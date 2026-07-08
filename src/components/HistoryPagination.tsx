import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ecrTheme } from '../theme/ecrTheme';

type HistoryPaginationProps = {
  page: number;
  pageCount: number;
  totalItems: number;
  pageSize: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
};

export function HistoryPagination({
  page,
  pageCount,
  totalItems,
  pageSize,
  itemLabel = 'riwayat',
  onPageChange,
}: HistoryPaginationProps) {
  if (totalItems <= pageSize) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const canGoBack = page > 1;
  const canGoNext = page < pageCount;

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Halaman sebelumnya"
        accessibilityState={{ disabled: !canGoBack }}
        disabled={!canGoBack}
        onPress={() => onPageChange(page - 1)}
        style={({ pressed }) => [
          styles.navButton,
          !canGoBack && styles.navButtonDisabled,
          pressed && canGoBack && styles.pressed,
        ]}
      >
        <MaterialCommunityIcons
          name="chevron-left"
          size={22}
          color={canGoBack ? ecrTheme.colors.textPrimary : ecrTheme.colors.textMuted}
        />
      </Pressable>

      <View style={styles.pageInfo}>
        <Text selectable style={styles.pageText}>
          Halaman {page} / {pageCount}
        </Text>
        <Text selectable style={styles.rangeText}>
          {start}-{end} dari {totalItems} {itemLabel}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Halaman berikutnya"
        accessibilityState={{ disabled: !canGoNext }}
        disabled={!canGoNext}
        onPress={() => onPageChange(page + 1)}
        style={({ pressed }) => [
          styles.navButton,
          !canGoNext && styles.navButtonDisabled,
          pressed && canGoNext && styles.pressed,
        ]}
      >
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={canGoNext ? ecrTheme.colors.textPrimary : ecrTheme.colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: ecrTheme.colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    padding: 10,
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: ecrTheme.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  navButtonDisabled: {
    opacity: 0.45,
  },
  pageInfo: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  pageText: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  rangeText: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 11.5,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
