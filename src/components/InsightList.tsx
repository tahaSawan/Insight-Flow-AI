import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Typography } from '@/components/Typography';
import { explainInsight } from '@/services/gemini';
import { UI } from '@/constants/plainLanguage';
import type { AnalysisResult } from '@/types/analysis';

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
  type,
  bulletStyle,
  titleColor,
  documentText,
  analysis,
}: InsightListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const handleTap = async (index: number, text: string) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
      return;
    }

    setExpandedIndex(index);

    if (explanations[index]) return;

    setLoadingIndex(index);
    try {
      const explanation = await explainInsight(documentText, analysis, text, type);
      setExplanations((prev) => ({ ...prev, [index]: explanation }));
    } catch {
      setExplanations((prev) => ({
        ...prev,
        [index]: UI.followUp.explainFail,
      }));
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <View>
      {items.map((item, index) => (
        <Pressable key={`${type}-${index}`} onPress={() => handleTap(index, item)}>
          <View style={[styles.listItem, expandedIndex === index && styles.listItemExpanded]}>
            <View style={[styles.bullet, bulletStyle]} />
            <View style={styles.body}>
              <Typography style={styles.listText}>{item}</Typography>
              {expandedIndex === index ? (
                <View style={styles.explainBox}>
                  {loadingIndex === index ? (
                    <ActivityIndicator size="small" color="#818CF8" />
                  ) : (
                    <Typography style={styles.explainText}>
                      {explanations[index] || 'Loading...'}
                    </Typography>
                  )}
                </View>
              ) : null}
            </View>
          </View>
        </Pressable>
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
    borderColor: 'transparent',
  },
  listItemExpanded: {
    backgroundColor: '#1A1A24',
    borderColor: '#2D2D44',
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
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
  },
  explainBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2D2D44',
  },
  explainText: {
    color: '#A5B4FC',
    fontSize: 13,
    lineHeight: 20,
  },
});
