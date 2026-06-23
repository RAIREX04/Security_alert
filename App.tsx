import 'react-native-gesture-handler';

import { QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { NotificationBootstrap } from './src/components/NotificationBootstrap';
import { AlarmServiceSync } from './src/components/AlarmServiceSync';
import { RequesterReviewMonitor } from './src/components/RequesterReviewMonitor';
import { OfflineReportSync } from './src/components/OfflineReportSync';
import { queryClient } from './src/config/query-client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="dark" />
            <NotificationBootstrap />
            <AlarmServiceSync />
            <OfflineReportSync />
            <AppNavigator />
            <RequesterReviewMonitor />
          </GestureHandlerRootView>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
