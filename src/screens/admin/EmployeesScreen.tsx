import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppTextInput } from '../../components/AppTextInput';
import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { HistoryPagination } from '../../components/HistoryPagination';
import { MetricCard } from '../../components/MetricCard';
import { UserCard } from '../../components/UserCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { listUsers } from '../../services/user-service';
import type { AdminStackParamList } from '../../types/navigation';
import { getPageCount, getPaginatedItems } from '../../utils/report-history';

type Props = NativeStackScreenProps<AdminStackParamList, 'EmployeeDirectory'>;
const DIRECTORY_PAGE_SIZE = 10;

export function EmployeesScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const usersQuery = useQuery({
    queryKey: ['users', 'staff'],
    queryFn: () => listUsers({ role: 'staff' }),
  });

  const users = usersQuery.data ?? [];
  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((item) => {
      const haystack = `${item.fullName} ${item.username} ${item.email} ${item.department ?? ''}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [query, users]);
  const pageCount = getPageCount(filteredUsers.length, DIRECTORY_PAGE_SIZE);
  const visibleUsers = useMemo(
    () => getPaginatedItems(filteredUsers, page, DIRECTORY_PAGE_SIZE),
    [filteredUsers, page],
  );

  const approvedCount = users.filter((item) => item.approvalStatus === 'approved').length;
  const pendingCount = users.filter((item) => item.approvalStatus === 'pending').length;
  const activeCount = users.filter((item) => item.isActive).length;

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  return (
    <Screen
      title="Employees"
      subtitle="Kelola staff aktif, approval, dan detail karyawan."
      left={<HeaderBackButton onPress={() => navigation.navigate('AdminDashboard')} />}
      right={<PrimaryButton title="Tambah" onPress={() => navigation.navigate('CreateStaff')} />}
      refreshing={usersQuery.isFetching}
      onRefresh={() => void usersQuery.refetch()}
    >
      <SectionCard tone="soft">
        <Text selectable style={styles.heroLabel}>
          DAFTAR STAFF
        </Text>
        <Text selectable style={[styles.heroTitle, compact && styles.heroTitleCompact]} numberOfLines={2}>
          {users.length} staff terdata
        </Text>
        <Text selectable style={styles.heroSubtitle} numberOfLines={2}>
          Approval staff, departemen, dan detail akun tersedia di satu tempat.
        </Text>

        <View style={styles.metrics}>
          <MetricCard label="Active" value={activeCount} />
          <MetricCard label="Approved" value={approvedCount} accent="#15803D" />
          <MetricCard label="Pending" value={pendingCount} accent="#EA580C" />
        </View>
      </SectionCard>

      <AppTextInput label="Cari staff" value={query} onChangeText={setQuery} hint="Nama, username, email, departemen" />

      {usersQuery.isLoading ? (
        <Text selectable style={styles.loading}>
          Memuat staff...
        </Text>
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="Belum ada staff" description="Staff yang terdaftar akan tampil di sini." />
      ) : (
        <>
          <View style={styles.list}>
            {visibleUsers.map((user) => (
              <UserCard
                key={user.userId}
                user={user}
                subtitle={user.department ?? 'Tanpa departemen'}
                onPress={() => navigation.navigate('UserDetail', { user })}
              />
            ))}
          </View>
          <HistoryPagination
            page={page}
            pageCount={pageCount}
            totalItems={filteredUsers.length}
            pageSize={DIRECTORY_PAGE_SIZE}
            itemLabel="staff"
            onPageChange={setPage}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroLabel: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: '#0F2C57',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroTitleCompact: {
    fontSize: 20,
    lineHeight: 26,
  },
  heroSubtitle: {
    color: '#475569',
    lineHeight: 20,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  loading: {
    color: '#64748B',
  },
  list: {
    gap: 12,
  },
});
