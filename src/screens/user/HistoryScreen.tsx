import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { ReportCard } from '../../components/ReportCard';
import { UserScreenShell } from '../../components/UserScreenShell';
import { listReportsByUser } from '../../services/report-service';
import { useAuth } from '../../context/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { UserStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<UserStackParamList, 'UserHistory'>;

const STATUS_FILTERS = ['all', 'open', 'progress', 'close'] as const;

export function HistoryScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'user-history', user?.userId],
    queryFn: async () => user ? listReportsByUser(user.userId) : [],
    enabled: Boolean(user?.userId),
  });

  const reports = data ?? [];
  const filteredReports = useMemo(() => {
    if (selectedStatus === 'all') return reports;
    return reports.filter((item) => item.status === selectedStatus);
  }, [reports, selectedStatus]);

  return (
    <UserScreenShell
      title="Riwayat Alert Saya"
      subtitle="Lihat alert yang sudah Anda kirim dan filter berdasarkan status."
      left={<HeaderBackButton onPress={() => navigation.navigate('UserHome')} variant="light" />}
    >
      <View style={styles.filterCard}>
        <Text selectable style={styles.filterTitle}>
          Filter Status
        </Text>
        <View style={styles.filterWrap}>
          {STATUS_FILTERS.map((status) => {
            const active = selectedStatus === status;
            const label =
              status === 'all'
                ? 'Semua'
                : status === 'open'
                  ? 'Open'
                  : status === 'progress'
                    ? 'Progress'
                    : 'Close';

            return (
              <Pressable
                key={status}
                onPress={() => setSelectedStatus(status)}
                accessibilityRole="button"
                accessibilityLabel={`Filter status ${label}`}
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [
                  styles.filterChip,
                  active && styles.filterChipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <Text selectable style={styles.loading}>
          Memuat riwayat...
        </Text>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          title="Belum ada riwayat"
          description={
            selectedStatus === 'all'
              ? 'Alert yang Anda kirim akan tampil di halaman ini.'
              : 'Tidak ada alert pada status yang dipilih.'
          }
        />
      ) : (
        <View style={styles.list}>
          {filteredReports.map((report) => (
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

const styles = StyleSheet.create({
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EE',
    borderRadius: 32,
    borderWidth: 1,
    gap: 14,
    padding: 18,
  },
  filterTitle: {
    color: '#101828',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  filterWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#D7E3F0',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 56,
    justifyContent: 'center',
    minWidth: 118,
    paddingHorizontal: 18,
  },
  filterChipActive: {
    backgroundColor: '#FFF1F3',
    borderColor: '#F2B8BF',
  },
  filterText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#B91C1C',
  },
  loading: {
    color: '#667085',
  },
  list: {
    gap: 12,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
