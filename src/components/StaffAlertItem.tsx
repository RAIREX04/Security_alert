import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { Report } from '../types/models';
import { formatDate } from '../utils/format';
import { getDepartmentGlyph, getDepartmentById, getStaffDepartmentTheme } from '../utils/staff';
import { StatusBadge } from './StatusBadge';
import { ecrTheme } from '../theme/ecrTheme';

type StaffAlertItemProps = {
  report: Report;
  onPress?: () => void;
};

export function StaffAlertItem({ report, onPress }: StaffAlertItemProps) {
  const { width } = useWindowDimensions();
  const department = getDepartmentById(report.departmentId);
  const theme = getStaffDepartmentTheme(department);
  const isHelpRequest = report.sourceDepartmentId != null && report.sourceDepartmentId !== report.departmentId;
  const isCompact = width < 380;
  const requesterReviewScore = report.requesterRatingScore ?? report.ratingScore;
  const requesterReviewComment = report.requesterRatingComment ?? report.ratingComment;
  const hasRequesterReview = Boolean(requesterReviewScore != null || requesterReviewComment);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${report.description}, status ${report.status}${isHelpRequest ? ', minta bantuan' : ''}`}
      accessibilityState={{ disabled: !onPress }}
      style={({ pressed }) => [
        styles.card,
        isCompact && styles.cardCompact,
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.soft }]} >
        <Text style={[styles.icon, { color: theme.color }]}>{getDepartmentGlyph(department.departmentCode)}</Text>
      </View>

      <View style={styles.body}>
        {isHelpRequest ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Minta Bantuan</Text>
            <Text style={styles.badgeSubtext} numberOfLines={1}>
              dari {report.sourceDepartment ?? 'departemen lain'}
            </Text>
          </View>
        ) : null}
        <Text selectable style={styles.title} numberOfLines={2}>
          {report.description}
        </Text>
        <Text selectable style={styles.meta} numberOfLines={2}>
          {report.reporter?.fullName ?? 'Anonim'} | {formatDate(report.createdAt)}
        </Text>
        {report.status === 'close' && hasRequesterReview ? (
          <View style={styles.reviewBox}>
            <View style={styles.reviewHeader}>
              <Text selectable style={styles.reviewLabel}>
                Review peminta bantuan
              </Text>
              <View style={styles.reviewScorePill}>
                <Text selectable style={styles.reviewScoreText}>
                  {requesterReviewScore != null ? `${requesterReviewScore}/5` : 'Review'}
                </Text>
              </View>
            </View>
            {requesterReviewComment ? (
              <Text selectable style={styles.reviewComment} numberOfLines={2}>
                {requesterReviewComment}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <StatusBadge status={report.status} compact />
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
    minHeight: 78,
    padding: 12,
    ...ecrTheme.shadows.soft,
  },
  cardCompact: {
    gap: 12,
    padding: 13,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: ecrTheme.radii.md,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  icon: {
    fontSize: 20,
    fontWeight: '900',
  },
  body: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: ecrTheme.status.open.bg,
    borderColor: ecrTheme.status.open.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: ecrTheme.status.open.text,
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  badgeSubtext: {
    color: ecrTheme.status.open.text,
    flexShrink: 1,
    fontSize: 10.5,
    fontWeight: '700',
  },
  title: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 14.5,
    fontWeight: '800',
    lineHeight: 21,
  },
  meta: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 17,
  },
  reviewBox: {
    backgroundColor: ecrTheme.colors.surface,
    borderColor: ecrTheme.colors.border,
    borderRadius: ecrTheme.radii.md,
    borderWidth: 1,
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  reviewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  reviewLabel: {
    color: ecrTheme.colors.textPrimary,
    flex: 1,
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  reviewScorePill: {
    backgroundColor: ecrTheme.colors.infoSoft,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  reviewScoreText: {
    color: ecrTheme.colors.pertaminaBlue,
    fontSize: 11.5,
    fontWeight: '800',
  },
  reviewComment: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
});
