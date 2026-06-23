import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
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
      <MaterialCommunityIcons
        name="chevron-left"
        size={25}
        color={isLight ? ecrTheme.colors.deepNavy : ecrTheme.colors.textPrimary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: ecrTheme.radii.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  darkButton: {
    backgroundColor: ecrTheme.colors.card,
    borderColor: ecrTheme.colors.border,
    borderWidth: 1,
    ...ecrTheme.shadows.soft,
  },
  lightButton: {
    backgroundColor: ecrTheme.colors.card,
    borderColor: ecrTheme.colors.border,
    borderWidth: 1,
    ...ecrTheme.shadows.soft,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
