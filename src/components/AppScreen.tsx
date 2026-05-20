import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { DemoModeBadge } from '@/components/DemoModeBadge';
import { colors } from '@/constants/designTokens';

interface AppScreenProps {
  children: React.ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
}

/** Full-screen shell with ops-dashboard atmosphere. */
export function AppScreen({ children, edges = ['top', 'left', 'right'], style }: AppScreenProps) {
  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={[colors.bgElevated, colors.bg, colors.bg]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={[styles.orb, styles.orbTop]} pointerEvents="none" />
      <View style={[styles.orb, styles.orbBottom]} pointerEvents="none" />
      <SafeAreaView style={styles.safe} edges={edges}>
        <DemoModeBadge />
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
    opacity: 0.5,
  },
  orbTop: {
    width: 260,
    height: 260,
    top: -90,
    right: -50,
    backgroundColor: colors.accentGlow,
  },
  orbBottom: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -70,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
});
