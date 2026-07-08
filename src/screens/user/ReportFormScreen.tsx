import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import type { RefObject } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import * as Network from 'expo-network';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { isNetworkFailure, submitAlertWithOfflineFallback } from '../../services/offline-report-queue';
import {
  capturePhotoAsync,
  getCurrentLocationSnapshot,
  pickImageAsync,
  type LocationSnapshot,
} from '../../services/device-service';
import { AppNoticeModal } from '../../components/AppNoticeModal';
import { LocationPreviewCard } from '../../components/LocationPreviewCard';
import { getApiErrorMessage } from '../../config/api';
import { uploadReportPhoto } from '../../services/upload-service';
import { PhotoSourceSheet } from '../../components/PhotoSourceSheet';
import { departmentFallbacks } from '../../utils/department';
import { getQueuedReportSubmissionCount } from '../../services/offline-report-queue';
import { openLocationInMaps } from '../../utils/maps';
import { getDepartmentBadgeLabel } from '../../utils/staff';
import type { UserStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<UserStackParamList, 'ReportForm'>;
type SpeechNotice = { title: string; message: string; tone?: 'success' | 'info' | 'warning' };
type ExpoSpeechRecognitionModuleType = {
  addListener: (
    eventName: 'start' | 'end' | 'result' | 'error',
    listener: (event: any) => void,
  ) => { remove: () => void };
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  start: (options: {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    addsPunctuation: boolean;
  }) => void;
  stop: () => void;
};

export function ReportFormScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const initialDepartmentId = route.params?.departmentId ?? departmentFallbacks[0].departmentId;
  const [departmentId] = useState(initialDepartmentId);
  const [description, setDescription] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [photoPreviewUri, setPhotoPreviewUri] = useState<string | null>(null);
  const [photoAsset, setPhotoAsset] = useState<{
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
    fileSize?: number | null;
  } | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [isPhotoSheetVisible, setIsPhotoSheetVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [createdReportId, setCreatedReportId] = useState<number | null>(null);
  const [notice, setNotice] = useState<SpeechNotice | null>(null);
  const [queuedReportCount, setQueuedReportCount] = useState(0);
  const descriptionInputRef = useRef<TextInput>(null);
  const isExpoGo = Constants.appOwnership === 'expo';
  const networkState = Network.useNetworkState();

  const selectedDepartment = useMemo(
    () => departmentFallbacks.find((item) => item.departmentId === departmentId) ?? departmentFallbacks[0],
    [departmentId],
  );

  useEffect(() => {
    void handleLocation();
  }, []);

  useEffect(() => {
    let active = true;

    const refreshQueuedCount = async () => {
      const count = await getQueuedReportSubmissionCount();
      if (active) {
        setQueuedReportCount(count);
      }
    };

    void refreshQueuedCount();
    const timer = setInterval(() => {
      void refreshQueuedCount();
    }, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const applyLocationSnapshot = (snapshot: LocationSnapshot) => {
    setLatitude(snapshot.latitude);
    setLongitude(snapshot.longitude);
    setLocationLabel(snapshot.label);
    setLocationAddress(snapshot.address);
    setAccuracy(snapshot.accuracy);
  };

  const handleLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const location = await getCurrentLocationSnapshot();
      applyLocationSnapshot(location);
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

  const appendDescription = (text: string) => {
    const nextText = text.trim();
    if (!nextText) return;
    setDescription((current) => {
      const separator = current.trim().length > 0 ? ' ' : '';
      return `${current}${separator}${nextText}`.trim();
    });
  };

  const handlePhotoUpload = async (asset: { uri: string; fileName?: string | null; mimeType?: string | null; fileSize?: number | null }) => {
    setIsUploadingPhoto(true);
    setPhotoAsset(asset);
    try {
      setPhotoPreviewUri(asset.uri);
      const uploaded = await uploadReportPhoto(asset);
      setPhotoUrl(uploaded.fileUrl);
      setPhotoName(uploaded.fileName);
    } catch (error) {
      setPhotoUrl(null);
      setPhotoName(asset.fileName ?? null);
      if (isNetworkFailure(error)) {
        setNotice({
          title: 'Foto disimpan sementara',
          message: 'Foto akan ikut terkirim saat jaringan kembali.',
          tone: 'info',
        });
      } else {
        setNotice({
          title: 'Upload gagal',
          message: error instanceof Error ? error.message : 'Coba lagi.',
          tone: 'warning',
        });
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePickCamera = async () => {
    const result = await capturePhotoAsync();
    if (!result) return;
    await handlePhotoUpload(result);
  };

  const handlePickGallery = async () => {
    const result = await pickImageAsync();
    if (!result) return;
    await handlePhotoUpload(result);
  };

  const handlePickPhoto = () => setIsPhotoSheetVisible(true);
  const isOnline = networkState.isInternetReachable ?? networkState.isConnected ?? true;

  const openMaps = async () => {
    if (latitude == null || longitude == null) return;
    await openLocationInMaps({
      latitude,
      longitude,
      label: locationAddress ?? locationLabel,
    });
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setNotice({ title: 'Validasi', message: 'Deskripsi kejadian wajib diisi.', tone: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitAlertWithOfflineFallback({
        departmentId,
        description,
        incidentLocationText: locationLabel || 'Lokasi belum diambil',
        incidentLatitude: latitude,
        incidentLongitude: longitude,
        sourceDepartmentId: user?.departmentId ?? undefined,
        attachment: photoPreviewUri
          ? {
              uri: photoAsset?.uri ?? photoPreviewUri,
              fileName: photoName ?? photoAsset?.fileName ?? 'incident.jpg',
              mimeType: photoAsset?.mimeType ?? null,
              fileSize: photoAsset?.fileSize ?? null,
              uploadedFileUrl: photoUrl,
            }
          : null,
      });
      setCreatedReportId(result.kind === 'sent' ? result.report.reportId : null);
      void getQueuedReportSubmissionCount()
        .then((count) => setQueuedReportCount(count))
        .catch(() => {});
      setSuccessVisible(true);
    } catch (error) {
      setNotice({
        title: 'Gagal kirim',
        message: getApiErrorMessage(error),
        tone: 'warning',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 18}
      style={styles.flex}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ImageBackground
          source={require('../../../assets/login-background-pag.png')}
          resizeMode="cover"
          style={styles.flex}
        >
          <View style={styles.overlay} />
          <LinearGradient
            colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.72)', 'rgba(248,251,255,0.96)']}
            style={StyleSheet.absoluteFill}
          />
          <View pointerEvents="none" style={styles.decorWrap}>
            <View style={styles.decorBlue} />
            <View style={styles.decorGreen} />
            <View style={styles.decorRed} />
          </View>

          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            <View style={styles.appBar}>
              <Pressable
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel="Kembali"
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              >
                <Text style={styles.backButtonText}>←</Text>
              </Pressable>
              <Text selectable style={styles.appBarTitle}>
                {selectedDepartment.departmentName}
              </Text>
              <View style={styles.appBarSpacer} />
            </View>

            <View style={styles.connectionRow}>
              <View style={[styles.connectionPill, isOnline ? styles.connectionPillOnline : styles.connectionPillOffline]}>
                <View style={[styles.connectionDot, isOnline ? styles.connectionDotOnline : styles.connectionDotOffline]} />
                <Text style={[styles.connectionText, isOnline ? styles.connectionTextOnline : styles.connectionTextOffline]}>
                  {isOnline ? 'Online' : 'Offline, alert akan dikirim nanti'}
                </Text>
              </View>
              {queuedReportCount > 0 ? (
                <View style={styles.queuePill}>
                  <Text style={styles.queuePillText}>{queuedReportCount} alert menunggu dikirim</Text>
                </View>
              ) : null}
            </View>

            <View style={[styles.heroCard, { backgroundColor: tint(selectedDepartment.color ?? '#1D4ED8', 0.09) }]}>
              <View style={[styles.heroIcon, { backgroundColor: selectedDepartment.color ?? '#1D4ED8' }]}>
                <Text style={styles.heroIconText}>{getDepartmentBadgeLabel(selectedDepartment.departmentCode)}</Text>
              </View>
              <View style={styles.heroBody}>
                <Text selectable style={styles.heroTitle}>
                  {selectedDepartment.departmentName}
                </Text>
                <Text selectable style={styles.heroSubtitle}>
                  {selectedDepartment.description ?? 'Departemen emergency'}
                </Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text selectable style={styles.sectionTitle}>
                Isi laporan anda
              </Text>
              <Text selectable style={styles.sectionMeta}>
                Pelapor: {user?.fullName ?? user?.username ?? 'user'}
              </Text>

              <View style={styles.noticeCard}>
                <View style={styles.noticeIcon}>
                  <Text style={styles.noticeIconText}>⌖</Text>
                </View>
                <Text selectable style={styles.noticeText}>
                  Lokasi akan diambil otomatis saat halaman dibuka dan ditandai langsung di peta.
                </Text>
              </View>

              <View style={styles.locationCard}>
                <View style={styles.locationHeader}>
                  <Text selectable style={styles.locationTitle}>
                    Preview lokasi
                  </Text>
                  <Pressable
                    onPress={handleLocation}
                    accessibilityRole="button"
                    accessibilityLabel="Refresh lokasi"
                    style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.refreshButtonText}>{isFetchingLocation ? 'Memuat...' : '↺ Refresh'}</Text>
                  </Pressable>
                </View>
                <Text selectable style={styles.locationCoords}>
                  {latitude != null && longitude != null
                    ? `Lat ${latitude.toFixed(6)}, Lng ${longitude.toFixed(6)}`
                    : 'Lokasi belum diambil'}
                </Text>
                <Text selectable style={styles.locationAccuracy}>
                  {latitude != null && longitude != null
                    ? locationAddress ?? 'Akurasi GPS sekitar 15 meter'
                    : 'Menunggu GPS perangkat...'}
                </Text>

                <LocationPreviewCard
                  title="Preview lokasi"
                  subtitle={latitude != null && longitude != null ? locationAddress ?? 'Koordinat GPS siap dipakai untuk laporan' : 'Aktifkan GPS agar titik lokasi muncul otomatis.'}
                  latitude={latitude}
                  longitude={longitude}
                  locationText={locationAddress ?? locationLabel}
                  accuracy={accuracy}
                  refreshing={isFetchingLocation}
                  onRefresh={handleLocation}
                  onOpenMaps={openMaps}
                  forceStaticPreview={!isOnline}
                />
              </View>

              <View style={styles.descriptionCard}>
                <View style={styles.descriptionRow}>
                  <TextInput
                    ref={descriptionInputRef}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Deskripsi kejadian"
                    placeholderTextColor="#97A3B6"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    style={styles.descriptionInput}
                  />
                  <SpeechToTextControl
                    isExpoGo={isExpoGo}
                    isDictating={isDictating}
                    inputRef={descriptionInputRef}
                    onBusyChange={setIsDictating}
                    onNotice={setNotice}
                    onTranscript={appendDescription}
                  />
                </View>
                <Text selectable style={styles.descriptionHint}>
                  {isExpoGo
                    ? 'Dikte suara tidak tersedia di Expo Go. Gunakan development build untuk fitur ini.'
                    : 'Tekan ikon mikrofon untuk mulai dikte suara ke deskripsi.'}
                </Text>
              </View>

              <View style={styles.photoCard}>
                <View style={styles.photoRow}>
                  <View style={styles.photoIconWrap}>
                    <MaterialCommunityIcons name="camera-plus-outline" size={36} color="#1D4ED8" />
                  </View>
                  <View style={styles.photoBody}>
                    <Text selectable style={styles.photoTitle}>
                      Foto kejadian
                    </Text>
                    <Text selectable style={styles.photoSubtitle}>
                      Opsional. Tambahkan foto jika ingin membantu tim melihat kondisi di lapangan.
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={handlePickPhoto}
                  disabled={isUploadingPhoto}
                  accessibilityRole="button"
                  accessibilityLabel="Upload foto"
                  style={({ pressed }) => [
                    styles.uploadButton,
                    pressed && !isUploadingPhoto && styles.pressed,
                    isUploadingPhoto && styles.uploadButtonDisabled,
                  ]}
                >
                  <Text style={styles.uploadButtonText}>
                    {isUploadingPhoto ? 'Mengunggah...' : 'Upload foto'}
                  </Text>
                </Pressable>

                {photoPreviewUri ? (
                  <View style={styles.photoPreviewWrap}>
                    <Image source={{ uri: photoPreviewUri }} style={styles.photoPreviewImage} />
                    <View style={styles.photoPreviewBadge}>
                      <Text style={styles.photoPreviewBadgeText}>
                        {isUploadingPhoto ? 'Menyimpan foto...' : 'Foto siap dilihat'}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {photoPreviewUri || photoUrl ? (
                  <Pressable
                    onPress={() => {
                      setPhotoPreviewUri(null);
                      setPhotoUrl(null);
                      setPhotoName(null);
                      setPhotoAsset(null);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Hapus foto"
                    style={({ pressed }) => [styles.clearPhotoButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.clearPhotoButtonText}>Hapus foto</Text>
                  </Pressable>
                ) : null}

                {photoUrl ? (
                  <Text selectable style={styles.fileMeta}>
                    {photoName ?? 'incident.jpg'}
                  </Text>
                ) : photoPreviewUri ? (
                  <Text selectable style={styles.fileMeta}>
                    Foto dipilih, menunggu upload selesai...
                  </Text>
                ) : null}
              </View>

              <Pressable
                onPress={handleSubmit}
                disabled={isSubmitting || isUploadingPhoto}
                accessibilityRole="button"
                accessibilityLabel="Kirim alert"
                accessibilityState={{ disabled: isSubmitting || isUploadingPhoto }}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && !isSubmitting && !isUploadingPhoto && styles.pressed,
                  (isSubmitting || isUploadingPhoto) && styles.submitButtonDisabled,
                ]}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Mengirim alert...' : isUploadingPhoto ? 'Mengunggah foto...' : 'Kirim alert'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
          <PhotoSourceSheet
            visible={isPhotoSheetVisible}
            onClose={() => setIsPhotoSheetVisible(false)}
            onCamera={() => void handlePickCamera()}
            onGallery={() => void handlePickGallery()}
            title="Pilih sumber foto"
            description="Ambil foto langsung dari kamera atau pilih dari galeri."
          />
      <AppNoticeModal
        visible={successVisible}
        title={createdReportId ? 'Report terkirim' : 'Alert disimpan offline'}
        message={
          createdReportId
            ? `Report #${createdReportId} berhasil dibuat dan tersimpan.`
            : 'Tidak ada jaringan saat ini. Alert disimpan dan akan otomatis dikirim saat sinyal kembali.'
        }
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
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

type SpeechControlProps = {
  isExpoGo: boolean;
  isDictating: boolean;
  inputRef: RefObject<TextInput | null>;
  onBusyChange: (isBusy: boolean) => void;
  onNotice: (notice: SpeechNotice | null) => void;
  onTranscript: (text: string) => void;
};

function SpeechToTextControl({
  isExpoGo,
  isDictating,
  inputRef,
  onBusyChange,
  onNotice,
  onTranscript,
}: SpeechControlProps) {
  const [speechModule, setSpeechModule] = useState<ExpoSpeechRecognitionModuleType | null>(null);

  useEffect(() => {
    if (isExpoGo) {
      setSpeechModule(null);
      return;
    }

    let cancelled = false;
    void import('expo-speech-recognition')
      .then((module) => {
        if (!cancelled) {
          setSpeechModule(module.ExpoSpeechRecognitionModule as ExpoSpeechRecognitionModuleType);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSpeechModule(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isExpoGo]);

  useEffect(() => {
    const module = speechModule;
    if (!module) {
      return;
    }

    const subscriptions = [
      module.addListener('start', () => {
        onBusyChange(true);
      }),
      module.addListener('end', () => {
        onBusyChange(false);
      }),
      module.addListener('result', (event) => {
        const transcript = event.results?.[0]?.transcript ?? '';
        onTranscript(transcript);
      }),
      module.addListener('error', (event) => {
        onBusyChange(false);
        onNotice({
          title: 'Dikte suara gagal',
          message: event.message || event.error || 'Coba lagi.',
          tone: 'warning',
        });
      }),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, [onBusyChange, onNotice, onTranscript, speechModule]);

  const handleVoiceToText = () => {
    if (isExpoGo) {
      onNotice({
        title: 'Fitur belum tersedia',
        message: 'Speech recognition hanya bisa dipakai di development build, bukan Expo Go.',
        tone: 'info',
      });
      return;
    }

    const module = speechModule;
    if (!module) {
      onNotice({
        title: 'Dikte suara gagal',
        message: 'Modul speech recognition belum siap.',
        tone: 'warning',
      });
      return;
    }

    if (isDictating) {
      module.stop();
      onBusyChange(false);
      return;
    }

    inputRef.current?.focus();
    void (async () => {
      const permissions = await module.requestPermissionsAsync();
      if (!permissions.granted) {
        onNotice({
          title: 'Izin ditolak',
          message: 'Mikrofon dan speech recognition perlu diizinkan dulu.',
          tone: 'warning',
        });
        return;
      }

      module.start({
        lang: 'id-ID',
        interimResults: false,
        continuous: false,
        addsPunctuation: true,
      });
    })().catch((error) => {
      onBusyChange(false);
      onNotice({
        title: 'Dikte suara gagal',
        message: error instanceof Error ? error.message : 'Coba lagi.',
        tone: 'warning',
      });
    });
  };

  return (
    <Pressable
      onPress={handleVoiceToText}
      accessibilityRole="button"
      accessibilityLabel="Input suara"
      style={({ pressed }) => [styles.voiceButton, pressed && styles.pressed]}
    >
      <MaterialCommunityIcons
        name={isDictating ? 'microphone-off' : 'microphone'}
        size={22}
        color={isDictating ? '#D12D45' : '#1D4ED8'}
      />
    </Pressable>
  );
}

function tint(color: string, opacity: number) {
  const hex = color.replace('#', '');
  if (hex.length !== 6) return color;
  const alpha = Math.max(0, Math.min(1, opacity));
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${hex}${alphaHex}`;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#F8FBFF',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  decorWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorBlue: {
    backgroundColor: 'rgba(83,147,255,0.12)',
    borderRadius: 999,
    height: 220,
    position: 'absolute',
    right: -78,
    top: 80,
    width: 220,
  },
  decorGreen: {
    backgroundColor: 'rgba(48,179,102,0.08)',
    borderRadius: 999,
    bottom: 84,
    height: 160,
    left: -50,
    position: 'absolute',
    width: 160,
  },
  decorRed: {
    backgroundColor: 'rgba(218,30,55,0.08)',
    borderRadius: 999,
    bottom: 78,
    height: 180,
    position: 'absolute',
    right: -70,
    width: 180,
  },
  content: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  appBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: '#E0E8F4',
    borderRadius: 18,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  backButtonText: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
  },
  appBarTitle: {
    color: '#101828',
    flex: 1,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  appBarSpacer: {
    width: 48,
  },
  connectionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  connectionPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  connectionPillOnline: {
    backgroundColor: '#DCFCE7',
  },
  connectionPillOffline: {
    backgroundColor: '#FFF7ED',
  },
  connectionDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  connectionDotOnline: {
    backgroundColor: '#15803D',
  },
  connectionDotOffline: {
    backgroundColor: '#C2410C',
  },
  connectionText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  connectionTextOnline: {
    color: '#15803D',
  },
  connectionTextOffline: {
    color: '#C2410C',
  },
  queuePill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EAF2FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  queuePillText: {
    color: '#1D4ED8',
    fontSize: 12.5,
    fontWeight: '800',
  },
  heroCard: {
    alignItems: 'center',
    borderColor: '#D9E6F6',
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  heroIcon: {
    alignItems: 'center',
    borderRadius: 22,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  heroIconText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  heroBody: {
    flex: 1,
    gap: 6,
  },
  heroTitle: {
    color: '#101828',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  heroSubtitle: {
    color: '#667085',
    fontSize: 14.5,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: '#D9E2EE',
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  sectionTitle: {
    color: '#101828',
    fontSize: 21.5,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  sectionMeta: {
    color: '#667085',
    fontSize: 14,
  },
  noticeCard: {
    alignItems: 'center',
    backgroundColor: '#F9FBFF',
    borderColor: '#D9E2EE',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  noticeIcon: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  noticeIconText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '900',
  },
  noticeText: {
    color: '#667085',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E7F0',
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  locationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationTitle: {
    color: '#101828',
    fontSize: 17,
    fontWeight: '900',
  },
  refreshButton: {
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  refreshButtonText: {
    color: '#D12D45',
    fontSize: 14.5,
    fontWeight: '800',
  },
  locationCoords: {
    color: '#667085',
    fontSize: 14,
  },
  locationAccuracy: {
    color: '#1E9A44',
    fontSize: 15,
    fontWeight: '800',
  },
  mapPreview: {
    backgroundColor: '#EEF5FF',
    borderRadius: 22,
    alignItems: 'center',
    gap: 12,
    minHeight: 250,
    overflow: 'hidden',
    padding: 18,
  },
  hidden: {
    display: 'none',
  },
  mapHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  mapBadge: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  mapBadgeText: {
    fontSize: 22,
  },
  mapHeaderText: {
    flex: 1,
    gap: 4,
  },
  mapTitle: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '900',
  },
  mapSubtitle: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 20,
  },
  coordinateCard: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: '#D9E2EE',
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  coordinateLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  coordinateValue: {
    color: '#102B57',
    fontSize: 15,
    fontWeight: '800',
  },
  mapGraphic: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#DCEAFE',
    borderColor: '#C7DBF7',
    borderRadius: 26,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 122,
    overflow: 'hidden',
    position: 'relative',
  },
  mapGraphicGlow: {
    backgroundColor: 'rgba(47,93,229,0.12)',
    borderRadius: 999,
    height: 180,
    position: 'absolute',
    right: -44,
    top: -32,
    width: 180,
  },
  mapGraphicGrid: {
    backgroundColor: 'rgba(16,43,87,0.06)',
    height: '100%',
    left: 0,
    opacity: 0.55,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  mapGraphicPin: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 58,
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 1,
    width: 58,
  },
  mapGraphicPinIcon: {
    fontSize: 24,
  },
  mapGraphicText: {
    color: '#102B57',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 10,
    textAlign: 'center',
  },
  mapsButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#C7DBF7',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 60,
    minWidth: '78%',
  },
  mapsButtonText: {
    color: '#0F2C57',
    fontSize: 17,
    fontWeight: '900',
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E7F0',
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  descriptionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  descriptionInput: {
    color: '#101828',
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    minHeight: 72,
    paddingVertical: 0,
  },
  voiceButton: {
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    borderColor: '#CFE0FF',
    borderRadius: 999,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  descriptionHint: {
    color: '#667085',
    fontSize: 13.5,
    lineHeight: 19,
    marginLeft: 2,
  },
  photoCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E7F0',
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoIconWrap: {
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    borderRadius: 20,
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  photoBody: {
    flex: 1,
    gap: 6,
    paddingTop: 2,
  },
  photoTitle: {
    color: '#101828',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
  },
  photoSubtitle: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 20,
  },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EE',
    borderRadius: 20,
    borderWidth: 1.2,
    justifyContent: 'center',
    minHeight: 68,
  },
  uploadButtonDisabled: {
    opacity: 0.65,
  },
  uploadButtonText: {
    color: '#1174C7',
    fontSize: 17,
    fontWeight: '900',
  },
  photoPreviewWrap: {
    borderColor: '#D9E2EE',
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  photoPreviewImage: {
    backgroundColor: '#EEF4FF',
    height: 180,
    width: '100%',
  },
  photoPreviewBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.84)',
    bottom: 12,
    borderRadius: 999,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
  },
  photoPreviewBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  clearPhotoButton: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 2,
  },
  clearPhotoButtonText: {
    color: '#D12D45',
    fontSize: 14,
    fontWeight: '800',
  },
  fileMeta: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#DA1E37',
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 60,
    shadowColor: '#DA1E37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: '#F3A4B1',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  submitButtonIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});

export default ReportFormScreen;

