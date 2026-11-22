import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withDelay,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';
import { SOUND_PULSES, EASE_IO, BRAND } from '../animation-config';

interface Props {
  size?: number;
  color?: string;
  active?: boolean;
}

export function MegaphoneIcon({ size = 36, color = BRAND.navy, active = false }: Props) {
  const op0 = useSharedValue<number>(1);
  const op1 = useSharedValue<number>(0.65);
  const op2 = useSharedValue<number>(0.35);

  useEffect(() => {
    if (!active) {
      cancelAnimation(op0);
      cancelAnimation(op1);
      cancelAnimation(op2);
      op0.value = 1; op1.value = 0.65; op2.value = 0.35;
      return;
    }
    op0.value = withRepeat(withTiming(0.25, { duration: SOUND_PULSES.durations[0], easing: EASE_IO }), -1, true);
    op1.value = withDelay(SOUND_PULSES.durations[0] / 2,
      withRepeat(withTiming(0.15, { duration: SOUND_PULSES.durations[1], easing: EASE_IO }), -1, true));
    op2.value = withDelay(SOUND_PULSES.durations[1] / 2,
      withRepeat(withTiming(0.08, { duration: SOUND_PULSES.durations[2], easing: EASE_IO }), -1, true));

    return () => { cancelAnimation(op0); cancelAnimation(op1); cancelAnimation(op2); };
  }, [active]);

  const wave0Style = useAnimatedStyle(() => ({ opacity: op0.value }));
  const wave1Style = useAnimatedStyle(() => ({ opacity: op1.value }));
  const wave2Style = useAnimatedStyle(() => ({ opacity: op2.value }));

  return (
    <View
      style={{ width: size, height: size, position: 'relative' }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size} viewBox="0 0 36 36" style={StyleSheet.absoluteFill}>
        <Path d="M8,10 L8,26 L26,32 L26,4 Z" fill={color} />
        <Rect x="2" y="15" width="7" height="7" rx="2" fill={color} opacity={0.75} />
      </Svg>

      <Animated.View style={[StyleSheet.absoluteFill, wave0Style]}>
        <Svg width={size} height={size} viewBox="0 0 36 36">
          <Path d="M28,14 Q33,18 28,22" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </Svg>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, wave1Style]}>
        <Svg width={size} height={size} viewBox="0 0 36 36">
          <Path d="M29,11 Q35,18 29,25" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </Svg>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, wave2Style]}>
        <Svg width={size} height={size} viewBox="0 0 36 36">
          <Path d="M31,8 Q35,18 31,28" stroke={color} strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}
