import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppNoticeModal } from '../../components/AppNoticeModal';
import { AppTextInput } from '../../components/AppTextInput';
import { PhotoSourceSheet } from '../../components/PhotoSourceSheet';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { LocationPreviewCard } from '../../components/LocationPreviewCard';
import { useAuth } from '../../context/AuthContext';
import { completeReport } from '../../services/report-service';
import {
  capturePhotoAsync,
  getCurrentLocationSnapshot,
  pickImageAsync,
  type LocationSnapshot,
} from '../../services/device-service';
import { uploadReportCompletionPhoto } from '../../services/upload-service';
import type { Report } from '../../types/models';
import { getApiErrorMessage } from '../../config/api';
import { normalizeMediaUrl } from '../../utils/media';
import { openLocationInMaps } from '../../utils/maps';

export function CompletionProofScreen({ navigation, route }: any) {
  const report: Report = route.params.report;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState('');
  const [responderLocation, setResponderLocation] = useState<string | null>(null);
  const [responderLatitude, setResponderLatitude] = useState<number | null>(null);
  const [responderLongitude, setResponderLongitude] = useState<number | null>(null);
  const [responderAccuracy, setResponderAccuracy] = useState<number | null>(null);
  const [photoPreviewUri, setPhotoPreviewUri] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isPhotoSheetVisible, setIsPhotoSheetVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string; tone?: 'success' | 'info' | 'warning' } | null>(null);
  const isTargetDepartmentStaff =
    user?.role === 'staff' && user?.departmentId != null && Number(user.departmentId) === Number(report.departmentId);
  const isAssignedStaff = user?.userId != null && report.assignedStaffId === user.userId;
  const canManage = user?.role === 'admin' || isTargetDepartmentStaff || isAssignedStaff;

  const handleLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const snapshot = await getCurrentLocationSnapshot();
      applyLocationSnapshot(snapshot);
    } catch (error) {
      setNotice({
        title: 'Lokasi gagal',
        message: error instanceof Error ? error.message : 'Coba lagi.',
        tone: 'warning',
      });
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const applyLocationSnapshot = (snapshot: LocationSnapshot) => {
    setResponderLocation(snapshot.label);
    setResponderLatitude(snapshot.latitude);
    setResponderLongitude(snapshot.longitude);
    setResponderAccuracy(snapshot.accuracy);
  };

  const openResponderMaps = async () => {
    if (responderLatitude == null || responderLongitude == null) {
      return;
    }

    await openLocationInMaps({
      latitude: responderLatitude,
      longitude: responderLongitude,
      label: responderLocation ?? 'Lokasi saat ini',
    });
  };

  useEffect(() => {
    if (canManage) {
      void handleLocation();
    }
  }, [canManage]);

  const handleCapture = async () => {
    const result = await capturePhotoAsync();
    if (!result) return;

    setIsUploadingPhoto(true);
    try {
      setPhotoPreviewUri(result.uri);
      const uploaded = await uploadReportCompletionPhoto(result);
      setPhotoUrl(uploaded.fileUrl);
      setPhotoName(uploaded.fileName);
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

  const handleGalleryPick = async () => {
    const result = await pickImageAsync();
    if (!result) return;

    setIsUploadingPhoto(true);
    try {
      setPhotoPreviewUri(result.uri);
      const uploaded = await uploadReportCompletionPhoto(result);
      setPhotoUrl(uploaded.fileUrl);
      setPhotoName(uploaded.fileName);
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

  const mutation = useMutation({
    mutationFn: async () => {
      if (!canManage) {
        throw new Error('Anda tidak memiliki izin untuk menyelesaikan alert ini.');
      }
      let locationText = responderLocation;
      if (!locationText) {
        const snapshot = await getCurrentLocationSnapshot();
        applyLocationSnapshot(snapshot);
        locationText = snapshot.label;
      }

      return completeReport(report.reportId, {
        completionDescription: description,
        responderLocation: locationText,
        attachments: photoUrl
          ? [
              {
                fileName: photoName ?? 'completion.jpg',
                fileUrl: photoUrl,
                attachmentType: 'completion_photo',
              },
            ]
          : undefined,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reports'] });
      await queryClient.invalidateQueries({ queryKey: ['report', report.reportId] });
      setSuccessVisible(true);
    },
    onError: (error) =>
      setNotice({
        title: 'Gagal',
        message: getApiErrorMessage(error),
        tone: 'warning',
      }),
  });

  if (!canManage) {
    return (
      <Screen
        title="Selesaikan Alert"
        subtitle={`Report #${report.reportId}`}
        left={<HeaderBackButton onPress={() => navigation.goBack()} />}
      >
        <SectionCard>
          <Text style={styles.helperLabel}>Akses dibatasi</Text>
          <Text style={styles.helperValue}>
            Hanya staff departemen tujuan atau admin yang dapat menyelesaikan alert ini.
          </Text>
          <View style={styles.restrictedAction}>
            <PrimaryButton title="Kembali" onPress={() => navigation.goBack()} />
          </View>
        </SectionCard>
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

  return (
    <Screen
      title="Selesaikan Alert"
      subtitle={`Report #${report.reportId}`}
      left={<HeaderBackButton onPress={() => navigation.goBack()} />}
    >
      <View style={styles.form}>
        <SectionCard>
          <AppTextInput
            label="Deskripsi penyelesaian"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            style={styles.multiline}
          />
        </SectionCard>

        <SectionCard>
          <PrimaryButton
            title={isFetchingLocation ? 'Mengambil lokasi...' : responderLocation ? 'Lokasi tiba terisi' : 'Ambil lokasi tiba'}
            onPress={handleLocation}
            disabled={isFetchingLocation}
          />
          {responderLocation ? (
            <View style={styles.previewBox}>
              <Text style={styles.helperLabel}>Lokasi tercatat</Text>
              <Text selectable style={styles.helperValue}>
                {responderLocation}
              </Text>
            </View>
          ) : null}
        </SectionCard>

        <LocationPreviewCard
          title="Lokasi saat ini"
          subtitle="Titik GPS perangkat yang akan dipakai untuk penyelesaian alert."
          latitude={responderLatitude}
          longitude={responderLongitude}
          locationText={responderLocation}
          accuracy={responderAccuracy}
          refreshing={isFetchingLocation}
          onRefresh={handleLocation}
          onOpenMaps={() => void openResponderMaps()}
        />

        <SectionCard>
          <PrimaryButton
            title={isUploadingPhoto ? 'Mengunggah foto...' : 'Ambil foto bukti'}
            onPress={() => setIsPhotoSheetVisible(true)}
            disabled={isUploadingPhoto}
          />
          {photoName ? (
            <View style={styles.previewBox}>
              {photoPreviewUri ? <Image source={{ uri: normalizeMediaUrl(photoPreviewUri) ?? photoPreviewUri }} style={styles.previewImage} /> : null}
              <Text style={styles.helperLabel}>Foto bukti</Text>
              <Text selectable style={styles.helperValue}>
                {photoName}
              </Text>
            </View>
          ) : photoPreviewUri ? (
            <View style={styles.previewBox}>
              {photoPreviewUri ? <Image source={{ uri: normalizeMediaUrl(photoPreviewUri) ?? photoPreviewUri }} style={styles.previewImage} /> : null}
              <Text style={styles.helperLabel}>Foto siap disimpan</Text>
              <Text selectable style={styles.helperValue}>
                Menunggu upload selesai
              </Text>
            </View>
          ) : null}
        </SectionCard>

          <PrimaryButton
            title={mutation.isPending ? 'Menyimpan...' : 'Tutup Alert'}
            onPress={() => {
              if (description.trim().length < 3) {
                setNotice({
                  title: 'Validasi',
                  message: 'Deskripsi penyelesaian wajib diisi.',
                  tone: 'warning',
                });
                return;
              }
              if (photoPreviewUri && !photoUrl) {
                setNotice({
                  title: 'Validasi',
                  message: 'Tunggu upload foto selesai sebelum menutup alert.',
                  tone: 'warning',
                });
                return;
              }
              mutation.mutate();
            }}
            disabled={mutation.isPending || isUploadingPhoto}
        />
      </View>
      <PhotoSourceSheet
        visible={isPhotoSheetVisible}
        onClose={() => setIsPhotoSheetVisible(false)}
        onCamera={() => void handleCapture()}
        onGallery={() => void handleGalleryPick()}
        title="Pilih sumber foto"
        description="Ambil foto langsung dari kamera atau pilih dari galeri."
      />
      <AppNoticeModal
        visible={successVisible}
        title="Berhasil"
        message="Alert ditutup dan bukti penyelesaian tersimpan."
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
  multiline: { minHeight: 130, textAlignVertical: 'top' },
  previewBox: {
    gap: 3,
    marginTop: 10,
  },
  previewImage: {
    backgroundColor: '#EEF4FF',
    borderRadius: 18,
    height: 180,
    marginBottom: 6,
    width: '100%',
  },
  helperLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  helperValue: {
    color: '#0F172A',
    fontWeight: '700',
    lineHeight: 19,
  },
  restrictedAction: {
    marginTop: 14,
  },
});
