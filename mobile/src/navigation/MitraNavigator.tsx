import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View, Platform } from 'react-native';

import MitraDashboardScreen from '../screens/MitraDashboardScreen';
import MitraMembersScreen from '../screens/MitraMembersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MitraNavigator() {
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
                tabBarActiveTintColor: '#6366F1',
                tabBarInactiveTintColor: '#94A3B8',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginTop: 2,
                },
            }}
        >
            <Tab.Screen
                name="MitraHome"
                component={MitraDashboardScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Feather name="home" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="MitraMembers"
                component={MitraMembersScreen}
                options={{
                    tabBarLabel: 'Anggota',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Feather name="users" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="MitraProfile"
                component={ProfileScreen}
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
