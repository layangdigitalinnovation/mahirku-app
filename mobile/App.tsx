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
import TokenPackagesScreen from './src/screens/TokenPackagesScreen';
import PaymentStatusScreen from './src/screens/PaymentStatusScreen';
import PaymentSuccessScreen from './src/screens/PaymentSuccessScreen';
import PaymentWebViewScreen from './src/screens/PaymentWebViewScreen';
import CognitiveTestIntroScreen from './src/screens/CognitiveTestIntroScreen';
import CognitiveQuestionnaireScreen from './src/screens/CognitiveQuestionnaireScreen';
import CognitiveDataEntryScreen from './src/screens/CognitiveDataEntryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import DiscTestScreen from './src/screens/DiscTestScreen';
import DiscResultScreen from './src/screens/DiscResultScreen';
import AddMemberScreen from './src/screens/AddMemberScreen';
import MemberListScreen from './src/screens/MemberListScreen';

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
            <Stack.Screen name="TokenPackages" component={TokenPackagesScreen} />
            <Stack.Screen name="PaymentStatus" component={PaymentStatusScreen} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
            <Stack.Screen name="PaymentWebView" component={PaymentWebViewScreen} />
            <Stack.Screen name="CognitiveDataEntry" component={CognitiveDataEntryScreen} />
            <Stack.Screen name="CognitiveQuestionnaire" component={CognitiveQuestionnaireScreen} />
            <Stack.Screen name="CognitiveTestIntro" component={CognitiveTestIntroScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="DiscTest" component={DiscTestScreen} />
            <Stack.Screen name="DiscResult" component={DiscResultScreen} />
            <Stack.Screen name="AddMember" component={AddMemberScreen} />
            <Stack.Screen name="MemberList" component={MemberListScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </PaperProvider>
  );
}
