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
          placeholderTextColor={ecrTheme.colors.textMuted}
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
    gap: 7,
  },
  label: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 12.5,
    fontWeight: '800',
  },
  input: {
    backgroundColor: ecrTheme.colors.card,
    borderColor: ecrTheme.colors.border,
    borderRadius: ecrTheme.radii.md,
    borderWidth: 1,
    color: ecrTheme.colors.textPrimary,
    fontSize: 14,
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
