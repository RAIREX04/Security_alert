import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { UserScreenShell } from '../../components/UserScreenShell';
import { useAuth } from '../../context/AuthContext';
import { getMe } from '../../services/auth-service';
import { getProfileSummary } from '../../services/user-service';
import { formatDate } from '../../utils/format';
import type { UserStackParamList } from '../../types/navigation';
import { normalizeMediaUrl } from '../../utils/media';
import { ImageZoomModal } from '../../components/ImageZoomModal';
import { AppNoticeModal } from '../../components/AppNoticeModal';
import { ProfileAvatar } from '../../components/ProfileAvatar';

type Props = NativeStackScreenProps<UserStackParamList, 'UserProfile'>;

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
  const summaryQuery = useQuery({
    queryKey: ['profile-summary'],
    queryFn: getProfileSummary,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const profile = profileQuery.data ?? user;
  const summary = summaryQuery.data;

  useFocusEffect(
    useCallback(() => {
      void profileQuery.refetch();
      void summaryQuery.refetch();
    }, [profileQuery.refetch, summaryQuery.refetch]),
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
    <UserScreenShell
      title="Profile"
      subtitle="Kelola identitas, fungsi, departemen, dan sesi login."
      left={<HeaderBackButton onPress={() => navigation.navigate('UserHome')} variant="light" />}
    >
      {!profile ? (
        <EmptyState title="Profil tidak ditemukan" description="Coba login ulang untuk memuat profil." />
      ) : (
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
              {profile.role === 'admin' ? 'Admin' : profile.role === 'staff' ? 'Staff' : 'Pelapor'}
            </Text>
          </View>
          </View>

          {summary ? (
            <View style={styles.metrics}>
              <MetricChip label="Dibuat" value={summary.reportsCreated} />
              <MetricChip label="Ditangani" value={summary.reportsHandled} />
            </View>
          ) : null}

          <View style={styles.detailCard}>
            <ProfileRow label="Nama" value={profile.fullName} />
            <ProfileRow label="Email" value={profile.email} />
            <ProfileRow label="Nomor Telepon" value={profile.phoneNumber ?? '-'} />
            <ProfileRow label="Peran" value={profile.role ?? 'user'} />
            <ProfileRow label="Fungsi" value={profile.department ?? '-'} />
            <ProfileRow label="Last login" value={formatDate(profile.lastLoginAt)} />
          </View>

          <Pressable
            onPress={() => navigation.navigate('EditProfile', { user: profile })}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>Edit Profile</Text>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
          >
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
    </UserScreenShell>
  );
}

function MetricChip({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metricChip}>
      <Text selectable style={styles.metricValue}>
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

