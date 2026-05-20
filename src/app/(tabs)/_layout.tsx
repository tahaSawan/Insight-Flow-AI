import { Tabs, useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { colors } from '@/constants/designTokens';
import { LayoutDashboard, UploadCloud, BrainCircuit, BarChart3, History } from 'lucide-react-native';
import { useAppContext } from '@/context/AppContext';
import { OnboardingModal } from '@/components/OnboardingModal';
import {
  getOnboardingComplete,
  setOnboardingComplete,
} from '@/services/appPreferences';

export default function TabsLayout() {
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
            backgroundColor: colors.surface,
            borderTopColor: colors.borderStrong,
            borderTopWidth: 1,
            height: 62,
            paddingTop: 6,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
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
