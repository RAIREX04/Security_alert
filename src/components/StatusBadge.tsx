import { StyleSheet, Text, View } from 'react-native';
import type { ReportStatus, ApprovalStatus } from '../types/models';
import { ecrTheme } from '../theme/ecrTheme';

type StatusBadgeProps = {
  status: ReportStatus | ApprovalStatus | string;
  compact?: boolean;
};

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  const tone = getTone(status);
  return (
    <View style={[styles.badge, compact && styles.badgeCompact, tone.container]}>
      <View style={[styles.dot, compact && styles.dotCompact, tone.dot]} />
      <Text selectable style={[styles.label, compact && styles.labelCompact, tone.label]}>
        {tone.labelText}
      </Text>
    </View>
  );
}

function getTone(status: string) {
  const value = status.toLowerCase();
  if (value === 'open') {
    return {
      container: { backgroundColor: ecrTheme.status.open.bg, borderColor: ecrTheme.status.open.border },
      label: { color: ecrTheme.status.open.text },
      dot: { backgroundColor: ecrTheme.status.open.text },
      labelText: 'Open',
    };
  }
  if (value === 'close' || value === 'approved') {
    return {
      container: { backgroundColor: ecrTheme.status.close.bg, borderColor: ecrTheme.status.close.border },
      label: { color: ecrTheme.status.close.text },
      dot: { backgroundColor: ecrTheme.status.close.text },
      labelText: value === 'approved' ? 'Disetujui' : 'Close',
    };
  }
  if (value === 'progress' || value === 'pending') {
    return {
      container: { backgroundColor: value === 'pending' ? ecrTheme.status.pending.bg : ecrTheme.status.progress.bg, borderColor: value === 'pending' ? ecrTheme.status.pending.border : ecrTheme.status.progress.border },
      label: { color: value === 'pending' ? ecrTheme.status.pending.text : ecrTheme.status.progress.text },
      dot: { backgroundColor: value === 'pending' ? ecrTheme.status.pending.text : ecrTheme.status.progress.text },
      labelText: value === 'pending' ? 'Pending' : 'Progress',
    };
  }
  if (value === 'rejected') {
    return {
      container: { backgroundColor: ecrTheme.status.open.bg, borderColor: ecrTheme.status.open.border },
      label: { color: ecrTheme.status.open.text },
      dot: { backgroundColor: ecrTheme.status.open.text },
      labelText: 'Ditolak',
    };
  }
  return {
    container: { backgroundColor: '#F1F5F9', borderColor: ecrTheme.colors.borderStrong },
    label: { color: ecrTheme.colors.textSecondary },
    dot: { backgroundColor: ecrTheme.colors.textSecondary },
    labelText: status,
  };
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    flexShrink: 0,
    minWidth: 76,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeCompact: {
    gap: 6,
    minWidth: 68,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  dot: {
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  dotCompact: {
    height: 6,
    width: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  labelCompact: {
    fontSize: 11,
  },
});
