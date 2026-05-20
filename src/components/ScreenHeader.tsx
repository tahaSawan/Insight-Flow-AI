import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/Typography';
import { colors, spacing, fontSize } from '@/constants/designTokens';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export function ScreenHeader({ title, subtitle, badge }: ScreenHeaderProps) {
  return (
    <View style={styles.wrap}>
      {badge ? (
        <View style={styles.badge}>
          <Typography style={styles.badgeText}>{badge}</Typography>
        </View>
      ) : null}
      <Typography variant="h1" style={styles.title}>
        {title}
      </Typography>
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
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
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
    lineHeight: 34,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
    lineHeight: 22,
  },
});
