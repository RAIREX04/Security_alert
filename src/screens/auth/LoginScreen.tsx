import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/auth-service';
import { getApiErrorMessage, setAccessToken } from '../../config/api';
import type { AuthStackParamList } from '../../types/navigation';
import { AuthField } from '../../components/AuthField';
import { AppNoticeModal } from '../../components/AppNoticeModal';
import { PertaminaLogo } from '../../components/PertaminaLogo';
import { isNetworkFailure } from '../../services/offline-report-queue';
import { resolveOfflineAuthSession } from '../../services/local-auth-service';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;
type FocusedField = 'username' | 'password' | null;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const { height } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showRegisterOptions, setShowRegisterOptions] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string; tone?: 'success' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      if (focusedField) {
        requestAnimationFrame(() => {
          scrollToFocusedField(focusedField);
        });
      }
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [focusedField]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setNotice({ title: 'Validasi', message: 'Username dan password wajib diisi.', tone: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await login(username.trim(), password.trim());
      setAccessToken(session.accessToken);
      await signIn(session, password.trim());
    } catch (error) {
      if (isNetworkFailure(error)) {
        const offlineSession = await resolveOfflineAuthSession(username.trim(), password.trim());
        if (offlineSession) {
          setAccessToken(offlineSession.accessToken);
          await signIn(offlineSession);
          setNotice({
            title: 'Login offline berhasil',
            message: 'Anda masuk memakai data login yang tersimpan di perangkat.',
            tone: 'success',
          });
          return;
        }

        setNotice({
          title: 'Login offline gagal',
          message: 'Belum ada data login offline di perangkat ini. Coba login saat jaringan tersedia.',
          tone: 'warning',
        });
        return;
      }

      setNotice({ title: 'Login gagal', message: getApiErrorMessage(error), tone: 'warning' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldFocus = (field: FocusedField) => {
    setFocusedField(field);
    if (field) {
      setTimeout(() => {
        scrollToFocusedField(field);
      }, 220);
    }
  };

  function scrollToFocusedField(field: Exclude<FocusedField, null>) {
    if (field === 'password') {
      scrollRef.current?.scrollToEnd({ animated: true });
      return;
    }

    scrollRef.current?.scrollTo({ y: 170, animated: true });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
      style={styles.flex}
    >
      <ImageBackground
        source={require('../../../assets/login-background-new.png')}
        resizeMode="cover"
        style={styles.flex}
      >
        <View pointerEvents="none" style={styles.overlay} />
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <LinearGradient
            colors={['rgba(4,22,74,0.84)', 'rgba(4,22,74,0.50)', 'rgba(4,22,74,0.18)', 'rgba(4,22,74,0.02)']}
            locations={[0, 0.35, 0.72, 1]}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
        <View pointerEvents="none" style={styles.decorWrap}>
          <View style={styles.decorTopLeft} />
          <View style={styles.decorBottomLeft} />
          <View style={styles.decorBottomRight} />
        </View>

        <ScrollView
          ref={scrollRef}
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            keyboardVisible && styles.scrollContentKeyboard,
            { minHeight: height },
          ]}
        >
            <View style={styles.heroWrap}>
              <View style={styles.logoRow}>
                <PertaminaLogo size="sm" framed />
              </View>

              <Text selectable style={styles.heroTitle}>
                Emergency
                {'\n'}
                Response Center
                {'\n'}
                (ECR)
              </Text>

              <View style={styles.accentRow}>
                <View style={styles.accentLine} />
                <View style={styles.accentDot} />
              </View>

              <Text selectable style={styles.heroSubtitle}>
                Aplikasi cepat tanggap layanan security, medical, fire, dan IT helpdesk.
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.badge}>
                <View style={styles.badgeIcon}>
                  <Text style={styles.badgeIconText}>S</Text>
                </View>
                <Text selectable style={styles.badgeText}>
                  KESELAMATAN | CEPAT | TERKOORDINASI
                </Text>
              </View>

              <View style={styles.intro}>
                <Text selectable style={styles.cardTitle}>
                  Selamat datang!
                </Text>
                <Text selectable style={styles.cardSubtitle}>
                  Silakan masuk untuk melanjutkan
                </Text>
              </View>

              <AuthField
                ref={usernameRef}
                icon="U"
                label="Username"
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                onFocus={() => handleFieldFocus('username')}
                onBlur={() => setFocusedField((current) => (current === 'username' ? null : current))}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                textContentType="username"
                onSubmitEditing={() => passwordRef.current?.focus()}
                active={focusedField === 'username'}
              />

              <AuthField
                ref={passwordRef}
                icon="P"
                label="Password"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                onFocus={() => handleFieldFocus('password')}
                onBlur={() => setFocusedField((current) => (current === 'password' ? null : current))}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={secureTextEntry}
                textContentType="password"
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                active={focusedField === 'password'}
                rightAction={
                  <Pressable
                    onPress={() => setSecureTextEntry((value) => !value)}
                    hitSlop={8}
                    style={({ pressed }) => [styles.eyeButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.eyeButtonText}>{secureTextEntry ? 'Show' : 'Hide'}</Text>
                  </Pressable>
                }
              />

              <Pressable
                onPress={handleLogin}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Masuk"
                accessibilityState={{ disabled: isSubmitting }}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && !isSubmitting && styles.pressed,
                  isSubmitting && styles.buttonDisabled,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Masuk</Text>
                )}
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text selectable style={styles.dividerText}>
                  atau
                </Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                onPress={() => setShowRegisterOptions(true)}
                accessibilityRole="button"
                accessibilityLabel="Daftar Akun Baru"
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryButtonText}>Daftar Akun Baru</Text>
              </Pressable>
            </View>
        </ScrollView>
      </ImageBackground>

      <Modal
        visible={showRegisterOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRegisterOptions(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowRegisterOptions(false)}>
          <Pressable style={styles.registerSheet}>
            <View style={styles.sheetHandle} />
            <Text selectable style={styles.sheetTitle}>
              Daftar sebagai
            </Text>
            <Text selectable style={styles.sheetSubtitle}>
              Pilih jenis akun yang ingin dibuat.
            </Text>

            <Pressable
              onPress={() => {
                setShowRegisterOptions(false);
                navigation.navigate('Register');
              }}
              accessibilityRole="button"
              accessibilityLabel="Daftar sebagai user"
              style={({ pressed }) => [styles.sheetOption, styles.sheetOptionUser, pressed && styles.pressed]}
            >
              <View style={[styles.registerIcon, styles.registerIconUser]}>
                <Text style={[styles.registerIconText, styles.registerIconTextUser]}>U</Text>
              </View>
              <View style={styles.registerTextWrap}>
                <Text style={[styles.registerOptionTitle, styles.registerOptionTitleUser]}>User</Text>
                <Text style={styles.registerOptionSubtitle}>Akun pelapor alert</Text>
              </View>
              <Text style={[styles.sheetChevron, styles.registerIconTextUser]}>›</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setShowRegisterOptions(false);
                navigation.navigate('StaffRegister');
              }}
              accessibilityRole="button"
              accessibilityLabel="Daftar sebagai staff karyawan"
              style={({ pressed }) => [styles.sheetOption, styles.sheetOptionStaff, pressed && styles.pressed]}
            >
              <View style={[styles.registerIcon, styles.registerIconStaff]}>
                <Text style={[styles.registerIconText, styles.registerIconTextStaff]}>S</Text>
              </View>
              <View style={styles.registerTextWrap}>
                <Text style={[styles.registerOptionTitle, styles.registerOptionTitleStaff]}>Staff Karyawan</Text>
                <Text style={styles.registerOptionSubtitle}>Akun petugas departemen</Text>
              </View>
              <Text style={[styles.sheetChevron, styles.registerIconTextStaff]}>›</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowRegisterOptions(false)}
              accessibilityRole="button"
              accessibilityLabel="Tutup pilihan daftar akun"
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <AppNoticeModal
        visible={Boolean(notice)}
        title={notice?.title ?? ''}
        message={notice?.message ?? ''}
        tone={notice?.tone ?? 'warning'}
        onAction={() => setNotice(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#061A4A',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,18,58,0.08)',
  },
  decorWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorTopLeft: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    height: 220,
    left: -88,
    position: 'absolute',
    top: 8,
    width: 220,
  },
  decorBottomLeft: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 999,
    bottom: 150,
    height: 200,
    left: -80,
    position: 'absolute',
    width: 200,
  },
  decorBottomRight: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999,
    bottom: 56,
    height: 220,
    position: 'absolute',
    right: -96,
    width: 220,
  },
  scrollContent: {
    flexGrow: 1,
    gap: 16,
    paddingBottom: 88,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  scrollContentKeyboard: {
    paddingBottom: 360,
  },
  heroWrap: {
    gap: 8,
    paddingRight: 56,
    paddingTop: 0,
  },
  logoRow: {
    alignItems: 'flex-start',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 32,
  },
  accentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  accentLine: {
    backgroundColor: '#F02B46',
    borderRadius: 999,
    height: 4,
    width: 48,
  },
  accentDot: {
    backgroundColor: 'rgba(255,255,255,0.38)',
    borderRadius: 999,
    height: 4,
    width: 12,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 15.5,
    fontWeight: '600',
    lineHeight: 22,
    maxWidth: 320,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderColor: 'rgba(214,225,238,0.98)',
    borderRadius: 34,
    borderWidth: 1,
    gap: 10,
    marginTop: 8,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 2,
  },
  badge: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#EFF9F0',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  badgeIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(25,146,68,0.14)',
    borderRadius: 999,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  badgeIconText: {
    color: '#199244',
    fontSize: 11,
    fontWeight: '900',
  },
  badgeText: {
    color: '#199244',
    flexShrink: 1,
    fontSize: 11.4,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  intro: {
    gap: 4,
    paddingBottom: 2,
    paddingTop: 4,
  },
  cardTitle: {
    color: '#173260',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  cardSubtitle: {
    color: '#6A768E',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  eyeButton: {
    marginRight: 12,
    padding: 6,
  },
  eyeButtonText: {
    color: '#2458E8',
    fontSize: 12.5,
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#E31B3D',
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
    minHeight: 54,
    shadowColor: '#E31B3D',
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
    fontWeight: '800',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginVertical: 10,
  },
  dividerLine: {
    backgroundColor: '#D9E5F3',
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#2458E8',
    borderRadius: 22,
    borderWidth: 1.4,
    justifyContent: 'center',
    minHeight: 52,
  },
  secondaryButtonText: {
    color: '#2458E8',
    fontSize: 15,
    fontWeight: '800',
  },
  modalBackdrop: {
    backgroundColor: 'rgba(6,18,48,0.54)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
  },
  registerSheet: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6F5',
    borderRadius: 28,
    borderWidth: 1,
    gap: 10,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 5,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: '#CBD5E1',
    borderRadius: 999,
    height: 4,
    marginBottom: 2,
    width: 42,
  },
  sheetTitle: {
    color: '#173260',
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
  },
  sheetSubtitle: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  sheetOption: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 68,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sheetOptionUser: {
    backgroundColor: '#F8FBFF',
    borderColor: '#D8E7FF',
  },
  sheetOptionStaff: {
    backgroundColor: '#F7FEFA',
    borderColor: '#CDEFD9',
  },
  registerIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  registerIconUser: {
    backgroundColor: '#EEF4FF',
  },
  registerIconStaff: {
    backgroundColor: '#ECFDF3',
  },
  registerIconText: {
    fontSize: 13,
    fontWeight: '900',
  },
  registerIconTextUser: {
    color: '#2458E8',
  },
  registerIconTextStaff: {
    color: '#199244',
  },
  registerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  registerOptionTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  registerOptionTitleUser: {
    color: '#2458E8',
  },
  registerOptionTitleStaff: {
    color: '#199244',
  },
  registerOptionSubtitle: {
    color: '#667085',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
  },
  sheetChevron: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 28,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButtonText: {
    color: '#667085',
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
