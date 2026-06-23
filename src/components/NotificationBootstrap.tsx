import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { STAFF_ALERT_CHANNEL_ID, STAFF_ALERT_SOUND } from '../constants/notifications';

export function NotificationBootstrap() {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    void Notifications.getPermissionsAsync()
      .then((current) => {
        if (current.status !== 'granted') {
          return Notifications.requestPermissionsAsync();
        }

        return current;
      })
      .catch(() => {});

    void Notifications.setNotificationChannelAsync(STAFF_ALERT_CHANNEL_ID, {
      name: 'Alert Staff',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 300, 300, 300],
      sound: STAFF_ALERT_SOUND,
    }).catch(() => {});
  }, []);

  return null;
}
