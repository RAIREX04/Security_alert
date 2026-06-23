import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { PrimaryButton } from './PrimaryButton';

type CenteredLoadingScreenProps = {
  title: string;
  subtitle?: string;
};

export function CenteredLoadingScreen({ title, subtitle }: CenteredLoadingScreenProps) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 40, 360);

  return (
    <View style={styles.shell}>
      <View style={[styles.card, { width: cardWidth }]}>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <PrimaryButton title="Memuat..." onPress={() => {}} disabled />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    backgroundColor: '#F9FBFF',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    alignItems: 'stretch',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EE',
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 2,
  },
  progressTrack: {
    backgroundColor: '#F2C1CB',
    borderRadius: 999,
    height: 12,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#DA1E37',
    borderRadius: 999,
    height: '100%',
    width: '48%',
  },
  title: {
    color: '#173260',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#5E6A80',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
