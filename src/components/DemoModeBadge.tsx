import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { Typography } from '@/components/Typography';
import { useAppContext } from '@/context/AppContext';
import { UI } from '@/constants/plainLanguage';
import { colors, spacing, radius } from '@/constants/designTokens';

/** Visible indicator during live hackathon demos. */
export function DemoModeBadge() {
  const { demoMode } = useAppContext();
  if (!demoMode) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.badge}>
        <Sparkles size={12} color={colors.accent} />
        <Typography variant="label" style={styles.text}>
          {UI.demo.badgeLabel}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.lg,
    zIndex: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  text: {
    color: colors.accentText,
    fontSize: 10,
    letterSpacing: 0.8,
  },
});
