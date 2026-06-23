import { Pressable, StyleSheet, Text } from 'react-native';
import { ecrTheme } from '../theme/ecrTheme';

type HeaderBackButtonProps = {
  onPress: () => void | Promise<void>;
  variant?: 'light' | 'dark';
};

export function HeaderBackButton({ onPress, variant = 'dark' }: HeaderBackButtonProps) {
  const isLight = variant === 'light';

  return (
    <Pressable
      onPress={() => void onPress()}
      accessibilityRole="button"
      accessibilityLabel="Kembali"
      style={({ pressed }) => [
        styles.button,
        isLight ? styles.lightButton : styles.darkButton,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, isLight ? styles.lightText : styles.darkText]}>‹</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 18,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  darkButton: {
    backgroundColor: ecrTheme.colors.card,
    borderColor: ecrTheme.colors.border,
    borderWidth: 1,
    shadowColor: ecrTheme.colors.deepNavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 1,
  },
  lightButton: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.24)',
    borderWidth: 1,
  },
  text: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 28,
    marginTop: -2,
  },
  darkText: {
    color: ecrTheme.colors.textPrimary,
  },
  lightText: {
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
