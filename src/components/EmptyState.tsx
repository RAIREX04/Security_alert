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
          <Text style={styles.iconText}>∅</Text>
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
    borderRadius: 30,
    borderWidth: 1,
    gap: 10,
    padding: 20,
    shadowColor: ecrTheme.colors.deepNavy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  },
  iconOuter: {
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 24,
    padding: 6,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D8E7FF',
    borderRadius: 18,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  iconText: {
    color: ecrTheme.colors.pertaminaBlue,
    fontSize: 20,
    fontWeight: '900',
  },
  title: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
