import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AppTextInput } from '../../components/AppTextInput';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { StatusBadge } from '../../components/StatusBadge';
import { AppConfirmModal } from '../../components/AppConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { deleteReport, getReport, markArrived, rateReport, startProgress } from '../../services/report-service';
import type { Report } from '../../types/models';
import { formatDate, formatStatus } from '../../utils/format';
import { openLocationInMaps } from '../../utils/maps';
import { normalizeMediaUrl } from '../../utils/media';
import { getApiErrorMessage } from '../../config/api';
import { AppNoticeModal } from '../../components/AppNoticeModal';
import { LocationPreviewCard } from '../../components/LocationPreviewCard';
import { ImageZoomModal } from '../../components/ImageZoomModal';
import { getCurrentLocationSnapshot } from '../../services/device-service';

export function ReportDetailScreen({ navigation, route }: any) {
  const initial: Report = route.params.report;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [ratingScore, setRatingScore] = useState(
    initial.requesterRatingScore?.toString() ?? initial.ratingScore?.toString() ?? '',
  );
  const [ratingComment, setRatingComment] = useState(initial.requesterRatingComment ?? initial.ratingComment ?? '');
  const [zoomUri, setZoomUri] = useState<string | null>(null);
  const [zoomTitle, setZoomTitle] = useState<string>('Lampiran');
  const [notice, setNotice] = useState<{ title: string; message: string; tone?: 'success' | 'info' | 'warning' } | null>(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const reportQuery = useQuery({
    queryKey: ['report', initial.reportId],
    queryFn: () => getReport(initial.reportId),
    initialData: initial,
  });

  const report = reportQuery.data;

  const action = useMutation({
    mutationFn: async (name: 'progress' | 'arrived' | 'rate' | 'delete') => {
        if (name === 'progress') return startProgress(report.reportId, {});
        if (name === 'arrived') {
          const snapshot = await getCurrentLocationSnapshot();
          return markArrived(report.reportId, { responderLocation: snapshot.label });
        }
        if (name === 'rate') {
          return rateReport(report.reportId, {
            ratingScore: Number(ratingScore),
            ratingComment,
            reviewerType: 'requester',
          });
        }
      await deleteReport(report.reportId);
      return null;
    },
    onSuccess: async (_, name) => {
      await queryClient.invalidateQueries({ queryKey: ['reports'] });
      await queryClient.invalidateQueries({ queryKey: ['report', report.reportId] });
      if (name === 'delete') {
        navigation.goBack();
        return;
      }
      setNotice({
        title: 'Berhasil',
        message: 'Status report berhasil diperbarui.',
        tone: 'success',
      });
    },
    onError: (error) =>
      setNotice({
        title: 'Gagal',
        message: getApiErrorMessage(error),
        tone: 'warning',
      }),
  });

  const isReporter = user?.userId === report.reporterUserId;
  const isTargetDepartmentStaff =
    user?.role === 'staff' && user?.departmentId != null && Number(user.departmentId) === Number(report.departmentId);
  const isAssignedStaff = user?.userId != null && report.assignedStaffId === user.userId;
  const canManage = user?.role === 'admin' || isTargetDepartmentStaff || isAssignedStaff;
  const isClose = report.status === 'close';
  const isProgress = report.status === 'progress';
  const isHelpRequest = report.sourceDepartmentId != null && report.sourceDepartmentId !== report.departmentId;
  const requesterRated = Boolean(report.requesterRatedAt ?? report.ratedAt);
  const ratingScoreValue = report.requesterRatingScore ?? report.ratingScore;
  const ratingCommentValue = report.requesterRatingComment ?? report.ratingComment;
  const canSeeRequesterReview = isClose && (isReporter || canManage);
  const openMaps = async () => {
    await openLocationInMaps({
      latitude: report.incidentLatitude,
      longitude: report.incidentLongitude,
      label: report.incidentLocationText,
    });
  };

  return (
    <Screen
      title={`Report #${report.reportId}`}
      subtitle={report.department}
      left={<HeaderBackButton onPress={() => navigation.goBack()} />}
    >
      <SectionCard>
        <View style={styles.heroRow}>
          <View style={styles.heroText}>
            <Text selectable style={styles.title}>
              {report.description}
            </Text>
            <Text selectable style={styles.subtitle}>
              Dibuat {formatDate(report.createdAt)}
            </Text>
            {isHelpRequest ? (
              <View style={styles.helpBanner}>
                <Text style={styles.helpBannerLabel}>Permintaan bantuan</Text>
                <Text selectable style={styles.helpBannerValue}>
                  Dari {report.sourceDepartment ?? 'departemen lain'} ke {report.department ?? 'departemen tujuan'}
                </Text>
              </View>
            ) : null}
          </View>
          <StatusBadge status={formatStatus(report.status)} />
        </View>

        <View style={styles.metaGrid}>
          <InfoPill label="Lokasi" value={report.incidentLocationText} tone="location" />
          <InfoPill
            label="Peminta bantuan"
            value={report.reporter?.fullName ?? (report.reporterUserId ? `User #${report.reporterUserId}` : 'Akun dihapus')}
            tone="reporter"
          />
          <InfoPill label="Penerima tugas" value={report.assignedStaff?.fullName ?? 'Belum diambil'} tone="staff" />
          <InfoPill label="Mulai" value={formatDate(report.progressStartedAt)} tone="time" />
          <InfoPill label="Tiba" value={formatDate(report.arrivedAt)} tone="time" />
          <InfoPill label="Selesai" value={formatDate(report.completedAt)} tone="time" />
        </View>

        {report.arrivedLocationText || report.completedLocationText ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>Lokasi staff</Text>
            {report.arrivedLocationText ? (
              <Text selectable style={styles.noteValue}>
                Tiba: {report.arrivedLocationText}
              </Text>
            ) : null}
            {report.completedLocationText ? (
              <Text selectable style={styles.noteValue}>
                Selesai: {report.completedLocationText}
              </Text>
            ) : null}
          </View>
        ) : null}

        <LocationPreviewCard
          title="Lokasi report"
          subtitle={report.department ?? 'Peta lokasi alert'}
          latitude={report.incidentLatitude}
          longitude={report.incidentLongitude}
          locationText={report.incidentLocationText}
          onOpenMaps={() => void openMaps()}
        />

        {report.completionDescription ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>Penyelesaian</Text>
            <Text style={styles.noteValue}>{report.completionDescription}</Text>
          </View>
        ) : null}

        {report.attachments?.length ? (
          <View style={styles.attachmentBox}>
            <Text style={styles.noteLabel}>Lampiran</Text>
            <View style={styles.attachmentRow}>
              {report.attachments.slice(0, 2).map((item) => (
                <Pressable
                  key={item.attachmentId}
                  style={styles.attachmentCard}
                  onPress={() => {
                    setZoomUri(normalizeMediaUrl(item.fileUrl) ?? item.fileUrl);
                    setZoomTitle(item.fileName || 'Lampiran');
                  }}
                >
                  <Image
                    source={{ uri: normalizeMediaUrl(item.fileUrl) ?? item.fileUrl }}
                    style={styles.attachmentImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.attachmentCaption} numberOfLines={1}>
                    {item.fileName}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </SectionCard>

      <SectionCard tone="soft">
        <Text style={styles.sectionTitle}>Status perjalanan alert</Text>
        <View style={styles.timeline}>
          <TimelineStep title="Open" active={report.status === 'open'} done={report.status !== 'open'} />
          <TimelineStep title="Progress" active={isProgress} done={report.status === 'progress' || isClose} />
          <TimelineStep title="Close" active={isClose} done={isClose} />
        </View>
      </SectionCard>

      {canManage ? (
        <SectionCard>
          <Text style={styles.sectionTitle}>Aksi cepat</Text>
          {report.status === 'open' ? (
            <PrimaryButton
              title={action.isPending ? 'Mengambil tugas...' : 'Ambil Tugas / Progress'}
              onPress={() => action.mutate('progress')}
              disabled={action.isPending}
            />
          ) : null}
          {report.status === 'progress' ? (
            <PrimaryButton
              title="Selesaikan Alert"
              onPress={() => navigation.navigate('CompletionProof', { report })}
            />
          ) : null}
          {user?.role === 'admin' ? (
            <PrimaryButton
              title="Hapus Report"
              style={styles.danger}
              onPress={() => setConfirmDeleteVisible(true)}
            />
          ) : null}
        </SectionCard>
      ) : null}

      {isReporter && isClose ? (
        requesterRated ? (
          <SectionCard>
            <View style={styles.reviewSummaryHeader}>
              <View style={styles.reviewSummaryTextWrap}>
                <Text style={styles.sectionTitle}>Review tersimpan</Text>
                <Text style={styles.reviewSummarySubtitle}>Rating layanan yang sudah Anda kirim.</Text>
              </View>
              <View style={styles.reviewSummaryBadge}>
                <Text style={styles.reviewSummaryBadgeText}>
                  {ratingScoreValue != null ? `${ratingScoreValue}/5` : 'Sudah dirating'}
                </Text>
              </View>
            </View>

            {ratingCommentValue ? (
              <View style={styles.reviewSummaryCommentBox}>
                <Text style={styles.reviewSummaryCommentLabel}>Komentar Anda</Text>
                <Text style={styles.reviewSummaryCommentText}>{ratingCommentValue}</Text>
              </View>
            ) : null}
          </SectionCard>
        ) : (
          <SectionCard>
            <Text style={styles.sectionTitle}>Rating layanan</Text>
            <AppTextInput
              label="Nilai 1-5"
              value={ratingScore}
              onChangeText={setRatingScore}
              keyboardType="number-pad"
              maxLength={1}
            />
            <AppTextInput
              label="Komentar"
              value={ratingComment}
              onChangeText={setRatingComment}
              multiline
              numberOfLines={4}
              style={styles.multiline}
            />
            <PrimaryButton
              title={action.isPending ? 'Mengirim...' : 'Kirim Rating'}
              onPress={() => {
                const score = Number(ratingScore);
                if (score < 1 || score > 5) {
                  setNotice({ title: 'Validasi', message: 'Rating harus 1 sampai 5.', tone: 'warning' });
                  return;
                }
                action.mutate('rate');
              }}
              disabled={action.isPending}
            />
          </SectionCard>
        )
      ) : canSeeRequesterReview ? (
        <SectionCard>
          <View style={styles.reviewSummaryHeader}>
            <View style={styles.reviewSummaryTextWrap}>
              <Text style={styles.sectionTitle}>Review dari peminta bantuan</Text>
              <Text style={styles.reviewSummarySubtitle}>Rating layanan yang dikirim setelah alert selesai.</Text>
            </View>
            <View style={styles.reviewSummaryBadge}>
              <Text style={styles.reviewSummaryBadgeText}>
                {requesterRated && ratingScoreValue != null ? `${ratingScoreValue}/5` : 'Menunggu'}
              </Text>
            </View>
          </View>

          {requesterRated && ratingCommentValue ? (
            <View style={styles.reviewSummaryCommentBox}>
              <Text style={styles.reviewSummaryCommentLabel}>Komentar</Text>
              <Text style={styles.reviewSummaryCommentText}>{ratingCommentValue}</Text>
            </View>
          ) : requesterRated ? null : (
            <View style={styles.reviewSummaryCommentBox}>
              <Text style={styles.reviewSummaryCommentText}>Review belum dikirim oleh peminta bantuan.</Text>
            </View>
          )}
        </SectionCard>
      ) : null}

      <ImageZoomModal
        visible={Boolean(zoomUri)}
        uri={zoomUri}
        title={zoomTitle}
        onClose={() => setZoomUri(null)}
      />

      <AppNoticeModal
        visible={Boolean(notice)}
        title={notice?.title ?? ''}
        message={notice?.message ?? ''}
        onAction={() => setNotice(null)}
        tone={notice?.tone ?? 'success'}
      />
      <AppConfirmModal
        visible={confirmDeleteVisible}
        title="Hapus report?"
        message="Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        cancelLabel="Batal"
        tone="danger"
        onCancel={() => setConfirmDeleteVisible(false)}
        onConfirm={() => {
          setConfirmDeleteVisible(false);
          action.mutate('delete');
        }}
      />
    </Screen>
  );
}

function InfoPill({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'location' | 'reporter' | 'staff' | 'time';
}) {
  return (
    <View style={[styles.infoPill, styles[`infoPill_${tone}`]]}>
      <View style={[styles.infoAccent, styles[`infoAccent_${tone}`]]} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function TimelineStep({
  title,
  active,
  done,
}: {
  title: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <View style={styles.timelineStep}>
      <View style={[styles.timelineDot, done && styles.timelineDotDone, active && styles.timelineDotActive]} />
      <Text style={[styles.timelineLabel, active && styles.timelineLabelActive]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: '#0F2C57',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 13,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoPill: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6F5',
    borderRadius: 22,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    gap: 5,
    overflow: 'hidden',
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 1,
  },
  infoAccent: {
    borderRadius: 999,
    height: 4,
    width: 42,
  },
  infoPill_default: {
    backgroundColor: '#FFFFFF',
  },
  infoPill_location: {
    backgroundColor: '#F8FBFF',
  },
  infoPill_reporter: {
    backgroundColor: '#FBFCFE',
  },
  infoPill_staff: {
    backgroundColor: '#FCFFFC',
  },
  infoPill_time: {
    backgroundColor: '#F8FAFC',
  },
  infoAccent_default: {
    backgroundColor: '#CBD5E1',
  },
  infoAccent_location: {
    backgroundColor: '#1D4ED8',
  },
  infoAccent_reporter: {
    backgroundColor: '#7C3AED',
  },
  infoAccent_staff: {
    backgroundColor: '#15803D',
  },
  infoAccent_time: {
    backgroundColor: '#DA1E37',
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#0F172A',
    fontSize: 13.5,
    fontWeight: '800',
    lineHeight: 20,
  },
  noteBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#DCE6F5',
    borderRadius: 22,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  attachmentBox: {
    gap: 10,
  },
  attachmentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  attachmentCard: {
    flex: 1,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6F5',
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
  },
  attachmentImage: {
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    height: 128,
    width: '100%',
  },
  attachmentCaption: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  noteLabel: {
    color: '#0F2C57',
    fontSize: 13,
    fontWeight: '800',
  },
  noteValue: {
    color: '#334155',
    lineHeight: 20,
  },
  sectionTitle: {
    color: '#0F2C57',
    fontSize: 16,
    fontWeight: '900',
  },
  reviewSummaryHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  reviewSummaryTextWrap: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  reviewSummarySubtitle: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
  },
  reviewSummaryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reviewSummaryBadgeText: {
    color: '#15803D',
    fontSize: 12.5,
    fontWeight: '900',
  },
  reviewSummaryCommentBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#DCE6F5',
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  reviewSummaryCommentLabel: {
    color: '#0F2C57',
    fontSize: 13,
    fontWeight: '800',
  },
  reviewSummaryCommentText: {
    color: '#334155',
    lineHeight: 20,
  },
  helpBanner: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    marginTop: 10,
    padding: 12,
  },
  helpBannerLabel: {
    color: '#B45309',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  helpBannerValue: {
    color: '#9A3412',
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 19,
  },
  timeline: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6F5',
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    paddingVertical: 14,
  },
  timelineDot: {
    backgroundColor: '#CBD5E1',
    borderRadius: 999,
    height: 12,
    width: 12,
  },
  timelineDotActive: {
    backgroundColor: '#DA1E37',
  },
  timelineDotDone: {
    backgroundColor: '#16A34A',
  },
  timelineLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  timelineLabelActive: {
    color: '#0F2C57',
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  danger: {
    backgroundColor: '#0F172A',
  },
});
