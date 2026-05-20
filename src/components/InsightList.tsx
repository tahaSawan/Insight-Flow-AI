import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/Typography';
import type { AnalysisResult } from '@/types/analysis';
import { colors } from '@/constants/designTokens';

type InsightType = 'finding' | 'risk' | 'action';

interface InsightListProps {
  items: string[];
  type: InsightType;
  bulletStyle: object;
  titleColor: string;
  documentText: string;
  analysis: AnalysisResult;
}

export function InsightList({
  items,
  type: _type,
  bulletStyle,
  titleColor,
  documentText: _documentText,
  analysis: _analysis,
}: InsightListProps) {
  return (
    <View>
      {items.map((item, index) => (
        <View key={`item-${index}`} style={[styles.listItem, { borderColor: titleColor + '22' }]}>
          <View style={[styles.bullet, bulletStyle]} />
          <View style={styles.body}>
            <Typography style={styles.listText}>{item}</Typography>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    marginBottom: 12,
    fontSize: 11,
    fontStyle: 'italic',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: colors.surfaceInactive,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 6,
  },
  body: {
    flex: 1,
  },
  listText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
