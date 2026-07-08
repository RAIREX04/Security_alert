import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { AppNoticeModal } from '../../components/AppNoticeModal';
import { AppTextInput } from '../../components/AppTextInput';
import { PhotoSourceSheet } from '../../components/PhotoSourceSheet';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { useAuth } from '../../context/AuthContext';
import { capturePhotoAsync, pickImageAsync } from '../../services/device-service';
import { queueProfileUpdateWithOfflineFallback } from '../../services/offline-profile-queue';
import type { User } from '../../types/models';
import { ProfileAvatar } from '../../components/ProfileAvatar';
import { normalizeMediaUrl } from '../../utils/media';
import { updateCachedOfflineAuthSession } from '../../services/local-auth-service';
import { uploadProfilePhoto } from '../../services/upload-service';

export function EditProfileScreen({ navigation, route }: any) {
  const profile: User = route.params.user;
  const { user: authUser, accessToken, refreshToken, setUser } = useAuth();
  const queryClient = useQueryClient();
  const networkState = Network.useNetworkState();
  const [fullName, setFullName] = useState(profile.fullName);
  const [username, setUsername] = useState(profile.username);
  const [email, setEmail] = useState(profile.email);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber ?? '');
  const [pin, setPin] = useState('');
  const [photoPreviewUri, setPhotoPreviewUri] = useState<string | null>(normalizeMediaUrl(profile.photoUrl));
  const [photoUrl, setPhotoUrl] = useState<string | null>(normalizeMediaUrl(profile.photoUrl));
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoAsset, setPhotoAsset] = useState<{
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
    fileSize?: number | null;
  } | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isPhotoSheetVisible, setIsPhotoSheetVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string; tone?: 'success' | 'info' | 'warning' } | null>(null);

  const isOnline = networkState.isInternetReachable ?? networkState.isConnected ?? true;

  const handlePhotoUpload = async (asset: { uri: string; fileName?: string | null; mimeType?: string | null; fileSize?: number | null }) => {
    setIsUploadingPhoto(true);
    try {
      setPhotoAsset(asset);
      setPhotoPreviewUri(asset.uri);
      if (isOnline) {
        const uploaded = await uploadProfilePhoto(asset);
        setPhotoUrl(uploaded.fileUrl);
        setPhotoName(uploaded.fileName);
      } else {
        setPhotoUrl(null);
        setPhotoName(asset.fileName ?? null);
        setNotice({
          title: 'Foto disimpan sementara',
          message: 'Foto akan dikirim saat jaringan kembali.',
          tone: 'info',
        });
      }
    } catch (error) {
      setNotice({
        title: 'Upload gagal',
        message: error instanceof Error ? error.message : 'Coba lagi.',
        tone: 'warning',
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePickCamera = async () => {
    const result = await capturePhotoAsync();
    if (result) await handlePhotoUpload(result);
  };

  const handlePickGallery = async () => {
    const result = await pickImageAsync();
    if (result) await handlePhotoUpload(result);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await queueProfileUpdateWithOfflineFallback({
        userId: authUser?.userId ?? profile.userId,
        fullName,
        username,
        email,
        phoneNumber,
        pin: pin.trim() || undefined,
        photo: photoAsset
          ? {
              ...photoAsset,
              uploadedFileUrl: photoUrl ?? undefined,
            }
          : null,
      });
      return result;
    },
    onSuccess: async (result) => {
      const user = result.kind === 'sent' ? result.user : buildOptimisticUser();
      setUser(user);
      queryClient.setQueryData(['me'], user);
      queryClient.setQueryData(['auth-me'], user);
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      await queryClient.invalidateQueries({ queryKey: ['auth-me'] });
      await updateCachedOfflineAuthSession(
        { accessToken: accessToken ?? '', refreshToken: refreshToken ?? '', user },
        pin.trim() || null,
      ).catch(() => {});
      setSuccessVisible(true);
    },
    onError: (error) =>
      setNotice({
        title: 'Gagal',
        message: error instanceof Error ? error.message : 'Coba lagi.',
        tone: 'warning',
      }),
  });

  const submit = () => {
    if (pin && pin.trim().length < 6) {
      setNotice({ title: 'Validasi', message: 'Password minimal 6 karakter.', tone: 'warning' });
      return;
    }
    mutation.mutate();
  };

  const buildOptimisticUser = (): User => ({
    ...profile,
    fullName: fullName.trim(),
    username: username.trim(),
    email: email.trim(),
    phoneNumber: phoneNumber.trim() || null,
    photoUrl: photoUrl ?? photoPreviewUri ?? profile.photoUrl ?? null,
  });

  return (
    <Screen
      title="Edit Profile"
      subtitle="Perbarui identitas dan password akun Anda."
      left={<HeaderBackButton onPress={() => navigation.goBack()} />}
    >
      <View style={styles.form}>
        <SectionCard tone="soft">
          <View style={styles.photoRow}>
            <ProfileAvatar
              name={profile.fullName}
              photoUrl={photoPreviewUri}
              size={72}
              containerStyle={styles.avatar}
              imageStyle={styles.avatarImage}
              fallbackStyle={styles.avatarFallback}
            />
            <View style={styles.photoMeta}>
              <Text style={styles.name}>{profile.fullName}</Text>
              <Text style={styles.helper}>{profile.role ?? 'user'} {profile.department ? `- ${profile.department}` : ''}</Text>
              <Text style={styles.helper}>{photoName ?? 'Belum ada foto profil baru'}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <PrimaryButton title="Ganti Foto" onPress={() => setIsPhotoSheetVisible(true)} />
          </View>
        </SectionCard>

        <AppTextInput label="Nama lengkap" value={fullName} onChangeText={setFullName} />
        <AppTextInput label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <AppTextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <AppTextInput label="Telepon" value={phoneNumber} onChangeText={setPhoneNumber} />
        <AppTextInput
          label="Password baru (opsional)"
          value={pin}
          onChangeText={setPin}
          secureTextEntry
          textContentType="newPassword"
          autoComplete="new-password"
        />
        <PrimaryButton
          title={mutation.isPending ? 'Menyimpan...' : isUploadingPhoto ? 'Mengunggah foto...' : 'Simpan Profil'}
          onPress={submit}
          disabled={mutation.isPending || isUploadingPhoto}
        />
      </View>
      <PhotoSourceSheet
        visible={isPhotoSheetVisible}
        onClose={() => setIsPhotoSheetVisible(false)}
        onCamera={() => void handlePickCamera()}
        onGallery={() => void handlePickGallery()}
        title="Pilih foto profil"
        description="Ambil foto baru dari kamera atau pilih foto dari galeri."
      />
      <AppNoticeModal
        visible={successVisible}
        title="Profil diperbarui"
        message="Perubahan identitas dan foto profil sudah tersimpan."
        onAction={() => {
          setSuccessVisible(false);
          navigation.goBack();
        }}
      />
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

const styles = StyleSheet.create({
  form: { gap: 12 },
  photoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#EAF3FF',
    borderRadius: 20,
    height: 72,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 72,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarFallback: {
    color: '#1D4ED8',
    fontSize: 26,
    fontWeight: '900',
  },
  photoMeta: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: '#0F2C57',
    fontSize: 18,
    fontWeight: '900',
  },
  helper: {
    color: '#64748B',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
});
