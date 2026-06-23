import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageStyle, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { normalizeMediaUrl } from '../utils/media';
import { ecrTheme } from '../theme/ecrTheme';

type ProfileAvatarProps = {
  name: string;
  photoUrl?: string | null;
  size?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  containerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  fallbackStyle?: StyleProp<TextStyle>;
};

export function ProfileAvatar({
  name,
  photoUrl,
  size = 92,
  onPress,
  accessibilityLabel,
  containerStyle,
  imageStyle,
  fallbackStyle,
}: ProfileAvatarProps) {
  const resolvedUri = useMemo(() => normalizeMediaUrl(photoUrl), [photoUrl]);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [resolvedUri]);

  const shouldShowImage = Boolean(resolvedUri) && !imageFailed;
  const Container = onPress ? Pressable : View;

  return (
    <Container
      {...(onPress
        ? {
            onPress,
            accessibilityRole: 'button',
            accessibilityLabel: accessibilityLabel ?? `${name}, foto profil`,
          }
        : {})}
      style={[
        styles.avatar,
        { height: size, width: size, borderRadius: size / 2 },
        containerStyle,
      ]}
    >
      {shouldShowImage ? (
        <Image
          key={resolvedUri ?? 'profile-avatar'}
          source={{ uri: resolvedUri ?? undefined }}
          style={[
            styles.image,
            { borderRadius: size / 2 },
            imageStyle,
          ]}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <Text style={[styles.fallback, fallbackStyle]}>{name.charAt(0).toUpperCase()}</Text>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    borderColor: '#D8E7FF',
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  fallback: {
    color: ecrTheme.colors.pertaminaBlue,
    fontSize: 34,
    fontWeight: '900',
  },
});
