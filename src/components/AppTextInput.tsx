import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { ecrTheme } from '../theme/ecrTheme';

type AppTextInputProps = TextInputProps & {
  label: string;
  hint?: string;
};

export const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  ({ label, hint, style, ...props }, ref) => {
    return (
      <View style={styles.wrapper}>
        <Text selectable style={styles.label}>
          {label}
        </Text>
        <TextInput
          ref={ref}
          placeholder={hint ?? label}
          placeholderTextColor="#94A3B8"
          style={[styles.input, style]}
          {...props}
        />
      </View>
    );
  },
);

AppTextInput.displayName = 'AppTextInput';

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  input: {
    backgroundColor: ecrTheme.colors.card,
    borderColor: ecrTheme.colors.border,
    borderRadius: 22,
    borderWidth: 1.2,
    color: ecrTheme.colors.textPrimary,
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: ecrTheme.colors.deepNavy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
});
