import { PropsWithChildren, type ReactNode } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Keyboard,
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ImageBackground
          source={require('../../assets/login-background-pag.png')}
          resizeMode="cover"
          style={styles.flex}
        >
          <View style={styles.overlay} />
          <LinearGradient
            colors={['rgba(248,250,252,0.40)', 'rgba(248,250,252,0.82)', 'rgba(246,248,251,0.98)']}
            style={StyleSheet.absoluteFill}
          />

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
              <PertaminaLogo size={compact ? 'md' : 'lg'} align="end" />
              <Text selectable style={[styles.heroTitle, compact && styles.heroTitleCompact]}>
                {title}
              </Text>
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
      </TouchableWithoutFeedback>
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
    backgroundColor: 'rgba(15,23,42,0.08)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: ecrTheme.spacing.screenX,
    paddingVertical: ecrTheme.spacing.xl,
  },
  scrollContentCompact: {
    justifyContent: 'flex-start',
    paddingTop: 24,
  },
  heroWrap: {
    marginBottom: 16,
    paddingRight: 86,
  },
  heroWrapCompact: {
    marginBottom: 10,
  },
  heroTitle: {
    color: ecrTheme.colors.deepNavy,
    fontSize: 29,
    fontWeight: '900',
    lineHeight: 34,
    marginTop: 22,
  },
  heroTitleCompact: {
    fontSize: 25,
    lineHeight: 30,
    marginTop: 14,
  },
  heroSubtitle: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    marginTop: 12,
  },
  heroSubtitleCompact: {
    marginTop: 10,
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
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderColor: ecrTheme.colors.border,
    borderRadius: ecrTheme.radii.xl,
    borderWidth: 1,
    ...ecrTheme.shadows.medium,
    padding: ecrTheme.spacing.lg,
  },
  footerWrap: {
    marginTop: 14,
  },
});
