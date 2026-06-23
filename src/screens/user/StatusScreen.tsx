import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { ReportCard } from '../../components/ReportCard';
import { UserScreenShell } from '../../components/UserScreenShell';
import { listReportsByUser } from '../../services/report-service';
import { useAuth } from '../../context/AuthContext';
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
    open: { bg: '#FFF0F0', color: '#B91C1C' },
    progress: { bg: '#DFF0FF', color: '#0B6AA8' },
    close: { bg: '#DCFCE7', color: '#15803D' },
  }[tone];

  return (
    <View style={[styles.statCard, { backgroundColor: tones.bg }]}>
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
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EE',
    borderRadius: 32,
    borderWidth: 1,
    gap: 16,
    padding: 18,
  },
  summaryTitle: {
    color: '#101828',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  summarySubtitle: {
    color: '#667085',
    fontSize: 16,
    lineHeight: 22,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    borderRadius: 28,
    flex: 1,
    gap: 8,
    minWidth: 96,
    padding: 18,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '700',
  },
  loading: {
    color: '#667085',
  },
  list: {
    gap: 12,
  },
});
