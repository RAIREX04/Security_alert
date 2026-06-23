import { StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { ReportCard } from '../../components/ReportCard';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { UserCard } from '../../components/UserCard';
import { getDepartmentStats } from '../../services/department-service';
import { listReports } from '../../services/report-service';
import { listUsers } from '../../services/user-service';
import { getAverageResolution, getDepartmentGlyph, getStaffDepartmentTheme } from '../../utils/staff';
import type { Department } from '../../types/models';

export function DepartmentDetailScreen({ navigation, route }: any) {
  const department: Department = route.params.department;
  const theme = getStaffDepartmentTheme(department);

  const statsQuery = useQuery({
    queryKey: ['department-stats', department.departmentId],
    queryFn: () => getDepartmentStats(department.departmentId),
  });
  const staffQuery = useQuery({
    queryKey: ['users', 'department', department.departmentId],
    queryFn: () => listUsers({ role: 'staff', departmentId: department.departmentId }),
  });
  const reportQuery = useQuery({
    queryKey: ['reports', 'department', department.departmentId],
    queryFn: () => listReports({ departmentId: department.departmentId }),
  });

  const stats = statsQuery.data ?? {};
  const staff = staffQuery.data ?? [];
  const reports = reportQuery.data ?? [];
  const openReports = stats.openReports ?? 0;
  const progressReports = stats.progressReports ?? 0;
  const closeReports = stats.closeReports ?? 0;
  const totalReports = reports.length;
  const averageResolution = getAverageResolution(reports);
  const maxFlow = Math.max(openReports, progressReports, closeReports, 1);

  return (
    <Screen
      title={department.departmentName}
      subtitle={department.description ?? undefined}
      left={<HeaderBackButton onPress={() => navigation.goBack()} />}
    >
      <SectionCard tone="soft">
        <View style={styles.heroHeader}>
          <View style={[styles.heroIconWrap, { backgroundColor: theme.soft }]}>
            <Text selectable style={[styles.heroIcon, { color: theme.color }]}>
              {getDepartmentGlyph(department.departmentCode)}
            </Text>
          </View>
          <View style={styles.heroText}>
            <Text selectable style={styles.heroLabel}>
              DETAIL DEPARTEMEN
            </Text>
            <Text selectable style={styles.heroTitle}>
              {department.departmentCode}
            </Text>
          </View>
        </View>
        <Text selectable style={styles.heroSubtitle}>
          {department.description ?? 'Ringkasan staf dan alert departemen ini.'}
        </Text>

        <View style={styles.quickStats}>
          <QuickStat label="Staff aktif" value={stats.totalStaff ?? staff.length} accent={theme.color} />
          <QuickStat label="Open" value={openReports} accent="#DC2626" />
          <QuickStat label="Progress" value={progressReports} accent="#0369A1" />
          <QuickStat label="Close" value={closeReports} accent="#15803D" />
        </View>
      </SectionCard>

      <SectionCard>
        <Text selectable style={styles.sectionTitle}>
          Statistik visual
        </Text>
        <View style={styles.chartStack}>
          <ChartRow label="Open" value={openReports} total={maxFlow} color="#DC2626" />
          <ChartRow label="Progress" value={progressReports} total={maxFlow} color="#0EA5E9" />
          <ChartRow label="Close" value={closeReports} total={maxFlow} color="#16A34A" />
        </View>
        <View style={styles.chartFooter}>
          <View style={styles.chartFooterItem}>
            <Text selectable style={styles.chartFooterLabel}>
              Total alert
            </Text>
            <Text selectable style={styles.chartFooterValue}>
              {totalReports}
            </Text>
          </View>
          <View style={styles.chartFooterItem}>
            <Text selectable style={styles.chartFooterLabel}>
              Rata-rata penyelesaian
            </Text>
            <Text selectable style={styles.chartFooterValue}>
              {averageResolution ?? '-'}
            </Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard>
        <Text selectable style={styles.sectionTitle}>
          Statistik detail
        </Text>
        <View style={styles.detailGrid}>
          <DetailRow label="Total staff aktif" value={stats.totalStaff ?? staff.length} />
          <DetailRow label="Total alert masuk" value={totalReports} />
          <DetailRow label="Alert open" value={openReports} />
          <DetailRow label="Alert progress" value={progressReports} />
          <DetailRow label="Alert close" value={closeReports} />
        </View>
      </SectionCard>

      <View style={styles.dualMetrics}>
        <PremiumKpi label="Staff aktif" value={stats.totalStaff ?? staff.length} tone={theme.soft} color={theme.color} />
        <PremiumKpi label="Rata-rata penyelesaian" value={averageResolution ?? '-'} tone="#F8FAFC" color="#0F2C57" />
      </View>

      <SectionCard>
        <Text style={styles.sectionTitle}>Staff Departemen</Text>
        {staff.length ? (
          <View style={styles.list}>
            {staff.map((user) => (
              <UserCard key={user.userId} user={user} onPress={() => navigation.navigate('UserDetail', { user })} />
            ))}
          </View>
        ) : (
          <EmptyState title="Belum ada staff" description="Tambahkan staff untuk departemen ini." />
        )}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Alert Departemen</Text>
        {reports.length ? (
          <View style={styles.list}>
            {reports.map((report) => (
              <ReportCard key={report.reportId} report={report} onPress={() => navigation.navigate('ReportDetail', { report })} />
            ))}
          </View>
        ) : (
          <EmptyState title="Belum ada alert" description="Alert departemen akan muncul di sini." />
        )}
      </SectionCard>
    </Screen>
  );
}

function QuickStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <View style={[styles.quickStat, accent ? { backgroundColor: `${accent}14` } : null]}>
      <Text selectable style={[styles.quickStatValue, accent ? { color: accent } : null]}>
        {value}
      </Text>
      <Text selectable style={styles.quickStatLabel}>
        {label}
      </Text>
    </View>
  );
}

function ChartRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const width = `${Math.min(100, Math.max(0, total === 0 ? 0 : (value / total) * 100))}%` as `${number}%`;
  return (
    <View style={styles.chartRow}>
      <View style={styles.chartRowHeader}>
        <Text selectable style={styles.chartLabel}>
          {label}
        </Text>
        <Text selectable style={styles.chartValue}>
          {value}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.detailRow}>
      <Text selectable style={styles.detailLabel}>
        {label}
      </Text>
      <Text selectable style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

function PremiumKpi({
  label,
  value,
  tone,
  color,
}: {
  label: string;
  value: number | string;
  tone: string;
  color: string;
}) {
  return (
    <View style={[styles.premiumKpi, { backgroundColor: tone }]}>
      <Text selectable style={[styles.premiumKpiValue, { color }]}>
        {value}
      </Text>
      <Text selectable style={styles.premiumKpiLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  heroIconWrap: {
    alignItems: 'center',
    borderRadius: 22,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  heroIcon: {
    fontSize: 32,
    fontWeight: '900',
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  heroLabel: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: '#0F2C57',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    color: '#475569',
    lineHeight: 20,
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickStat: {
    backgroundColor: '#F5F8FF',
    borderRadius: 18,
    flexBasis: '48%',
    flexGrow: 1,
    gap: 6,
    minHeight: 86,
    padding: 14,
  },
  quickStatValue: {
    color: '#1E3A8A',
    fontSize: 30,
    fontWeight: '900',
  },
  quickStatLabel: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#0F2C57',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  chartStack: {
    gap: 14,
  },
  chartRow: {
    gap: 8,
  },
  chartRowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '800',
  },
  chartValue: {
    color: '#0F2C57',
    fontSize: 14,
    fontWeight: '900',
  },
  track: {
    backgroundColor: '#EDF2F7',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
    height: '100%',
  },
  chartFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  chartFooterItem: {
    backgroundColor: '#F8FAFC',
    borderColor: '#D7E3F0',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: 14,
  },
  chartFooterLabel: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '700',
  },
  chartFooterValue: {
    color: '#0F2C57',
    fontSize: 18,
    fontWeight: '900',
  },
  detailGrid: {
    gap: 10,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailLabel: {
    color: '#475569',
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  detailValue: {
    color: '#0F2C57',
    fontSize: 15,
    fontWeight: '900',
  },
  dualMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  premiumKpi: {
    borderRadius: 22,
    flexBasis: '48%',
    flexGrow: 1,
    gap: 6,
    minHeight: 92,
    padding: 16,
  },
  premiumKpiValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  premiumKpiLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    gap: 10,
  },
});
