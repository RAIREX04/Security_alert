import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';

type PlaceholderScreenProps = {
  title: string;
  description: string;
};

export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  return (
    <Screen title={title} subtitle={description}>
      <View style={styles.box}>
        <Text selectable style={styles.title}>
          {title}
        </Text>
        <Text selectable style={styles.description}>
          {description}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    padding: 20,
  },
  title: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    color: '#64748B',
    textAlign: 'center',
  },
});

