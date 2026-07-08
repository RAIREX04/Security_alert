import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ProfileAvatar } from './ProfileAvatar';

type ProfilePhotoInputProps = {
  name: string;
  photoUri?: string | null;
  fileName?: string | null;
  required?: boolean;
  onPress: () => void;
};

export function ProfilePhotoInput({
  name,
  photoUri,
  fileName,
  required = false,
  onPress,
}: ProfilePhotoInputProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Foto profil</Text>
        <Text style={[styles.badge, required ? styles.badgeRequired : styles.badgeOptional]}>
          {required ? 'Wajib' : 'Opsional'}
        </Text>
      </View>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Pilih foto profil"
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <ProfileAvatar
          name={name.trim() || 'A'}
          photoUrl={photoUri}
          size={58}
          containerStyle={styles.avatar}
          fallbackStyle={styles.avatarFallback}
        />
        <View style={styles.copy}>
          <Text style={styles.title}>{photoUri ? 'Foto sudah dipilih' : 'Tambah foto profil'}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {fileName ?? 'Ambil foto atau pilih dari galeri'}
          </Text>
        </View>
        <View style={styles.actionIcon}>
          <MaterialCommunityIcons name="camera-plus-outline" size={22} color="#1D4ED8" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  label: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '900',
  },
  badge: {
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeRequired: {
    backgroundColor: '#FEF2F2',
    color: '#BE123C',
  },
  badgeOptional: {
    backgroundColor: '#EEF6FF',
    color: '#0B67A3',
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 76,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  avatar: {
    backgroundColor: '#EEF4FF',
    shadowOpacity: 0,
  },
  avatarFallback: {
    fontSize: 22,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#0F172A',
    fontSize: 14.5,
    fontWeight: '900',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 2,
  },
  actionIcon: {
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
