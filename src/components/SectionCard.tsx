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
    borderRadius: 32,
    borderColor: ecrTheme.colors.border,
    borderWidth: 1,
    gap: 14,
    overflow: 'hidden',
    padding: 18,
    borderCurve: 'continuous',
    shadowColor: ecrTheme.colors.deepNavy,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 2,
  },
});

const toneStyles = StyleSheet.create({
  default: {
    backgroundColor: ecrTheme.colors.card,
  },
  soft: {
    backgroundColor: '#F4F9FF',
  },
  warning: {
    backgroundColor: ecrTheme.colors.warningSoft,
  },
});
