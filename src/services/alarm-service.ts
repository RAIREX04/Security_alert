import { NativeModules, Platform } from 'react-native';
import type { User } from '../types/models';
import { env } from '../config/env';

type AlarmSession = {
  accessToken: string;
  refreshToken: string;
  apiBaseUrl: string;
  user: Pick<User, 'userId' | 'fullName' | 'role' | 'approvalStatus' | 'isActive' | 'departmentId' | 'department'>;
};

type AlarmNativeModule = {
  startMonitoring: (sessionJson: string) => Promise<void>;
  stopMonitoring: () => Promise<void>;
};

const nativeModule = NativeModules.AlarmMonitor as AlarmNativeModule | undefined;

export async function startAlarmMonitoring(session: Omit<AlarmSession, 'apiBaseUrl'>) {
  if (Platform.OS !== 'android' || !nativeModule?.startMonitoring) {
    return;
  }

  await nativeModule.startMonitoring(
    JSON.stringify({
      ...session,
      apiBaseUrl: env.apiBaseUrl,
    }),
  );
}

export async function stopAlarmMonitoring() {
  if (Platform.OS !== 'android' || !nativeModule?.stopMonitoring) {
    return;
  }

  await nativeModule.stopMonitoring();
}
