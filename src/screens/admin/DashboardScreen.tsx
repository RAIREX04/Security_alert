import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../../components/EmptyState';
import { MetricCard } from '../../components/MetricCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ReportCard } from '../../components/ReportCard';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { UserCard } from '../../components/UserCard';
import { listDepartments } from '../../services/department-service';
import { listReports } from '../../services/report-service';
import { listUsers } from '../../services/user-service';
import { getDepartmentIconName, getStaffDepartmentTheme } from '../../utils/staff';
import type { AdminStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminDashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const usersQuery = useQuery({
    queryKey: ['users', 'admin-dashboard'],
    queryFn: () => listUsers(),
  });
  const pendingStaffQuery = useQuery({
    queryKey: ['users', 'admin-dashboard', 'pending-staff'],
    queryFn: () => listUsers({ role: 'staff', approvalStatus: 'pending' }),
  });
  const reportsQuery = useQuery({
    queryKey: ['reports', 'admin-dashboard'],
    queryFn: () => listReports(),
  });
  const departmentsQuery = useQuery({
    queryKey: ['departments', 'admin-dashboard'],
    queryFn: listDepartments,
  });

  const users = usersQuery.data ?? [];
  const pendingStaff = pendingStaffQuery.data ?? [];
  const reports = reportsQuery.data ?? [];
  const departments = departmentsQuery.data ?? [];

  const summary = useMemo(
    () => ({
      activeUsers: users.filter((item) => item.role === 'user' && item.isActive).length,
      activeStaff: users.filter((item) => item.role === 'staff' && item.approvalStatus === 'approved' && item.isActive).length,
      totalAlerts: reports.length,
      openAlerts: reports.filter((item) => item.status === 'open').length,
      progressAlerts: reports.filter((item) => item.status === 'progress').length,
      closeAlerts: reports.filter((item) => item.status === 'close').length,
      pendingApprovals: pendingStaff.length,
    }),
    [pendingStaff.length, reports, users],
  );

  const departmentRows = useMemo(
    () =>
      departments.map((department) => {
        const deptReports = reports.filter((report) => report.departmentId === department.departmentId);
        const deptStaff = users.filter((user) => user.role === 'staff' && user.departmentId === department.departmentId && user.isActive);
        return {
          department,
          reportCount: deptReports.length,
          staffCount: deptStaff.length,
          theme: getStaffDepartmentTheme(department),
        };
      }),
    [departments, reports, users],
  );

  const refetchAll = async () => {
    await Promise.all([usersQuery.refetch(), pendingStaffQuery.refetch(), reportsQuery.refetch(), departmentsQuery.refetch()]);
  };

  return (
    <Screen
      title="Panel Admin"
      subtitle="Kelola user, staff, departemen, dan seluruh alert dari satu tempat."
      refreshing={usersQuery.isFetching || pendingStaffQuery.isFetching || reportsQuery.isFetching || departmentsQuery.isFetching}
      onRefresh={() => void refetchAll()}
      right={
        <Pressable
          onPress={() => void refetchAll()}
          accessibilityRole="button"
          accessibilityLabel="Refresh dashboard"
          style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="refresh" size={22} color="#101828" />
        </Pressable>
      }
    >
      <SectionCard tone="soft">
        <Text selectable style={styles.sectionLabel}>
          COMMAND CENTER
        </Text>
        <Text selectable style={[styles.heroTitle, compact && styles.heroTitleCompact]}>
          Dashboard Admin
        </Text>
        <Text selectable style={styles.heroSubtitle}>
          Admin dapat menambah karyawan, departemen, dan memantau semua user serta alert lintas departemen.
        </Text>

        <View style={styles.metricRow}>
          <MetricCard label="User Aktif" value={summary.activeUsers} accent="#2563EB" />
          <MetricCard label="Karyawan Aktif" value={summary.activeStaff} accent="#16A34A" />
        </View>
        <View style={styles.metricRow}>
          <MetricCard label="Total Alert" value={summary.totalAlerts} accent="#DC2626" />
          <MetricCard label="Pending Approval" value={summary.pendingApprovals} accent="#F97316" />
        </View>
      </SectionCard>

      <SectionCard>
        <View style={styles.sectionHeader}>
          <View>
            <Text selectable style={styles.sectionTitle}>
              Ringkasan Alert
            </Text>
            <Text selectable style={styles.sectionSubtitle}>
              Distribusi status seluruh alert.
            </Text>
          </View>
          <View style={styles.countPill}>
            <Text selectable style={styles.countPillValue}>
              {summary.totalAlerts}
            </Text>
          </View>
        </View>

        <View style={styles.alertTable}>
          <StatRow label="Open" value={summary.openAlerts} accent="#DC2626" />
          <StatRow label="Progress" value={summary.progressAlerts} accent="#0EA5E9" />
          <StatRow label="Close" value={summary.closeAlerts} accent="#16A34A" />
        </View>
      </SectionCard>

      <SectionCard>
        <View style={styles.sectionHeader}>
          <View>
            <Text selectable style={styles.sectionTitle}>
              Kelola Departemen
            </Text>
            <Text selectable style={styles.sectionSubtitle}>
              Statistik ringkas masing-masing departemen.
            </Text>
          </View>
        </View>

        {departmentRows.length === 0 ? (
          <EmptyState title="Belum ada departemen" description="Data departemen akan tampil di sini." />
        ) : (
          <View style={styles.departmentList}>
            {departmentRows.map(({ department, reportCount, staffCount, theme }) => {
              const iconName = getDepartmentIconName(department.departmentCode);
              return (
              <Pressable
                key={department.departmentId}
                onPress={() => navigation.navigate('DepartmentDetail', { department })}
                accessibilityRole="button"
                accessibilityLabel={`Buka detail ${department.departmentName}`}
                style={({ pressed }) => [styles.departmentCard, pressed && styles.pressed]}
              >
                <View style={[styles.departmentStripe, { backgroundColor: theme.color }]} />
                <View style={[styles.departmentIconWrap, { backgroundColor: theme.soft }]}>
                  <MaterialCommunityIcons name={iconName as any} size={28} color={theme.color} />
                </View>
                <View style={styles.departmentBody}>
                  <Text selectable style={styles.departmentTitle} numberOfLines={2}>
                    {department.departmentName}
                  </Text>
                  <Text selectable style={styles.departmentMeta} numberOfLines={2}>
                    {reportCount} alert | {staffCount} staff aktif
                  </Text>
                </View>
              </Pressable>
              );
            })}
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
              {reports.length} item terakhir.
            </Text>
          </View>
        </View>

        {reports.length === 0 ? (
          <EmptyState title="Belum ada alert" description="Laporan terbaru akan tampil di sini." />
        ) : (
          <View style={styles.list}>
            {reports.slice(0, 3).map((report) => (
              <ReportCard key={report.reportId} report={report} onPress={() => navigation.navigate('ReportDetail', { report })} />
            ))}
          </View>
        )}
      </SectionCard>

      <SectionCard>
        <View style={styles.sectionHeader}>
          <View>
            <Text selectable style={styles.sectionTitle}>
              Approval Staff
            </Text>
            <Text selectable style={styles.sectionSubtitle}>
              Tinjau karyawan baru yang menunggu persetujuan.
            </Text>
          </View>
          <View style={styles.countPill}>
            <Text selectable style={styles.countPillValue}>
              {summary.pendingApprovals}
            </Text>
          </View>
        </View>

        {pendingStaff.length === 0 ? (
          <EmptyState title="Tidak ada approval pending" description="Semua staff sudah diverifikasi." />
        ) : (
          <View style={styles.list}>
            {pendingStaff.slice(0, 4).map((user) => (
              <UserCard
                key={user.userId}
                user={user}
                subtitle={user.department ?? 'Menunggu approval admin'}
                onPress={() => navigation.navigate('UserDetail', { user })}
              />
            ))}
          </View>
        )}
      </SectionCard>

      <SectionCard tone="soft">
        <Text selectable style={styles.sectionTitle}>
          Aksi Cepat
        </Text>
        <View style={styles.quickActions}>
          <PrimaryButton title="Tambah Karyawan" onPress={() => navigation.navigate('CreateStaff')} />
          <PrimaryButton title="Tambah User" onPress={() => navigation.navigate('CreateUser')} />
        </View>
      </SectionCard>
    </Screen>
  );
}

function StatRow({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <View style={styles.statRow}>
      <View style={styles.statLeft}>
        <View style={[styles.statDot, { backgroundColor: accent }]} />
        <Text selectable style={styles.statLabel}>
          {label}
        </Text>
      </View>
      <Text selectable style={[styles.statValue, { color: accent }]}>
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
  heroTitleCompact: {
    fontSize: 22,
    lineHeight: 28,
  },
  heroSubtitle: {
    color: '#667085',
    fontSize: 14.5,
    lineHeight: 21,
  },
  metricRow: {
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
  alertTable: {
    gap: 10,
  },
  statRow: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#DCE6F5',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  statDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  statLabel: {
    color: '#475569',
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  departmentList: {
    gap: 12,
  },
  departmentCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6F5',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    overflow: 'hidden',
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 1,
  },
  departmentStripe: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 4,
  },
  departmentIconWrap: {
    alignItems: 'center',
    borderRadius: 18,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  departmentBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  departmentTitle: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 21,
  },
  departmentMeta: {
    color: '#667085',
    fontSize: 13.5,
    lineHeight: 18,
  },
  list: {
    gap: 12,
  },
  quickActions: {
    gap: 10,
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
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});

