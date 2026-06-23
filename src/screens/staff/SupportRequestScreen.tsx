import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { Screen } from '../../components/Screen';
import { StaffDepartmentCard } from '../../components/StaffDepartmentCard';
import { useAuth } from '../../context/AuthContext';
import { listDepartments } from '../../services/department-service';
import { getDepartmentById } from '../../utils/staff';
import type { StaffStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<StaffStackParamList, 'StaffSupport'>;

export function SupportRequestScreen({ navigation }: Props) {
  const { user } = useAuth();
  const currentDepartment = useMemo(
    () => (user?.departmentId ? getDepartmentById(user.departmentId) : null),
    [user?.departmentId],
  );
  const { data, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: listDepartments,
  });

  const departments = (data ?? []).filter((item) => item.departmentId !== currentDepartment?.departmentId);

  return (
    <Screen
      title="Minta Bantuan"
      subtitle="Kirim alert bantuan ke departemen lain saat tim Anda membutuhkan dukungan tambahan di lapangan."
      left={<HeaderBackButton onPress={() => navigation.navigate('StaffDashboard')} />}
    >
      <View style={styles.introCard}>
        <Text selectable style={styles.introTitle}>
          Pilih Departemen Bantuan
        </Text>
        <Text selectable style={styles.introSubtitle}>
          Semua departemen yang tersedia ditampilkan di bawah ini. Pilih yang paling sesuai dengan kebutuhan Anda.
        </Text>
      </View>

      {isLoading ? (
        <Text selectable style={styles.loading}>
          Memuat departemen...
        </Text>
      ) : departments.length === 0 ? (
        <EmptyState
          title="Belum ada departemen bantuan"
          description="Departemen lain akan muncul di sini untuk menerima permintaan bantuan."
        />
      ) : (
        <View style={styles.list}>
          {departments.map((department) => (
            <StaffDepartmentCard
              key={department.departmentId}
              department={department}
              onPress={() =>
                navigation.navigate('ReportForm', {
                  departmentId: department.departmentId,
                  departmentName: department.departmentName,
                })
              }
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  introCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EE',
    borderRadius: 32,
    borderWidth: 1,
    gap: 10,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 1,
  },
  introTitle: {
    color: '#101828',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  introSubtitle: {
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
  },
  loading: {
    color: '#667085',
  },
  list: {
    gap: 14,
  },
});

export default SupportRequestScreen;
