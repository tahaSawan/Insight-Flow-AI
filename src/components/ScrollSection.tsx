import React from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import type { ResultsSectionId } from '@/components/ResultsJumpNav';

interface ScrollSectionProps {
  sectionId: ResultsSectionId;
  onMeasure: (id: ResultsSectionId, y: number) => void;
  children: React.ReactNode;
}

/** Wraps a Results block so jump-nav can scrollTo the right offset. */
export function ScrollSection({ sectionId, onMeasure, children }: ScrollSectionProps) {
  return (
    <View
      onLayout={(e: LayoutChangeEvent) => {
        onMeasure(sectionId, e.nativeEvent.layout.y);
      }}
    >
      {children}
    </View>
  );
}
