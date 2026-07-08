import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Network from 'expo-network';

import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { HistoryPagination } from '../../components/HistoryPagination';
import { ReportCard } from '../../components/ReportCard';
import { UserScreenShell } from '../../components/UserScreenShell';
import { getQueuedReportSubmissionCount } from '../../services/offline-report-queue';
import { listReportsByUser } from '../../services/report-service';
import { useAuth } from '../../context/AuthContext';
import { ecrTheme } from '../../theme/ecrTheme';
import {
  getPageCount,
  getPaginatedItems,
  HISTORY_PAGE_SIZE,
  matchesReportSearch,
} from '../../utils/report-history';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { UserStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<UserStackParamList, 'UserHistory'>;

const STATUS_FILTERS = ['all', 'open', 'progress', 'close'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export function HistoryScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [queuedCount, setQueuedCount] = useState(0);
  const networkState = Network.useNetworkState();
  const isOnline = networkState.isInternetReachable ?? networkState.isConnected ?? true;
  const reportsQuery = useQuery({
    queryKey: ['reports', 'user-history', user?.userId],
    queryFn: async () => user ? listReportsByUser(user.userId) : [],
    enabled: Boolean(user?.userId),
  });

  const refreshQueuedCount = useCallback(async () => {
    const count = await getQueuedReportSubmissionCount();
    setQueuedCount(count);
  }, []);

  useEffect(() => {
    let active = true;

    const refreshQueuedCountIfActive = async () => {
      const count = await getQueuedReportSubmissionCount();
      if (active) {
        setQueuedCount(count);
      }
    };

    void refreshQueuedCountIfActive();
    const timer = setInterval(() => {
      void refreshQueuedCountIfActive();
    }, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

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
  const counts = useMemo(
    () => ({
      all: reports.length,
      open: reports.filter((item) => item.status === 'open').length,
      progress: reports.filter((item) => item.status === 'progress').length,
      close: reports.filter((item) => item.status === 'close').length,
    }),
    [reports],
  );
  const activeCount = counts.open + counts.progress;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedStatus]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  return (
    <UserScreenShell
      title="Riwayat Alert Saya"
      subtitle="Pantau alert yang sudah dikirim dengan tampilan lebih ringkas."
      left={<HeaderBackButton onPress={() => navigation.navigate('UserHome')} variant="light" />}
      compact
      refreshing={reportsQuery.isFetching}
      onRefresh={() => {
        void reportsQuery.refetch();
        void refreshQueuedCount();
      }}
    >
      <View style={styles.accentStrip}>
        <View style={[styles.accentSegment, { backgroundColor: ecrTheme.colors.pertaminaBlue }]} />
        <View style={[styles.accentSegment, { backgroundColor: ecrTheme.colors.pertaminaGreen }]} />
        <View style={[styles.accentSegment, { backgroundColor: ecrTheme.colors.primaryRed }]} />
      </View>

      <View style={styles.summaryRow}>
        <SummaryPill label="Total" value={counts.all} tone="neutral" />
        <SummaryPill label="Aktif" value={activeCount} tone="info" />
        <SummaryPill label="Selesai" value={counts.close} tone="success" />
      </View>

      <View style={styles.filterCard}>
        <View style={styles.filterHeader}>
          <Text selectable style={styles.filterTitle}>
            Status
          </Text>
          <Text selectable style={styles.filterCaption}>
            {filteredReports.length} tampil
          </Text>
        </View>
        <View style={styles.filterWrap}>
          {STATUS_FILTERS.map((status) => {
            const active = selectedStatus === status;
            const meta = getFilterMeta(status);

            return (
              <Pressable
                key={status}
                onPress={() => setSelectedStatus(status)}
                accessibilityRole="button"
                accessibilityLabel={`Filter status ${meta.label}`}
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [
                  styles.filterChip,
                  active && { backgroundColor: meta.activeBackground, borderColor: meta.activeBorder },
                  pressed && styles.pressed,
                ]}
              >
                <Text numberOfLines={1} style={[styles.filterText, active && { color: meta.activeText }]}>
                  {meta.label}
                </Text>
                <Text numberOfLines={1} style={[styles.filterCount, active && { color: meta.activeText }]}>
                  {counts[status]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.searchCard}>
        <View style={styles.searchHeader}>
          <Text selectable style={styles.searchTitle}>
            Cari riwayat
          </Text>
          <Text selectable style={styles.searchCaption}>
            {filteredReports.length} hasil
          </Text>
        </View>
        <View style={styles.searchInputRow}>
          <MaterialCommunityIcons name="magnify" size={20} color={ecrTheme.colors.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari deskripsi, lokasi, departemen..."
            placeholderTextColor={ecrTheme.colors.textMuted}
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
              <MaterialCommunityIcons name="close" size={18} color={ecrTheme.colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {!isOnline && queuedCount > 0 ? (
        <View style={styles.offlineNotice}>
          <Text selectable style={styles.offlineNoticeTitle}>
            {queuedCount} alert menunggu sinkronisasi
          </Text>
          <Text selectable style={styles.offlineNoticeSubtitle}>
            Data ini akan otomatis terkirim saat jaringan kembali.
          </Text>
        </View>
      ) : null}

      {reportsQuery.isLoading ? (
        <Text selectable style={styles.loading}>
          Memuat riwayat...
        </Text>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          title="Belum ada riwayat"
          description={
            searchQuery.trim()
              ? 'Tidak ada alert yang cocok dengan pencarian.'
              : selectedStatus === 'all'
              ? 'Alert yang Anda kirim akan tampil di halaman ini.'
              : 'Tidak ada alert pada status yang dipilih.'
          }
        />
      ) : (
        <>
          <View style={styles.list}>
            {visibleReports.map((report) => (
              <ReportCard
                key={report.reportId}
                report={report}
                compact
                variant="userHistory"
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
    </UserScreenShell>
  );
}

function getFilterMeta(status: StatusFilter) {
  if (status === 'open') {
    return {
      label: 'Open',
      activeBackground: ecrTheme.status.open.bg,
      activeBorder: ecrTheme.status.open.border,
      activeText: ecrTheme.status.open.text,
    };
  }
  if (status === 'progress') {
    return {
      label: 'Progress',
      activeBackground: ecrTheme.status.progress.bg,
      activeBorder: ecrTheme.status.progress.border,
      activeText: ecrTheme.status.progress.text,
    };
  }
  if (status === 'close') {
    return {
      label: 'Close',
      activeBackground: ecrTheme.status.close.bg,
      activeBorder: ecrTheme.status.close.border,
      activeText: ecrTheme.status.close.text,
    };
  }
  return {
    label: 'Semua',
    activeBackground: '#EEF4FF',
    activeBorder: '#B8CDF8',
    activeText: ecrTheme.colors.pertaminaBlue,
  };
}

function SummaryPill({ label, value, tone }: { label: string; value: number; tone: 'neutral' | 'info' | 'success' }) {
  const colors = {
    neutral: {
      backgroundColor: '#FFFFFF',
      borderColor: ecrTheme.colors.border,
      labelColor: ecrTheme.colors.textSecondary,
      valueColor: ecrTheme.colors.textPrimary,
    },
    info: {
      backgroundColor: ecrTheme.status.progress.bg,
      borderColor: ecrTheme.status.progress.border,
      labelColor: '#1D4ED8',
      valueColor: ecrTheme.status.progress.text,
    },
    success: {
      backgroundColor: ecrTheme.status.close.bg,
      borderColor: ecrTheme.status.close.border,
      labelColor: '#166534',
      valueColor: ecrTheme.status.close.text,
    },
  }[tone];

  return (
    <View style={[styles.summaryPill, { backgroundColor: colors.backgroundColor, borderColor: colors.borderColor }]}>
      <Text selectable style={[styles.summaryValue, { color: colors.valueColor }]}>
        {value}
      </Text>
      <Text selectable style={[styles.summaryLabel, { color: colors.labelColor }]}>
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
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryPill: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 1,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  summaryValue: {
    fontSize: 17,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
    lineHeight: 21,
  },
  summaryLabel: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderColor: ecrTheme.colors.border,
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    padding: 14,
    shadowColor: ecrTheme.colors.deepNavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 1,
  },
  filterHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  filterTitle: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  filterCaption: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  filterWrap: {
    flexDirection: 'row',
    gap: 5,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderColor: ecrTheme.colors.border,
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    padding: 14,
    shadowColor: ecrTheme.colors.deepNavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 1,
  },
  searchHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  searchTitle: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  searchCaption: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  searchInputRow: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: ecrTheme.colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  searchInput: {
    color: ecrTheme.colors.textPrimary,
    flex: 1,
    fontSize: 13.5,
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
  offlineNotice: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
    borderRadius: 18,
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
  filterChip: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: ecrTheme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 3,
    minHeight: 38,
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: 5,
    paddingVertical: 7,
  },
  filterText: {
    color: ecrTheme.colors.textSecondary,
    flexShrink: 1,
    fontSize: 10.8,
    fontWeight: '800',
  },
  filterCount: {
    color: ecrTheme.colors.textMuted,
    fontSize: 10.2,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
  },
  loading: {
    color: '#667085',
    fontSize: 13,
  },
  list: {
    gap: 10,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
