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
        <Text selectable style={styles.subtitle} numberOfLines={3}>
          {department.description ?? 'Departemen bantuan'}
        </Text>
      </View>

      <View style={styles.arrowWrap}>
        <Text style={[styles.arrow, { color: theme.color }]}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 104,
    padding: 16,
    shadowColor: ecrTheme.colors.deepNavy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 22,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  icon: {
    fontSize: 30,
    fontWeight: '900',
  },
  body: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  arrowWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
  },
  arrow: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 34,
  },
});
