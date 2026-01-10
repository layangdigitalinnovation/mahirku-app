import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import AffiliatorDashboardScreen from '../screens/AffiliatorDashboardScreen';
import AffiliatorWithdrawScreen from '../screens/AffiliatorWithdrawScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AffiliatorNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: '#F1F5F9',
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 88 : 64,
                    paddingTop: 10,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
                    elevation: 8,
                    shadowColor: '#64748B',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                },
                tabBarActiveTintColor: '#10B981', // Emerald-500 for Affiliator theme
                tabBarInactiveTintColor: '#94A3B8',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginTop: 2,
                },
            }}
        >
            <Tab.Screen
                name="AffiliatorHome"
                component={AffiliatorDashboardScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Feather name="home" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="AffiliatorWithdraw"
                component={AffiliatorWithdrawScreen}
                options={{
                    tabBarLabel: 'Tarik Saldo',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Feather name="arrow-up-circle" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="AffiliatorProfile"
                children={(props) => <ProfileScreen {...props} hideTabs={true} />}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Feather name="user" size={24} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
