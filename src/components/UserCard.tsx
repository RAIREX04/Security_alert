import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { User } from '../types/models';
import { ProfileAvatar } from './ProfileAvatar';
import { StatusBadge } from './StatusBadge';
import { ecrTheme } from '../theme/ecrTheme';

type UserCardProps = {
  user: User;
  subtitle?: string;
  onPress?: () => void;
};

export function UserCard({ user, subtitle, onPress }: UserCardProps) {
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const label = `${user.fullName}, ${subtitle ?? user.email}, status ${user.approvalStatus}`;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      accessibilityHint={onPress ? 'Buka detail akun' : undefined}
      accessibilityState={{ disabled: !onPress }}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      <ProfileAvatar
        name={user.fullName}
        photoUrl={user.photoUrl}
        size={48}
        accessibilityLabel={`${user.fullName}, foto profil`}
        containerStyle={styles.avatar}
        imageStyle={styles.avatarImage}
        fallbackStyle={styles.avatarText}
      />
      <View style={styles.body}>
        <Text selectable style={styles.title} numberOfLines={2}>
          {user.fullName}
        </Text>
        <Text selectable style={styles.subtitle} numberOfLines={2}>
          {subtitle ?? user.email}
        </Text>
        <Text selectable style={styles.meta} numberOfLines={1}>
          {user.username}
        </Text>
      </View>
      <StatusBadge status={user.approvalStatus} compact />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    backgroundColor: ecrTheme.colors.card,
    borderColor: ecrTheme.colors.border,
    borderRadius: ecrTheme.radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 13,
    ...ecrTheme.shadows.soft,
  },
  cardCompact: {
    gap: 10,
    padding: 14,
  },
  pressed: {
    opacity: 0.96,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: ecrTheme.colors.infoSoft,
    borderColor: '#BFDBFE',
    borderRadius: ecrTheme.radii.md,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 48,
  },
  avatarImage: {
    borderRadius: ecrTheme.radii.md,
  },
  avatarText: {
    color: ecrTheme.colors.pertaminaBlue,
    fontSize: 16,
    fontWeight: '900',
  },
  body: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  title: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 14.5,
    fontWeight: '900',
    lineHeight: 21,
  },
  subtitle: {
    color: ecrTheme.colors.textSecondary,
    lineHeight: 18,
  },
  meta: {
    color: ecrTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
});
