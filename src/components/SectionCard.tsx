import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { ecrTheme } from '../theme/ecrTheme';

type SectionCardProps = PropsWithChildren<{
  tone?: 'default' | 'soft' | 'warning';
}>;

export function SectionCard({ children, tone = 'default' }: SectionCardProps) {
  return <View style={[styles.card, toneStyles[tone]]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ecrTheme.colors.card,
    borderRadius: ecrTheme.radii.lg,
    borderColor: ecrTheme.colors.border,
    borderWidth: 1,
    gap: ecrTheme.spacing.md,
    overflow: 'hidden',
    padding: ecrTheme.spacing.lg,
    borderCurve: 'continuous',
    ...ecrTheme.shadows.soft,
  },
});

const toneStyles = StyleSheet.create({
  default: {
    backgroundColor: ecrTheme.colors.card,
  },
  soft: {
    backgroundColor: ecrTheme.colors.surface,
  },
  warning: {
    backgroundColor: ecrTheme.colors.warningSoft,
  },
});
