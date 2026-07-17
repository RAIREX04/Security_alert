import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { MetricCard } from '../../components/MetricCard';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { StatusBadge } from '../../components/StatusBadge';
import { listDepartments } from '../../services/department-service';
import { listReports } from '../../services/report-service';
import type { Report } from '../../types/models';
import { formatDate, formatStatus } from '../../utils/format';

type Props = {
  navigation: {
    canGoBack?: () => boolean;
    goBack: () => void;
    navigate: (name: string, params?: unknown) => void;
  };
};

const MODES = ['timeline', 'tv', 'guide'] as const;
type Mode = (typeof MODES)[number];

export function OperationsScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<Mode>('timeline');
  const reportsQuery = useQuery({
    queryKey: ['reports', 'operations'],
    queryFn: () => listReports(),
    refetchInterval: mode === 'tv' ? 15000 : false,
  });
  const departmentsQuery = useQuery({
    queryKey: ['departments', 'operations'],
    queryFn: listDepartments,
  });

  const reports = reportsQuery.data ?? [];
  const activeReports = reports.filter((report) => report.status !== 'close');
  const departments = departmentsQuery.data ?? [];
  const compact = width < 390;

  const groupedTimeline = useMemo(() => groupReportsByDate(reports), [reports]);
  const busiestDepartment = useMemo(() => {
    return departments
      .map((department) => ({
        name: department.departmentName,
        count: reports.filter((report) => report.departmentId === department.departmentId).length,
      }))
      .sort((a, b) => b.count - a.count)[0];
  }, [departments, reports]);

  const refreshAll = async () => {
    await Promise.all([reportsQuery.refetch(), departmentsQuery.refetch()]);
  };

  return (
    <Screen
      title="Operasional ECR"
      subtitle="Timeline alert, monitor TV, dan panduan screenshot untuk manual aplikasi."
      left={navigation.canGoBack?.() ? <HeaderBackButton onPress={() => navigation.goBack()} /> : undefined}
      refreshing={reportsQuery.isFetching || departmentsQuery.isFetching}
      onRefresh={() => void refreshAll()}
    >
      <SectionCard tone="soft">
        <Text selectable style={styles.kicker}>CONTROL ROOM</Text>
        <Text selectable style={[styles.heroTitle, compact && styles.heroTitleCompact]}>
          Mode operasional berbasis pola GasBerth Scheduler
        </Text>
        <Text selectable style={styles.heroSubtitle}>
          Gunakan halaman ini untuk screenshot kalender/timeline, tampilan TV, dan daftar gambar panduan resmi ECR.
        </Text>
        <View style={styles.metrics}>
          <MetricCard label="Alert Aktif" value={activeReports.length} accent="#DC2626" />
          <MetricCard label="Total Report" value={reports.length} accent="#005BAC" />
          <MetricCard label="Dept. Terpadat" value={busiestDepartment?.count ?? 0} accent="#F97316" />
        </View>
      </SectionCard>

      <View style={styles.modeRow}>
        {MODES.map((item) => (
          <Pressable
            key={item}
            onPress={() => setMode(item)}
            accessibilityRole="button"
            style={[styles.modeButton, mode === item && styles.modeButtonActive]}
          >
            <MaterialCommunityIcons name={getModeIcon(item) as any} size={18} color={mode === item ? '#FFFFFF' : '#475569'} />
            <Text style={[styles.modeText, mode === item && styles.modeTextActive]}>{getModeLabel(item)}</Text>
          </Pressable>
        ))}
      </View>

      {mode === 'timeline' ? (
        <TimelineView groupedTimeline={groupedTimeline} onOpenReport={(report) => navigation.navigate('ReportDetail', { report })} />
      ) : null}

      {mode === 'tv' ? (
        <MonitoringTvView reports={activeReports} />
      ) : null}

      {mode === 'guide' ? <ScreenshotGuideView /> : null}
    </Screen>
  );
}

