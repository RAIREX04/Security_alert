import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Department } from '../types/models';
import { ecrTheme } from '../theme/ecrTheme';

type DepartmentTileProps = {
  department: Department;
  subtitle?: string;
  onPress?: () => void;
  trailing?: ReactNode;
  selected?: boolean;
};

export function DepartmentTile({ department, subtitle, onPress, trailing, selected = false }: DepartmentTileProps) {
  const accent = department.color ?? ecrTheme.colors.pertaminaBlue;
  const tint = `${accent}10`;
  const borderTint = selected ? `${accent}45` : `${accent}22`;
  const label = `${department.departmentName}, ${subtitle ?? department.description ?? 'tanpa deskripsi'}`;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      accessibilityHint={onPress ? 'Pilih departemen' : undefined}
      accessibilityState={{ disabled: !onPress }}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: tint, borderColor: borderTint },
        pressed && onPress ? styles.pressed : null,
        selected && styles.cardSelected,
      ]}
    >
      <View style={[styles.mark, { backgroundColor: accent }]}>
        <Text selectable style={styles.markText}>
          {getBadgeText(department.departmentCode)}
        </Text>
      </View>

      <Text selectable style={[styles.title, { color: accent }]} numberOfLines={2}>
        {department.departmentName.replace(/^ALERT\s+/i, '')}
      </Text>

      <Text selectable style={styles.subtitle} numberOfLines={2}>
        {subtitle ?? department.description ?? '-'}
      </Text>

      <View style={styles.spacer} />

      <View style={styles.actionPill}>
        <Text style={[styles.actionText, { color: accent }]}>Pilih departemen</Text>
        <Text style={[styles.actionArrow, { color: accent }]}>›</Text>
      </View>

      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </Pressable>
  );
}

function getBadgeText(code?: string | null) {
  const normalized = (code ?? '').toUpperCase();
  if (normalized.includes('HELPDESK')) return 'IT';
  if (normalized.includes('FIRE')) return 'F';
  if (normalized.includes('MEDICAL')) return 'M';
  return 'S';
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    flex: 1,
    minHeight: 188,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    shadowColor: ecrTheme.colors.deepNavy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 2,
  },
  cardSelected: {
    shadowOpacity: 0.11,
    shadowRadius: 20,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }],
  },
  mark: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 16,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  markText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
    lineHeight: 17,
    marginTop: 10,
    minHeight: 34,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#667085',
    fontSize: 11.5,
    lineHeight: 15,
    marginTop: 6,
    minHeight: 32,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  actionPill: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: -0.1,
  },
  actionArrow: {
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 18,
    marginLeft: 4,
  },
  trailing: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
});
