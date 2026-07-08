import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthField } from '../../components/AuthField';
import { AppNoticeModal } from '../../components/AppNoticeModal';
import { AuthScreenShell } from '../../components/AuthScreenShell';
import { PhotoSourceSheet } from '../../components/PhotoSourceSheet';
import { ProfilePhotoInput } from '../../components/ProfilePhotoInput';
import { capturePhotoAsync, pickImageAsync } from '../../services/device-service';
import { registerUser } from '../../services/auth-service';
import { uploadRegistrationProfilePhoto } from '../../services/upload-service';
import type { AuthStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photoAsset, setPhotoAsset] = useState<{
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
    fileSize?: number | null;
  } | null>(null);
  const [isPhotoSheetVisible, setIsPhotoSheetVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string; tone?: 'success' | 'info' | 'warning' } | null>(null);

  const handlePhotoPicked = (asset: {
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
    fileSize?: number | null;
  } | null) => {
    if (asset) setPhotoAsset(asset);
  };

  const handlePickCamera = async () => {
    try {
      handlePhotoPicked(await capturePhotoAsync());
    } catch (error) {
      setNotice({ title: 'Foto gagal', message: error instanceof Error ? error.message : 'Coba lagi.', tone: 'warning' });
    }
  };

  const handlePickGallery = async () => {
    try {
      handlePhotoPicked(await pickImageAsync());
    } catch (error) {
      setNotice({ title: 'Foto gagal', message: error instanceof Error ? error.message : 'Coba lagi.', tone: 'warning' });
    }
  };

  const handleSubmit = async () => {
    if (!fullName || !username || !pin) {
      setNotice({ title: 'Validasi', message: 'Nama, username, dan password wajib diisi.', tone: 'warning' });
      return;
    }
    if (pin.trim().length < 6) {
      setNotice({ title: 'Validasi', message: 'Password minimal 6 karakter.', tone: 'warning' });
      return;
    }
    if (!photoAsset) {
      setNotice({ title: 'Validasi', message: 'Foto profil wajib ditambahkan.', tone: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedPhoto = await uploadRegistrationProfilePhoto(photoAsset);
      await registerUser({
        fullName,
        username,
        email,
        pin,
        phoneNumber,
        photoUrl: uploadedPhoto.fileUrl,
      });
      setNotice({ title: 'Berhasil', message: 'Akun user berhasil dibuat. Silakan login.', tone: 'success' });
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
      title="Registrasi User"
      subtitle="Buat akun pelapor untuk mengirim alert ke departemen tujuan."
      compact
    >
      <View style={styles.cardIntro}>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>AKUN PELAPOR</Text>
        </View>
        <Text style={styles.cardTitle}>Daftar sekali, lalu langsung siap kirim alert.</Text>
        <Text style={styles.cardSubtitle}>
          Gunakan data yang valid agar riwayat alert dan notifikasi bisa terhubung dengan rapi.
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
          label="Password"
          icon="P"
          value={pin}
          onChangeText={setPin}
          secureTextEntry
          textContentType="newPassword"
          autoComplete="new-password"
        />
        <ProfilePhotoInput
          name={fullName}
          photoUri={photoAsset?.uri}
          fileName={photoAsset?.fileName}
          required
          onPress={() => setIsPhotoSheetVisible(true)}
        />

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel={isSubmitting ? 'Menyimpan...' : 'Daftar'}
          accessibilityState={{ disabled: isSubmitting }}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && !isSubmitting && styles.pressed,
            isSubmitting && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.primaryButtonText}>{isSubmitting ? 'Menyimpan...' : 'Daftar'}</Text>
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
      <PhotoSourceSheet
        visible={isPhotoSheetVisible}
        onClose={() => setIsPhotoSheetVisible(false)}
        onCamera={() => void handlePickCamera()}
        onGallery={() => void handlePickGallery()}
        title="Pilih foto profil"
        description="Foto profil wajib untuk registrasi akun."
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
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#DA1E37',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 48,
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
    fontSize: 16,
    fontWeight: '800',
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
    fontSize: 13.5,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
