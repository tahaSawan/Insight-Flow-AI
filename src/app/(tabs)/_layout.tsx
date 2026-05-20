import { Tabs, useRouter, useFocusEffect } from 'expo-router';
import { useColorScheme } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { LayoutDashboard, UploadCloud, BrainCircuit, BarChart3, History } from 'lucide-react-native';
import { useAppContext } from '@/context/AppContext';
import { OnboardingModal } from '@/components/OnboardingModal';
import {
  getOnboardingComplete,
  setOnboardingComplete,
} from '@/services/appPreferences';

export default function TabsLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { uploadedText, analysisResults, history, preferencesLoaded } = useAppContext();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const hasUpload = uploadedText.trim().length > 0;
  const hasResults = analysisResults !== null;

  useEffect(() => {
    if (!preferencesLoaded) return;
    getOnboardingComplete().then((done) => {
      if (!done) setShowOnboarding(true);
    });
  }, [preferencesLoaded]);

  useFocusEffect(
    useCallback(() => {
      getOnboardingComplete().then((done) => {
        if (!done) setShowOnboarding(true);
      });
    }, []),
  );

  const finishOnboarding = async () => {
    await setOnboardingComplete(true);
    setShowOnboarding(false);
  };

  return (
    <>
      <OnboardingModal visible={showOnboarding} onComplete={finishOnboarding} />
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
            title: 'Home',
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
            tabBarIcon: ({ color, size }) => (
              <BrainCircuit color={hasUpload ? color : `${color}88`} size={size} />
            ),
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
            tabBarIcon: ({ color, size }) => (
              <BarChart3 color={hasResults ? color : `${color}88`} size={size} />
            ),
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
            tabBarIcon: ({ color, size }) => (
              <History color={history.length > 0 ? color : `${color}88`} size={size} />
            ),
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
    </>
  );
}
