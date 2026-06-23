import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppTextInput } from '../../components/AppTextInput';
import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { MetricCard } from '../../components/MetricCard';
import { UserCard } from '../../components/UserCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { listUsers } from '../../services/user-service';
import type { AdminStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'UserDirectory'>;

export function UsersScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const [query, setQuery] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['users', 'users-directory'],
    queryFn: () => listUsers({ role: 'user' }),
  });

  const users = data ?? [];
  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((item) => {
      const haystack = `${item.fullName} ${item.username} ${item.email}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [query, users]);

  return (
    <Screen
      title="Users"
      subtitle="Kelola akun pelapor dan akses pengguna."
      left={<HeaderBackButton onPress={() => navigation.navigate('AdminDashboard')} />}
      right={<PrimaryButton title="Tambah" onPress={() => navigation.navigate('CreateUser')} />}
    >
      <SectionCard tone="soft">
        <Text selectable style={styles.heroLabel}>
          DAFTAR USER
        </Text>
        <Text selectable style={[styles.heroTitle, compact && styles.heroTitleCompact]} numberOfLines={2}>
          {users.length} akun aktif terdata
        </Text>
        <Text selectable style={styles.heroSubtitle} numberOfLines={2}>
          Cari nama, username, atau email untuk menemukan user dengan cepat.
        </Text>

        <View style={styles.metrics}>
          <MetricCard label="Total" value={users.length} />
          <MetricCard label="Terfilter" value={filteredUsers.length} accent="#1D4ED8" />
        </View>
      </SectionCard>

      <AppTextInput label="Cari user" value={query} onChangeText={setQuery} hint="Nama, username, email" />

      {isLoading ? (
        <Text selectable style={styles.loading}>
          Memuat user...
        </Text>
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="Belum ada user" description="Akun user akan tampil di sini." />
      ) : (
        <View style={styles.list}>
          {filteredUsers.map((user) => (
            <UserCard key={user.userId} user={user} onPress={() => navigation.navigate('UserDetail', { user })} />
          ))}
        </View>
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
