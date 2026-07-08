import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Network from 'expo-network';

import { getAccessToken } from '../config/api';
import { createReport } from './report-service';
import { uploadReportPhoto, type UploadedFile } from './upload-service';
import type { Report } from '../types/models';

const STORAGE_KEY = 'offline_report_submissions_v1';
const STORAGE_DIR = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ''}offline-report-submissions`;

export type PendingReportAttachment =
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

export type PendingReportSubmission = {
  id: string;
  createdAt: string;
  payload: {
    departmentId: number;
    sourceDepartmentId?: number | null;
    clientSubmissionId: string;
    description: string;
    incidentLocationText: string;
    incidentLatitude?: number | null;
    incidentLongitude?: number | null;
    attachment?: PendingReportAttachment | null;
  };
};

export type ReportSubmissionInput = {
  departmentId: number;
  sourceDepartmentId?: number | null;
  description: string;
  incidentLocationText: string;
  incidentLatitude?: number | null;
  incidentLongitude?: number | null;
  attachment?: {
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
    fileSize?: number | null;
    uploadedFileUrl?: string | null;
  } | null;
};

export type SubmitAlertResult =
  | { kind: 'sent'; report: Report }
  | { kind: 'queued'; submission: PendingReportSubmission };

let syncInFlight: Promise<{ processed: number; remaining: number }> | null = null;

function isNetworkAvailable(state: Network.NetworkState) {
  return state.isInternetReachable ?? state.isConnected ?? true;
}

export function isNetworkFailure(error: unknown) {
  if (!error || typeof error !== 'object') return false;

  const maybe = error as {
    code?: string;
    message?: string;
    response?: { status?: number };
  };

  if (maybe.response?.status == null) {
    return true;
  }

  if (maybe.code === 'ERR_NETWORK' || maybe.code === 'ECONNABORTED') {
    return true;
  }

  const message = maybe.message?.toLowerCase() ?? '';
  return message.includes('network') || message.includes('timeout');
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

function createId() {
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildFileName(fileName?: string | null) {
  const clean = (fileName ?? 'photo.jpg').trim();
  if (clean.length === 0) return 'photo.jpg';
  return clean.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_');
}

function buildFallbackAttachmentName(sourceName?: string | null) {
  const base = buildFileName(sourceName);
  if (/\.[a-z0-9]+$/i.test(base)) return base;
  return `${base}.jpg`;
}

async function loadQueue() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as PendingReportSubmission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: PendingReportSubmission[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

async function copyAttachmentToStorage(input: Required<NonNullable<ReportSubmissionInput['attachment']>>) {
  await ensureStorageDir();

  const fileName = buildFallbackAttachmentName(input.fileName);
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

async function resolveAttachment(
  attachment: ReportSubmissionInput['attachment'],
): Promise<UploadedFile | null> {
  if (!attachment) return null;

  if (attachment.uploadedFileUrl) {
    return {
      fileName: buildFallbackAttachmentName(attachment.fileName),
      fileUrl: attachment.uploadedFileUrl,
      mimeType: attachment.mimeType ?? null,
      fileSize: attachment.fileSize ?? null,
    };
  }

  const uploaded = await uploadReportPhoto({
    uri: attachment.uri,
    fileName: buildFallbackAttachmentName(attachment.fileName),
    mimeType: attachment.mimeType ?? 'image/jpeg',
    fileSize: attachment.fileSize ?? null,
  });

  return uploaded;
}

async function queueSubmission(
  input: ReportSubmissionInput,
  clientSubmissionId: string,
  attachment?: PendingReportAttachment | null,
) {
  const submission: PendingReportSubmission = {
    id: clientSubmissionId,
    createdAt: new Date().toISOString(),
    payload: {
      departmentId: input.departmentId,
      sourceDepartmentId: input.sourceDepartmentId ?? null,
      clientSubmissionId,
      description: input.description,
      incidentLocationText: input.incidentLocationText,
      incidentLatitude: input.incidentLatitude ?? null,
      incidentLongitude: input.incidentLongitude ?? null,
      attachment: attachment ?? null,
    },
  };

  const queue = await loadQueue();
  queue.push(submission);
  await saveQueue(queue);
  return submission;
}

async function prepareQueueAttachment(input: ReportSubmissionInput['attachment']) {
  if (!input) return null;

  if (input.uploadedFileUrl) {
    return {
      kind: 'uploaded' as const,
      fileName: buildFallbackAttachmentName(input.fileName),
      fileUrl: input.uploadedFileUrl,
      mimeType: input.mimeType ?? null,
      fileSize: input.fileSize ?? null,
    };
  }

  if (!input.uri) return null;

  return copyAttachmentToStorage({
    uri: input.uri,
    fileName: input.fileName ?? 'photo.jpg',
    mimeType: input.mimeType ?? null,
    fileSize: input.fileSize ?? null,
    uploadedFileUrl: null,
  });
}

export async function submitAlertWithOfflineFallback(input: ReportSubmissionInput): Promise<SubmitAlertResult> {
  const clientSubmissionId = createId();
  const networkState = await Network.getNetworkStateAsync();
  const online = isNetworkAvailable(networkState);

  if (!online) {
    const queuedAttachment = await prepareQueueAttachment(input.attachment);
    const submission = await queueSubmission(input, clientSubmissionId, queuedAttachment);
    return { kind: 'queued', submission };
  }

  let preparedAttachment: UploadedFile | null = null;
  try {
    preparedAttachment = await resolveAttachment(input.attachment);

    const report = await createReport({
      departmentId: input.departmentId,
      sourceDepartmentId: input.sourceDepartmentId ?? undefined,
      clientSubmissionId,
      description: input.description,
      incidentLocationText: input.incidentLocationText,
      incidentLatitude: input.incidentLatitude ?? null,
      incidentLongitude: input.incidentLongitude ?? null,
      attachments: preparedAttachment
        ? [
            {
              fileName: preparedAttachment.fileName,
              fileUrl: preparedAttachment.fileUrl,
              mimeType: preparedAttachment.mimeType ?? null,
              fileSize: preparedAttachment.fileSize ?? null,
              attachmentType: 'incident_photo',
            },
          ]
        : undefined,
    });

    return { kind: 'sent', report };
  } catch (error) {
    if (!isNetworkFailure(error)) {
      throw error;
    }

    const queuedAttachment = preparedAttachment
      ? {
          kind: 'uploaded' as const,
          fileName: preparedAttachment.fileName,
          fileUrl: preparedAttachment.fileUrl,
          mimeType: preparedAttachment.mimeType ?? null,
          fileSize: preparedAttachment.fileSize ?? null,
        }
      : await prepareQueueAttachment(input.attachment);

    const submission = await queueSubmission(input, clientSubmissionId, queuedAttachment);
    return { kind: 'queued', submission };
  }
}

async function deleteStoredAttachment(attachment: PendingReportAttachment | null | undefined) {
  if (!attachment || attachment.kind !== 'local') {
    return;
  }

  try {
    await FileSystem.deleteAsync(attachment.localUri, { idempotent: true });
  } catch {
    // Ignore cleanup failures so sync can still succeed.
  }
}

export async function syncQueuedReportSubmissions() {
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
    if (!isNetworkAvailable(networkState)) {
      const remaining = (await loadQueue()).length;
      return { processed: 0, remaining };
    }

    const queue = await loadQueue();
    if (queue.length === 0) {
      return { processed: 0, remaining: 0 };
    }

    let processed = 0;

    for (let index = 0; index < queue.length; index += 1) {
      const item = queue[index];
      try {
        const attachment = item.payload.attachment;
        const uploadedAttachment =
          attachment?.kind === 'uploaded'
            ? attachment
            : attachment?.kind === 'local'
              ? await uploadReportPhoto({
                  uri: attachment.localUri,
                  fileName: attachment.fileName,
                  mimeType: attachment.mimeType ?? 'image/jpeg',
                  fileSize: attachment.fileSize ?? null,
                })
              : null;

        await createReport({
          departmentId: item.payload.departmentId,
          sourceDepartmentId: item.payload.sourceDepartmentId ?? undefined,
          clientSubmissionId: item.payload.clientSubmissionId ?? item.id,
          description: item.payload.description,
          incidentLocationText: item.payload.incidentLocationText,
          incidentLatitude: item.payload.incidentLatitude ?? null,
          incidentLongitude: item.payload.incidentLongitude ?? null,
          attachments: uploadedAttachment
            ? [
                {
                  fileName: uploadedAttachment.fileName,
                  fileUrl: uploadedAttachment.fileUrl,
                  mimeType: uploadedAttachment.mimeType ?? null,
                  fileSize: uploadedAttachment.fileSize ?? null,
                  attachmentType: 'incident_photo',
                },
              ]
            : undefined,
        });

        processed += 1;
        await deleteStoredAttachment(attachment);
      } catch (error) {
        const remainingQueue = queue.slice(index);
        await saveQueue(remainingQueue);
        return {
          processed,
          remaining: remainingQueue.length,
        };
      }
    }

    await saveQueue([]);
    return {
      processed,
      remaining: 0,
    };
  })().finally(() => {
    syncInFlight = null;
  });

  return syncInFlight;
}

export async function getQueuedReportSubmissionCount() {
  return (await loadQueue()).length;
}
