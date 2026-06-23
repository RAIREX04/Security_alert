import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ecrTheme } from '../theme/ecrTheme';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({ title, onPress, disabled, style }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={disabled ? ['#F3A4B1', '#E8A2AE'] : ecrTheme.gradients.button}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.label}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 22,
    minHeight: 56,
    overflow: 'hidden',
    shadowColor: ecrTheme.colors.primaryRed,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 3,
  },
  gradient: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 18,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.82,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
