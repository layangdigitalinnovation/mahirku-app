import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as PaperProvider } from 'react-native-paper';
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AffiliatorDashboardScreen from './src/screens/AffiliatorDashboardScreen';
import MitraDashboardScreen from './src/screens/MitraDashboardScreen';
import MitraWithdrawScreen from './src/screens/MitraWithdrawScreen';
import MitraNavigator from './src/navigation/MitraNavigator';
import AffiliatorNavigator from './src/navigation/AffiliatorNavigator';
import MitraCommissionHistoryScreen from './src/screens/MitraCommissionHistoryScreen';
import TestStartScreen from './src/screens/TestStartScreen';
import TestScreen from './src/screens/TestScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import ReportDetailScreen from './src/screens/ReportDetailScreen';
import InvoiceHistoryScreen from './src/screens/InvoiceHistoryScreen';
import TokenPackagesScreen from './src/screens/TokenPackagesScreen';
import PurchaseConfirmationScreen from './src/screens/PurchaseConfirmationScreen';
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
import TransferTokenScreen from './src/screens/TransferTokenScreen';
import AddMemberScreen from './src/screens/AddMemberScreen';
import MemberListScreen from './src/screens/MemberListScreen';
import TermsOfUseScreen from './src/screens/TermsOfUseScreen';
import FAQScreen from './src/screens/FAQScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { saveReferralCode } from './src/store/referral';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

const linking = {
  prefixes: ['com.mahirku.app://', 'mahirku://', 'https://mahirku.com', 'http://mahirku.com'],
  config: {
    screens: {
      Auth: {
        path: 'auth',
        // Support old /login and /register paths
        parse: {
          login: () => ({ initialTab: 0 }),
          register: () => ({ initialTab: 1 }),
        },
      },
      Dashboard: 'dashboard',
      AffiliatorDashboard: 'affiliator-dashboard',
      MitraDashboard: 'mitra-dashboard',
    },
  },
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      setShowOnboarding(hasSeenOnboarding !== 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setShowOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) return;
      try {
        // Simple regex to find ref or referralCode query param
        const regex = /[?&](ref|referralCode)=([^&#]*)/;
        const match = regex.exec(url);
        if (match && match[2]) {
          const ref = match[2];
          console.log('Referral code captured:', ref);
          saveReferralCode(ref);
        }
      } catch (e) {
        console.error('Error parsing URL:', e);
      }
    };

    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener('url', (event) => handleUrl(event.url));
    return () => subscription.remove();
  }, []);

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  return (
    <PaperProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer linking={linking}>
          <Stack.Navigator initialRouteName={showOnboarding ? "Onboarding" : "Auth"} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="AffiliatorDashboard" component={AffiliatorNavigator} />
            <Stack.Screen name="MitraDashboard" component={MitraNavigator} />
            <Stack.Screen name="MitraWithdraw" component={MitraWithdrawScreen} />
            <Stack.Screen name="MitraCommissionHistory" component={MitraCommissionHistoryScreen} />
            <Stack.Screen name="TestStart" component={TestStartScreen} />
            <Stack.Screen name="TransferToken" component={TransferTokenScreen} />
            <Stack.Screen name="Tests" component={TestScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
            <Stack.Screen name="InvoiceHistory" component={InvoiceHistoryScreen} />
            <Stack.Screen name="TokenPackages" component={TokenPackagesScreen} />
            <Stack.Screen name="PurchaseConfirmation" component={PurchaseConfirmationScreen} />
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
            <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
            <Stack.Screen name="FAQ" component={FAQScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </PaperProvider>
  );
}
