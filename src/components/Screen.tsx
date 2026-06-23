import { PropsWithChildren, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ecrTheme } from '../theme/ecrTheme';

type ScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
}>;

export function Screen({ title, subtitle, left, right, children }: ScreenProps) {
  const { width } = useWindowDimensions();
  const compact = width < 390;

  return (
    <SafeAreaView style={styles.shell} edges={['top', 'left', 'right']}>
      <View pointerEvents="none" style={styles.backdrop}>
        <View style={styles.blobBlue} />
        <View style={styles.blobRed} />
        <View style={styles.blobGreen} />
        <LinearGradient colors={ecrTheme.gradients.page} style={styles.fade} />
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.container, compact && styles.containerCompact]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {left ? <View style={styles.headerAction}>{left}</View> : null}
            <View style={styles.headerText}>
              <Text selectable style={styles.kicker}>
                Emergency Response Center
              </Text>
              <Text selectable style={styles.title}>
                {title}
              </Text>
              {subtitle ? (
                <Text selectable style={styles.subtitle}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </View>
          {right}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: ecrTheme.colors.background,
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blobBlue: {
    backgroundColor: 'rgba(0,91,172,0.11)',
    borderRadius: 999,
    height: 240,
    opacity: 0.9,
    position: 'absolute',
    right: -132,
    top: 24,
    width: 240,
  },
  blobRed: {
    backgroundColor: 'rgba(214,31,42,0.08)',
    borderRadius: 999,
    bottom: 28,
    height: 200,
    left: -84,
    opacity: 0.72,
    position: 'absolute',
    width: 200,
  },
  blobGreen: {
    backgroundColor: 'rgba(14,159,110,0.08)',
    borderRadius: 999,
    height: 280,
    left: '14%',
    opacity: 0.24,
    position: 'absolute',
    top: '28%',
    width: 280,
  },
  fade: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    gap: 16,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 172,
  },
  containerCompact: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 2,
  },
  headerLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minWidth: 0,
  },
  headerAction: {
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  kicker: {
    color: ecrTheme.colors.pertaminaBlue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  title: {
    color: ecrTheme.colors.deepNavy,
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 33,
  },
  subtitle: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 14.5,
    lineHeight: 21,
  },
});
