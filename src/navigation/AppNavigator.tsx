import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useEffect, type ComponentType } from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { CenteredLoadingScreen } from '../components/CenteredLoadingScreen';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../services/auth-service';
import type { AuthStackParamList } from '../types/navigation';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { StaffRegisterScreen } from '../screens/auth/StaffRegisterScreen';
import { HomeScreen } from '../screens/user/HomeScreen';
import { HistoryScreen as UserHistoryScreen } from '../screens/user/HistoryScreen';
import { ProfileScreen as UserProfileScreen } from '../screens/user/ProfileScreen';
import { StatusScreen as UserStatusScreen } from '../screens/user/StatusScreen';
import { ReportFormScreen } from '../screens/user/ReportFormScreen';
import { DashboardScreen as StaffDashboardScreen } from '../screens/staff/DashboardScreen';
import { SupportRequestScreen as StaffSupportScreen } from '../screens/staff/SupportRequestScreen';
import { HistoryScreen as StaffHistoryScreen } from '../screens/staff/HistoryScreen';
import { ProfileScreen as StaffProfileScreen } from '../screens/staff/ProfileScreen';
import { DashboardScreen as AdminDashboardScreen } from '../screens/admin/DashboardScreen';
import { EmployeesScreen } from '../screens/admin/EmployeesScreen';
import { UsersScreen } from '../screens/admin/UsersScreen';
import { HistoryScreen as AdminHistoryScreen } from '../screens/admin/HistoryScreen';
import { ProfileScreen as AdminProfileScreen } from '../screens/admin/ProfileScreen';
import {
  CompletionProofScreen,
  CreateStaffScreen,
  CreateUserScreen,
  DepartmentDetailScreen,
  EditProfileScreen,
  EditUserScreen,
  ReportDetailScreen,
  UserDetailScreen,
} from '../screens/shared/RoutePlaceholders';

type RootStackParamList = {
  Root: undefined;
  ReportForm: { departmentId?: number; departmentName?: string } | undefined;
  ReportDetail: { report: import('../types/models').Report };
  EditProfile: { user: import('../types/models').User };
  DepartmentDetail: { department: import('../types/models').Department };
  CreateStaff: undefined;
  CreateUser: undefined;
  EditUser: { user: import('../types/models').User };
  UserDetail: { user: import('../types/models').User };
  CompletionProof: { report: import('../types/models').Report };
};

type UserTabParamList = {
  UserHome: undefined;
  UserHistory: undefined;
  UserStatus: undefined;
  UserProfile: undefined;
};

type StaffTabParamList = {
  StaffDashboard: undefined;
  StaffSupport: undefined;
  StaffHistory: undefined;
  StaffProfile: undefined;
};

type AdminTabParamList = {
  AdminDashboard: undefined;
  EmployeeDirectory: undefined;
  UserDirectory: undefined;
  AdminHistory: undefined;
  AdminProfile: undefined;
};

const rootStack = createNativeStackNavigator<RootStackParamList>();
const authStack = createNativeStackNavigator<AuthStackParamList>();
const userTabs = createBottomTabNavigator<UserTabParamList>();
const staffTabs = createBottomTabNavigator<StaffTabParamList>();
const adminTabs = createBottomTabNavigator<AdminTabParamList>();

const asScreen = <T extends object,>(component: ComponentType<T>) =>
  component as unknown as ComponentType<any>;

function AuthNavigator() {
  return (
    <authStack.Navigator screenOptions={{ headerShown: false }}>
      <authStack.Screen name="Login" component={LoginScreen} />
      <authStack.Screen name="Register" component={RegisterScreen} />
      <authStack.Screen name="StaffRegister" component={StaffRegisterScreen} />
    </authStack.Navigator>
  );
}

