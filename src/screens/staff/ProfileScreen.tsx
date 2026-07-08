import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { getMe } from '../../services/auth-service';
import { getProfileSummary } from '../../services/user-service';
import { listReports } from '../../services/report-service';
import { formatDate } from '../../utils/format';
import { getDepartmentById, getStaffDepartmentTheme } from '../../utils/staff';
import { normalizeMediaUrl } from '../../utils/media';
import { ImageZoomModal } from '../../components/ImageZoomModal';
import { AppNoticeModal } from '../../components/AppNoticeModal';
import { ProfileAvatar } from '../../components/ProfileAvatar';
import type { StaffStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<StaffStackParamList, 'StaffProfile'>;

export function ProfileScreen({ navigation }: Props) {
  const { signOut, user } = useAuth();
  const [zoomUri, setZoomUri] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ title: string; message: string; tone?: 'success' | 'info' | 'warning' } | null>(null);
  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });
  const summaryQuery = useQuery({
    queryKey: ['profile-summary'],
    queryFn: getProfileSummary,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const profile = profileQuery.data ?? user;
  const department = useMemo(() => getDepartmentById(profile?.departmentId), [profile?.departmentId]);
  const theme = useMemo(() => getStaffDepartmentTheme(department), [department]);

  const reportsQuery = useQuery({
    queryKey: ['reports', 'staff-profile', profile?.departmentId],
    queryFn: () => listReports({ departmentId: profile?.departmentId ?? undefined }),
    enabled: Boolean(profile?.departmentId),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const reports = reportsQuery.data ?? [];
  const openCount = reports.filter((item) => item.status === 'open').length;
  const progressCount = reports.filter((item) => item.status === 'progress').length;
  const closeCount = reports.filter((item) => item.status === 'close').length;

  useFocusEffect(
    useCallback(() => {
      void profileQuery.refetch();
      void summaryQuery.refetch();
      void reportsQuery.refetch();
    }, [profileQuery.refetch, reportsQuery.refetch, summaryQuery.refetch]),
  );

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      setNotice({
        title: 'Logout gagal',
        message: error instanceof Error ? error.message : 'Coba lagi.',
        tone: 'warning',
      });
    }
  };

  return (
    <Screen
      title="Profile"
      subtitle="Kelola identitas, fungsi, departemen, dan sesi login Anda."
      left={<HeaderBackButton onPress={() => navigation.navigate('StaffDashboard')} />}
    >
      {!profile ? (
        <EmptyState title="Profil tidak ditemukan" description="Coba login ulang untuk memuat profil Anda." />
      ) : (
        <View style={styles.stack}>
          <View style={[styles.heroCard, { backgroundColor: theme.ink }]}>
            <ProfileAvatar
              name={profile.fullName}
              photoUrl={profile.photoUrl}
              size={92}
              onPress={() => profile.photoUrl && setZoomUri(normalizeMediaUrl(profile.photoUrl))}
              containerStyle={styles.avatar}
              imageStyle={styles.avatarImage}
              fallbackStyle={styles.avatarFallback}
            />

            <View style={styles.heroText}>
              <Text selectable style={styles.name}>
                {profile.fullName}
              </Text>
              <Text selectable style={styles.role}>
                {profile.role === 'staff' ? 'Petugas' : profile.role === 'admin' ? 'Admin' : 'Pelapor'}
              </Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            <MetricChip label="Open" value={openCount} accent="#C62828" />
            <MetricChip label="Progress" value={progressCount} accent="#0E7AAC" />
            <MetricChip label="Close" value={closeCount} accent="#15803D" />
          </View>

          {summaryQuery.data ? (
            <View style={styles.metricRow}>
              <MetricChip label="Dibuat" value={summaryQuery.data.reportsCreated} accent={theme.color} />
              <MetricChip label="Ditangani" value={summaryQuery.data.reportsHandled} accent={theme.color} />
            </View>
          ) : null}

          <View style={styles.detailCard}>
            <ProfileRow label="Nama" value={profile.fullName} />
            <ProfileRow label="Email" value={profile.email} />
            <ProfileRow label="Nomor Telepon" value={profile.phoneNumber ?? '-'} />
            <ProfileRow label="Peran" value={profile.role ?? 'staff'} />
            <ProfileRow label="Fungsi" value={profile.department ?? department.departmentName} />
            <ProfileRow label="Status" value={profile.approvalStatus} />
            <ProfileRow label="Last login" value={formatDate(profile.lastLoginAt)} />
          </View>

          <View style={styles.sectionCard}>
            <Text selectable style={styles.sectionTitle}>
              Ringkasan departemen
            </Text>
            <Text selectable style={styles.sectionSubtitle}>
              {department.description ?? 'Data departemen aktif Anda.'}
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate('EditProfile', { user: profile })}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>Edit Profile</Text>
          </Pressable>

          <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </Pressable>
        </View>
      )}
      <ImageZoomModal visible={Boolean(zoomUri)} uri={zoomUri} title={profile?.fullName ?? 'Foto profil'} onClose={() => setZoomUri(null)} />
      <AppNoticeModal
        visible={Boolean(notice)}
        title={notice?.title ?? ''}
        message={notice?.message ?? ''}
        tone={notice?.tone ?? 'warning'}
        onAction={() => setNotice(null)}
      />
    </Screen>
  );
}

function MetricChip({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <View style={styles.metricChip}>
      <View style={[styles.metricBar, { backgroundColor: accent }]} />
      <Text selectable style={[styles.metricValue, { color: accent }]}>
        {value}
      </Text>
      <Text selectable style={styles.metricLabel}>
        {label}
      </Text>
    </View>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text selectable style={styles.rowLabel}>
        {label}
      </Text>
      <Text selectable style={styles.rowValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  editButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: '#D9E2EE',
    borderRadius: 18,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  editButtonText: {
    color: '#101828',
    fontSize: 20,
    fontWeight: '900',
  },
  stack: {
    gap: 14,
  },
  heroCard: {
    alignItems: 'center',
    borderRadius: 34,
    borderColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    minHeight: 156,
    padding: 18,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 2,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    height: 92,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 92,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarFallback: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
  },
  heroText: {
    flex: 1,
    gap: 6,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  role: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 18,
    fontWeight: '600',
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricChip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6F5',
    borderRadius: 30,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    minWidth: 100,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 1,
  },
  metricBar: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    height: 4,
    width: 36,
  },
  metricValue: {
    fontSize: 30,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    color: '#667085',
    fontSize: 14,
    fontWeight: '700',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6F5',
    borderRadius: 30,
    borderWidth: 1,
    gap: 0,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 2,
  },
  row: {
    alignItems: 'flex-start',
    borderBottomColor: '#E7EDF5',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  rowLabel: {
    color: '#667085',
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  rowValue: {
    color: '#101828',
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6F5',
    borderRadius: 30,
    borderWidth: 1,
    gap: 8,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 2,
  },
  sectionTitle: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 20,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#2F5DE5',
    borderRadius: 22,
    borderWidth: 1.4,
    minHeight: 56,
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 1,
  },
  secondaryButtonText: {
    color: '#2F5DE5',
    fontSize: 16,
    fontWeight: '900',
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#101828',
    borderRadius: 22,
    minHeight: 56,
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
