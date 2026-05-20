import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { entranceDelay } from '@/utils/microAnimations';

interface AnimatedEntranceProps {
  children: React.ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function AnimatedEntrance({
  children,
  index = 0,
  style,
  disabled = false,
}: AnimatedEntranceProps) {
  if (disabled) {
    return <>{children}</>;
  }

  const entering = FadeInDown.duration(360)
    .delay(entranceDelay(index))
    .springify()
    .damping(22)
    .stiffness(320);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
