import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { Typography } from '@/components/Typography';
import { colors, spacing, fontSize, radius } from '@/constants/designTokens';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  showBrand?: boolean;
}

export function ScreenHeader({ title, subtitle, badge, showBrand = false }: ScreenHeaderProps) {
  return (
    <View style={styles.wrap}>
      {showBrand ? (
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Sparkles size={14} color={colors.accentText} />
          </View>
          <Typography variant="label" style={styles.brandName}>
            InsightFlow
          </Typography>
        </View>
      ) : null}
      {badge ? (
        <View style={styles.badge}>
          <Typography style={styles.badgeText}>{badge}</Typography>
        </View>
      ) : null}
      <Typography variant="h1" style={styles.title}>
        {title}
      </Typography>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentLine}
      />
      {subtitle ? (
        <Typography variant="body" style={styles.subtitle}>
          {subtitle}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: colors.accentText,
    letterSpacing: 1.2,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  badgeText: {
    color: colors.accentText,
    fontSize: fontSize.label,
    fontWeight: '700',
  },
  title: {
    fontSize: fontSize.title,
    marginBottom: spacing.sm,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  accentLine: {
    width: 48,
    height: 3,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
    lineHeight: 22,
    maxWidth: '95%',
  },
});
