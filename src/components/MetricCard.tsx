import { StyleSheet, Text, View } from 'react-native';
import { ecrTheme } from '../theme/ecrTheme';

type MetricCardProps = {
  label: string;
  value: string | number;
  accent?: string;
};

export function MetricCard({ label, value, accent = ecrTheme.colors.primaryRed }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <Text selectable style={[styles.value, { color: accent }]}>
        {value}
      </Text>
      <Text selectable style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ecrTheme.colors.card,
    borderColor: ecrTheme.colors.border,
    borderRadius: ecrTheme.radii.md,
    borderWidth: 1,
    flex: 1,
    gap: 5,
    padding: 14,
    ...ecrTheme.shadows.soft,
  },
  accentBar: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    height: 3,
    marginBottom: 4,
    width: 32,
  },
  value: {
    fontSize: 26,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  label: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
});
