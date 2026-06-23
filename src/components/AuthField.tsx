import { forwardRef, type ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

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
          placeholderTextColor="#8F99AB"
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
    backgroundColor: '#FFFFFF',
    borderColor: '#D7DEE8',
    borderRadius: 22,
    borderWidth: 1.2,
    flexDirection: 'row',
    minHeight: 52,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0,
    shadowRadius: 12,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: '#FFF1F3',
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    marginLeft: 12,
    width: 30,
  },
  iconWrapActive: {
    backgroundColor: '#FDE6EA',
  },
  icon: {
    color: '#DA1E37',
    fontSize: 13,
    fontWeight: '900',
  },
  iconActive: {
    color: '#C81E34',
  },
  input: {
    color: '#1F2937',
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputActive: {
    color: '#13213A',
  },
});
