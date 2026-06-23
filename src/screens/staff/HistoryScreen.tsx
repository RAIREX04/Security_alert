import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { Screen } from '../../components/Screen';
import { StaffAlertItem } from '../../components/StaffAlertItem';
import { useAuth } from '../../context/AuthContext';
import { listReports, listReportsByUser } from '../../services/report-service';
import { getDepartmentById } from '../../utils/staff';
import type { StaffStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<StaffStackParamList, 'StaffHistory'>;

const STATUS_FILTERS = ['all', 'open', 'progress', 'close'] as const;
const REQUEST_FILTERS = ['all', 'help', 'alert'] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];
type RequestFilter = (typeof REQUEST_FILTERS)[number];

function isHelpRequest(report: { sourceDepartmentId?: number | null; departmentId: number }) {
  return report.sourceDepartmentId != null && report.sourceDepartmentId !== report.departmentId;
}

export function HistoryScreen({ navigation }: Props) {
  const { user } = useAuth();
  const department = useMemo(() => getDepartmentById(user?.departmentId), [user?.departmentId]);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [selectedRequest, setSelectedRequest] = useState<RequestFilter>('all');

  const departmentReportsQuery = useQuery({
    queryKey: ['reports', 'staff-history', user?.departmentId],
    queryFn: () => listReports({ departmentId: user?.departmentId ?? undefined }),
    enabled: Boolean(user?.departmentId),
  });

  const myReportsQuery = useQuery({
    queryKey: ['reports', 'staff-history', 'my-reports', user?.userId],
    queryFn: async () => user ? listReportsByUser(user.userId) : [],
    enabled: Boolean(user?.userId),
  });

  const reports = useMemo(() => {
    const merged = [...(departmentReportsQuery.data ?? []), ...(myReportsQuery.data ?? [])];
    const seen = new Set<number>();
    return merged
      .filter((item) => {
        if (seen.has(item.reportId)) {
          return false;
        }
        seen.add(item.reportId);
        return true;
      })
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  }, [departmentReportsQuery.data, myReportsQuery.data]);
  const isLoading = departmentReportsQuery.isLoading || myReportsQuery.isLoading;
  const myHelpRequests = useMemo(
    () => (myReportsQuery.data ?? []).filter((item) => isHelpRequest(item)),
    [myReportsQuery.data],
  );
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const helpRequest = isHelpRequest(item);
      const matchesRequest =
        selectedRequest === 'all'
          || (selectedRequest === 'help' && helpRequest)
          || (selectedRequest === 'alert' && !helpRequest);

      return matchesStatus && matchesRequest;
    });
  }, [reports, selectedRequest, selectedStatus]);

  const counts = useMemo(
    () => ({
      all: reports.length,
      open: reports.filter((item) => item.status === 'open').length,
      progress: reports.filter((item) => item.status === 'progress').length,
      close: reports.filter((item) => item.status === 'close').length,
      help: myHelpRequests.length,
      alert: reports.filter((item) => !isHelpRequest(item)).length,
    }),
    [myHelpRequests.length, reports],
  );

  return (
    <Screen
      title={`Riwayat ${department.departmentName}`}
      subtitle="Pantau semua alert yang masuk, aktif, dan sudah selesai di departemen Anda."
      left={<HeaderBackButton onPress={() => navigation.navigate('StaffDashboard')} />}
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
                style={({ pressed }) => [styles.filterChip, active && styles.filterChipActive, pressed && styles.pressed]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
                <Text style={[styles.filterCount, active && styles.filterCountActive]}>{counts[status]}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.requestSection}>
          <Text selectable style={styles.filterTitleSmall}>
            Jenis Riwayat
          </Text>
          <View style={styles.filterWrap}>
            {REQUEST_FILTERS.map((request) => {
              const active = selectedRequest === request;
              const label =
                request === 'all'
                  ? 'Semua'
                  : request === 'help'
                    ? 'Minta Bantuan'
                    : 'Alert Biasa';

              return (
                <Pressable
                  key={request}
                  onPress={() => setSelectedRequest(request)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter jenis riwayat ${label}`}
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [styles.filterChip, active && styles.filterChipActive, pressed && styles.pressed]}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
                  <Text style={[styles.filterCount, active && styles.filterCountActive]}>{counts[request]}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {myHelpRequests.length > 0 ? (
        <View style={styles.myHelpCard}>
          <Text selectable style={styles.myHelpTitle}>
            Permintaan bantuan saya
          </Text>
          <Text selectable style={styles.myHelpSubtitle}>
            {myHelpRequests.length} laporan bantuan yang Anda kirim akan tetap tampil di riwayat ini.
          </Text>
          <View style={styles.myHelpList}>
            {myHelpRequests.slice(0, 3).map((report) => (
              <StaffAlertItem
                key={`help-${report.reportId}`}
                report={report}
                onPress={() => navigation.navigate('ReportDetail', { report })}
              />
            ))}
          </View>
        </View>
      ) : null}

      {isLoading ? (
        <Text selectable style={styles.loading}>
          Memuat riwayat...
        </Text>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          title="Belum ada riwayat"
          description={
            selectedStatus === 'all' && selectedRequest === 'all'
              ? 'Alert dan minta bantuan departemen Anda akan tampil di sini.'
              : 'Tidak ada riwayat pada status yang dipilih.'
          }
        />
      ) : (
        <View style={styles.list}>
          {filteredReports.map((report) => (
            <StaffAlertItem
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
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6F5',
    borderRadius: 32,
    borderWidth: 1,
    gap: 14,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 2,
  },
  myHelpCard: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderRadius: 28,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  myHelpTitle: {
    color: '#9A3412',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  myHelpSubtitle: {
    color: '#B45309',
    fontSize: 13.5,
    lineHeight: 19,
  },
  myHelpList: {
    gap: 10,
  },
  filterTitle: {
    color: '#101828',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  filterTitleSmall: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  requestSection: {
    gap: 12,
  },
  filterWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#DCE6F5',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  filterChipActive: {
    backgroundColor: '#F1FBF4',
    borderColor: '#BFE7CF',
  },
  filterText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#15803D',
  },
  filterCount: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '800',
  },
  filterCountActive: {
    color: '#15803D',
  },
  loading: {
    color: '#667085',
  },
  list: {
    gap: 12,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
});
