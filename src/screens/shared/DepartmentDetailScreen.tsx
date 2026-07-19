import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { HistoryPagination } from '../../components/HistoryPagination';
import { ReportCard } from '../../components/ReportCard';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { UserCard } from '../../components/UserCard';
import { getDepartmentStats, updateDepartment } from '../../services/department-service';
import { listReports } from '../../services/report-service';
import { listUsers } from '../../services/user-service';
import { getAverageRating, getAverageResolution, getDepartmentIconName, getStaffDepartmentTheme } from '../../utils/staff';
import {
  getPageCount,
  getPaginatedItems,
  HISTORY_PAGE_SIZE,
  matchesReportSearch,
} from '../../utils/report-history';
import type { Department } from '../../types/models';

export function DepartmentDetailScreen({ navigation, route }: any) {
  const [department, setDepartment] = useState<Department>(route.params.department);
  const theme = getStaffDepartmentTheme(department);
  const iconName = getDepartmentIconName(department.departmentCode);
  const queryClient = useQueryClient();
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [expandedHistoryStaffId, setExpandedHistoryStaffId] = useState<number | null>(null);
  const [isEditingDepartment, setIsEditingDepartment] = useState(false);
  const [departmentHistorySearch, setDepartmentHistorySearch] = useState('');
  const [departmentHistoryPage, setDepartmentHistoryPage] = useState(1);
  const [form, setForm] = useState({
    departmentCode: department.departmentCode,
    departmentName: department.departmentName,
    description: department.description ?? '',
    isActive: department.isActive,
  });
  const [notice, setNotice] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateDepartment(department.departmentId, {
        departmentCode: form.departmentCode.trim(),
        departmentName: form.departmentName.trim(),
        description: form.description.trim() || null,
        isActive: form.isActive,
      }),
    onSuccess: async (updated) => {
      setDepartment(updated);
      setForm({
        departmentCode: updated.departmentCode,
        departmentName: updated.departmentName,
        description: updated.description ?? '',
        isActive: updated.isActive,
      });
      queryClient.setQueryData<Department[]>(['departments', 'admin-dashboard'], (current) =>
        current?.map((item) => (item.departmentId === updated.departmentId ? updated : item)) ?? current,
      );
      await queryClient.invalidateQueries({ queryKey: ['departments'] });
      setIsEditingDepartment(false);
      setNotice('Departemen berhasil diperbarui.');
    },
    onError: (error) => {
      setNotice(error instanceof Error ? error.message : 'Departemen gagal diperbarui.');
    },
  });

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
  const filteredDepartmentReports = useMemo(
    () =>
      reports
        .filter((report) => matchesReportSearch(report, departmentHistorySearch))
        .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()),
    [departmentHistorySearch, reports],
  );
  const departmentHistoryPageCount = getPageCount(filteredDepartmentReports.length, HISTORY_PAGE_SIZE);
  const visibleDepartmentReports = useMemo(
    () => getPaginatedItems(filteredDepartmentReports, departmentHistoryPage, HISTORY_PAGE_SIZE),
    [departmentHistoryPage, filteredDepartmentReports],
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

  useEffect(() => {
    setDepartmentHistoryPage(1);
  }, [departmentHistorySearch]);

  useEffect(() => {
    if (departmentHistoryPage > departmentHistoryPageCount) {
      setDepartmentHistoryPage(departmentHistoryPageCount);
    }
  }, [departmentHistoryPage, departmentHistoryPageCount]);

  const handleSaveDepartment = () => {
    if (!form.departmentCode.trim() || !form.departmentName.trim()) {
      setNotice('Kode dan nama departemen wajib diisi.');
      return;
    }

    updateMutation.mutate();
  };

  const handleToggleEditDepartment = () => {
    setNotice(null);
    setForm({
      departmentCode: department.departmentCode,
      departmentName: department.departmentName,
      description: department.description ?? '',
      isActive: department.isActive,
    });
    setIsEditingDepartment((current) => !current);
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
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderText}>
            <Text selectable style={styles.sectionTitle}>
              Atur Departemen
            </Text>
            <Text selectable style={styles.sectionSubtitle}>
              Ubah nama, kode, deskripsi, dan status departemen.
            </Text>
          </View>
          <Pressable
            onPress={handleToggleEditDepartment}
            accessibilityRole="button"
            accessibilityLabel={isEditingDepartment ? 'Tutup edit departemen' : 'Edit departemen'}
            style={({ pressed }) => [styles.editIconButton, pressed && styles.staffSummaryPressed]}
          >
            <MaterialCommunityIcons
              name={isEditingDepartment ? 'close' : 'pencil-outline'}
              size={23}
              color="#1D4ED8"
            />
          </Pressable>
        </View>

        {notice ? (
          <View style={styles.noticeBox}>
            <Text selectable style={styles.noticeText}>
              {notice}
            </Text>
          </View>
        ) : null}

        {isEditingDepartment ? (
          <View style={styles.formStack}>
            <DepartmentField
              label="Nama departemen"
              value={form.departmentName}
              onChangeText={(departmentName) => setForm((current) => ({ ...current, departmentName }))}
            />
            <DepartmentField
              label="Kode departemen"
              value={form.departmentCode}
              onChangeText={(departmentCode) => setForm((current) => ({ ...current, departmentCode }))}
            />
            <DepartmentField
              label="Deskripsi"
              value={form.description}
              multiline
              onChangeText={(description) => setForm((current) => ({ ...current, description }))}
            />

            <Pressable
              onPress={() => setForm((current) => ({ ...current, isActive: !current.isActive }))}
              accessibilityRole="switch"
              accessibilityState={{ checked: form.isActive }}
              style={({ pressed }) => [styles.activeToggle, pressed && styles.staffSummaryPressed]}
            >
              <View style={styles.activeToggleText}>
                <Text selectable style={styles.activeToggleTitle}>
                  Status departemen
                </Text>
                <Text selectable style={styles.activeToggleSubtitle}>
                  {form.isActive ? 'Aktif dan tampil di aplikasi' : 'Nonaktif dari daftar pilihan'}
                </Text>
              </View>
              <MaterialCommunityIcons
                name={form.isActive ? 'toggle-switch' : 'toggle-switch-off-outline'}
                size={42}
                color={form.isActive ? '#16A34A' : '#94A3B8'}
              />
            </Pressable>

            <Pressable
              onPress={handleSaveDepartment}
              disabled={updateMutation.isPending}
              accessibilityRole="button"
              accessibilityLabel="Simpan perubahan departemen"
              style={({ pressed }) => [
                styles.saveButton,
                updateMutation.isPending && styles.saveButtonDisabled,
                pressed && !updateMutation.isPending && styles.staffSummaryPressed,
              ]}
            >
              <Text style={styles.saveButtonText}>
                {updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.departmentPreview}>
            <DepartmentInfoRow label="Nama" value={department.departmentName} />
            <DepartmentInfoRow label="Kode" value={department.departmentCode} />
            <DepartmentInfoRow label="Deskripsi" value={department.description ?? '-'} />
            <View style={styles.departmentStatusPreview}>
              <View style={[styles.statusDot, { backgroundColor: department.isActive ? '#16A34A' : '#94A3B8' }]} />
              <Text selectable style={styles.departmentStatusText}>
                {department.isActive ? 'Aktif di aplikasi' : 'Nonaktif dari daftar pilihan'}
              </Text>
            </View>
          </View>
        )}
      </SectionCard>

      <SectionCard>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>Riwayat Departemen</Text>
            <Text selectable style={styles.sectionSubtitle}>
              Cari alert departemen ini dan lihat 10 data per halaman.
            </Text>
          </View>
          <Text selectable style={styles.sectionCount}>
            {filteredDepartmentReports.length} tampil
          </Text>
        </View>

        <View style={styles.searchInputRow}>
          <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
          <TextInput
            value={departmentHistorySearch}
            onChangeText={setDepartmentHistorySearch}
            placeholder="Cari deskripsi, lokasi, staff, user..."
            placeholderTextColor="#94A3B8"
            returnKeyType="search"
            style={styles.searchInput}
          />
          {departmentHistorySearch ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Hapus pencarian riwayat departemen"
              onPress={() => setDepartmentHistorySearch('')}
              style={({ pressed }) => [styles.clearButton, pressed && styles.staffSummaryPressed]}
            >
              <MaterialCommunityIcons name="close" size={18} color="#64748B" />
            </Pressable>
          ) : null}
        </View>

        {reports.length ? (
          filteredDepartmentReports.length ? (
            <>
              <View style={styles.list}>
                {visibleDepartmentReports.map((report) => (
                  <ReportCard key={report.reportId} report={report} onPress={() => navigation.navigate('ReportDetail', { report })} />
                ))}
              </View>
              <HistoryPagination
                page={departmentHistoryPage}
                pageCount={departmentHistoryPageCount}
                totalItems={filteredDepartmentReports.length}
                pageSize={HISTORY_PAGE_SIZE}
                itemLabel="alert"
                onPageChange={setDepartmentHistoryPage}
              />
            </>
          ) : (
            <EmptyState title="Tidak ada hasil" description="Tidak ada alert departemen yang cocok dengan pencarian." />
          )
        ) : (
          <EmptyState title="Belum ada alert" description="Alert departemen akan muncul di sini." />
        )}
      </SectionCard>
    </Screen>
  );
}

