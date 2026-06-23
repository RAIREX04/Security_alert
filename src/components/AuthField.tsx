import { forwardRef, type ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { ecrTheme } from '../theme/ecrTheme';

type AuthFieldProps = TextInputProps & {
  label: string;
  icon: string;
  active?: boolean;
  rightAction?: ReactNode;
};

export const AuthField = forwardRef<TextInput, AuthFieldProps>(
  ({ label, icon, active, rightAction, style, ...props }, ref) => {
    return (
      <View style={styles.field}>
        <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
          <Text style={[styles.icon, active && styles.iconActive]}>{icon}</Text>
        </View>
        <TextInput
          ref={ref}
          placeholder={label}
          placeholderTextColor={ecrTheme.colors.textMuted}
          style={[styles.input, active && styles.inputActive, style]}
          accessibilityLabel={label}
          {...props}
        />
        {rightAction}
      </View>
    );
  },
);

AuthField.displayName = 'AuthField';

const styles = StyleSheet.create({
  field: {
    alignItems: 'center',
    backgroundColor: ecrTheme.colors.card,
    borderColor: ecrTheme.colors.border,
    borderRadius: ecrTheme.radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0,
    shadowRadius: 12,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: ecrTheme.status.open.bg,
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    marginLeft: 12,
    width: 30,
  },
  iconWrapActive: {
    backgroundColor: ecrTheme.status.open.bg,
  },
  icon: {
    color: ecrTheme.status.open.text,
    fontSize: 13,
    fontWeight: '900',
  },
  iconActive: {
    color: ecrTheme.status.open.text,
  },
  input: {
    color: ecrTheme.colors.textPrimary,
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputActive: {
    color: ecrTheme.colors.textPrimary,
  },
});
