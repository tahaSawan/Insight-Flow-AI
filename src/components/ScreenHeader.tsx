import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { Typography } from '@/components/Typography';
import { colors, spacing, radius } from '@/constants/designTokens';
import { textBlock } from '@/constants/typography';

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
          <Typography variant="badgeText" style={styles.brandName}>
            InsightFlow
          </Typography>
        </View>
      ) : null}
      {badge ? (
        <View style={styles.badge}>
          <Typography variant="badgeText">{badge}</Typography>
        </View>
      ) : null}
      <Typography variant="screenTitle" style={styles.title}>
        {title}
      </Typography>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentLine}
      />
      {subtitle ? (
        <Typography variant="screenSubtitle" style={styles.subtitle}>
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
    marginBottom: textBlock.sm,
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
    letterSpacing: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginBottom: textBlock.sm,
  },
  title: {
    marginBottom: textBlock.sm,
  },
  accentLine: {
    width: 48,
    height: 3,
    borderRadius: 2,
    marginBottom: textBlock.sm,
  },
  subtitle: {
    maxWidth: '95%',
  },
});
