import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Report } from '../types/models';
import { formatDate, formatStatus } from '../utils/format';
import { StatusBadge } from './StatusBadge';
import { ecrTheme } from '../theme/ecrTheme';

type ReportCardProps = {
  report: Report;
  onPress?: () => void;
  compact?: boolean;
};

export function ReportCard({ report, onPress, compact = false }: ReportCardProps) {
  const title = report.department ?? `Departemen #${report.departmentId}`;
  const statusText = formatStatus(report.status);
  const tone = getTone(report.status);
  const requesterName = report.reporter?.fullName ?? 'Peminta bantuan';
  const requesterReview = {
    score: report.requesterRatingScore ?? report.ratingScore,
    comment: report.requesterRatingComment ?? report.ratingComment,
    pending: report.requesterReviewPending,
  };
  const hasRequesterReview = requesterReview.score != null || requesterReview.comment || requesterReview.pending;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${title}, status ${statusText}`}
      accessibilityHint={onPress ? 'Buka detail laporan' : undefined}
      accessibilityState={{ disabled: !onPress }}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        { backgroundColor: tone.background, borderColor: tone.border },
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, compact && styles.iconWrapCompact, { backgroundColor: tone.iconBackground }]}>
          <Text style={[styles.iconText, compact && styles.iconTextCompact, { color: tone.iconColor }]}>{tone.icon}</Text>
        </View>
        <View style={styles.headerText}>
          <Text selectable style={[styles.title, compact && styles.titleCompact]} numberOfLines={compact ? 1 : 2}>
            {title}
          </Text>
          <Text selectable style={[styles.meta, compact && styles.metaCompact]} numberOfLines={compact ? 1 : 2}>
            {formatDate(report.createdAt)}
          </Text>
        </View>
        <StatusBadge status={statusText} compact={compact} />
      </View>

      <Text selectable style={[styles.description, compact && styles.descriptionCompact]} numberOfLines={compact ? 1 : 2}>
        {report.description}
      </Text>

      <View style={styles.locationRow}>
        <MaterialCommunityIcons
          name="map-marker-outline"
          size={compact ? 15 : 16}
          color={ecrTheme.colors.textSecondary}
        />
        <Text selectable style={[styles.location, compact && styles.locationCompact]} numberOfLines={compact ? 1 : 2}>
          {report.incidentLocationText}
        </Text>
      </View>

      {report.status === 'close' && hasRequesterReview ? (
        <View style={[styles.reviewCard, compact && styles.reviewCardCompact]}>
          <View style={styles.reviewHeader}>
            <View>
              <Text selectable style={[styles.reviewTitle, compact && styles.reviewTitleCompact]}>
                Review
              </Text>
              <Text selectable style={[styles.reviewSubtitle, compact && styles.reviewSubtitleCompact]} numberOfLines={compact ? 1 : 2}>
                Ringkasan penilaian dari peminta bantuan
              </Text>
            </View>
            <View style={styles.reviewCountPill}>
              <Text selectable style={styles.reviewCountText}>
                1 catatan
              </Text>
            </View>
          </View>
          <View style={[styles.reviewItem, compact && styles.reviewItemCompact]}>
            <View style={styles.reviewItemHeader}>
              <View style={styles.reviewItemLabelWrap}>
                <View style={styles.reviewDot} />
                <Text selectable style={styles.reviewItemLabel} numberOfLines={1}>
                  {requesterName}
                </Text>
              </View>
              <View style={[styles.reviewScorePill, requesterReview.pending ? styles.reviewScorePillMuted : null]}>
                <Text selectable style={[styles.reviewItemScore, requesterReview.pending ? styles.reviewItemScoreMuted : null]}>
                  {requesterReview.pending ? 'Menunggu' : requesterReview.score != null ? `${requesterReview.score}/5` : 'Belum diisi'}
                </Text>
              </View>
            </View>
            {requesterReview.comment ? (
              <Text selectable style={styles.reviewItemComment} numberOfLines={2}>
                {requesterReview.comment}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      {onPress ? (
        <Text selectable style={[styles.detailHint, compact && styles.detailHintCompact]}>
          Tap untuk lihat detail
        </Text>
      ) : null}
    </Pressable>
  );
}

function getTone(status: string) {
  const value = status.toLowerCase();
  if (value === 'open') {
    return {
      background: ecrTheme.colors.card,
      border: ecrTheme.colors.border,
      icon: 'O',
      iconBackground: '#FFE4E6',
      iconColor: ecrTheme.status.open.text,
    };
  }
  if (value === 'progress') {
    return {
      background: ecrTheme.colors.card,
      border: ecrTheme.colors.border,
      icon: 'P',
      iconBackground: '#DBEAFE',
      iconColor: ecrTheme.status.progress.text,
    };
  }
  return {
    background: ecrTheme.colors.card,
    border: ecrTheme.colors.border,
    icon: 'C',
    iconBackground: '#D1FAE5',
    iconColor: ecrTheme.status.close.text,
  };
}

const styles = StyleSheet.create({
  card: {
    borderRadius: ecrTheme.radii.lg,
    borderWidth: 1,
    gap: 10,
    padding: 14,
    ...ecrTheme.shadows.soft,
  },
  cardCompact: {
    borderRadius: ecrTheme.radii.md,
    gap: 8,
    padding: 12,
  },
  pressed: {
    opacity: 0.96,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: ecrTheme.radii.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  iconWrapCompact: {
    borderRadius: ecrTheme.radii.sm,
    height: 42,
    width: 42,
  },
  iconText: {
    fontSize: 19,
    fontWeight: '900',
  },
  iconTextCompact: {
    fontSize: 17,
  },
  headerText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  title: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 14.5,
    fontWeight: '900',
    lineHeight: 22,
  },
  titleCompact: {
    fontSize: 14,
    lineHeight: 18,
  },
  meta: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 17,
  },
  metaCompact: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  description: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 13,
    lineHeight: 20,
  },
  descriptionCompact: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  location: {
    color: '#475569',
    fontSize: 13,
    flex: 1,
  },
  locationCompact: {
    fontSize: 12,
  },
  reviewCard: {
    backgroundColor: ecrTheme.colors.surface,
    borderColor: ecrTheme.colors.border,
    borderRadius: ecrTheme.radii.md,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  reviewCardCompact: {
    borderRadius: 16,
    gap: 8,
    padding: 10,
  },
  reviewHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  reviewTitle: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  reviewTitleCompact: {
    fontSize: 11.5,
  },
  reviewSubtitle: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  reviewSubtitleCompact: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  reviewCountPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF2FF',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  reviewCountText: {
    color: ecrTheme.colors.pertaminaBlue,
    fontSize: 12,
    fontWeight: '800',
  },
  reviewItem: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  reviewItemCompact: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  reviewItemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  reviewItemLabelWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  reviewDot: {
    backgroundColor: ecrTheme.colors.pertaminaBlue,
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  reviewScorePill: {
    alignItems: 'center',
    backgroundColor: '#E8F1FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  reviewScorePillMuted: {
    backgroundColor: '#FFF3CD',
  },
  reviewItemLabel: {
    color: ecrTheme.colors.textPrimary,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  reviewItemScore: {
    color: ecrTheme.colors.pertaminaBlue,
    fontSize: 12,
    fontWeight: '800',
  },
  reviewItemScoreMuted: {
    color: '#B45309',
  },
  reviewItemComment: {
    color: '#475569',
    fontSize: 12.5,
    lineHeight: 17.5,
  },
  detailHint: {
    color: ecrTheme.colors.primaryRed,
    fontSize: 14,
    fontWeight: '800',
  },
  detailHintCompact: {
    fontSize: 12.5,
  },
});
