import { useEffect } from 'react';
import * as Network from 'expo-network';

import { queryClient } from '../config/query-client';
import { useAuth } from '../context/AuthContext';
import { syncQueuedProfileUpdates } from '../services/offline-profile-queue';

export function OfflineProfileSync() {
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

    void syncQueuedProfileUpdates()
      .then(async (result) => {
        if (!active || result.processed <= 0) {
          return;
        }

        await queryClient.invalidateQueries({ queryKey: ['me'] });
        await queryClient.invalidateQueries({ queryKey: ['auth-me'] });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [accessToken, isHydrating, networkState.isConnected, networkState.isInternetReachable]);

  return null;
}
