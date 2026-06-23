import { useEffect, useMemo, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { listReports } from '../services/report-service';
import { STAFF_ALERT_CHANNEL_ID, STAFF_ALERT_SOUND } from '../constants/notifications';

const ALERT_SOUND = require('../../assets/sounds/alarm_sound_effect.mp3');

export function StaffAlertMonitor() {
  const { user } = useAuth();
  const isStaff = user?.role === 'staff' && user?.approvalStatus === 'approved' && user.isActive;
  const departmentId = user?.departmentId ?? null;
  const alarmPlayer = useAudioPlayer(ALERT_SOUND, {
    downloadFirst: true,
    updateInterval: 250,
  });
  const previousAlertIds = useRef<Set<number>>(new Set());
  const initialized = useRef(false);

  const safePlayerAction = (action: () => void | Promise<unknown>) => {
    try {
      const result = action();
      if (result && typeof (result as Promise<unknown>).catch === 'function') {
        void (result as Promise<unknown>).catch(() => {});
      }
    } catch {
      // The shared audio object can already be released during fast remounts
      // in development. Ignore playback cleanup errors so the app stays usable.
    }
  };

  const shouldObserveAlerts = Boolean(isStaff && departmentId);

  const reportsQuery = useQuery({
    queryKey: ['reports', 'staff-alert-monitor', departmentId],
    queryFn: () => listReports({ departmentId: departmentId ?? undefined }),
    enabled: shouldObserveAlerts,
    refetchInterval: shouldObserveAlerts ? 8000 : false,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  const openReports = useMemo(
    () =>
      (reportsQuery.data ?? []).filter(
        (report) => report.status === 'open' && (report.assignedStaffId == null),
      ),
    [reportsQuery.data],
  );

  useEffect(() => {
    if (!shouldObserveAlerts) {
      initialized.current = false;
      previousAlertIds.current = new Set();
      safePlayerAction(() => alarmPlayer.pause());
      safePlayerAction(() => {
        void alarmPlayer.seekTo(0).catch(() => {});
      });
      return;
    }

    if (Platform.OS !== 'web') {
      const configureAudio = async () => {
        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: 'doNotMix',
          shouldPlayInBackground: true,
        });
      };

      void configureAudio().catch(() => {});
    }
  }, [alarmPlayer, shouldObserveAlerts]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      void Notifications.setNotificationChannelAsync(STAFF_ALERT_CHANNEL_ID, {
        name: 'Alert staff',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 300, 300, 300],
        sound: STAFF_ALERT_SOUND,
      }).catch(() => {});
    }

    if (Platform.OS !== 'web') {
      void (async () => {
        const current = await Notifications.getPermissionsAsync();
        if (current.status !== 'granted') {
          await Notifications.requestPermissionsAsync();
        }
      })().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!shouldObserveAlerts) {
      return;
    }

    const currentIds = new Set(openReports.map((report) => report.reportId));

    if (!initialized.current) {
      initialized.current = true;
      previousAlertIds.current = currentIds;
      if (currentIds.size > 0) {
        alarmPlayer.loop = true;
        safePlayerAction(() => {
          alarmPlayer.setActiveForLockScreen(true, {
            title: 'Alert keamanan aktif',
            artist: user?.department ?? 'Security Alert',
            albumTitle: 'Alarm berjalan',
          });
        });
        safePlayerAction(() => alarmPlayer.play());
      }
      return;
    }

    const previousIds = previousAlertIds.current;
    const newReports = openReports.filter((report) => !previousIds.has(report.reportId));

    if (newReports.length > 0) {
      void Promise.all(
        newReports.map((report) =>
          Notifications.scheduleNotificationAsync({
            content: {
              title: 'Alert baru masuk',
              body: `${report.department ?? 'Departemen Anda'}: ${report.incidentLocationText}`,
              sound: STAFF_ALERT_SOUND,
              data: {
                reportId: report.reportId,
                departmentId: report.departmentId,
              },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: 1,
              channelId: STAFF_ALERT_CHANNEL_ID,
            },
          }),
        ),
      ).catch(() => {});
    }

    previousAlertIds.current = currentIds;

    if (currentIds.size > 0) {
      alarmPlayer.loop = true;
      safePlayerAction(() => {
        alarmPlayer.setActiveForLockScreen(true, {
          title: 'Alert keamanan aktif',
          artist: user?.department ?? 'Security Alert',
          albumTitle: 'Alarm berjalan',
        });
      });
      if (!alarmPlayer.playing) {
        safePlayerAction(() => {
          void alarmPlayer.seekTo(0).catch(() => {});
        });
        safePlayerAction(() => alarmPlayer.play());
      }
      return;
    }

    safePlayerAction(() => alarmPlayer.pause());
    safePlayerAction(() => alarmPlayer.setActiveForLockScreen(false));
    safePlayerAction(() => {
      void alarmPlayer.seekTo(0).catch(() => {});
    });
  }, [alarmPlayer, openReports, shouldObserveAlerts]);

  useEffect(
    () => () => {
      safePlayerAction(() => alarmPlayer.pause());
      safePlayerAction(() => alarmPlayer.setActiveForLockScreen(false));
    },
    [alarmPlayer],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active' && shouldObserveAlerts && openReports.length > 0 && !alarmPlayer.playing) {
      alarmPlayer.loop = true;
      safePlayerAction(() => {
          alarmPlayer.setActiveForLockScreen(true, {
            title: 'Alert keamanan aktif',
            artist: user?.department ?? 'Security Alert',
            albumTitle: 'Alarm berjalan',
          });
        });
        safePlayerAction(() => alarmPlayer.play());
      }
    });

    return () => subscription.remove();
  }, [alarmPlayer, openReports.length, shouldObserveAlerts]);

  return null;
}
