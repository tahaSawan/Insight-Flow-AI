import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/Card';
import { SkeletonBar } from '@/components/SkeletonBar';
import { spacing } from '@/constants/designTokens';

export function AnalysisSkeleton() {
  return (
    <View style={styles.wrap}>
      <Card entranceIndex={0} style={styles.block}>
        <SkeletonBar width="55%" height={14} />
        <SkeletonBar width="100%" />
        <SkeletonBar width="88%" />
      </Card>
      <Card entranceIndex={1} style={styles.block}>
        <SkeletonBar width="40%" height={10} />
        <SkeletonBar width="100%" height={48} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  block: { gap: spacing.sm, marginBottom: spacing.sm },
});
