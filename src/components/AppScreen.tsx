import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  SafeAreaView,
  type Edge,
} from 'react-native-safe-area-context';
import { colors } from '@/constants/designTokens';

interface AppScreenProps {
  children: React.ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
}

/** Full-screen shell with brand gradient atmosphere. */
export function AppScreen({ children, edges = ['top', 'left', 'right'], style }: AppScreenProps) {
  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={[colors.bgElevated, colors.bg, colors.bg]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={[styles.orb, styles.orbTop]} pointerEvents="none" />
      <View style={[styles.orb, styles.orbBottom]} pointerEvents="none" />
      <SafeAreaView style={styles.safe} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safe: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.55,
  },
  orbTop: {
    width: 280,
    height: 280,
    top: -80,
    right: -60,
    backgroundColor: colors.accentGlow,
  },
  orbBottom: {
    width: 220,
    height: 220,
    bottom: 120,
    left: -80,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
});
