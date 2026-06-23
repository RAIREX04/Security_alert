import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { MetricCard } from '../../components/MetricCard';
import { ReportCard } from '../../components/ReportCard';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { listReports } from '../../services/report-service';
import type { AdminStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminHistory'>;

const STATUS_FILTERS = ['all', 'open', 'progress', 'close'] as const;

export function HistoryScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const [selectedStatus, setSelectedStatus] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'admin-history'],
    queryFn: () => listReports(),
  });

  const reports = data ?? [];
  const filteredReports = useMemo(() => {
    if (selectedStatus === 'all') return reports;
    return reports.filter((item) => item.status === selectedStatus);
  }, [reports, selectedStatus]);

  const openCount = reports.filter((item) => item.status === 'open').length;
  const progressCount = reports.filter((item) => item.status === 'progress').length;
  const closeCount = reports.filter((item) => item.status === 'close').length;

  return (
    <Screen
      title="Riwayat"
      subtitle="Seluruh alert lintas departemen."
      left={<HeaderBackButton onPress={() => navigation.navigate('AdminDashboard')} />}
    >
      <SectionCard tone="soft">
        <Text selectable style={styles.sectionLabel}>
          COMMAND CENTER
        </Text>
        <Text selectable style={[styles.sectionTitle, compact && styles.sectionTitleCompact]} numberOfLines={2}>
          Riwayat lintas departemen
        </Text>
        <Text selectable style={styles.sectionSubtitle} numberOfLines={2}>
          Lihat seluruh alert dari semua departemen dan buka detail untuk audit penuh.
        </Text>

        <View style={styles.metrics}>
          <MetricCard label="Open" value={openCount} />
          <MetricCard label="Progress" value={progressCount} accent="#0369A1" />
          <MetricCard label="Close" value={closeCount} accent="#15803D" />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.filterLabel}>Filter status</Text>
        <View style={styles.filterRow}>
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
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      {isLoading ? (
        <Text selectable style={styles.loading}>
          Memuat report...
        </Text>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          title="Belum ada report"
          description={
            selectedStatus === 'all'
              ? 'Semua report akan tampil di sini.'
              : 'Tidak ada report pada status yang dipilih.'
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionTitle: {
    color: '#0F2C57',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  sectionTitleCompact: {
    fontSize: 20,
    lineHeight: 26,
  },
  sectionSubtitle: {
    color: '#64748B',
    lineHeight: 20,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterLabel: {
    color: '#0F2C57',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    backgroundColor: '#F8FAFC',
    borderColor: '#D7E3F0',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterChipActive: {
    backgroundColor: '#FFF1F3',
    borderColor: '#FCA5A5',
  },
  filterText: {
    color: '#475569',
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#B91C1C',
  },
  loading: {
    color: '#64748B',
  },
  list: {
    gap: 12,
  },
});
