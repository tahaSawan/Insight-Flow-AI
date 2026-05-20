import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/Typography';
import { colors, spacing, fontSize } from '@/constants/designTokens';

interface SectionHeaderProps {
  title: string;
  hint?: string;
}

export function SectionHeader({ title, hint }: SectionHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Typography variant="h3" style={styles.title}>
        {title}
      </Typography>
      {hint ? (
        <Typography variant="caption" style={styles.hint}>
          {hint}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.subheading,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  hint: {
    color: colors.textMuted,
    fontSize: fontSize.caption,
    lineHeight: 18,
  },
});
