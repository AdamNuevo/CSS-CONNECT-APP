import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withDelay,
  withTiming,
  cancelAnimation,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { BARS, EASE_IO, BRAND } from '../animation-config';

const BASES = [10, 16, 24] as const;

interface Props {
  size?: number;
  color?: string;
  active?: boolean;
}

export function BarChartIcon({ size = 36, color = BRAND.navy, active = false }: Props) {
  const h0 = useSharedValue<number>(BASES[0]);
  const h1 = useSharedValue<number>(BASES[1]);
  const h2 = useSharedValue<number>(BASES[2]);

  useEffect(() => {
    if (!active) {
      cancelAnimation(h0); cancelAnimation(h1); cancelAnimation(h2);
      h0.value = BASES[0]; h1.value = BASES[1]; h2.value = BASES[2];
      return;
    }

    const startBar = (sv: SharedValue<number>, base: number, idx: number) => {
      const delta = base * BARS.amplitude;
      sv.value = withDelay(
        BARS.durations[idx] / 3,
        withRepeat(withTiming(base + delta, { duration: BARS.durations[idx], easing: EASE_IO }), -1, true)
      );
    };

    startBar(h0, BASES[0], 0);
    startBar(h1, BASES[1], 1);
    startBar(h2, BASES[2], 2);

    return () => { cancelAnimation(h0); cancelAnimation(h1); cancelAnimation(h2); };
  }, [active]);

  const b0Style = useAnimatedStyle(() => ({ height: (h0.value / 36) * size }));
  const b1Style = useAnimatedStyle(() => ({ height: (h1.value / 36) * size }));
  const b2Style = useAnimatedStyle(() => ({ height: (h2.value / 36) * size }));

  const scale = size / 36;

  return (
    <View
      style={{ width: size, height: size, position: 'relative' }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size} viewBox="0 0 36 36" style={StyleSheet.absoluteFill}>
        <Line x1="2" y1="32" x2="34" y2="32" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </Svg>

      <View style={[s.barTrack, { bottom: 4 * scale, left: 0, width: size }]}>
        <Animated.View style={[s.bar, { left: 4 * scale, width: 7 * scale, backgroundColor: color }, b0Style]} />
        <Animated.View style={[s.bar, { left: 14 * scale, width: 7 * scale, backgroundColor: color }, b1Style]} />
        <Animated.View style={[s.bar, { left: 24 * scale, width: 7 * scale, backgroundColor: color }, b2Style]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  barTrack: {
    position: 'absolute',
    height: 28,
  },
  bar: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 1.5,
  },
});
