import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Report } from '../types/models';
import { formatDate, formatStatus } from '../utils/format';
import { StatusBadge } from './StatusBadge';
import { ecrTheme } from '../theme/ecrTheme';

type ReportCardProps = {
  report: Report;
  onPress?: () => void;
};

export function ReportCard({ report, onPress }: ReportCardProps) {
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
        { backgroundColor: tone.background, borderColor: tone.border },
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: tone.iconBackground }]}>
          <Text style={[styles.iconText, { color: tone.iconColor }]}>{tone.icon}</Text>
        </View>
        <View style={styles.headerText}>
          <Text selectable style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text selectable style={styles.meta} numberOfLines={2}>
            {formatDate(report.createdAt)}
          </Text>
        </View>
        <StatusBadge status={statusText} />
      </View>

      <Text selectable style={styles.description} numberOfLines={2}>
        {report.description}
      </Text>

      <View style={styles.locationRow}>
        <Text style={styles.locationIcon}>⌖</Text>
        <Text selectable style={styles.location} numberOfLines={2}>
          {report.incidentLocationText}
        </Text>
      </View>

      {report.status === 'close' && hasRequesterReview ? (
        <View style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View>
              <Text selectable style={styles.reviewTitle}>
                Review
              </Text>
              <Text selectable style={styles.reviewSubtitle}>
                Ringkasan penilaian dari peminta bantuan
              </Text>
            </View>
            <View style={styles.reviewCountPill}>
              <Text selectable style={styles.reviewCountText}>
                1 catatan
              </Text>
            </View>
          </View>
          <View style={styles.reviewItem}>
            <View style={styles.reviewItemHeader}>
              <View style={styles.reviewItemLabelWrap}>
                <View style={styles.reviewDot} />
                <Text selectable style={styles.reviewItemLabel}>
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
        <Text selectable style={styles.detailHint}>
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
      iconBackground: '#FFE8E8',
      iconColor: ecrTheme.status.open.text,
    };
  }
  if (value === 'progress') {
    return {
      background: ecrTheme.colors.card,
      border: ecrTheme.colors.border,
      icon: 'P',
      iconBackground: '#FFF1DE',
      iconColor: ecrTheme.status.progress.text,
    };
  }
  return {
    background: ecrTheme.colors.card,
    border: ecrTheme.colors.border,
    icon: 'C',
    iconBackground: '#DFF7E8',
    iconColor: ecrTheme.status.close.text,
  };
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 11,
    padding: 16,
    shadowColor: ecrTheme.colors.deepNavy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
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
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  iconText: {
    fontSize: 21,
    fontWeight: '900',
  },
  headerText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  title: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 15.5,
    fontWeight: '900',
    lineHeight: 22,
  },
  meta: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 17,
  },
  description: {
    color: ecrTheme.colors.textPrimary,
    fontSize: 13.8,
    lineHeight: 20,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  locationIcon: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '800',
  },
  location: {
    color: '#475569',
    fontSize: 13,
    flex: 1,
  },
  reviewCard: {
    backgroundColor: '#F8FBFF',
    borderColor: '#D9E5F5',
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    padding: 14,
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
  reviewSubtitle: {
    color: ecrTheme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
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
});
