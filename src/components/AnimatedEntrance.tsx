import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppContext } from '@/context/AppContext';
import { entranceDelay, entranceDurationMs } from '@/utils/microAnimations';

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
  const { demoMode } = useAppContext();

  if (disabled) {
    return <>{children}</>;
  }

  const entering = FadeInDown.duration(entranceDurationMs(demoMode))
    .delay(entranceDelay(index, 48, 280, demoMode))
    .springify()
    .damping(demoMode ? 24 : 22)
    .stiffness(demoMode ? 380 : 320);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
