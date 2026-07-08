import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { ecrTheme } from '../theme/ecrTheme';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.iconOuter}>
        <View style={styles.icon}>
          <MaterialCommunityIcons name="file-search-outline" size={22} color={ecrTheme.colors.pertaminaBlue} />
        </View>
      </View>
      <Text selectable style={styles.title}>
        {title}
      </Text>
      <Text selectable style={styles.description}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    backgroundColor: ecrTheme.colors.card,
    borderColor: ecrTheme.colors.border,
    borderRadius: ecrTheme.radii.lg,
    borderWidth: 1,
    gap: 13,
    minHeight: 190,
    paddingHorizontal: ecrTheme.spacing.lg,
    paddingVertical: 24,
    ...ecrTheme.shadows.soft,
  },
  iconOuter: {
    alignItems: 'center',
    backgroundColor: ecrTheme.colors.infoSoft,
    borderRadius: ecrTheme.radii.md,
    padding: 6,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: ecrTheme.colors.card,
    borderColor: '#D8E7FF',
    borderRadius: ecrTheme.radii.sm,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  title: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 25,
    maxWidth: 260,
    textAlign: 'center',
  },
  description: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 21,
    maxWidth: 300,
    textAlign: 'center',
  },
});
