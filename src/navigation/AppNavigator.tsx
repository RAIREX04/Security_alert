import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { useEffect, useRef, type ComponentType } from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ecrTheme } from '../theme/ecrTheme';

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
import { OperationsScreen } from '../screens/admin/OperationsScreen';
import { ProfileScreen as AdminProfileScreen } from '../screens/admin/ProfileScreen';
import { ViewOnlyDashboardScreen } from '../screens/view-only/ViewOnlyDashboardScreen';
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

type ViewOnlyTabParamList = {
  ViewOnlyDashboard: undefined;
  ViewOnlyOperations: undefined;
  ViewOnlyHistory: undefined;
  ViewOnlyProfile: undefined;
};

const rootStack = createNativeStackNavigator<RootStackParamList>();
const authStack = createNativeStackNavigator<AuthStackParamList>();
const userTabs = createBottomTabNavigator<UserTabParamList>();
const staffTabs = createBottomTabNavigator<StaffTabParamList>();
const adminTabs = createBottomTabNavigator<AdminTabParamList>();
const viewOnlyTabs = createBottomTabNavigator<ViewOnlyTabParamList>();

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
        screenOptions={tabScreenOptions}
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

  if (user.role === 'admin' || user.role === 'superadmin') {
    return (
      <adminTabs.Navigator
        screenOptions={tabScreenOptions}
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

  if (user.role === 'view_only') {
    return (
      <viewOnlyTabs.Navigator screenOptions={tabScreenOptions}>
        <viewOnlyTabs.Screen
          name="ViewOnlyDashboard"
          component={asScreen(ViewOnlyDashboardScreen)}
          options={{
            tabBarLabel: 'Monitor',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name="eye-outline" color={color} size={size} focused={focused} />
            ),
          }}
        />
        <viewOnlyTabs.Screen
          name="ViewOnlyOperations"
          component={asScreen(OperationsScreen)}
          options={{
            tabBarLabel: 'TV',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name="monitor-dashboard-outline" color={color} size={size} focused={focused} />
            ),
          }}
        />
        <viewOnlyTabs.Screen
          name="ViewOnlyHistory"
          component={asScreen(AdminHistoryScreen)}
          options={{
            tabBarLabel: 'Riwayat',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name="time-outline" color={color} size={size} focused={focused} />
            ),
          }}
        />
        <viewOnlyTabs.Screen
          name="ViewOnlyProfile"
          component={asScreen(AdminProfileScreen)}
          options={{
            tabBarLabel: 'Profil',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name="person-outline" color={color} size={size} focused={focused} />
            ),
          }}
        />
      </viewOnlyTabs.Navigator>
    );
  }

  return (
    <userTabs.Navigator
      screenOptions={tabScreenOptions}
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
  const {
    accessToken,
    isHydrating,
    refreshCurrentSession,
    refreshToken,
    user,
    setUser,
  } = useAuth();
  const networkState = Network.useNetworkState();
  const attemptedRefreshRef = useRef(false);
  const isOnline = networkState.isInternetReachable ?? networkState.isConnected ?? true;
  const meQuery = useQuery({
    queryKey: ['auth-me', accessToken],
    queryFn: getMe,
    enabled: Boolean(accessToken && !isHydrating && isOnline),
  });

  useEffect(() => {
    if (meQuery.data) setUser(meQuery.data);
  }, [meQuery.data, setUser]);

  useEffect(() => {
    if (!meQuery.isError || !accessToken || !isOnline) {
      attemptedRefreshRef.current = false;
      return;
    }

    if (attemptedRefreshRef.current) {
      return;
    }

    attemptedRefreshRef.current = true;

    if (refreshToken) {
      void refreshCurrentSession().catch(() => {
        // Keep the current session visible so transient auth/me failures do not kick the user out.
      });
    }
  }, [accessToken, isOnline, meQuery.isError, refreshCurrentSession, refreshToken]);

  if (isHydrating || (accessToken && isOnline && meQuery.isLoading)) {
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
    background: ecrTheme.colors.background,
    card: ecrTheme.colors.card,
    text: ecrTheme.colors.textPrimary,
    border: ecrTheme.colors.border,
    primary: ecrTheme.colors.primaryRed,
  },
};

const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: ecrTheme.colors.pertaminaBlue,
  tabBarInactiveTintColor: ecrTheme.colors.textSecondary,
  tabBarLabelStyle: { fontSize: 11, fontWeight: '800' as const },
  tabBarHideOnKeyboard: true,
  tabBarShowLabel: true,
  tabBarStyle: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: ecrTheme.radii.xl,
    borderTopColor: ecrTheme.colors.border,
    borderTopWidth: 1,
    bottom: 54,
    height: 74,
    left: 14,
    paddingBottom: 7,
    paddingTop: 7,
    position: 'absolute' as const,
    right: 14,
    ...ecrTheme.shadows.medium,
  },
  tabBarItemStyle: {
    borderRadius: ecrTheme.radii.lg,
    paddingTop: 4,
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
    'monitor-dashboard-outline': 'monitor-dashboard',
    'eye-outline': 'eye-outline',
  };
  const iconName = iconMap[name] ?? 'circle-outline';

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: focused ? ecrTheme.colors.infoSoft : 'transparent',
        borderColor: focused ? '#BFDBFE' : 'transparent',
        borderRadius: 999,
        borderWidth: focused ? 1 : 0,
        height: 32,
        justifyContent: 'center',
        width: 32,
      }}
    >
      <MaterialCommunityIcons
        name={iconName as any}
        color={focused ? ecrTheme.colors.pertaminaBlue : color ?? ecrTheme.colors.textSecondary}
        size={(size ?? 20) + 1}
      />
    </View>
  );
}
