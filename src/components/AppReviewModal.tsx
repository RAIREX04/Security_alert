import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppTextInput } from './AppTextInput';

type AppReviewModalProps = {
  visible: boolean;
  title: string;
  message: string;
  submitLabel?: string;
  cancelLabel?: string;
  initialScore?: number | null;
  initialComment?: string | null;
  onSubmit: (payload: { score: number; comment: string }) => void;
  onClose: () => void;
};

export function AppReviewModal({
  visible,
  title,
  message,
  submitLabel = 'Kirim Review',
  cancelLabel = 'Nanti Saja',
  initialScore = null,
  initialComment = '',
  onSubmit,
  onClose,
}: AppReviewModalProps) {
  const [score, setScore] = useState<number>(initialScore ?? 0);
  const [comment, setComment] = useState(initialComment ?? '');

  useEffect(() => {
    if (!visible) return;
    setScore(initialScore ?? 0);
    setComment(initialComment ?? '');
  }, [initialComment, initialScore, visible]);

  const canSubmit = useMemo(() => score >= 1 && score <= 5, [score]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <LinearGradient colors={['rgba(29,78,216,0.12)', 'rgba(29,78,216,0)']} style={styles.topGlow} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>★</Text>
          </View>

          <Text selectable style={styles.title}>
            {title}
          </Text>
          <Text selectable style={styles.message}>
            {message}
          </Text>

          <View style={styles.starRow} accessibilityRole="radiogroup">
            {[1, 2, 3, 4, 5].map((item) => {
              const active = item <= score;
              return (
                <Pressable
                  key={item}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Nilai ${item} bintang`}
                  onPress={() => setScore(item)}
                  style={({ pressed }) => [styles.starButton, active && styles.starButtonActive, pressed && styles.starButtonPressed]}
                >
                  <Text style={[styles.starText, active && styles.starTextActive]}>★</Text>
                </Pressable>
              );
            })}
          </View>

          <Text selectable style={styles.scoreHint}>
            {score > 0 ? `${score}/5 dipilih` : 'Pilih nilai 1 sampai 5'}
          </Text>

          <AppTextInput
            label="Komentar singkat"
            hint="Tulis pengalaman Anda"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            style={styles.commentInput}
          />

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={[styles.secondaryButton, styles.button]}>
              <Text style={styles.secondaryLabel}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={() => canSubmit && onSubmit({ score, comment: comment.trim() })}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                styles.button,
                !canSubmit && styles.primaryButtonDisabled,
                pressed && canSubmit && styles.pressed,
              ]}
            >
              <Text style={styles.primaryLabel}>{submitLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.56)',
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
    maxWidth: 440,
    overflow: 'hidden',
    padding: 22,
    width: '100%',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 8,
  },
  topGlow: {
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
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
    height: 72,
    justifyContent: 'center',
    marginTop: 8,
    width: 72,
  },
  badgeText: {
    color: '#1D4ED8',
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
  starRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 4,
  },
  starButton: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#DCE6F5',
    borderRadius: 18,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  starButtonActive: {
    backgroundColor: '#FFF7D6',
    borderColor: '#F1C232',
  },
  starButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  starText: {
    color: '#94A3B8',
    fontSize: 22,
    fontWeight: '900',
  },
  starTextActive: {
    color: '#EAB308',
  },
  scoreHint: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  commentInput: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  button: {
    alignItems: 'center',
    borderRadius: 18,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
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
    backgroundColor: '#DA1E37',
    borderColor: '#C81E34',
    borderWidth: 1,
  },
  primaryButtonDisabled: {
    backgroundColor: '#F3A4B1',
    borderColor: '#F3A4B1',
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
});
