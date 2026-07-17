import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DashboardDepartmentCard } from '../../components/DashboardDepartmentCard';
import { UserScreenShell } from '../../components/UserScreenShell';
import { useAuth } from '../../context/AuthContext';
import { listDepartments } from '../../services/department-service';
import { listReportsByUser } from '../../services/report-service';
import { ecrTheme } from '../../theme/ecrTheme';
import { departmentFallbacks } from '../../utils/department';
import { getDepartmentIconName, getStaffDepartmentTheme } from '../../utils/staff';
import type { Report } from '../../types/models';
import type { UserStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<UserStackParamList, 'UserHome'>;

export function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const fullName = user?.fullName?.trim() || 'User';
  const displayName = fullName.replace(/\s+/g, ' ');

  const reportsQuery = useQuery({
    queryKey: ['reports', 'user-dashboard', user?.userId],
    queryFn: async () => (user ? listReportsByUser(user.userId) : []),
    enabled: Boolean(user?.userId),
    refetchInterval: 8000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });
  const departmentsQuery = useQuery({
    queryKey: ['departments', 'user-home'],
    queryFn: listDepartments,
  });

  const reports = reportsQuery.data ?? [];
  const departments = useMemo(() => {
    const activeDepartments = (departmentsQuery.data ?? []).filter((department) => department.isActive);
    return activeDepartments.length > 0 ? activeDepartments : departmentFallbacks.slice(0, 4);
  }, [departmentsQuery.data]);
  const countsByDepartment = useMemo(() => departments.map((department) => ({ department })), [departments]);
  const recentReports = useMemo(
    () =>
      [...reports]
        .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
        .slice(0, 3),
    [reports],
  );

  return (
    <UserScreenShell
      title=""
      subtitle={undefined}
      scrollable
      refreshing={reportsQuery.isFetching || departmentsQuery.isFetching}
      onRefresh={() => {
        void reportsQuery.refetch();
        void departmentsQuery.refetch();
      }}
    >
      <View style={styles.body}>
        <View style={styles.hero}>
          <Text selectable style={styles.dateText}>
            {formatToday()}
          </Text>

          <Text selectable style={styles.heroTitle} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.82}>
            Hello, {displayName}.
          </Text>

          <Text selectable style={styles.heroSubtitle}>
            Pilih departemen awal, lalu tambahkan departemen lain di form alert.
          </Text>

          <View style={styles.accentStrip}>
            <View style={[styles.accentSegment, { backgroundColor: ecrTheme.colors.pertaminaBlue }]} />
            <View style={[styles.accentSegment, { backgroundColor: ecrTheme.colors.pertaminaGreen }]} />
            <View style={[styles.accentSegment, { backgroundColor: ecrTheme.colors.primaryRed }]} />
          </View>
        </View>

        <View style={styles.departmentRow}>
          {countsByDepartment.map(({ department }) => (
            <DashboardDepartmentCard
              key={department.departmentId}
              department={department}
              onPress={() =>
                navigation.navigate('ReportForm', {
                  departmentId: department.departmentId,
                  departmentName: department.departmentName,
                })
              }
            />
          ))}
        </View>

        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text selectable style={styles.sectionTitle}>
              History
            </Text>
            <Pressable
              onPress={() => navigation.navigate('UserHistory')}
              accessibilityRole="button"
              accessibilityLabel="Lihat semua riwayat"
              style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
            >
              <Text style={styles.linkButtonText}>Lihat semua</Text>
            </Pressable>
          </View>

          <View style={styles.historyList}>
            {recentReports.map((report) => (
              <HistoryRow
                key={report.reportId}
                report={report}
                onPress={() => navigation.navigate('ReportDetail', { report })}
              />
            ))}
          </View>
        </View>
      </View>
    </UserScreenShell>
  );
}

function HistoryRow({ report, onPress }: { report: Report; onPress: () => void }) {
  const department = departmentFallbacks.find((item) => item.departmentId === report.departmentId) ?? departmentFallbacks[0];
  const theme = getStaffDepartmentTheme(department);
  const iconName = getDepartmentIconName(department.departmentCode);
  const title = report.department || department.departmentName;
  const subtitle = report.description || 'Alert baru dari user sedang menunggu penanganan.';
  const timeLabel = formatRelativeTime(report.createdAt);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Buka detail ${title}`}
      style={({ pressed }) => [styles.historyRow, pressed && styles.pressed]}
    >
      <View style={styles.historyIconWrap}>
        <View style={[styles.historyIconBadge, { backgroundColor: `${theme.soft}` }]}>
          <MaterialCommunityIcons name={iconName as any} size={19} color={theme.color} />
        </View>
      </View>

      <View style={styles.historyBody}>
        <Text selectable style={[styles.historyTitle, { color: theme.ink }]} numberOfLines={1}>
          {title}
        </Text>
        <Text selectable style={styles.historySubtitle} numberOfLines={1}>
          {subtitle}
          {'  '}
          <Text style={[styles.historyTime, { color: theme.color }]}>• {timeLabel}</Text>
        </Text>
      </View>
    </Pressable>
  );
}

function formatToday() {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

function formatRelativeTime(value?: string) {
  if (!value) return 'baru saja';
  const diffMinutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (diffMinutes < 1) return 'baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} hari lalu`;
}

const styles = StyleSheet.create({
  body: {
    gap: ecrTheme.spacing.md,
  },
  hero: {
    gap: 8,
    paddingTop: 2,
  },
  dateText: {
    color: ecrTheme.colors.pertaminaBlue,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  heroTitle: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 33,
  },
  heroSubtitle: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 20,
    maxWidth: 320,
  },
  accentStrip: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 8,
    width: 160,
  },
  accentSegment: {
    borderRadius: 999,
    height: 5,
    flex: 1,
  },
  departmentRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
  },
  historySection: {
    gap: 12,
    marginTop: 4,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  linkButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  linkButtonText: {
    color: ecrTheme.colors.pertaminaBlue,
    fontSize: 14,
    fontWeight: '800',
  },
  historyList: {
    gap: 10,
  },
  historyRow: {
    alignItems: 'center',
    backgroundColor: ecrTheme.colors.card,
    borderColor: ecrTheme.colors.border,
    borderRadius: ecrTheme.radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    ...ecrTheme.shadows.soft,
  },
  historyIconWrap: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 16,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  historyIconBadge: {
    alignItems: 'center',
    borderRadius: 14,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  historyBody: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  historyTitle: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  historySubtitle: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  historyTime: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});

