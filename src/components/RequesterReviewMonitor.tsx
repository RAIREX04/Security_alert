import { useEffect, useMemo, useState } from 'react';

import { AppNoticeModal } from './AppNoticeModal';
import { AppReviewModal } from './AppReviewModal';
import { useAuth } from '../context/AuthContext';
import { listReports, rateReport } from '../services/report-service';
import type { Report } from '../types/models';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function RequesterReviewMonitor() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeReview, setActiveReview] = useState<Report | null>(null);
  const [dismissedReviewKeys, setDismissedReviewKeys] = useState<string[]>([]);
  const [notice, setNotice] = useState<{ title: string; message: string; tone?: 'success' | 'info' | 'warning' } | null>(null);

  const { data: reports } = useQuery({
    queryKey: ['reports', 'requester-review-monitor', user?.userId],
    queryFn: () => listReports(),
    enabled: Boolean(user?.userId),
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  const pendingReviews = useMemo(() => {
    return (reports ?? [])
      .filter((report) => report.reporterUserId === user?.userId && report.status === 'close' && !(report.requesterRatedAt ?? report.ratedAt))
      .sort((a, b) => new Date(b.completedAt ?? b.createdAt ?? 0).getTime() - new Date(a.completedAt ?? a.createdAt ?? 0).getTime());
  }, [reports, user?.userId]);

  useEffect(() => {
    if (activeReview) return;
    const nextReview = pendingReviews.find((item) => !dismissedReviewKeys.includes(`requester:${item.reportId}`));
    if (nextReview) {
      setActiveReview(nextReview);
    }
  }, [activeReview, dismissedReviewKeys, pendingReviews]);

  const submitReview = useMutation({
    mutationFn: async (payload: { report: Report; score: number; comment: string }) => {
      return rateReport(payload.report.reportId, {
        ratingScore: payload.score,
        ratingComment: payload.comment || null,
        reviewerType: 'requester',
      });
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['reports'] });
      setDismissedReviewKeys((current) => [...current, `requester:${variables.report.reportId}`]);
      setActiveReview(null);
      setNotice({
        title: 'Review tersimpan',
        message: 'Terima kasih, penilaian Anda sudah dikirim.',
        tone: 'success',
      });
    },
    onError: (error) => {
      setNotice({
        title: 'Review gagal',
        message: error instanceof Error ? error.message : 'Gagal mengirim review.',
        tone: 'warning',
      });
    },
  });

  if (!user) {
    return null;
  }

  return (
    <>
      <AppReviewModal
        visible={Boolean(activeReview)}
        title="Beri review layanan"
        message={
          activeReview
            ? `${activeReview.description}\nLaporan Anda sudah selesai ditangani. Silakan beri penilaian.`
            : 'Beri penilaian untuk laporan yang sudah selesai.'
        }
        submitLabel={submitReview.isPending ? 'Mengirim...' : 'Kirim Review'}
        onClose={() => {
          if (activeReview) {
            setDismissedReviewKeys((current) => [...current, `requester:${activeReview.reportId}`]);
          }
          setActiveReview(null);
        }}
        onSubmit={({ score, comment }) => {
          if (!activeReview || submitReview.isPending) return;
          submitReview.mutate({ report: activeReview, score, comment });
        }}
      />

      <AppNoticeModal
        visible={Boolean(notice)}
        title={notice?.title ?? ''}
        message={notice?.message ?? ''}
        onAction={() => setNotice(null)}
        tone={notice?.tone ?? 'success'}
      />
    </>
  );
}
