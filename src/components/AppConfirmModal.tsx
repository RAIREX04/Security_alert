import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type AppConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
};

export function AppConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Lanjut',
  cancelLabel = 'Batal',
  tone = 'warning',
  onConfirm,
  onCancel,
}: AppConfirmModalProps) {
  const accent = toneAccent[tone];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
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

          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={[styles.button, styles.secondaryButton]}>
              <Text style={styles.secondaryLabel}>{cancelLabel}</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={[styles.button, styles.primaryButton, { backgroundColor: accent.color }]}>
              <Text style={styles.primaryLabel}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const toneAccent = {
  danger: { color: '#B91C1C', soft: '#FEE2E2', symbol: '!', gradient: ['rgba(185,28,28,0.12)', 'rgba(185,28,28,0)'] as const },
  warning: { color: '#B45309', soft: '#FEF3C7', symbol: '!', gradient: ['rgba(245,158,11,0.12)', 'rgba(245,158,11,0)'] as const },
  info: { color: '#1D4ED8', soft: '#DBEAFE', symbol: 'i', gradient: ['rgba(29,78,216,0.12)', 'rgba(29,78,216,0)'] as const },
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
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    alignItems: 'center',
    borderRadius: 18,
    flex: 1,
    justifyContent: 'center',
    minHeight: 50,
  },
  secondaryButton: {
    backgroundColor: '#F8FAFC',
    borderColor: '#DCE6F5',
    borderWidth: 1,
  },
  secondaryLabel: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  primaryButton: {
    borderWidth: 1,
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
