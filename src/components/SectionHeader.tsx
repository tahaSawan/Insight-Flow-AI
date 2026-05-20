import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/Typography';
import { spacing } from '@/constants/designTokens';
import { textBlock } from '@/constants/typography';

interface SectionHeaderProps {
  title: string;
  hint?: string;
}

export function SectionHeader({ title, hint }: SectionHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Typography variant="sectionTitle">{title}</Typography>
      {hint ? (
        <Typography variant="sectionHint" style={styles.hint}>
          {hint}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
    gap: textBlock.xs,
  },
  hint: {
    marginTop: 0,
  },
});
