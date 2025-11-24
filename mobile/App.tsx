import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as PaperProvider } from 'react-native-paper';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TestStartScreen from './src/screens/TestStartScreen';
import TestScreen from './src/screens/TestScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import ReportDetailScreen from './src/screens/ReportDetailScreen';
import InvoiceHistoryScreen from './src/screens/InvoiceHistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <PaperProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="TestStart" component={TestStartScreen} />
            <Stack.Screen name="Tests" component={TestScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
            <Stack.Screen name="InvoiceHistory" component={InvoiceHistoryScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </PaperProvider>
  );
}
