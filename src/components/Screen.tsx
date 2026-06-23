import { PropsWithChildren, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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
  container: {
    gap: ecrTheme.spacing.md,
    paddingHorizontal: ecrTheme.spacing.screenX,
    paddingTop: 14,
    paddingBottom: ecrTheme.spacing.screenBottom,
  },
  containerCompact: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 4,
    paddingVertical: 4,
  },
  headerLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  headerAction: {
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  kicker: {
    color: ecrTheme.colors.pertaminaBlue,
    fontSize: ecrTheme.typography.kicker.fontSize,
    fontWeight: '900',
    letterSpacing: ecrTheme.typography.kicker.letterSpacing,
    textTransform: 'uppercase',
  },
  title: {
    color: ecrTheme.colors.deepNavy,
    fontSize: ecrTheme.typography.title.fontSize,
    fontWeight: '900',
    lineHeight: ecrTheme.typography.title.lineHeight,
  },
  subtitle: {
    color: ecrTheme.colors.textSecondary,
    fontSize: ecrTheme.typography.body.fontSize,
    lineHeight: ecrTheme.typography.body.lineHeight,
  },
});
