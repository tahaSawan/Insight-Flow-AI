import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import React from 'react';
import { LayoutDashboard, UploadCloud, BrainCircuit, BarChart3 } from 'lucide-react-native';

export default function TabsLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#12121A' : '#ffffff',
          borderTopColor: isDark ? '#1F1F2E' : '#e2e8f0',
        },
        tabBarActiveTintColor: '#6366F1', // primary
        tabBarInactiveTintColor: '#8A8D98', // textSecondary
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Upload',
          tabBarIcon: ({ color, size }) => <UploadCloud color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analysis',
          tabBarIcon: ({ color, size }) => <BrainCircuit color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Results',
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
