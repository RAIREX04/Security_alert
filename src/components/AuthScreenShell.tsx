import { PropsWithChildren, type ReactNode } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PertaminaLogo } from './PertaminaLogo';
import { ecrTheme } from '../theme/ecrTheme';

type AuthScreenShellProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  compact?: boolean;
  footer?: ReactNode;
}>;

export function AuthScreenShell({ title, subtitle, compact = false, footer, children }: AuthScreenShellProps) {
  const { height } = useWindowDimensions();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      style={styles.flex}
    >
      <ImageBackground
        source={require('../../assets/login-background-new.png')}
        resizeMode="cover"
        style={styles.flex}
      >
        <View pointerEvents="none" style={styles.overlay} />
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <LinearGradient
            colors={['rgba(4,22,74,0.86)', 'rgba(4,22,74,0.54)', 'rgba(4,22,74,0.20)', 'rgba(4,22,74,0.03)']}
            locations={[0, 0.36, 0.72, 1]}
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
          contentContainerStyle={[
            styles.scrollContent,
            { minHeight: height },
            compact && styles.scrollContentCompact,
          ]}
        >
          <View style={[styles.heroWrap, compact && styles.heroWrapCompact]}>
            <PertaminaLogo size={compact ? 'sm' : 'md'} framed={false} />
            <Text selectable style={[styles.heroTitle, compact && styles.heroTitleCompact]}>
              {title}
            </Text>
            <View style={styles.accentRow}>
              <View style={styles.accentLine} />
              <View style={styles.accentDot} />
            </View>
            <Text selectable style={[styles.heroSubtitle, compact && styles.heroSubtitleCompact]}>
              {subtitle}
            </Text>
            {!compact ? (
              <View style={styles.heroPills}>
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillText}>Keamanan tanggap</Text>
                </View>
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillText}>Respon cepat</Text>
                </View>
              </View>
            ) : null}
          </View>

          <View style={styles.card}>{children}</View>

          {footer ? <View style={styles.footerWrap}>{footer}</View> : null}
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: ecrTheme.colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,12,38,0.10)',
  },
  decorWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  decorTopLeft: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 190,
    height: 260,
    left: -142,
    position: 'absolute',
    top: -52,
    width: 260,
  },
  decorBottomLeft: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 260,
    bottom: -150,
    height: 340,
    left: -210,
    position: 'absolute',
    width: 340,
  },
  decorBottomRight: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 240,
    bottom: -128,
    height: 320,
    position: 'absolute',
    right: -184,
    width: 320,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: ecrTheme.spacing.screenX,
    paddingBottom: ecrTheme.spacing.xl,
    paddingTop: 34,
  },
  scrollContentCompact: {
    justifyContent: 'flex-start',
    paddingTop: 28,
  },
  heroWrap: {
    marginBottom: 18,
    paddingRight: 46,
  },
  heroWrapCompact: {
    marginBottom: 14,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.7,
    lineHeight: 39,
    marginTop: 24,
  },
  heroTitleCompact: {
    fontSize: 30,
    lineHeight: 35,
    marginTop: 18,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
    marginTop: 12,
  },
  heroSubtitleCompact: {
    marginTop: 12,
  },
  accentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  accentLine: {
    backgroundColor: '#EA1D38',
    borderRadius: 999,
    height: 5,
    width: 70,
  },
  accentDot: {
    backgroundColor: 'rgba(255,255,255,0.36)',
    borderRadius: 999,
    height: 5,
    width: 18,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  heroPill: {
    backgroundColor: ecrTheme.colors.surfaceRaised,
    borderColor: ecrTheme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroPillText: {
    color: ecrTheme.colors.deepNavy,
    fontSize: 11.2,
    fontWeight: '800',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderColor: 'rgba(226,232,240,0.92)',
    borderRadius: 34,
    borderWidth: 1,
    ...ecrTheme.shadows.medium,
    padding: 24,
  },
  footerWrap: {
    marginTop: 14,
  },
});
