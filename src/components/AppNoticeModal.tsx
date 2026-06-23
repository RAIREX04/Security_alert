import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { PrimaryButton } from './PrimaryButton';

type AppNoticeModalProps = {
  visible: boolean;
  title: string;
  message: string;
  actionLabel?: string;
  onAction: () => void;
  tone?: 'success' | 'info' | 'warning';
};

export function AppNoticeModal({
  visible,
  title,
  message,
  actionLabel = 'OK',
  onAction,
  tone = 'success',
}: AppNoticeModalProps) {
  const accent = toneAccent[tone];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onAction}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onAction} />
        <View style={styles.card}>
          <LinearGradient colors={accent.gradient} style={styles.headerGlow} />
          <View style={[styles.badge, { backgroundColor: accent.soft }]}>
            <Text style={[styles.badgeText, { color: accent.color }]}>{accent.symbol}</Text>
          </View>
          <Text selectable style={styles.title}>
            {title}
          </Text>
          <Text selectable style={styles.message}>
            {message}
          </Text>
          <PrimaryButton title={actionLabel} onPress={onAction} />
        </View>
      </View>
    </Modal>
  );
}

const toneAccent = {
  success: { color: '#15803D', soft: '#DCFCE7', symbol: '✓', gradient: ['rgba(22,163,74,0.12)', 'rgba(22,163,74,0)'] as const },
  info: { color: '#1D4ED8', soft: '#DBEAFE', symbol: 'i', gradient: ['rgba(29,78,216,0.12)', 'rgba(29,78,216,0)'] as const },
  warning: { color: '#B45309', soft: '#FEF3C7', symbol: '!', gradient: ['rgba(245,158,11,0.12)', 'rgba(245,158,11,0)'] as const },
} as const;

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.52)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 34,
    borderWidth: 1,
    gap: 14,
    maxWidth: 420,
    overflow: 'hidden',
    padding: 22,
    width: '100%',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 8,
  },
  headerGlow: {
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    height: 84,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  badge: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 999,
    height: 72,
    justifyContent: 'center',
    marginTop: 8,
    width: 72,
  },
  badgeText: {
    fontSize: 28,
    fontWeight: '900',
  },
  title: {
    color: '#0F172A',
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    color: '#475569',
    fontSize: 15.5,
    lineHeight: 23,
    textAlign: 'center',
  },
});
