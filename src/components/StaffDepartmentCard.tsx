import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Department } from '../types/models';
import { getDepartmentGlyph, getStaffDepartmentTheme } from '../utils/staff';
import { ecrTheme } from '../theme/ecrTheme';

type StaffDepartmentCardProps = {
  department: Department;
  onPress?: () => void;
};

export function StaffDepartmentCard({ department, onPress }: StaffDepartmentCardProps) {
  const theme = getStaffDepartmentTheme(department);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Pilih ${department.departmentName}`}
      accessibilityState={{ disabled: !onPress }}
      style={({ pressed }) => [
        styles.card,
        { borderColor: theme.border, backgroundColor: ecrTheme.colors.card },
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.soft }]}>
        <Text selectable style={[styles.icon, { color: theme.color }]}>
          {getDepartmentGlyph(department.departmentCode)}
        </Text>
      </View>

      <View style={styles.body}>
        <Text selectable style={styles.title} numberOfLines={1}>
          {department.departmentName}
        </Text>
        <Text selectable style={styles.subtitle} numberOfLines={2}>
          {department.description ?? 'Departemen bantuan'}
        </Text>
      </View>

      <View style={styles.arrowWrap}>
        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.color} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: ecrTheme.radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 92,
    padding: 14,
    ...ecrTheme.shadows.soft,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: ecrTheme.radii.md,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  icon: {
    fontSize: 24,
    fontWeight: '900',
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  subtitle: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  arrowWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
  },
});
