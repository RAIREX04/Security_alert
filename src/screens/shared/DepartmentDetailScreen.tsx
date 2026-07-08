import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { ReportCard } from '../../components/ReportCard';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { UserCard } from '../../components/UserCard';
import { getDepartmentStats } from '../../services/department-service';
import { listReports } from '../../services/report-service';
import { listUsers } from '../../services/user-service';
import { getAverageRating, getAverageResolution, getDepartmentIconName, getStaffDepartmentTheme } from '../../utils/staff';
import type { Department } from '../../types/models';

export function DepartmentDetailScreen({ navigation, route }: any) {
  const department: Department = route.params.department;
  const theme = getStaffDepartmentTheme(department);
  const iconName = getDepartmentIconName(department.departmentCode);
  const queryClient = useQueryClient();
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [expandedHistoryStaffId, setExpandedHistoryStaffId] = useState<number | null>(null);

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

  const dashboardUsers = queryClient.getQueryData<any[]>(['users', 'admin-dashboard']) ?? [];
  const dashboardReports = queryClient.getQueryData<any[]>(['reports', 'admin-dashboard']) ?? [];
  const stats = statsQuery.data ?? {};
  const staff = staffQuery.data && staffQuery.data.length > 0 ? staffQuery.data : dashboardUsers.filter(
    (user) => user.role === 'staff' && user.departmentId === department.departmentId && user.isActive,
  );
  const reports = reportQuery.data && reportQuery.data.length > 0 ? reportQuery.data : dashboardReports.filter(
    (report) => report.departmentId === department.departmentId,
  );
  const handledByStaffCount = reports.filter((report) => report.assignedStaffId != null).length;
  const staffHandlingSummary = useMemo(
    () =>
      staff
        .map((member) => {
          const handledReports = reports.filter((report) => report.assignedStaffId === member.userId);
          const handledCount = handledReports.length;
          return {
            staff: member,
            handledCount,
            handledReports,
            averageRating: getAverageRating(handledReports),
            finishedCount: handledReports.filter((report) => report.status === 'close').length,
          };
        })
        .filter((item) => item.handledCount > 0)
        .sort((a, b) => b.handledCount - a.handledCount || a.staff.fullName.localeCompare(b.staff.fullName)),
    [reports, staff],
  );
  const fallbackStats = {
    totalStaff: staff.length,
    totalReports: reports.length,
    openReports: reports.filter((report) => report.status === 'open').length,
    progressReports: reports.filter((report) => report.status === 'progress').length,
    closeReports: reports.filter((report) => report.status === 'close').length,
  };
  const derivedStats = {
    totalStaff: stats.totalStaff ?? fallbackStats.totalStaff,
    totalReports: stats.totalReports ?? fallbackStats.totalReports,
    openReports: stats.openReports ?? fallbackStats.openReports,
    progressReports: stats.progressReports ?? fallbackStats.progressReports,
    closeReports: stats.closeReports ?? fallbackStats.closeReports,
  };
  const openReports = derivedStats.openReports;
  const progressReports = derivedStats.progressReports;
  const closeReports = derivedStats.closeReports;
  const totalReports = derivedStats.totalReports;
  const averageResolution = getAverageResolution(reports);
  const averageRating = getAverageRating(reports);
  const maxFlow = Math.max(openReports, progressReports, closeReports, 1);
  const refetchAll = async () => {
    await Promise.all([statsQuery.refetch(), staffQuery.refetch(), reportQuery.refetch()]);
  };

  return (
    <Screen
      title={department.departmentName}
      subtitle={department.description ?? undefined}
      left={<HeaderBackButton onPress={() => navigation.goBack()} />}
      refreshing={statsQuery.isFetching || staffQuery.isFetching || reportQuery.isFetching}
      onRefresh={() => void refetchAll()}
    >
      <SectionCard tone="soft">
        <View style={styles.heroHeader}>
          <View style={[styles.heroIconWrap, { backgroundColor: theme.soft }]}>
            <MaterialCommunityIcons name={iconName as any} size={36} color={theme.color} />
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
          <QuickStat label="Diambil staff" value={handledByStaffCount} accent="#7C3AED" />
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
              Rating rata-rata
            </Text>
            <Text selectable style={styles.chartFooterValue}>
              {averageRating != null ? `${averageRating}/5` : '-'}
            </Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard>
        <Text selectable style={styles.sectionTitle}>
          Statistik detail
        </Text>
        <View style={styles.detailGrid}>
          <DetailRow label="Total staff aktif" value={derivedStats.totalStaff} />
          <DetailRow label="Total alert masuk" value={totalReports} />
          <DetailRow label="Alert open" value={openReports} />
          <DetailRow label="Alert progress" value={progressReports} />
          <DetailRow label="Alert close" value={closeReports} />
        </View>
      </SectionCard>

      <View style={styles.dualMetrics}>
        <PremiumKpi label="Staff aktif" value={derivedStats.totalStaff} tone={theme.soft} color={theme.color} />
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

      <SectionCard tone="soft">
        <Text style={styles.sectionTitle}>Alert per Staff</Text>
        <Text selectable style={styles.sectionSubtitle}>
          Lihat siapa yang paling banyak menangani alert di departemen ini.
        </Text>
        {staffHandlingSummary.length ? (
          <View style={styles.staffSummaryList}>
            {staffHandlingSummary.map(({ staff: member, handledCount, handledReports, averageRating, finishedCount }) => {
              const isSelected = selectedStaffId === member.userId;
              const isHistoryExpanded = expandedHistoryStaffId === member.userId;
              const historyItems = isHistoryExpanded ? handledReports : handledReports.slice(0, 4);
              return (
                <View key={member.userId} style={styles.staffSummaryBlock}>
                  <Pressable
                    onPress={() => setSelectedStaffId((current) => (current === member.userId ? null : member.userId))}
                    style={({ pressed }) => [styles.staffSummaryRow, pressed && styles.staffSummaryPressed]}
                  >
                    <View style={styles.staffSummaryLeft}>
                      <View style={[styles.staffSummaryAvatar, { backgroundColor: theme.soft }]}>
                        <Text style={[styles.staffSummaryAvatarText, { color: theme.color }]}>
                          {member.fullName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.staffSummaryBody}>
                        <Text selectable style={styles.staffSummaryName} numberOfLines={1}>
                          {member.fullName}
                        </Text>
                        <Text selectable style={styles.staffSummaryMeta} numberOfLines={1}>
                          {member.username}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.staffSummaryBadge, { backgroundColor: `${theme.color}12` }]}>
                      <Text selectable style={[styles.staffSummaryBadgeText, { color: theme.color }]}>
                        {handledCount} alert
                      </Text>
                    </View>
                  </Pressable>
                  {isSelected ? (
                    <View style={styles.staffDetailCard}>
                      <View style={styles.staffDetailHeader}>
                        <View>
                          <Text selectable style={styles.staffDetailTitle}>
                            Detail staff
                          </Text>
                          <Text selectable style={styles.staffDetailSubtitle}>
                            {member.fullName}
                          </Text>
                        </View>
                        <View style={[styles.staffDetailRatingPill, { backgroundColor: `${theme.color}12` }]}>
                          <Text selectable style={[styles.staffDetailRatingText, { color: theme.color }]}>
                            {averageRating != null ? `${averageRating}/5` : '-'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.staffDetailMetrics}>
                        <MiniMetric
                          label="Alert dikerjakan"
                          value={handledCount}
                          accent={theme.color}
                          onPress={() => setExpandedHistoryStaffId((current) => (current === member.userId ? null : member.userId))}
                        />
                        <MiniMetric
                          label="Alert selesai"
                          value={finishedCount}
                          accent="#15803D"
                        />
                      </View>
                      <Text selectable style={styles.staffDetailHint}>
                        Tekan kartu alert dikerjakan untuk melihat semua riwayat staff ini.
                      </Text>

                      <View style={styles.staffDetailSectionHeader}>
                        <Text selectable style={styles.staffDetailSectionTitle}>
                          {isHistoryExpanded ? 'Semua riwayat' : 'Riwayat terbaru'}
                        </Text>
                        <Pressable
                          onPress={() => setExpandedHistoryStaffId((current) => (current === member.userId ? null : member.userId))}
                          style={({ pressed }) => [styles.staffDetailToggle, pressed && styles.staffDetailTogglePressed]}
                        >
                          <Text style={styles.staffDetailToggleText}>
                            {isHistoryExpanded ? 'Tutup' : 'Lihat semua'}
                          </Text>
                        </Pressable>
                      </View>
                      <View style={styles.staffHistoryList}>
                        {historyItems.map((report) => (
                          <View key={report.reportId} style={styles.staffHistoryRow}>
                            <View style={styles.staffHistoryLeft}>
                              <View style={[styles.staffHistoryDot, { backgroundColor: theme.color }]} />
                              <View style={styles.staffHistoryBody}>
                                <Text selectable style={styles.staffHistoryTitle}>
                                  {report.description}
                                </Text>
                                <Text selectable style={styles.staffHistoryMeta}>
                                  {report.status.toUpperCase()} • {report.createdAt ? new Date(report.createdAt).toLocaleDateString('id-ID') : '-'}
                                </Text>
                              </View>
                            </View>
                            <Text selectable style={styles.staffHistoryScore}>
                              {report.requesterRatingScore ?? report.ratingScore ?? report.staffRatingScore ?? '-'}
                            </Text>
                          </View>
                        ))}
                        {!historyItems.length ? (
                          <Text selectable style={styles.staffHistoryEmpty}>
                            Belum ada riwayat untuk staff ini.
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState title="Belum ada alert yang diambil" description="Alert yang sudah diambil staff akan tampil di sini." />
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
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 19,
    marginBottom: 10,
    marginTop: 4,
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
  staffSummaryList: {
    gap: 10,
  },
  staffSummaryRow: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6F5',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 14,
  },
  staffSummaryPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  staffSummaryLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minWidth: 0,
  },
  staffSummaryAvatar: {
    alignItems: 'center',
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  staffSummaryAvatarText: {
    fontSize: 16,
    fontWeight: '900',
  },
  staffSummaryBody: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  staffSummaryName: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '900',
  },
  staffSummaryMeta: {
    color: '#667085',
    fontSize: 12.5,
    fontWeight: '700',
  },
  staffSummaryBadge: {
    borderRadius: 999,
    minWidth: 74,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  staffSummaryBadgeText: {
    fontSize: 12.5,
    fontWeight: '900',
    textAlign: 'center',
  },
  staffSummaryBlock: {
    gap: 10,
  },
  staffDetailCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6F5',
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  staffDetailHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  staffDetailTitle: {
    color: '#0F2C57',
    fontSize: 15,
    fontWeight: '900',
  },
  staffDetailSubtitle: {
    color: '#667085',
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 2,
  },
  staffDetailRatingPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  staffDetailRatingText: {
    fontSize: 13,
    fontWeight: '900',
  },
  staffDetailMetrics: {
    flexDirection: 'row',
    gap: 10,
  },
  staffDetailHint: {
    color: '#667085',
    fontSize: 11.5,
    fontWeight: '600',
    lineHeight: 16,
  },
  staffDetailSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  staffDetailToggle: {
    alignItems: 'center',
    backgroundColor: '#EFF4FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  staffDetailTogglePressed: {
    opacity: 0.86,
  },
  staffDetailToggleText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '800',
  },
  miniMetric: {
    backgroundColor: '#F8FAFC',
    borderColor: '#DCE6F5',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: 12,
  },
  miniMetricPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  miniMetricValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  miniMetricLabel: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '700',
  },
  staffDetailSectionTitle: {
    color: '#0F2C57',
    fontSize: 13,
    fontWeight: '900',
  },
  staffHistoryList: {
    gap: 8,
  },
  staffHistoryRow: {
    alignItems: 'center',
    backgroundColor: '#F8FBFF',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  staffHistoryLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  staffHistoryDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  staffHistoryBody: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  staffHistoryTitle: {
    color: '#101828',
    fontSize: 13.5,
    fontWeight: '800',
    lineHeight: 18,
  },
  staffHistoryMeta: {
    color: '#667085',
    fontSize: 11.5,
    fontWeight: '700',
    lineHeight: 15,
  },
  staffHistoryEmpty: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 4,
    paddingTop: 2,
  },
  staffHistoryScore: {
    color: '#1D4ED8',
    fontSize: 12.5,
    fontWeight: '900',
  },
});

function MiniMetric({
  label,
  value,
  accent,
  onPress,
}: {
  label: string;
  value: number;
  accent: string;
  onPress?: () => void;
}) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.miniMetric, pressed && styles.miniMetricPressed]}
      >
        <Text selectable style={[styles.miniMetricValue, { color: accent }]}>
          {value}
        </Text>
        <Text selectable style={styles.miniMetricLabel}>
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.miniMetric}>
      <Text selectable style={[styles.miniMetricValue, { color: accent }]}>
        {value}
      </Text>
      <Text selectable style={styles.miniMetricLabel}>
        {label}
      </Text>
    </View>
  );
}
