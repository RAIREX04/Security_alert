import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import type { AuthSession } from '../types/models';

type OfflineAuthRecord = {
  username: string;
  pinSalt: string;
  pinHash: string;
  session: AuthSession;
  storedAt: string;
};

const STORAGE_KEY = 'management_emergency_offline_auth_v1';

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function createSalt() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

async function hashPin(pin: string, salt: string) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${pin.trim()}`,
  );
}

async function loadRecord(): Promise<OfflineAuthRecord | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as OfflineAuthRecord;
  } catch {
    return null;
  }
}

export async function cacheOfflineAuthSession(session: AuthSession, pin: string) {
  const record: OfflineAuthRecord = {
    username: normalizeUsername(session.user.username),
    pinSalt: createSalt(),
    pinHash: '',
    session,
    storedAt: new Date().toISOString(),
  };
  record.pinHash = await hashPin(pin, record.pinSalt);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export async function updateCachedOfflineAuthSession(session: AuthSession, pin?: string | null) {
  const record = await loadRecord();
  if (!record) {
    if (pin) {
      await cacheOfflineAuthSession(session, pin);
    }
    return;
  }

  record.username = normalizeUsername(session.user.username);
  record.session = {
    accessToken: session.accessToken || record.session.accessToken,
    refreshToken: session.refreshToken || record.session.refreshToken,
    user: session.user,
  };
  if (pin) {
    record.pinSalt = createSalt();
    record.pinHash = await hashPin(pin, record.pinSalt);
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export async function clearOfflineAuthSession() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function hasOfflineAuthSession() {
  return Boolean(await loadRecord());
}

export async function resolveOfflineAuthSession(username: string, pin: string): Promise<AuthSession | null> {
  const record = await loadRecord();
  if (!record) {
    return null;
  }

  if (normalizeUsername(username) !== record.username) {
    return null;
  }

  const candidateHash = await hashPin(pin, record.pinSalt);
  if (candidateHash !== record.pinHash) {
    return null;
  }

  return record.session;
}
