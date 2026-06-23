import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../../components/EmptyState';
import { MetricCard } from '../../components/MetricCard';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { StaffAlertItem } from '../../components/StaffAlertItem';
import { useAuth } from '../../context/AuthContext';
import { listReports, listReportsByUser } from '../../services/report-service';
import { formatDuration, getAverageResolution, getDepartmentById, getStaffDepartmentTheme } from '../../utils/staff';
import type { StaffStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<StaffStackParamList, 'StaffDashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const department = useMemo(() => getDepartmentById(user?.departmentId), [user?.departmentId]);
  const theme = useMemo(() => getStaffDepartmentTheme(department), [department]);

  const departmentReportsQuery = useQuery({
    queryKey: ['reports', 'staff-dashboard', user?.departmentId],
    queryFn: () => listReports({ departmentId: user?.departmentId ?? undefined }),
    enabled: Boolean(user?.departmentId),
    refetchInterval: 8000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  const myReportsQuery = useQuery({
    queryKey: ['reports', 'staff-dashboard', 'my-reports', user?.userId],
    queryFn: async () => (user ? listReportsByUser(user.userId) : []),
    enabled: Boolean(user?.userId),
    refetchInterval: 8000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  const reports = useMemo(() => {
    const merged = [...(departmentReportsQuery.data ?? []), ...(myReportsQuery.data ?? [])];
    const seen = new Set<number>();
    return merged
      .filter((report) => {
        if (seen.has(report.reportId)) return false;
        seen.add(report.reportId);
        return true;
      })
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  }, [departmentReportsQuery.data, myReportsQuery.data]);

  const isLoading = departmentReportsQuery.isLoading || myReportsQuery.isLoading;
  const openReports = reports.filter((item) => item.status === 'open');
  const progressReports = reports.filter((item) => item.status === 'progress');
  const closeReports = reports.filter((item) => item.status === 'close');
  const activeReports = reports.filter((item) => item.status !== 'close');
  const assignedReports = reports.filter((item) => item.assignedStaffId === user?.userId && item.status !== 'close');
  const helpRequests = reports.filter((item) => item.sourceDepartmentId != null && item.sourceDepartmentId !== item.departmentId && item.status !== 'close' && !item.assignedStaffId);
  const averageResolution = getAverageResolution(closeReports);
  const recentReports = [...reports].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());

  return (
    <Screen
      title={`Dashboard ${department.departmentName}`}
      subtitle="Pantau alert departemen, ambil tugas, dan selesaikan dengan cepat."
    >
      <SectionCard tone="soft">
        <Text selectable style={styles.sectionLabel}>
          COMMAND CENTER
        </Text>
        <Text selectable style={styles.heroTitle}>
          {department.departmentName}
        </Text>
        <Text selectable style={styles.heroSubtitle}>
          {department.description ?? 'Penanganan alert departemen dan dukungan lintas tim.'}
        </Text>

        {helpRequests.length > 0 ? (
          <View style={styles.helpBadge}>
            <View style={styles.helpBadgeDot} />
            <View style={styles.helpBadgeBody}>
              <Text selectable style={styles.helpBadgeTitle}>
                Ada permintaan bantuan baru
              </Text>
              <Text selectable style={styles.helpBadgeText}>
                {helpRequests.length} laporan dari departemen lain menunggu penanganan.
              </Text>
            </View>
            <View style={styles.helpBadgeCount}>
              <Text selectable style={styles.helpBadgeCountText}>
                {helpRequests.length}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.metricGrid}>
          <MetricCard label="Total Alert" value={reports.length} accent={theme.color} />
          <MetricCard label="Open" value={openReports.length} accent="#DC2626" />
          <MetricCard label="Progress" value={progressReports.length} accent="#0EA5E9" />
          <MetricCard label="Close" value={closeReports.length} accent="#16A34A" />
        </View>
      </SectionCard>

      <SectionCard>
        <View style={styles.sectionHeader}>
          <View>
            <Text selectable style={styles.sectionTitle}>
              Ringkasan operasional
            </Text>
            <Text selectable style={styles.sectionSubtitle}>
              Lihat status kerja dan performa penanganan secara cepat.
            </Text>
          </View>
          <View style={styles.countPill}>
            <Text selectable style={styles.countPillValue}>
              {activeReports.length}
            </Text>
          </View>
        </View>

        <View style={styles.summaryList}>
          <SummaryRow label="Alert aktif departemen" value={openReports.length + progressReports.length} accent={theme.color} />
          <SummaryRow label="Sedang Anda tangani" value={assignedReports.length} accent={theme.color} />
          <SummaryRow label="Rata-rata penyelesaian" value={averageResolution ?? formatDuration(0)} accent="#16A34A" />
        </View>
      </SectionCard>

      <SectionCard>
        <View style={styles.sectionHeader}>
          <View>
            <Text selectable style={styles.sectionTitle}>
              Alert Aktif
            </Text>
            <Text selectable style={styles.sectionSubtitle}>
              Alert yang belum close akan muncul di sini.
            </Text>
          </View>
          <Pressable
            onPress={() => void departmentReportsQuery.refetch()}
            accessibilityRole="button"
            accessibilityLabel="Refresh alert"
            style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}
          >
            <Text style={styles.refreshButtonIcon}>↻</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <Text selectable style={styles.loading}>
            Memuat alert departemen...
          </Text>
        ) : activeReports.length === 0 ? (
          <EmptyState title="Tidak ada alert aktif" description="Alert baru departemen akan tampil di sini saat user mengirim laporan." />
        ) : (
          <View style={styles.list}>
            {activeReports.map((report) => (
              <StaffAlertItem
                key={report.reportId}
                report={report}
                onPress={() => navigation.navigate('ReportDetail', { report })}
              />
            ))}
          </View>
        )}
      </SectionCard>

      <SectionCard tone="soft">
        <View style={styles.sectionHeader}>
          <View>
            <Text selectable style={styles.sectionTitle}>
              Aktivitas Terbaru
            </Text>
            <Text selectable style={styles.sectionSubtitle}>
              {recentReports.length} item terbaru.
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('StaffHistory')}
            accessibilityRole="button"
            accessibilityLabel="Lihat riwayat staff"
            style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
          >
            <Text style={styles.linkButtonText}>Lihat semua</Text>
          </Pressable>
        </View>

        {recentReports.length === 0 ? (
          <EmptyState title="Belum ada aktivitas" description="Alert yang masuk ke departemen Anda akan muncul di sini." />
        ) : (
          <View style={styles.list}>
            {recentReports.slice(0, 4).map((report) => (
              <StaffAlertItem
                key={report.reportId}
                report={report}
                onPress={() => navigation.navigate('ReportDetail', { report })}
              />
            ))}
          </View>
        )}
      </SectionCard>
    </Screen>
  );
}

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryLeft}>
        <View style={[styles.summaryDot, { backgroundColor: accent }]} />
        <Text selectable style={styles.summaryLabel}>
          {label}
        </Text>
      </View>
      <Text selectable style={[styles.summaryValue, { color: accent }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#102B57',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  heroSubtitle: {
    color: '#667085',
    fontSize: 14.5,
    lineHeight: 21,
  },
  helpBadge: {
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderColor: '#F6C4CC',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  helpBadgeDot: {
    backgroundColor: '#DA1E37',
    borderRadius: 999,
    height: 12,
    width: 12,
  },
  helpBadgeBody: {
    flex: 1,
    gap: 2,
  },
  helpBadgeTitle: {
    color: '#B91C1C',
    fontSize: 15,
    fontWeight: '900',
  },
  helpBadgeText: {
    color: '#C24141',
    fontSize: 13,
    lineHeight: 18,
  },
  helpBadgeCount: {
    alignItems: 'center',
    backgroundColor: '#B91C1C',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    minWidth: 34,
    paddingHorizontal: 10,
  },
  helpBadgeCountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sectionHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 4,
  },
  countPill: {
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    minWidth: 44,
    paddingHorizontal: 12,
  },
  countPillValue: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '900',
  },
  summaryList: {
    gap: 10,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  summaryDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  summaryLabel: {
    color: '#475467',
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  refreshButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3EF',
    borderRadius: 18,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  refreshButtonIcon: {
    color: '#101828',
    fontSize: 22,
    fontWeight: '900',
  },
  loading: {
    color: '#667085',
  },
  list: {
    gap: 12,
  },
  linkButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3EF',
    borderRadius: 999,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  linkButtonText: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});

