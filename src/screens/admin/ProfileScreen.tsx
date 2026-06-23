import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { useAuth } from '../../context/AuthContext';
import { getMe } from '../../services/auth-service';
import { listDepartments } from '../../services/department-service';
import { listReports } from '../../services/report-service';
import { listUsers } from '../../services/user-service';
import { formatDate } from '../../utils/format';
import { normalizeMediaUrl } from '../../utils/media';
import { ImageZoomModal } from '../../components/ImageZoomModal';
import { AppNoticeModal } from '../../components/AppNoticeModal';
import { ProfileAvatar } from '../../components/ProfileAvatar';
import type { AdminStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminProfile'>;

export function ProfileScreen({ navigation }: Props) {
  const { signOut, user } = useAuth();
  const [zoomUri, setZoomUri] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ title: string; message: string; tone?: 'success' | 'info' | 'warning' } | null>(null);
  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const usersQuery = useQuery({
    queryKey: ['admin-profile', 'users'],
    queryFn: () => listUsers(),
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const reportsQuery = useQuery({
    queryKey: ['admin-profile', 'reports'],
    queryFn: () => listReports(),
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const departmentsQuery = useQuery({
    queryKey: ['admin-profile', 'departments'],
    queryFn: listDepartments,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const profile = profileQuery.data ?? user;
  const users = usersQuery.data ?? [];
  const reports = reportsQuery.data ?? [];
  const departments = departmentsQuery.data ?? [];

  useFocusEffect(
    useCallback(() => {
      void profileQuery.refetch();
      void usersQuery.refetch();
      void reportsQuery.refetch();
      void departmentsQuery.refetch();
    }, [departmentsQuery.refetch, profileQuery.refetch, reportsQuery.refetch, usersQuery.refetch]),
  );

  const summary = useMemo(
    () => ({
      activeUsers: users.filter((item) => item.role === 'user' && item.isActive).length,
      activeStaff: users.filter((item) => item.role === 'staff' && item.approvalStatus === 'approved' && item.isActive).length,
      pendingStaff: users.filter((item) => item.role === 'staff' && item.approvalStatus === 'pending').length,
      totalAlerts: reports.length,
    }),
    [reports.length, users],
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

  if (!profile) {
    return (
      <Screen
        title="Profil Admin"
        subtitle="Kelola identitas dan akses admin."
        left={<HeaderBackButton onPress={() => navigation.navigate('AdminDashboard')} />}
      >
        <EmptyState title="Profil tidak ditemukan" description="Coba login ulang untuk memuat profil." />
      </Screen>
    );
  }

  return (
    <Screen
      title="Profil Admin"
      subtitle="Kelola identitas, akses, dan ringkasan panel Anda."
      left={<HeaderBackButton onPress={() => navigation.navigate('AdminDashboard')} />}
      right={
        <Pressable
          onPress={() => navigation.navigate('EditUser', { user: profile })}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
        >
          <Text style={styles.editButtonText}>✎</Text>
        </Pressable>
      }
    >
      <View style={styles.stack}>
        <View style={styles.heroCard}>
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
              {profile.role === 'admin' ? 'Super Admin' : profile.role === 'staff' ? 'Staff' : 'Pelapor'}
            </Text>
          </View>
        </View>

        <View style={styles.metrics}>
          <MetricChip label="User aktif" value={summary.activeUsers} />
          <MetricChip label="Staff aktif" value={summary.activeStaff} />
        </View>

        <View style={styles.metrics}>
          <MetricChip label="Alert" value={summary.totalAlerts} accent="#B91C1C" />
          <MetricChip label="Departemen" value={departments.length} accent="#1D4ED8" />
        </View>

        <SectionCard>
          <Text style={styles.sectionTitle}>Akun admin</Text>
          <View style={styles.detailCard}>
            <ProfileRow label="Nama" value={profile.fullName} />
            <ProfileRow label="Username" value={profile.username} />
            <ProfileRow label="Email" value={profile.email} />
            <ProfileRow label="Nomor Telepon" value={profile.phoneNumber ?? '-'} />
            <ProfileRow label="Peran" value={profile.role ?? 'admin'} />
            <ProfileRow label="Last login" value={formatDate(profile.lastLoginAt)} />
          </View>
        </SectionCard>

        <SectionCard tone="soft">
          <Text style={styles.sectionTitle}>Akses cepat</Text>
          <View style={styles.quickLinks}>
            <QuickLink title="Kelola Karyawan" subtitle="Approval dan detail staff" onPress={() => navigation.navigate('EmployeeDirectory')} />
            <QuickLink title="Kelola User" subtitle="Akun pelapor" onPress={() => navigation.navigate('UserDirectory')} />
            <QuickLink title="Lihat Riwayat" subtitle="Audit seluruh alert" onPress={() => navigation.navigate('AdminHistory')} />
          </View>
        </SectionCard>

        <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </View>
      <ImageZoomModal visible={Boolean(zoomUri)} uri={zoomUri} title={profile.fullName ?? 'Foto profil'} onClose={() => setZoomUri(null)} />
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

function MetricChip({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <View style={[styles.metricChip, accent ? { borderColor: `${accent}33` } : null]}>
      <Text selectable style={[styles.metricValue, accent ? { color: accent } : null]}>
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

function QuickLink({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickLink, pressed && styles.pressed]}>
      <Text selectable style={styles.quickLinkTitle}>
        {title}
      </Text>
      <Text selectable style={styles.quickLinkSubtitle}>
        {subtitle}
      </Text>
    </Pressable>
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
    backgroundColor: '#173B7A',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 32,
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
  metrics: {
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
    minWidth: 120,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 1,
  },
  metricValue: {
    color: '#101828',
    fontSize: 30,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    color: '#667085',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#0F2C57',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
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
  quickLinks: {
    gap: 10,
  },
  quickLink: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6F5',
    borderRadius: 22,
    borderWidth: 1,
    gap: 4,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 1,
  },
  quickLinkTitle: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '900',
  },
  quickLinkSubtitle: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '600',
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
