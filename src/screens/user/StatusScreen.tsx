import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { ReportCard } from '../../components/ReportCard';
import { UserScreenShell } from '../../components/UserScreenShell';
import { getQueuedReportSubmissionCount } from '../../services/offline-report-queue';
import { listReportsByUser } from '../../services/report-service';
import { useAuth } from '../../context/AuthContext';
import { ecrTheme } from '../../theme/ecrTheme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { UserStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<UserStackParamList, 'UserStatus'>;

export function StatusScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [queuedCount, setQueuedCount] = useState(0);
  const networkState = Network.useNetworkState();
  const isOnline = networkState.isInternetReachable ?? networkState.isConnected ?? true;
  const reportsQuery = useQuery({
    queryKey: ['reports', 'user-status', user?.userId],
    queryFn: async () => user ? listReportsByUser(user.userId) : [],
    enabled: Boolean(user?.userId),
  });

  useEffect(() => {
    let active = true;

    const refreshQueuedCount = async () => {
      const count = await getQueuedReportSubmissionCount();
      if (active) {
        setQueuedCount(count);
      }
    };

    void refreshQueuedCount();
    const timer = setInterval(() => {
      void refreshQueuedCount();
    }, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const reports = reportsQuery.data ?? [];
  const openCount = reports.filter((item) => item.status === 'open').length;
  const progressCount = reports.filter((item) => item.status === 'progress').length;
  const closeCount = reports.filter((item) => item.status === 'close').length;
  const activeReports = reports.filter((item) => item.status !== 'close');

  return (
    <UserScreenShell
      title="Status Alert Saya"
      subtitle="Pantau alert yang masih diproses oleh departemen terkait."
      left={<HeaderBackButton onPress={() => navigation.navigate('UserHome')} variant="light" />}
      compact
      refreshing={reportsQuery.isFetching}
      onRefresh={() => void reportsQuery.refetch()}
    >
      <View style={styles.accentStrip}>
        <View style={[styles.accentSegment, { backgroundColor: ecrTheme.colors.pertaminaBlue }]} />
        <View style={[styles.accentSegment, { backgroundColor: ecrTheme.colors.pertaminaGreen }]} />
        <View style={[styles.accentSegment, { backgroundColor: ecrTheme.colors.primaryRed }]} />
      </View>

      <View style={styles.summaryCard}>
        <Text selectable style={styles.summaryTitle}>
          Status alert aktif
        </Text>
        <Text selectable style={styles.summarySubtitle}>
          {activeReports.length} alert masih berjalan
        </Text>

        <View style={styles.metricsGrid}>
          <StatCard label="Open" value={openCount} tone="open" />
          <StatCard label="Progress" value={progressCount} tone="progress" />
          <StatCard label="Close" value={closeCount} tone="close" />
        </View>
      </View>

      {!isOnline && queuedCount > 0 ? (
        <View style={styles.offlineNotice}>
          <Text selectable style={styles.offlineNoticeTitle}>
            {queuedCount} alert menunggu sinkronisasi
          </Text>
          <Text selectable style={styles.offlineNoticeSubtitle}>
            Begitu jaringan kembali, alert akan dikirim otomatis ke server.
          </Text>
        </View>
      ) : null}

      {reportsQuery.isLoading ? (
        <Text selectable style={styles.loading}>
          Memuat status...
        </Text>
      ) : activeReports.length === 0 ? (
        <EmptyState title="Tidak ada alert aktif" description="Semua alert Anda sudah selesai atau belum ada alert baru." />
      ) : (
        <View style={styles.list}>
          {activeReports.map((report) => (
            <ReportCard
              key={report.reportId}
              report={report}
              compact
              variant="userHistory"
              onPress={() => navigation.navigate('ReportDetail', { report })}
            />
          ))}
        </View>
      )}
    </UserScreenShell>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: 'open' | 'progress' | 'close' }) {
  const tones = {
    open: { bg: ecrTheme.status.open.bg, color: ecrTheme.status.open.text, border: ecrTheme.status.open.border },
    progress: { bg: ecrTheme.status.progress.bg, color: ecrTheme.status.progress.text, border: ecrTheme.status.progress.border },
    close: { bg: ecrTheme.status.close.bg, color: ecrTheme.status.close.text, border: ecrTheme.status.close.border },
  }[tone];

  return (
    <View style={[styles.statCard, { backgroundColor: tones.bg, borderColor: tones.border }]}>
      <Text selectable style={[styles.statValue, { color: tones.color }]}>
        {value}
      </Text>
      <Text selectable style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  accentStrip: {
    flexDirection: 'row',
    gap: 3,
    marginTop: -2,
    width: 160,
  },
  accentSegment: {
    borderRadius: 999,
    flex: 1,
    height: 5,
  },
  summaryCard: {
    backgroundColor: ecrTheme.colors.card,
    borderColor: ecrTheme.colors.border,
    borderRadius: ecrTheme.radii.lg,
    borderWidth: 1,
    gap: ecrTheme.spacing.md,
    padding: ecrTheme.spacing.lg,
    ...ecrTheme.shadows.soft,
  },
  summaryTitle: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 19,
    fontWeight: '900',
  },
  summarySubtitle: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    borderRadius: ecrTheme.radii.md,
    borderWidth: 1,
    flex: 1,
    gap: 5,
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 11.5,
    fontWeight: '700',
    lineHeight: 15,
  },
  loading: {
    color: ecrTheme.colors.textSecondary,
  },
  offlineNotice: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
    borderRadius: ecrTheme.radii.md,
    borderWidth: 1,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  offlineNoticeTitle: {
    color: '#C2410C',
    fontSize: 13.5,
    fontWeight: '900',
  },
  offlineNoticeSubtitle: {
    color: '#9A3412',
    fontSize: 12.5,
    lineHeight: 18,
  },
  list: {
    gap: 10,
  },
});
