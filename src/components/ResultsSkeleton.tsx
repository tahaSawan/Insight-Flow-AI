import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/Card';
import { SkeletonBar } from '@/components/SkeletonBar';
import { spacing } from '@/constants/designTokens';

export function ResultsSkeleton() {
  return (
    <View style={styles.wrap}>
      <Card entranceIndex={0} style={styles.block}>
        <SkeletonBar width="40%" />
        <SkeletonBar width="95%" />
        <SkeletonBar width="80%" />
      </Card>
      <Card variant="alert" entranceIndex={1} style={styles.block}>
        <SkeletonBar width="35%" />
        <SkeletonBar width="100%" />
        <SkeletonBar width="70%" />
      </Card>
      <Card entranceIndex={2} style={styles.block}>
        <SkeletonBar width="50%" />
        <SkeletonBar width="90%" />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md, paddingVertical: spacing.sm },
  block: { gap: spacing.sm, marginBottom: 0 },
});