function DepartmentField({
  label,
  value,
  multiline,
  onChangeText,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  onChangeText: (text: string) => void;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text selectable style={styles.inputLabel}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholder={label}
        placeholderTextColor="#94A3B8"
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.inputMultiline]}
      />
    </View>
  );
}

function DepartmentInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.departmentInfoRow}>
      <Text selectable style={styles.departmentInfoLabel}>
        {label}
      </Text>
      <Text selectable style={styles.departmentInfoValue}>
        {value}
      </Text>
    </View>
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
  sectionHeaderRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  sectionHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  sectionCount: {
    color: '#64748B',
    fontSize: 12.5,
    fontWeight: '800',
    paddingTop: 2,
  },
  editIconButton: {
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderRadius: 16,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  noticeBox: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noticeText: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  formStack: {
    gap: 12,
  },
  inputGroup: {
    gap: 7,
  },
  inputLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6F5',
    borderRadius: 16,
    borderWidth: 1,
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputMultiline: {
    minHeight: 92,
    lineHeight: 21,
  },
  activeToggle: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#DCE6F5',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  activeToggleText: {
    flex: 1,
    minWidth: 0,
  },
  activeToggleTitle: {
    color: '#0F2C57',
    fontSize: 15,
    fontWeight: '900',
  },
  activeToggleSubtitle: {
    color: '#667085',
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 2,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#1D4ED8',
    borderRadius: 18,
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
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
  departmentPreview: {
    backgroundColor: '#F8FAFC',
    borderColor: '#DCE6F5',
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  departmentInfoRow: {
    gap: 4,
  },
  departmentInfoLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
  },
  departmentInfoValue: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  departmentStatusPreview: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingTop: 2,
  },
  statusDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  departmentStatusText: {
    color: '#475569',
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
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
