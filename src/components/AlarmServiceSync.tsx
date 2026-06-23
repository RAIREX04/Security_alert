import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { startAlarmMonitoring, stopAlarmMonitoring } from '../services/alarm-service';

export function AlarmServiceSync() {
  const { user, accessToken, refreshToken, isHydrating } = useAuth();

  useEffect(() => {
    if (Platform.OS !== 'android' || isHydrating) {
      return;
    }

    const eligible =
      user?.role === 'staff' &&
      user.approvalStatus === 'approved' &&
      user.isActive &&
      Boolean(accessToken) &&
      Boolean(refreshToken);

    if (!eligible) {
      void stopAlarmMonitoring().catch(() => {});
      return;
    }

    void startAlarmMonitoring({
      accessToken: accessToken!,
      refreshToken: refreshToken!,
      user: {
        userId: user.userId,
        fullName: user.fullName,
        role: user.role ?? 'staff',
        approvalStatus: user.approvalStatus,
        isActive: user.isActive,
        departmentId: user.departmentId ?? null,
        department: user.department ?? null,
      },
    }).catch(() => {});
  }, [
    accessToken,
    isHydrating,
    refreshToken,
    user?.approvalStatus,
    user?.department,
    user?.departmentId,
    user?.fullName,
    user?.isActive,
    user?.role,
    user?.userId,
  ]);

  useEffect(() => {
    return () => {
      if (Platform.OS === 'android') {
        void stopAlarmMonitoring().catch(() => {});
      }
    };
  }, []);

  return null;
}
