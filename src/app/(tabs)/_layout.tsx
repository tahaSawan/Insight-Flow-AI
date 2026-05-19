import { Tabs, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import React from 'react';
import { LayoutDashboard, UploadCloud, BrainCircuit, BarChart3, History } from 'lucide-react-native';
import { useAppContext } from '@/context/AppContext';

export default function TabsLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { uploadedText, analysisResults, history } = useAppContext();
  const router = useRouter();

  const hasUpload = uploadedText.trim().length > 0;
  const hasResults = analysisResults !== null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#12121A' : '#ffffff',
          borderTopColor: isDark ? '#1F1F2E' : '#e2e8f0',
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#8A8D98',
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
          href: hasUpload ? '/analysis' : null,
          tabBarIcon: ({ color, size }) => <BrainCircuit color={color} size={size} />,
        }}
        listeners={{
          tabPress: (e) => {
            if (!hasUpload) {
              e.preventDefault();
              router.push('/upload');
            }
          },
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Results',
          href: hasResults ? '/results' : null,
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
        listeners={{
          tabPress: (e) => {
            if (!hasResults) {
              e.preventDefault();
              if (hasUpload) {
                router.push('/analysis');
              } else {
                router.push('/upload');
              }
            }
          },
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          href: history.length > 0 ? '/history' : null,
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
        }}
        listeners={{
          tabPress: (e) => {
            if (history.length === 0) {
              e.preventDefault();
              router.push('/upload');
            }
          },
        }}
      />
    </Tabs>
  );
}
