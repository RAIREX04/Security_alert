import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../context/AuthContext';
import { registerPushToken, removePushToken } from '../services/notification-service';

function getExpoProjectId() {
  return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? null;
}

export function PushTokenSync() {
  const { user } = useAuth();
  const registeredTokenRef = useRef<string | null>(null);
  const userSyncKey = `${user?.userId ?? 'none'}:${user?.role ?? 'none'}:${user?.approvalStatus ?? 'none'}:${user?.isActive ? '1' : '0'}`;
  const isExpoGo = Constants.appOwnership === 'expo';

  useEffect(() => {
    let active = true;

    const sync = async () => {
      if (Platform.OS === 'web' || isExpoGo) {
        return;
      }

      const isEligible =
        user?.role === 'staff' && user?.approvalStatus === 'approved' && user.isActive;

      if (!isEligible) {
        if (registeredTokenRef.current) {
          await removePushToken(registeredTokenRef.current).catch(() => {});
          registeredTokenRef.current = null;
        }
        return;
      }

      const permissions = await Notifications.getPermissionsAsync();
      let finalStatus = permissions.status;
      if (finalStatus !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync();
        finalStatus = requested.status;
      }

      if (finalStatus !== 'granted') {
        return;
      }

      const projectId = getExpoProjectId();
      if (!projectId) {
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      if (!active || !token) {
        return;
      }

      await registerPushToken({
        fcmToken: token,
        platform: Platform.OS === 'android' ? 'android' : undefined,
        deviceId: null,
      });
      if (!active) {
        return;
      }
      registeredTokenRef.current = token;
    };

    void sync().catch(() => {});

    return () => {
      active = false;
      if (registeredTokenRef.current) {
        void removePushToken(registeredTokenRef.current).catch(() => {});
        registeredTokenRef.current = null;
      }
    };
  }, [isExpoGo, userSyncKey]);

  return null;
}
