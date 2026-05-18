import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import React from 'react';
// Note: In an actual app, you would import vector icons or custom images for tabs

export default function TabsLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1E293B' : '#ffffff',
          borderTopColor: isDark ? '#334155' : '#e2e8f0',
        },
        tabBarActiveTintColor: '#3B82F6', // primary blue
        tabBarInactiveTintColor: '#94A3B8', // textSecondary
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Upload',
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analysis',
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Results',
        }}
      />
    </Tabs>
  );
}
