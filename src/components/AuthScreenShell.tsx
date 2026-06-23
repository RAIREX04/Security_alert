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
    backgroundColor: '#F8FBFF',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  decorWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorBlue: {
    backgroundColor: 'rgba(83,147,255,0.15)',
    borderRadius: 999,
    height: 240,
    left: -90,
    position: 'absolute',
    top: 34,
    width: 240,
  },
  decorGreen: {
    backgroundColor: 'rgba(48,179,102,0.11)',
    borderRadius: 999,
    bottom: 96,
    height: 170,
    left: -50,
    position: 'absolute',
    width: 170,
  },
  decorRed: {
    backgroundColor: 'rgba(218,30,55,0.12)',
    borderRadius: 999,
    bottom: 86,
    height: 190,
    position: 'absolute',
    right: -74,
    width: 190,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 22,
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
    color: '#173260',
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: -1.1,
    lineHeight: 33,
    marginTop: 22,
  },
  heroTitleCompact: {
    fontSize: 28,
    lineHeight: 30,
    marginTop: 14,
  },
  heroSubtitle: {
    color: '#5E6A80',
    fontSize: 12.9,
    fontWeight: '600',
    lineHeight: 17,
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
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderColor: '#DCE5F0',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroPillText: {
    color: '#173260',
    fontSize: 11.2,
    fontWeight: '800',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: '#D8E2EE',
    borderRadius: 34,
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.09,
    shadowRadius: 28,
    elevation: 2,
    padding: 18,
  },
  footerWrap: {
    marginTop: 14,
  },
});
