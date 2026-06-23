import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type PhotoSourceSheetProps = {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  title?: string;
  description?: string;
};

export function PhotoSourceSheet({
  visible,
  onClose,
  onCamera,
  onGallery,
  title = 'Pilih sumber foto',
  description = 'Ambil foto langsung dari kamera atau pilih dari galeri.',
}: PhotoSourceSheetProps) {
  const openAfterClose = (action: () => void) => {
    onClose();
    setTimeout(action, 250);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheetWrap} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.options}>
            <OptionRow
              icon="◉"
              title="Buka kamera"
              subtitle="Foto langsung dari perangkat"
              onPress={() => {
                openAfterClose(onCamera);
              }}
            />
            <OptionRow
              icon="▣"
              title="Pilih dari galeri"
              subtitle="Gunakan foto yang sudah ada"
              onPress={() => {
                openAfterClose(onGallery);
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function OptionRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
    >
      <View style={styles.optionIcon}>
        <Text style={styles.optionIconText}>{icon}</Text>
      </View>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.32)',
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#F8FAFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: '#CBD5E1',
    borderRadius: 999,
    height: 5,
    marginBottom: 14,
    width: 54,
  },
  title: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
  },
  description: {
    color: '#64748B',
    fontSize: 14.5,
    lineHeight: 20,
    marginTop: 8,
  },
  options: {
    gap: 14,
    marginTop: 26,
  },
  option: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  optionPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  optionIcon: {
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  optionIconText: {
    color: '#1D4ED8',
    fontSize: 18,
    fontWeight: '900',
  },
  optionText: {
    flex: 1,
    gap: 3,
  },
  optionTitle: {
    color: '#0F172A',
    fontSize: 16.5,
    fontWeight: '800',
  },
  optionSubtitle: {
    color: '#64748B',
    fontSize: 13.5,
    lineHeight: 18,
  },
});
