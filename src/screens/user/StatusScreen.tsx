import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { ReportCard } from '../../components/ReportCard';
import { UserScreenShell } from '../../components/UserScreenShell';
import { listReportsByUser } from '../../services/report-service';
import { useAuth } from '../../context/AuthContext';
import { ecrTheme } from '../../theme/ecrTheme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { UserStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<UserStackParamList, 'UserStatus'>;

export function StatusScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'user-status', user?.userId],
    queryFn: async () => user ? listReportsByUser(user.userId) : [],
    enabled: Boolean(user?.userId),
  });

  const reports = data ?? [];
  const openCount = reports.filter((item) => item.status === 'open').length;
  const progressCount = reports.filter((item) => item.status === 'progress').length;
  const closeCount = reports.filter((item) => item.status === 'close').length;
  const activeReports = reports.filter((item) => item.status !== 'close');

  return (
    <UserScreenShell
      title="Status Alert Saya"
      subtitle="Pantau alert yang masih diproses oleh departemen terkait."
      left={<HeaderBackButton onPress={() => navigation.navigate('UserHome')} variant="light" />}
    >
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

      {isLoading ? (
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
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    borderRadius: ecrTheme.radii.md,
    borderWidth: 1,
    flex: 1,
    gap: 5,
    minWidth: 96,
    padding: 14,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: '700',
  },
  loading: {
    color: ecrTheme.colors.textSecondary,
  },
  list: {
    gap: 10,
  },
});
