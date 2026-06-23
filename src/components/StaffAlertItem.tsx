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

      <StatusBadge status={report.status} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    backgroundColor: ecrTheme.colors.card,
    borderColor: ecrTheme.colors.border,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 84,
    padding: 14,
    shadowColor: ecrTheme.colors.deepNavy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
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
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  icon: {
    fontSize: 24,
    fontWeight: '900',
  },
  body: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF1F3',
    borderColor: '#F2B8BF',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: ecrTheme.colors.primaryRed,
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  badgeSubtext: {
    color: ecrTheme.colors.primaryRed,
    flexShrink: 1,
    fontSize: 10.5,
    fontWeight: '700',
  },
  title: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 15.5,
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
    backgroundColor: '#F7FBFF',
    borderColor: '#D9E5F5',
    borderRadius: 16,
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
    color: '#102B57',
    flex: 1,
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  reviewScorePill: {
    backgroundColor: '#EAF2FF',
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
    color: '#475569',
    fontSize: 12,
    lineHeight: 17,
  },
});
