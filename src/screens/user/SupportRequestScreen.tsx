import { useQuery } from '@tanstack/react-query';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { DepartmentTile } from '../../components/DepartmentTile';
import { EmptyState } from '../../components/EmptyState';
import { HeaderBackButton } from '../../components/HeaderBackButton';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { listDepartments } from '../../services/department-service';

type Props = {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
};

export function SupportRequestScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: listDepartments,
  });

  const departments = (data ?? []).filter((item) => item.departmentId !== user?.departmentId);

  return (
    <Screen
      title="Minta Bantuan"
      subtitle="Pilih departemen lain untuk mengirim bantuan lintas tim."
      left={<HeaderBackButton onPress={() => navigation.navigate('UserHome')} />}
    >
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
            <DepartmentTile
              key={department.departmentId}
              department={department}
              subtitle={department.description ?? 'Departemen bantuan'}
              onPress={() => navigation.navigate('ReportForm', { departmentId: department.departmentId, departmentName: department.departmentName })}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    color: '#64748B',
  },
  list: {
    gap: 12,
  },
});

export default SupportRequestScreen;
