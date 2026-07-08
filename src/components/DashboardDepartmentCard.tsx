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
    minHeight: 128,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingTop: 9,
    paddingBottom: 10,
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
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  iconBubble: {
    alignItems: 'center',
    borderRadius: ecrTheme.radii.sm,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  title: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: -0.15,
    lineHeight: 13,
    marginTop: 8,
    minHeight: 28,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  bottomBar: {
    borderRadius: 999,
    height: 4,
    marginBottom: 1,
    marginTop: 'auto',
    width: 24,
  },
});
