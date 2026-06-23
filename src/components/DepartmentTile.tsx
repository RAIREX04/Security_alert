import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  const tint = `${accent}0D`;
  const borderTint = selected ? `${accent}55` : `${accent}22`;
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
        selected && styles.cardSelected,
        pressed && onPress ? styles.pressed : null,
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
        <MaterialCommunityIcons name="chevron-right" size={17} color={accent} />
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
    borderRadius: ecrTheme.radii.lg,
    borderWidth: 1,
    flex: 1,
    minHeight: 172,
    overflow: 'hidden',
    paddingBottom: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
    ...ecrTheme.shadows.soft,
  },
  cardSelected: {
    borderWidth: 1.5,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }],
  },
  mark: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: ecrTheme.radii.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  markText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
  },
  title: {
    fontSize: 12.5,
    fontWeight: '900',
    lineHeight: 16,
    marginTop: 9,
    minHeight: 30,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 5,
    minHeight: 30,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  actionPill: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: ecrTheme.colors.card,
    borderRadius: ecrTheme.radii.full,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: 10,
  },
  actionText: {
    fontSize: 11.5,
    fontWeight: '900',
  },
  trailing: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
});
