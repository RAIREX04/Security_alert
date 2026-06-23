import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthField } from '../../components/AuthField';
import { AppNoticeModal } from '../../components/AppNoticeModal';
import { AuthScreenShell } from '../../components/AuthScreenShell';
import { DepartmentTile } from '../../components/DepartmentTile';
import { registerStaff } from '../../services/auth-service';
import { departmentFallbacks } from '../../utils/department';
import type { AuthStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'StaffRegister'>;

export function StaffRegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [departmentId, setDepartmentId] = useState(departmentFallbacks[0].departmentId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string; tone?: 'success' | 'info' | 'warning' } | null>(null);

  const selectedDepartment = useMemo(
    () => departmentFallbacks.find((item) => item.departmentId === departmentId) ?? departmentFallbacks[0],
    [departmentId],
  );

  const handleSubmit = async () => {
    if (!fullName || !username || !pin) {
      setNotice({ title: 'Validasi', message: 'Nama, username, dan PIN wajib diisi.', tone: 'warning' });
      return;
    }
    if (!/^\d{6}$/.test(pin)) {
      setNotice({ title: 'Validasi', message: 'PIN wajib tepat 6 angka.', tone: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      await registerStaff({
        fullName,
        username,
        email,
        pin,
        phoneNumber,
        departmentId,
      });
      setNotice({
        title: 'Berhasil',
        message: 'Pengajuan staff dikirim dan menunggu approval admin.',
        tone: 'success',
      });
    } catch (error) {
      setNotice({
        title: 'Registrasi gagal',
        message: error instanceof Error ? error.message : 'Coba lagi.',
        tone: 'warning',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenShell
      title="Pengajuan Staff"
      subtitle="Staff baru akan menunggu approval admin sebelum bisa login."
      compact
    >
      <View style={styles.cardIntro}>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>PENGAJUAN STAFF</Text>
        </View>
        <Text style={styles.cardTitle}>Lengkapi data, pilih departemen, lalu kirim approval.</Text>
        <Text style={styles.cardSubtitle}>
          Setelah disetujui admin, akun staff bisa login dan menerima tugas alert departemen.
        </Text>
      </View>

      <View style={styles.form}>
        <AuthField
          label="Nama lengkap"
          icon="N"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
        <AuthField
          label="Username"
          icon="U"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <AuthField
          label="Email (opsional)"
          icon="E"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AuthField
          label="No. telepon"
          icon="T"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <AuthField
          label="PIN 6 angka"
          icon="P"
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry
        />

        <View style={styles.sectionHeader}>
          <Text selectable style={styles.sectionLabel}>
            Pilih departemen
          </Text>
          <Text style={styles.sectionHint}>Akan dipakai sebagai penempatan awal staff.</Text>
        </View>

        <View style={styles.departmentList}>
          {departmentFallbacks.map((department) => {
            const selected = department.departmentId === selectedDepartment.departmentId;

            return (
              <Pressable
                key={department.departmentId}
                onPress={() => setDepartmentId(department.departmentId)}
                style={({ pressed }) => [
                  styles.departmentItem,
                  pressed && styles.pressed,
                  selected && styles.departmentSelected,
                ]}
              >
                <DepartmentTile
                  department={department}
                  subtitle={department.description ?? undefined}
                  selected={selected}
                />
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel={isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
          accessibilityState={{ disabled: isSubmitting }}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && !isSubmitting && styles.pressed,
            isSubmitting && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
          </Text>
          <Text style={styles.primaryButtonArrow}>{'>'}</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          style={({ pressed }) => [styles.secondaryLink, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryLinkText}>Kembali ke login</Text>
        </Pressable>
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
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  cardIntro: {
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F1FBF4',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  badgeDot: {
    backgroundColor: '#1E9A44',
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  badgeText: {
    color: '#1E9A44',
    fontSize: 11.3,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  cardTitle: {
    color: '#173260',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    color: '#5E6A80',
    lineHeight: 19,
  },
  form: {
    gap: 10,
  },
  sectionHeader: {
    gap: 2,
    marginTop: 2,
  },
  sectionLabel: {
    color: '#173260',
    fontSize: 13.5,
    fontWeight: '800',
  },
  sectionHint: {
    color: '#5E6A80',
    fontSize: 12.5,
  },
  departmentList: {
    gap: 12,
  },
  departmentItem: {
    borderRadius: 26,
  },
  departmentSelected: {
    transform: [{ scale: 0.995 }],
    opacity: 1,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#DA1E37',
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 4,
    shadowColor: '#DA1E37',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: '#F3A4B1',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '900',
  },
  primaryButtonArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 10,
    marginTop: -1,
  },
  secondaryLink: {
    alignItems: 'center',
    paddingTop: 6,
  },
  secondaryLinkText: {
    color: '#2F5DE5',
    fontSize: 13,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
