import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Network from 'expo-network';

import { updateMe } from './user-service';
import { uploadProfilePhoto, type UploadedFile } from './upload-service';
import { getAccessToken } from '../config/api';
import { isLikelyNetworkError } from '../utils/network-error';
import { updateCachedOfflineAuthSession } from './local-auth-service';
import type { User } from '../types/models';

const STORAGE_KEY = 'management_emergency_profile_updates_v1';
const STORAGE_DIR = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ''}profile-updates`;

type PendingProfilePhoto =
  | {
      kind: 'local';
      localUri: string;
      fileName: string;
      mimeType?: string | null;
      fileSize?: number | null;
    }
  | {
      kind: 'uploaded';
      fileName: string;
      fileUrl: string;
      mimeType?: string | null;
      fileSize?: number | null;
    };

export type PendingProfileUpdate = {
  id: string;
  createdAt: string;
  userId: number;
  payload: {
    fullName?: string;
    username?: string;
    email?: string;
    phoneNumber?: string | null;
    pin?: string;
    photo?: PendingProfilePhoto | null;
  };
};

type ProfileUpdateInput = {
  userId: number;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  pin?: string;
  photo?: {
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
    fileSize?: number | null;
    uploadedFileUrl?: string | null;
  } | null;
};

export type SyncProfileUpdateResult = {
  processed: number;
  remaining: number;
  updatedUser?: User;
};

let syncInFlight: Promise<SyncProfileUpdateResult> | null = null;

function createId() {
  return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildFileName(fileName?: string | null) {
  const clean = (fileName ?? 'profile.jpg').trim();
  if (clean.length === 0) return 'profile.jpg';
  return clean.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_');
}

async function ensureStorageDir() {
  if (!STORAGE_DIR) {
    throw new Error('Folder penyimpanan offline tidak tersedia.');
  }

  const info = await FileSystem.getInfoAsync(STORAGE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(STORAGE_DIR, { intermediates: true });
  }
}

async function loadQueue() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as PendingProfileUpdate[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: PendingProfileUpdate[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

async function copyPhotoToStorage(input: Required<NonNullable<ProfileUpdateInput['photo']>>) {
  await ensureStorageDir();

  const fileName = buildFileName(input.fileName);
  const targetUri = `${STORAGE_DIR}/${createId()}-${fileName}`;
  await FileSystem.copyAsync({
    from: input.uri,
    to: targetUri,
  });

  return {
    kind: 'local' as const,
    localUri: targetUri,
    fileName,
    mimeType: input.mimeType ?? null,
    fileSize: input.fileSize ?? null,
  };
}

async function queueProfileUpdate(userId: number, payload: PendingProfileUpdate['payload']) {
  const queue = await loadQueue();
  const item: PendingProfileUpdate = {
    id: createId(),
    createdAt: new Date().toISOString(),
    userId,
    payload,
  };
  queue.push(item);
  await saveQueue(queue);
  return item;
}

async function deleteStoredPhoto(photo: PendingProfilePhoto | null | undefined) {
  if (!photo || photo.kind !== 'local') {
    return;
  }

  try {
    await FileSystem.deleteAsync(photo.localUri, { idempotent: true });
  } catch {
    // Ignore cleanup failures so the rest of the sync can continue.
  }
}

export async function queueProfileUpdateWithOfflineFallback(input: ProfileUpdateInput) {
  const networkState = await Network.getNetworkStateAsync();
  const online = networkState.isInternetReachable ?? networkState.isConnected ?? true;
  const payload = {
    fullName: input.fullName.trim(),
    username: input.username.trim(),
    email: input.email.trim(),
    phoneNumber: input.phoneNumber.trim(),
    ...(input.pin ? { pin: input.pin.trim() } : {}),
    photo: input.photo?.uploadedFileUrl
      ? {
          kind: 'uploaded' as const,
          fileName: buildFileName(input.photo.fileName),
          fileUrl: input.photo.uploadedFileUrl,
          mimeType: input.photo.mimeType ?? null,
          fileSize: input.photo.fileSize ?? null,
        }
      : null,
  };

  if (!online) {
    const queuedPhoto = input.photo
      ? await copyPhotoToStorage({
          uri: input.photo.uri,
          fileName: input.photo.fileName ?? 'profile.jpg',
          mimeType: input.photo.mimeType ?? null,
          fileSize: input.photo.fileSize ?? null,
          uploadedFileUrl: null,
        })
      : null;
    const submission = await queueProfileUpdate(input.userId, {
      ...payload,
      photo: queuedPhoto,
    });
    return { kind: 'queued' as const, submission };
  }

  try {
    const uploadedPhoto =
      input.photo?.uploadedFileUrl
        ? payload.photo
        : input.photo
          ? await uploadProfilePhoto({
              uri: input.photo.uri,
              fileName: buildFileName(input.photo.fileName),
              mimeType: input.photo.mimeType ?? 'image/jpeg',
              fileSize: input.photo.fileSize ?? null,
            })
          : null;

    const user = await updateMe({
      fullName: payload.fullName,
      username: payload.username,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      ...(payload.pin ? { pin: payload.pin } : {}),
      ...(uploadedPhoto ? { photoUrl: uploadedPhoto.fileUrl } : {}),
    });

    await updateCachedOfflineAuthSession(
      { accessToken: '', refreshToken: '', user },
      payload.pin ?? null,
    ).catch(() => {});

    return { kind: 'sent' as const, user };
  } catch (error) {
    if (!isLikelyNetworkError(error)) {
      throw error;
    }

    const queuedPhoto = input.photo?.uploadedFileUrl
      ? payload.photo
      : input.photo
        ? await copyPhotoToStorage({
            uri: input.photo.uri,
            fileName: input.photo.fileName ?? 'profile.jpg',
            mimeType: input.photo.mimeType ?? null,
            fileSize: input.photo.fileSize ?? null,
            uploadedFileUrl: null,
          })
        : null;

    const submission = await queueProfileUpdate(input.userId, {
      ...payload,
      photo: queuedPhoto,
    });
    return { kind: 'queued' as const, submission };
  }
}

export async function syncQueuedProfileUpdates() {
  if (syncInFlight) {
    return syncInFlight;
  }

  syncInFlight = (async () => {
    const token = getAccessToken();
    if (!token) {
      const remaining = (await loadQueue()).length;
      return { processed: 0, remaining };
    }

    const networkState = await Network.getNetworkStateAsync();
    const online = networkState.isInternetReachable ?? networkState.isConnected ?? true;
    if (!online) {
      const remaining = (await loadQueue()).length;
      return { processed: 0, remaining };
    }

    const queue = await loadQueue();
    if (queue.length === 0) {
      return { processed: 0, remaining: 0 };
    }

    let processed = 0;
    let updatedUser: User | undefined;

    for (let index = 0; index < queue.length; index += 1) {
      const item = queue[index];
      try {
        const photo = item.payload.photo;
        const uploadedPhoto =
          photo?.kind === 'uploaded'
            ? photo
            : photo?.kind === 'local'
              ? await uploadProfilePhoto({
                  uri: photo.localUri,
                  fileName: photo.fileName,
                  mimeType: photo.mimeType ?? 'image/jpeg',
                  fileSize: photo.fileSize ?? null,
                })
              : null;

        updatedUser = await updateMe({
          fullName: item.payload.fullName,
          username: item.payload.username,
          email: item.payload.email,
          phoneNumber: item.payload.phoneNumber,
          ...(item.payload.pin ? { pin: item.payload.pin } : {}),
          ...(uploadedPhoto ? { photoUrl: uploadedPhoto.fileUrl } : {}),
        });

        processed += 1;
        await deleteStoredPhoto(photo);

        await updateCachedOfflineAuthSession(
          { accessToken: '', refreshToken: '', user: updatedUser },
          item.payload.pin ?? null,
        ).catch(() => {});
      } catch {
        const remainingQueue = queue.slice(index);
        await saveQueue(remainingQueue);
        return {
          processed,
          remaining: remainingQueue.length,
          updatedUser,
        };
      }
    }

    await saveQueue([]);
    return {
      processed,
      remaining: 0,
      updatedUser,
    };
  })().finally(() => {
    syncInFlight = null;
  });

  return syncInFlight;
}

export async function getQueuedProfileUpdateCount() {
  return (await loadQueue()).length;
}
