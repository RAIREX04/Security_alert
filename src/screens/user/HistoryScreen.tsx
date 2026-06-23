import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { ReportCard } from '../../components/ReportCard';
import { UserScreenShell } from '../../components/UserScreenShell';
import { listReportsByUser } from '../../services/report-service';
import { useAuth } from '../../context/AuthContext';
import { ecrTheme } from '../../theme/ecrTheme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { UserStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<UserStackParamList, 'UserHistory'>;

const STATUS_FILTERS = ['all', 'open', 'progress', 'close'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export function HistoryScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
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

  return (
    <UserScreenShell
      title="Riwayat Alert Saya"
      subtitle="Pantau alert yang sudah dikirim dengan tampilan lebih ringkas."
      left={<HeaderBackButton onPress={() => navigation.navigate('UserHome')} variant="light" />}
      compact
    >
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
                <Text style={[styles.filterText, active && { color: meta.activeText }]}>{meta.label}</Text>
                <Text style={[styles.filterCount, active && { color: meta.activeText }]}>{counts[status]}</Text>
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
              compact
              onPress={() => navigation.navigate('ReportDetail', { report })}
            />
          ))}
        </View>
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
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    padding: 12,
    shadowColor: ecrTheme.colors.deepNavy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
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
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: ecrTheme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterText: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: '800',
  },
  filterCount: {
    color: ecrTheme.colors.textMuted,
    fontSize: 11.5,
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
