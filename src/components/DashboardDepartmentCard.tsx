import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Department } from '../types/models';
import { ecrTheme } from '../theme/ecrTheme';
import { getDepartmentIconName } from '../utils/staff';

type DashboardDepartmentCardProps = {
  department: Department;
  onPress?: () => void;
};

export function DashboardDepartmentCard({ department, onPress }: DashboardDepartmentCardProps) {
  const accent = department.color ?? ecrTheme.colors.pertaminaBlue;
  const title = department.departmentName;
  const iconName = getDepartmentIconName(department.departmentCode);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={department.departmentName}
      style={({ pressed }) => [
        styles.card,
        { borderColor: `${accent}20` },
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${accent}12` }]}>
        <View style={[styles.iconBubble, { backgroundColor: accent }]}>
          <MaterialCommunityIcons name={iconName as any} size={22} color="#FFFFFF" />
        </View>
      </View>

      <Text selectable style={[styles.title, { color: accent }]} numberOfLines={2}>
        {title}
      </Text>

      <View style={[styles.bottomBar, { backgroundColor: accent }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6F5',
    borderRadius: ecrTheme.radii.md,
    borderWidth: 1,
    flexGrow: 1,
    flexBasis: '24%',
    minHeight: 160,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 12,
    ...ecrTheme.shadows.soft,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: ecrTheme.radii.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  iconBubble: {
    alignItems: 'center',
    borderRadius: ecrTheme.radii.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  title: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: -0.15,
    lineHeight: 13,
    marginTop: 10,
    minHeight: 28,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  bottomBar: {
    borderRadius: 999,
    height: 4,
    marginTop: 'auto',
    width: 24,
  },
});
