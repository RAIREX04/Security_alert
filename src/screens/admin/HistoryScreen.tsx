import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { HistoryPagination } from '../../components/HistoryPagination';
import { MetricCard } from '../../components/MetricCard';
import { ReportCard } from '../../components/ReportCard';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { listReports } from '../../services/report-service';
import {
  getPageCount,
  getPaginatedItems,
  HISTORY_PAGE_SIZE,
  matchesReportSearch,
} from '../../utils/report-history';
import type { AdminStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminHistory'>;

const STATUS_FILTERS = ['all', 'open', 'progress', 'close'] as const;

export function HistoryScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const routeNames = (navigation as any).getState?.().routeNames ?? [];
  const dashboardRoute = routeNames.includes('AdminDashboard')
    ? 'AdminDashboard'
    : routeNames.includes('ViewOnlyDashboard')
      ? 'ViewOnlyDashboard'
      : null;
  const [selectedStatus, setSelectedStatus] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const reportsQuery = useQuery({
    queryKey: ['reports', 'admin-history'],
    queryFn: () => listReports(),
  });

  const reports = reportsQuery.data ?? [];
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      return matchesStatus && matchesReportSearch(item, searchQuery);
    });
  }, [reports, searchQuery, selectedStatus]);
  const pageCount = getPageCount(filteredReports.length);
  const visibleReports = useMemo(
    () => getPaginatedItems(filteredReports, page, HISTORY_PAGE_SIZE),
    [filteredReports, page],
  );

  const openCount = reports.filter((item) => item.status === 'open').length;
  const progressCount = reports.filter((item) => item.status === 'progress').length;
  const closeCount = reports.filter((item) => item.status === 'close').length;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedStatus]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  return (
    <Screen
      title="Riwayat"
      subtitle="Seluruh alert lintas departemen."
      left={dashboardRoute ? <HeaderBackButton onPress={() => (navigation as any).navigate(dashboardRoute)} /> : undefined}
      refreshing={reportsQuery.isFetching}
      onRefresh={() => void reportsQuery.refetch()}
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
        <View style={styles.filterHeader}>
          <Text style={styles.filterLabel}>Filter status</Text>
          <Text selectable style={styles.filterCaption}>
            {filteredReports.length} tampil
          </Text>
        </View>
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

      <SectionCard>
        <View style={styles.filterHeader}>
          <Text selectable style={styles.filterLabel}>
            Cari report
          </Text>
          <Text selectable style={styles.filterCaption}>
            10 per halaman
          </Text>
        </View>
        <View style={styles.searchInputRow}>
          <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari deskripsi, lokasi, staff, user..."
            placeholderTextColor="#94A3B8"
            returnKeyType="search"
            style={styles.searchInput}
          />
          {searchQuery ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Hapus pencarian"
              onPress={() => setSearchQuery('')}
              style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons name="close" size={18} color="#64748B" />
            </Pressable>
          ) : null}
        </View>
      </SectionCard>

      {reportsQuery.isLoading ? (
        <Text selectable style={styles.loading}>
          Memuat report...
        </Text>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          title="Belum ada report"
          description={
            searchQuery.trim()
              ? 'Tidak ada report yang cocok dengan pencarian.'
              : selectedStatus === 'all'
              ? 'Semua report akan tampil di sini.'
              : 'Tidak ada report pada status yang dipilih.'
          }
        />
      ) : (
        <>
          <View style={styles.list}>
            {visibleReports.map((report) => (
              <ReportCard
                key={report.reportId}
                report={report}
                onPress={() => navigation.navigate('ReportDetail', { report })}
              />
            ))}
          </View>
          <HistoryPagination
            page={page}
            pageCount={pageCount}
            totalItems={filteredReports.length}
            pageSize={HISTORY_PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
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
  },
  filterCaption: {
    color: '#64748B',
    fontSize: 12.5,
    fontWeight: '700',
  },
  filterHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
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
  searchInputRow: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#D7E3F0',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  searchInput: {
    color: '#0F172A',
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    minWidth: 0,
    paddingVertical: 10,
  },
  clearButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  loading: {
    color: '#64748B',
  },
  list: {
    gap: 12,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
