import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { EmptyState } from '../../components/EmptyState';
import { MetricCard } from '../../components/MetricCard';
import { ReportCard } from '../../components/ReportCard';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { listReports } from '../../services/report-service';

export function ViewOnlyDashboardScreen({ navigation }: any) {
  const reportsQuery = useQuery({
    queryKey: ['reports', 'view-only-dashboard'],
    queryFn: () => listReports(),
  });

  const reports = reportsQuery.data ?? [];
  const summary = useMemo(
    () => ({
      total: reports.length,
      open: reports.filter((report) => report.status === 'open').length,
      progress: reports.filter((report) => report.status === 'progress').length,
      close: reports.filter((report) => report.status === 'close').length,
    }),
    [reports],
  );

  return (
    <Screen
      title="View Only"
      subtitle="Mode pemantauan tanpa tombol tambah, edit, hapus, atau perubahan status."
      refreshing={reportsQuery.isFetching}
      onRefresh={() => void reportsQuery.refetch()}
    >
      <SectionCard tone="soft">
        <Text selectable style={styles.kicker}>READ ONLY ACCESS</Text>
        <Text selectable style={styles.heroTitle}>Dashboard pemantauan ECR</Text>
        <Text selectable style={styles.heroSubtitle}>
          Akun view only digunakan untuk melihat kondisi operasional dan audit cepat tanpa izin mengubah data.
        </Text>
        <View style={styles.metrics}>
          <MetricCard label="Total Alert" value={summary.total} accent="#005BAC" />
          <MetricCard label="Open" value={summary.open} accent="#DC2626" />
          <MetricCard label="Progress" value={summary.progress} accent="#2563EB" />
          <MetricCard label="Close" value={summary.close} accent="#16A34A" />
        </View>
      </SectionCard>

      <SectionCard>
        <Text selectable style={styles.sectionTitle}>Alert terbaru</Text>
        <Text selectable style={styles.sectionSubtitle}>Tekan kartu untuk melihat detail report tanpa aksi perubahan.</Text>
        {reports.length === 0 ? (
          <EmptyState title="Belum ada alert" description="Data alert akan tampil di sini." />
        ) : (
          <View style={styles.list}>
            {reports.slice(0, 6).map((report) => (
              <ReportCard
                key={report.reportId}
                report={report}
                onPress={() => navigation.navigate('ReportDetail', { report })}
              />
            ))}
          </View>
        )}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: '#1D4ED8', fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
  heroTitle: { color: '#0F172A', fontSize: 23, fontWeight: '900', lineHeight: 29 },
  heroSubtitle: { color: '#475569', fontSize: 14, lineHeight: 20 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sectionTitle: { color: '#0F172A', fontSize: 18, fontWeight: '900' },
  sectionSubtitle: { color: '#64748B', fontSize: 13.5, lineHeight: 19, marginTop: 4 },
  list: { gap: 12 },
});
