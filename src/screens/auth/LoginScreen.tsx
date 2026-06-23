import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;
type FocusedField = 'username' | 'pin' | null;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const { height } = useWindowDimensions();
  const usernameRef = useRef<TextInput>(null);
  const pinRef = useRef<TextInput>(null);

  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [notice, setNotice] = useState<{ title: string; message: string; tone?: 'success' | 'info' | 'warning' } | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !pin.trim()) {
      setNotice({ title: 'Validasi', message: 'Username dan PIN wajib diisi.', tone: 'warning' });
      return;
    }

    if (!/^\d{6}$/.test(pin.trim())) {
      setNotice({ title: 'Validasi', message: 'PIN wajib tepat 6 angka.', tone: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await login(username.trim(), pin.trim());
      setAccessToken(session.accessToken);
      await signIn(session);
    } catch (error) {
      setNotice({ title: 'Login gagal', message: getApiErrorMessage(error), tone: 'warning' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scrollContent, { minHeight: height }]}
        >
            <View style={styles.heroWrap}>
              <View style={styles.logoRow}>
                <PertaminaLogo size="sm" framed={false} />
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
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField((current) => (current === 'username' ? null : current))}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                textContentType="username"
                onSubmitEditing={() => pinRef.current?.focus()}
                active={focusedField === 'username'}
              />

              <AuthField
                ref={pinRef}
                icon="P"
                label="PIN"
                placeholder="PIN"
                value={pin}
                onChangeText={setPin}
                onFocus={() => setFocusedField('pin')}
                onBlur={() => setFocusedField((current) => (current === 'pin' ? null : current))}
                keyboardType="number-pad"
                maxLength={6}
                secureTextEntry={secureTextEntry}
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                active={focusedField === 'pin'}
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
                onPress={() => navigation.navigate('Register')}
                accessibilityRole="button"
                accessibilityLabel="Daftar Akun Baru"
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryButtonText}>Daftar Akun Baru</Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('StaffRegister')}
                accessibilityRole="button"
                accessibilityLabel="Daftar Staff Karyawan"
                style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
              >
                <Text style={styles.ghostButtonText}>Daftar Staff Karyawan</Text>
              </Pressable>
            </View>
        </ScrollView>
      </ImageBackground>

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
    gap: 18,
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  heroWrap: {
    gap: 10,
    paddingRight: 56,
    paddingTop: 4,
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
    marginTop: 18,
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
  ghostButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: 'rgba(25,146,68,0.30)',
    borderRadius: 22,
    borderWidth: 1.4,
    justifyContent: 'center',
    minHeight: 52,
  },
  ghostButtonText: {
    color: '#199244',
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