function TimelineView({
  groupedTimeline,
  onOpenReport,
}: {
  groupedTimeline: Array<{ label: string; reports: Report[] }>;
  onOpenReport: (report: Report) => void;
}) {
  if (groupedTimeline.length === 0) {
    return <EmptyState title="Belum ada timeline" description="Alert akan tampil berdasarkan tanggal saat data tersedia." />;
  }

  return (
    <View style={styles.timelineList}>
      {groupedTimeline.map((group) => (
        <SectionCard key={group.label}>
          <View style={styles.sectionHeader}>
            <View>
              <Text selectable style={styles.sectionTitle}>{group.label}</Text>
              <Text selectable style={styles.sectionSubtitle}>{group.reports.length} alert tercatat</Text>
            </View>
          </View>

          <View style={styles.timelineStack}>
            {group.reports.map((report) => (
              <Pressable
                key={report.reportId}
                onPress={() => onOpenReport(report)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.timelineItem, pressed && styles.pressed]}
              >
                <View style={styles.timelineRail}>
                  <View style={[styles.timelineDot, report.status === 'close' && styles.timelineDotClose]} />
                  <View style={styles.timelineLine} />
                </View>
                <View style={styles.timelineBody}>
                  <View style={styles.reportTopline}>
                    <Text selectable style={styles.reportId}>Report #{report.reportId}</Text>
                    <StatusBadge status={formatStatus(report.status)} />
                  </View>
                  <Text selectable style={styles.reportTitle} numberOfLines={2}>{report.description}</Text>
                  <Text selectable style={styles.reportMeta} numberOfLines={2}>
                    {formatDate(report.createdAt)} | {report.department ?? 'Departemen'} | {report.incidentLocationText}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </SectionCard>
      ))}
    </View>
  );
}

function MonitoringTvView({ reports }: { reports: Report[] }) {
  return (
    <SectionCard>
      <View style={styles.tvHeader}>
        <View>
          <Text selectable style={styles.tvKicker}>LIVE MONITOR</Text>
          <Text selectable style={styles.tvTitle}>Monitoring TV ECR</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>AUTO REFRESH</Text>
        </View>
      </View>

      {reports.length === 0 ? (
        <EmptyState title="Tidak ada alert aktif" description="Ruang kontrol akan menampilkan alert Open dan Progress di sini." />
      ) : (
        <View style={styles.tvList}>
          {reports.slice(0, 8).map((report) => (
            <View key={report.reportId} style={styles.tvRow}>
              <View style={styles.tvNumber}>
                <Text selectable style={styles.tvNumberText}>#{report.reportId}</Text>
              </View>
              <View style={styles.tvBody}>
                <Text selectable style={styles.tvReportTitle} numberOfLines={2}>{report.description}</Text>
                <Text selectable style={styles.tvReportMeta} numberOfLines={2}>
                  {report.department ?? 'Departemen'} | {report.incidentLocationText}
                </Text>
                <Text selectable style={styles.tvReportTime}>{formatDate(report.createdAt)}</Text>
              </View>
              <View style={styles.tvStatus}>
                <Text style={styles.tvStatusText}>{formatStatus(report.status)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </SectionCard>
  );
}

function ScreenshotGuideView() {
  return (
    <View style={styles.guideList}>
      {SCREENSHOT_GUIDE.map((item) => (
        <SectionCard key={item.id}>
          <View style={styles.guideHeader}>
            <View style={styles.guideNumber}>
              <Text style={styles.guideNumberText}>{item.id}</Text>
            </View>
            <View style={styles.guideBody}>
              <Text selectable style={styles.guideTitle}>{item.title}</Text>
              <Text selectable style={styles.placeholder}>[GAMBAR {item.id} - letakkan screenshot: {item.title}]</Text>
              <Text selectable style={styles.guideNote}>{item.note}</Text>
              <Text selectable style={styles.caption}>Caption: Gambar {item.id}. {item.caption}</Text>
            </View>
          </View>
        </SectionCard>
      ))}
    </View>
  );
}

function groupReportsByDate(reports: Report[]) {
  const formatter = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const map = new Map<string, Report[]>();
  reports.forEach((report) => {
    const date = report.createdAt ? new Date(report.createdAt) : new Date();
    const label = Number.isNaN(date.getTime()) ? 'Tanggal tidak tersedia' : formatter.format(date);
    map.set(label, [...(map.get(label) ?? []), report]);
  });
  return Array.from(map.entries()).map(([label, groupedReports]) => ({ label, reports: groupedReports }));
}

function getModeLabel(mode: Mode) {
  if (mode === 'timeline') return 'Timeline';
  if (mode === 'tv') return 'TV';
  return 'Panduan SS';
}

function getModeIcon(mode: Mode) {
  if (mode === 'timeline') return 'calendar-clock';
  if (mode === 'tv') return 'monitor-dashboard';
  return 'file-document-outline';
}

const SCREENSHOT_GUIDE = [
  { id: 1, title: 'Halaman Login', note: 'Ambil saat field username dan PIN/password terlihat jelas.', caption: 'Halaman Login Aplikasi ECR' },
  { id: 2, title: 'Dashboard Pelapor', note: 'Tampilkan tombol buat alert, status alert aktif, dan riwayat singkat.', caption: 'Dashboard Pelapor' },
  { id: 3, title: 'Form Tambah Alert Bagian Atas', note: 'Tampilkan field departemen tujuan, deskripsi, dan prioritas.', caption: 'Form Tambah Alert Bagian Atas' },
  { id: 4, title: 'Form Tambah Alert Bagian Bawah', note: 'Tampilkan lokasi GPS, upload foto, dan tombol kirim.', caption: 'Form Tambah Alert Bagian Bawah' },
  { id: 5, title: 'Halaman Status Alert', note: 'Tampilkan status Open, Progress, Arrived, atau Close beserta timeline.', caption: 'Halaman Status Alert' },
  { id: 6, title: 'Riwayat Alert', note: 'Tampilkan daftar laporan yang pernah dibuat user.', caption: 'Halaman Riwayat Alert' },
  { id: 7, title: 'Dashboard Staff', note: 'Tampilkan alert masuk sesuai departemen staff.', caption: 'Dashboard Staff Departemen' },
  { id: 8, title: 'Detail Alert Sebelum Diproses', note: 'Tampilkan deskripsi, lokasi, pelapor, foto, dan tombol Progress.', caption: 'Detail Alert Sebelum Diproses' },
  { id: 9, title: 'Detail Alert Dalam Proses', note: 'Tampilkan status progress dan tombol Arrived atau Close.', caption: 'Detail Alert Dalam Proses' },
  { id: 10, title: 'Form Penyelesaian Alert', note: 'Tampilkan catatan penyelesaian, upload bukti, dan tombol selesai.', caption: 'Form Penyelesaian Alert' },
  { id: 11, title: 'Dashboard Admin', note: 'Tampilkan statistik total alert, open, progress, close, dan departemen.', caption: 'Dashboard Admin ECR' },
  { id: 12, title: 'Data Alert Admin', note: 'Tampilkan filter, pencarian, status, dan tombol detail/cetak.', caption: 'Halaman Data Alert' },
  { id: 13, title: 'Detail Report Alert', note: 'Tampilkan timeline, pelapor, staff, status, lokasi, dan bukti.', caption: 'Detail Report Alert' },
  { id: 14, title: 'Kalender atau Timeline Alert', note: 'Tampilkan alert dalam tampilan tanggal/waktu dengan filter.', caption: 'Kalender atau Timeline Alert' },
  { id: 15, title: 'Monitoring TV ECR', note: 'Ambil screenshot fullscreen jika bisa. Tampilkan alert aktif dengan teks besar.', caption: 'Tampilan Monitoring TV ECR' },
  { id: 16, title: 'Master Data Departemen', note: 'Tampilkan tombol tambah, edit, hapus, dan pencarian.', caption: 'Master Data Departemen' },
  { id: 17, title: 'Master Data User dan Staff', note: 'Tampilkan role, departemen, dan status approval.', caption: 'Master Data User dan Staff' },
  { id: 18, title: 'Form Tambah atau Edit User', note: 'Tampilkan nama, username, role, departemen, dan status akun.', caption: 'Form Tambah atau Edit User' },
  { id: 19, title: 'Halaman Approval Staff', note: 'Tampilkan akun pending dan tombol approve/reject.', caption: 'Halaman Approval Staff' },
  { id: 20, title: 'Preview Cetak Data Alert', note: 'Tampilkan preview daftar alert sebelum dicetak.', caption: 'Preview Cetak Data Alert' },
  { id: 21, title: 'Preview Cetak Detail Alert', note: 'Tampilkan preview detail alert lengkap sebelum dicetak.', caption: 'Preview Cetak Detail Alert' },
  { id: 22, title: 'Halaman Superadmin', note: 'Tampilkan menu manajemen user, role, dan konfigurasi.', caption: 'Halaman Superadmin' },
  { id: 23, title: 'Halaman View Only', note: 'Pastikan tidak ada tombol tambah/edit/hapus.', caption: 'Halaman View Only' },
];

const styles = StyleSheet.create({
  kicker: { color: '#1D4ED8', fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
  heroTitle: { color: '#0F172A', fontSize: 22, fontWeight: '900', lineHeight: 28 },
  heroTitleCompact: { fontSize: 20, lineHeight: 26 },
  heroSubtitle: { color: '#475569', fontSize: 14, lineHeight: 20 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D7E3F0',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 8,
  },
  modeButtonActive: { backgroundColor: '#005BAC', borderColor: '#005BAC' },
  modeText: { color: '#475569', fontSize: 12.5, fontWeight: '900' },
  modeTextActive: { color: '#FFFFFF' },
  timelineList: { gap: 14 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  sectionTitle: { color: '#0F172A', fontSize: 18, fontWeight: '900' },
  sectionSubtitle: { color: '#64748B', fontSize: 13, marginTop: 3 },
  timelineStack: { gap: 12 },
  timelineItem: { flexDirection: 'row', gap: 12 },
  timelineRail: { alignItems: 'center', width: 18 },
  timelineDot: { backgroundColor: '#DC2626', borderRadius: 999, height: 12, width: 12 },
  timelineDotClose: { backgroundColor: '#16A34A' },
  timelineLine: { backgroundColor: '#D7E3F0', flex: 1, marginTop: 4, width: 2 },
  timelineBody: {
    backgroundColor: '#F8FAFC',
    borderColor: '#D7E3F0',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    padding: 12,
  },
  reportTopline: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  reportId: { color: '#005BAC', fontSize: 12.5, fontWeight: '900' },
  reportTitle: { color: '#0F172A', fontSize: 15, fontWeight: '900', lineHeight: 20 },
  reportMeta: { color: '#64748B', fontSize: 12.5, lineHeight: 17 },
  tvHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  tvKicker: { color: '#DC2626', fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
  tvTitle: { color: '#0F172A', fontSize: 24, fontWeight: '900', lineHeight: 30 },
  liveBadge: {
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  liveDot: { backgroundColor: '#16A34A', borderRadius: 999, height: 8, width: 8 },
  liveText: { color: '#047857', fontSize: 10.5, fontWeight: '900' },
  tvList: { gap: 10 },
  tvRow: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  tvNumber: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, height: 48, justifyContent: 'center', width: 58 },
  tvNumberText: { color: '#0F172A', fontSize: 16, fontWeight: '900' },
  tvBody: { flex: 1, gap: 3, minWidth: 0 },
  tvReportTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', lineHeight: 22 },
  tvReportMeta: { color: '#CBD5E1', fontSize: 12.5, lineHeight: 17 },
  tvReportTime: { color: '#93C5FD', fontSize: 12, fontWeight: '800' },
  tvStatus: { backgroundColor: '#DC2626', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  tvStatusText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  guideList: { gap: 12 },
  guideHeader: { flexDirection: 'row', gap: 12 },
  guideNumber: { alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 999, height: 38, justifyContent: 'center', width: 38 },
  guideNumberText: { color: '#005BAC', fontWeight: '900' },
  guideBody: { flex: 1, gap: 7, minWidth: 0 },
  guideTitle: { color: '#0F172A', fontSize: 15, fontWeight: '900' },
  placeholder: { color: '#B91C1C', fontSize: 12.5, fontWeight: '900', lineHeight: 18 },
  guideNote: { color: '#475569', fontSize: 13, lineHeight: 18 },
  caption: { color: '#0F172A', fontSize: 12.5, fontWeight: '800', lineHeight: 17 },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
});
