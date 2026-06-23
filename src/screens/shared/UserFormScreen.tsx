import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppNoticeModal } from '../../components/AppNoticeModal';
import { AppTextInput } from '../../components/AppTextInput';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { createUser, getUserFormOptions, updateUser } from '../../services/user-service';
import type { User } from '../../types/models';
import { getApiErrorMessage } from '../../config/api';

type Props = {
  navigation: { goBack: () => void };
  route?: { params?: { user?: User; role?: 'staff' | 'user' } };
  defaultRole?: 'staff' | 'user';
};

export function UserFormScreen({ navigation, route, defaultRole = 'user' }: Props) {
  const existing = route?.params?.user;
  const role = route?.params?.role ?? defaultRole;
  const queryClient = useQueryClient();
  const optionsQuery = useQuery({
    queryKey: ['user-form-options'],
    queryFn: getUserFormOptions,
  });
  const [fullName, setFullName] = useState(existing?.fullName ?? '');
  const [username, setUsername] = useState(existing?.username ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(existing?.phoneNumber ?? '');
  const [pin, setPin] = useState('');
  const [departmentId, setDepartmentId] = useState<number | null>(existing?.departmentId ?? null);
  const [notice, setNotice] = useState<{ title: string; message: string; tone?: 'success' | 'info' | 'warning' } | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      existing
        ? updateUser(existing.userId, {
            fullName,
            username,
            email,
            phoneNumber,
            departmentId,
            ...(pin ? { pin } : {}),
          })
        : createUser({
            fullName,
            username,
            email,
            pin,
            phoneNumber,
            roleName: role,
            departmentId: role === 'staff' ? departmentId : null,
            approvalStatus: 'approved',
          }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      setNotice({
        title: 'Berhasil',
        message: existing ? 'Data akun diperbarui.' : 'Akun berhasil dibuat.',
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

  const submit = () => {
    if (!fullName.trim() || !username.trim() || (!existing && !pin)) {
      setNotice({ title: 'Validasi', message: 'Nama, username, dan PIN wajib diisi.', tone: 'warning' });
      return;
    }
    if (pin && !/^\d{6}$/.test(pin)) {
      setNotice({ title: 'Validasi', message: 'PIN wajib tepat 6 angka.', tone: 'warning' });
      return;
    }
    if (role === 'staff' && !departmentId) {
      setNotice({ title: 'Validasi', message: 'Departemen staff wajib dipilih.', tone: 'warning' });
      return;
    }
    mutation.mutate();
  };

  return (
    <Screen
      title={existing ? 'Edit Akun' : role === 'staff' ? 'Tambah Karyawan' : 'Tambah User'}
      subtitle="Data akan langsung tersimpan ke SQL Server melalui Express API."
      left={<HeaderBackButton onPress={() => navigation.goBack()} />}
    >
      <View style={styles.form}>
        <SectionCard tone="soft">
          <Text style={styles.heroLabel}>{existing ? 'EDIT AKUN' : role === 'staff' ? 'STAFF BARU' : 'USER BARU'}</Text>
          <Text style={styles.heroTitle}>
            {existing ? 'Perbarui identitas akun dengan aman.' : 'Form ini langsung terhubung ke backend Express.'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {existing
              ? 'Perubahan tersimpan ke SQL Server dan data user akan diperbarui di seluruh layar.'
              : 'Lengkapi data minimum, pilih departemen jika staff, lalu simpan akun.'}
          </Text>
        </SectionCard>

        <AppTextInput label="Nama lengkap" value={fullName} onChangeText={setFullName} />
        <AppTextInput label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <AppTextInput label="Email (opsional)" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <AppTextInput label="Nomor telepon" value={phoneNumber ?? ''} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
        <AppTextInput
          label={existing ? 'PIN baru 6 angka (opsional)' : 'PIN 6 angka'}
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry
        />

        {(role === 'staff' || existing?.role === 'staff') ? (
          <SectionCard>
            <Text style={styles.label}>Pilih departemen</Text>
            <View style={styles.choiceList}>
              {(optionsQuery.data?.departments ?? []).map((department) => (
                <Pressable
                  key={department.departmentId}
                  onPress={() => setDepartmentId(department.departmentId)}
                  style={[
                    styles.choice,
                    departmentId === department.departmentId && styles.choiceActive,
                  ]}
                >
                  <Text style={styles.choiceText}>{department.departmentName}</Text>
                </Pressable>
              ))}
            </View>
          </SectionCard>
        ) : null}

        <PrimaryButton
          title={mutation.isPending ? 'Menyimpan...' : 'Simpan'}
          onPress={submit}
          disabled={mutation.isPending}
        />
      </View>
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

export function CreateStaffScreen(props: Props) {
  return <UserFormScreen {...props} defaultRole="staff" />;
}

export function CreateUserScreen(props: Props) {
  return <UserFormScreen {...props} defaultRole="user" />;
}

export function EditUserScreen(props: Props) {
  return <UserFormScreen {...props} />;
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  heroLabel: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: '#0F2C57',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    color: '#475569',
    lineHeight: 20,
  },
  label: { color: '#0F2C57', fontWeight: '800' },
  choiceList: {
    gap: 10,
    marginTop: 10,
  },
  choice: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D7E3F0',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  choiceActive: { backgroundColor: '#EAF3FF', borderColor: '#0078D7' },
  choiceText: { color: '#0F2C57', fontWeight: '700' },
});