function RoleTabs() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === 'staff') {
    return (
      <staffTabs.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#DA1E37',
          tabBarInactiveTintColor: '#667085',
          tabBarLabelStyle: { fontSize: 11.5, fontWeight: '800' },
          tabBarHideOnKeyboard: true,
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: 'rgba(255,255,255,0.96)',
            borderRadius: 32,
            borderTopColor: '#D9E3EF',
            borderTopWidth: 1,
            bottom: 16,
            elevation: 8,
            height: 86,
            left: 16,
            paddingBottom: 12,
            paddingTop: 12,
            position: 'absolute',
            right: 16,
            shadowColor: '#0F172A',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.08,
            shadowRadius: 24,
          },
          tabBarItemStyle: {
            borderRadius: 24,
            paddingTop: 6,
          },
        }}
      >
        <staffTabs.Screen
          name="StaffDashboard"
          component={asScreen(StaffDashboardScreen)}
          options={{
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name="grid-outline" color={color} size={size} focused={focused} />
            ),
          }}
        />
        <staffTabs.Screen
          name="StaffSupport"
          component={asScreen(StaffSupportScreen)}
          options={{
            tabBarLabel: 'Minta bantuan',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name="megaphone-outline" color={color} size={size} focused={focused} />
            ),
          }}
        />
        <staffTabs.Screen
          name="StaffHistory"
          component={asScreen(StaffHistoryScreen)}
          options={{
            tabBarLabel: 'Riwayat',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name="time-outline" color={color} size={size} focused={focused} />
            ),
          }}
        />
        <staffTabs.Screen
          name="StaffProfile"
          component={asScreen(StaffProfileScreen)}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name="person-outline" color={color} size={size} focused={focused} />
            ),
          }}
        />
      </staffTabs.Navigator>
    );
  }

  if (user.role === 'admin') {
    return (
      <adminTabs.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#DA1E37',
          tabBarInactiveTintColor: '#667085',
          tabBarLabelStyle: { fontSize: 11.5, fontWeight: '800' },
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: 'rgba(255,255,255,0.96)',
            borderRadius: 32,
            borderTopColor: '#D9E3EF',
            borderTopWidth: 1,
            bottom: 16,
            elevation: 8,
            height: 86,
            left: 16,
            paddingBottom: 12,
            paddingTop: 12,
            position: 'absolute',
            right: 16,
            shadowColor: '#0F172A',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.08,
            shadowRadius: 24,
          },
          tabBarItemStyle: {
            borderRadius: 24,
            paddingTop: 6,
          },
        }}
      >
        <adminTabs.Screen
          name="AdminDashboard"
          component={asScreen(AdminDashboardScreen)}
          options={{
            tabBarLabel: 'Admin',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name="shield-outline" color={color} size={size} focused={focused} />
            ),
          }}
        />
        <adminTabs.Screen
          name="EmployeeDirectory"
          component={asScreen(EmployeesScreen)}
          options={{
            tabBarLabel: 'Karyawan',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name="people-outline" color={color} size={size} focused={focused} />
            ),
          }}
        />
        <adminTabs.Screen
          name="UserDirectory"
          component={asScreen(UsersScreen)}
          options={{
            tabBarLabel: 'User',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name="person-circle-outline" color={color} size={size} focused={focused} />
            ),
          }}
        />
        <adminTabs.Screen
          name="AdminHistory"
          component={asScreen(AdminHistoryScreen)}
          options={{
            tabBarLabel: 'Riwayat',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name="time-outline" color={color} size={size} focused={focused} />
            ),
          }}
        />
        <adminTabs.Screen
          name="AdminProfile"
          component={asScreen(AdminProfileScreen)}
          options={{
            tabBarLabel: 'Profil',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name="person-outline" color={color} size={size} focused={focused} />
            ),
          }}
        />
      </adminTabs.Navigator>
    );
  }

  return (
    <userTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#DA1E37',
        tabBarInactiveTintColor: '#667085',
        tabBarLabelStyle: { fontSize: 11.5, fontWeight: '800' },
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderRadius: 32,
          borderTopColor: '#D9E3EF',
          borderTopWidth: 1,
          bottom: 16,
          elevation: 8,
          height: 86,
          left: 16,
          paddingBottom: 12,
          paddingTop: 12,
          position: 'absolute',
          right: 16,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
        },
        tabBarItemStyle: {
          borderRadius: 24,
          paddingTop: 6,
        },
      }}
    >
      <userTabs.Screen
        name="UserHome"
        component={asScreen(HomeScreen)}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="grid-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <userTabs.Screen
        name="UserHistory"
        component={asScreen(UserHistoryScreen)}
        options={{
          tabBarLabel: 'Riwayat',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="time-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <userTabs.Screen
        name="UserStatus"
        component={asScreen(UserStatusScreen)}
        options={{
          tabBarLabel: 'Status',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="alert-circle-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <userTabs.Screen
        name="UserProfile"
        component={asScreen(UserProfileScreen)}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="person-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />
    </userTabs.Navigator>
  );
}

function RootGate() {
  const { accessToken, isHydrating, user, setUser, signOut } = useAuth();
  const meQuery = useQuery({
    queryKey: ['auth-me', accessToken],
    queryFn: getMe,
    enabled: Boolean(accessToken && !isHydrating),
  });

  useEffect(() => {
    if (meQuery.data) setUser(meQuery.data);
  }, [meQuery.data, setUser]);

  useEffect(() => {
    if (meQuery.isError && accessToken) {
      void signOut();
    }
  }, [accessToken, meQuery.isError, signOut]);

  if (isHydrating || (accessToken && meQuery.isLoading)) {
    return <CenteredLoadingScreen title="Menyiapkan aplikasi" subtitle="Memeriksa sesi login dan data terbaru." />;
  }

  return user ? <RoleTabs /> : <AuthNavigator />;
}

export function AppNavigator() {
  return (
    <NavigationContainer theme={defaultTheme}>
      <rootStack.Navigator screenOptions={{ headerShown: false }}>
        <rootStack.Screen name="Root" component={RootGate} />
        <rootStack.Screen name="ReportForm" component={ReportFormScreen} />
        <rootStack.Screen name="ReportDetail" component={ReportDetailScreen as ComponentType<any>} />
        <rootStack.Screen name="EditProfile" component={EditProfileScreen as ComponentType<any>} />
        <rootStack.Screen name="DepartmentDetail" component={DepartmentDetailScreen as ComponentType<any>} />
        <rootStack.Screen name="CreateStaff" component={CreateStaffScreen as ComponentType<any>} />
        <rootStack.Screen name="CreateUser" component={CreateUserScreen as ComponentType<any>} />
        <rootStack.Screen name="EditUser" component={EditUserScreen as ComponentType<any>} />
        <rootStack.Screen name="UserDetail" component={UserDetailScreen as ComponentType<any>} />
        <rootStack.Screen name="CompletionProof" component={CompletionProofScreen as ComponentType<any>} />
      </rootStack.Navigator>
    </NavigationContainer>
  );
}

const defaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F9FBFF',
    card: '#FFFFFF',
    text: '#0F2C57',
    border: '#D7E3F0',
    primary: '#DA1E37',
  },
};

function TabIcon({
  name,
  color,
  size,
  focused,
}: {
  name: string;
  color?: string;
  size?: number;
  focused?: boolean;
}) {
  const iconMap: Record<string, string> = {
    'grid-outline': 'view-grid-outline',
    'alert-circle-outline': 'alert-circle-outline',
    'time-outline': 'clock-outline',
    'person-outline': 'account-outline',
    'shield-outline': 'shield-outline',
    'people-outline': 'account-group-outline',
    'person-circle-outline': 'account-circle-outline',
    'megaphone-outline': 'bullhorn-outline',
  };
  const iconName = iconMap[name] ?? 'circle-outline';

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: focused ? '#EEF4FF' : 'transparent',
        borderColor: focused ? '#D9E7FF' : 'transparent',
        borderRadius: 999,
        borderWidth: focused ? 1 : 0,
        height: 34,
        justifyContent: 'center',
        width: 34,
      }}
    >
      <MaterialCommunityIcons
        name={iconName as any}
        color={focused ? '#2563EB' : color ?? '#667085'}
        size={(size ?? 20) + 1}
      />
    </View>
  );
}
