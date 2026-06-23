import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppConfirmModal } from '../../components/AppConfirmModal';
import { AppNoticeModal } from '../../components/AppNoticeModal';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { StatusBadge } from '../../components/StatusBadge';
import { approveUser, deleteUser, rejectUser } from '../../services/user-service';
import { updateUser } from '../../services/user-service';
import type { User } from '../../types/models';
import { formatDate } from '../../utils/format';
import { getApiErrorMessage } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { normalizeMediaUrl } from '../../utils/media';
import { ImageZoomModal } from '../../components/ImageZoomModal';
import { ProfileAvatar } from '../../components/ProfileAvatar';

export function UserDetailScreen({ navigation, route }: any) {
  const user: User = route.params.user;
  const { user: currentUser } = useAuth();
  const [zoomUri, setZoomUri] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ title: string; message: string; tone?: 'success' | 'info' | 'warning' } | null>(null);
  const [confirm, setConfirm] = useState<
    | { action: 'approve' | 'reject' | 'delete' | 'activate'; title: string; message: string; confirm: string; tone?: 'danger' | 'warning' | 'info' }
    | null
  >(null);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (action: 'approve' | 'reject' | 'delete' | 'activate') => {
      if (action === 'approve') return approveUser(user.userId);
      if (action === 'reject') return rejectUser(user.userId);
      if (action === 'activate') return updateUser(user.userId, { isActive: true });
      return deleteUser(user.userId);
    },
    onSuccess: async (_, action) => {
      if (action === 'delete') {
        queryClient.setQueriesData({ queryKey: ['users'] }, (old: unknown) => {
          if (!Array.isArray(old)) return old;
          return old.filter((item) => item?.userId !== user.userId);
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['users'] });
      setNotice({
        title: 'Berhasil',
        message:
          action === 'delete'
            ? 'Akun berhasil dihapus dari database.'
            : action === 'activate'
              ? 'Akun diaktifkan kembali.'
              : 'Status approval diperbarui.',
        tone: 'success',
      });
    },
    onError: (error) =>
      setNotice({
        title: 'Gagal',
        message: getApiErrorMessage(error),
        tone: 'warning',
      }),
  });

  const confirmDelete = () => {
    setConfirm({
      action: 'delete',
      title: 'Hapus akun?',
      message: 'Akun akan dihapus permanen dari database. Histori laporan tetap aman.',
      confirm: 'Hapus',
      tone: 'danger',
    });
  };

  const confirmApprovalAction = (action: 'approve' | 'reject' | 'activate') => {
    const copy = {
      approve: {
        title: 'Approve staff?',
        message: 'Staff akan langsung bisa login dan menerima tugas alert.',
        confirm: 'Approve',
      },
      reject: {
        title: 'Reject staff?',
        message: 'Status staff berubah menjadi ditolak dan tidak bisa login.',
        confirm: 'Reject',
      },
      activate: {
        title: 'Aktifkan akun?',
        message: 'Akun akan kembali bisa digunakan sesuai role dan statusnya.',
        confirm: 'Aktifkan',
      },
    }[action];

    setConfirm({
      action,
      title: copy.title,
      message: copy.message,
      confirm: copy.confirm,
      tone: action === 'reject' ? 'danger' : 'warning',
    });
  };

  return (
    <Screen
      title={user.fullName}
      subtitle={`${user.role ?? 'user'} - ${user.approvalStatus}`}
      left={<HeaderBackButton onPress={() => navigation.goBack()} />}
    >
      <SectionCard tone="soft">
        <View style={styles.heroRow}>
          <ProfileAvatar
            name={user.fullName}
            photoUrl={user.photoUrl}
            size={92}
            onPress={() => user.photoUrl && setZoomUri(normalizeMediaUrl(user.photoUrl))}
            containerStyle={styles.avatar}
            imageStyle={styles.avatarImage}
            fallbackStyle={styles.avatarFallback}
          />
          <View style={styles.heroText}>
            <Text style={styles.heroLabel}>DETAIL AKUN</Text>
            <Text style={styles.heroValue}>{user.fullName}</Text>
            <Text style={styles.heroMeta}>{user.email}</Text>
            <View style={styles.heroChips}>
              <StatusBadge status={user.approvalStatus} />
              <View style={styles.roleChip}>
                <Text style={styles.roleChipText}>{user.role ?? 'user'}</Text>
              </View>
            </View>
          </View>
        </View>
      </SectionCard>

      <SectionCard>
        <View style={styles.infoGrid}>
          <Info label="Username" value={user.username} />
          <Info label="Telepon" value={user.phoneNumber || '-'} />
          <Info label="Departemen" value={user.department || '-'} />
          <Info label="Status akun" value={user.isActive ? 'Aktif' : 'Nonaktif'} />
          <Info label="Approved at" value={formatDate(user.approvedAt)} />
          <Info label="Last login" value={formatDate(user.lastLoginAt)} />
        </View>
      </SectionCard>

      {user.role === 'staff' && user.approvalStatus === 'pending' ? (
        <SectionCard tone="warning">
          <Text style={styles.noticeTitle}>Menunggu approval admin</Text>
          <Text style={styles.noticeText}>
            Staff ini belum bisa login sampai Anda memutuskan approve atau reject.
          </Text>
        </SectionCard>
      ) : null}

      <View style={styles.actions}>
        {user.role === 'staff' && user.approvalStatus === 'pending' ? (
          <PrimaryButton title="Approve Staff" onPress={() => confirmApprovalAction('approve')} />
        ) : null}
        {user.role === 'staff' && user.approvalStatus === 'pending' ? (
          <PrimaryButton title="Reject Staff" onPress={() => confirmApprovalAction('reject')} style={styles.warning} />
        ) : null}
        <PrimaryButton title="Edit Akun" onPress={() => navigation.navigate('EditUser', { user })} />
        {!user.isActive ? (
          <PrimaryButton title="Aktifkan Kembali" onPress={() => confirmApprovalAction('activate')} />
        ) : currentUser?.userId !== user.userId ? (
          <PrimaryButton title="Hapus Akun" onPress={confirmDelete} style={styles.danger} />
        ) : null}
        {!user.isActive && currentUser?.userId !== user.userId ? (
          <PrimaryButton title="Hapus Permanen" onPress={confirmDelete} style={styles.danger} />
        ) : null}
      </View>

      <ImageZoomModal visible={Boolean(zoomUri)} uri={zoomUri} title={user.fullName} onClose={() => setZoomUri(null)} />
      <AppConfirmModal
        visible={Boolean(confirm)}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.confirm ?? 'Lanjut'}
        cancelLabel="Batal"
        tone={confirm?.tone ?? 'warning'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const action = confirm?.action;
          setConfirm(null);
          if (action) mutation.mutate(action);
        }}
      />
      <AppNoticeModal
        visible={Boolean(notice)}
        title={notice?.title ?? ''}
        message={notice?.message ?? ''}
        tone={notice?.tone ?? 'warning'}
        onAction={() => {
          const shouldGoBack = notice?.tone === 'success';
          setNotice(null);
          if (shouldGoBack) navigation.goBack();
        }}
      />
    </Screen>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { gap: 10 },
  heroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  heroChips: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#EAF3FF',
    borderRadius: 22,
    height: 76,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 76,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarFallback: {
    color: '#1D4ED8',
    fontSize: 28,
    fontWeight: '900',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  info: {
    flexBasis: '48%',
    gap: 3,
  },
  label: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  value: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
  heroLabel: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroValue: {
    color: '#0F2C57',
    fontSize: 22,
    fontWeight: '900',
  },
  heroMeta: {
    color: '#475569',
  },
  roleChip: {
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  roleChipText: {
    color: '#4338CA',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  noticeTitle: {
    color: '#9A3412',
    fontSize: 14,
    fontWeight: '900',
  },
  noticeText: {
    color: '#7C2D12',
    lineHeight: 20,
  },
  warning: { backgroundColor: '#EA580C' },
  danger: { backgroundColor: '#0F172A' },
});
