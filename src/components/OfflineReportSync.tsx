import { useEffect } from 'react';
import * as Network from 'expo-network';

import { queryClient } from '../config/query-client';
import { useAuth } from '../context/AuthContext';
import { syncQueuedReportSubmissions } from '../services/offline-report-queue';

export function OfflineReportSync() {
  const { accessToken, isHydrating } = useAuth();
  const networkState = Network.useNetworkState();

  useEffect(() => {
    if (isHydrating || !accessToken) {
      return;
    }

    const online = networkState.isInternetReachable ?? networkState.isConnected ?? true;
    if (!online) {
      return;
    }

    let active = true;

    void syncQueuedReportSubmissions()
      .then(async (result) => {
        if (active && result.processed > 0) {
          await queryClient.invalidateQueries({ queryKey: ['reports'] });
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [accessToken, isHydrating, networkState.isConnected, networkState.isInternetReachable]);

  return null;
}
