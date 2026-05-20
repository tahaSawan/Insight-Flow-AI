import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { pressSpring } from '@/utils/microAnimations';

export function usePressScale(pressedScale = 0.97, disabled = false) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    if (disabled) return;
    scale.value = withSpring(pressedScale, pressSpring);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, pressSpring);
  };

  return { animatedStyle, onPressIn, onPressOut };
}
