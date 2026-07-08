import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Report } from '../types/models';

const STORAGE_KEY = 'management_emergency_report_cache_v1';

type CachedReportBucket = {
  reports: Report[];
  storedAt: string;
};

type ReportCacheState = Record<string, CachedReportBucket>;

function buildCacheKey(prefix: string, params: unknown) {
  return `${prefix}:${JSON.stringify(params ?? null)}`;
}

async function loadCache(): Promise<ReportCacheState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as ReportCacheState;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function saveCache(cache: ReportCacheState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

export function getUserReportsCacheKey(userId: number) {
  return buildCacheKey('user', { userId });
}

export function getDepartmentReportsCacheKey(params?: {
  status?: string;
  departmentId?: number;
  q?: string;
}) {
  return buildCacheKey('department', params ?? {});
}

export async function cacheReports(cacheKey: string, reports: Report[]) {
  const cache = await loadCache();
  cache[cacheKey] = {
    reports,
    storedAt: new Date().toISOString(),
  };
  await saveCache(cache);
}

export async function readCachedReports(cacheKey: string) {
  const cache = await loadCache();
  return cache[cacheKey]?.reports ?? [];
}
