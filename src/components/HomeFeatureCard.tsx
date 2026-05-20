import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/Typography';
import { colors, radius, spacing } from '@/constants/designTokens';

interface HomeFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  tint: 'cyan' | 'amber' | 'emerald';
}

const TINTS = {
  cyan: { border: colors.borderAccent, bg: colors.accentSoft },
  amber: { border: 'rgba(245, 158, 11, 0.35)', bg: colors.warningSoft },
  emerald: { border: 'rgba(16, 185, 129, 0.35)', bg: colors.accentSecondarySoft },
} as const;

export function HomeFeatureCard({ icon, title, tint }: HomeFeatureCardProps) {
  const palette = TINTS[tint];
  return (
    <View style={[styles.card, { borderColor: palette.border, backgroundColor: palette.bg }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceHighlight }]}>{icon}</View>
      <Typography style={styles.title} numberOfLines={2}>
        {title}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
});
