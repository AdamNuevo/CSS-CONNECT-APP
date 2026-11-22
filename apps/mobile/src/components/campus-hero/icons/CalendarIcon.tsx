import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { EASE_IO, BRAND } from '../animation-config';

interface Props {
  size?: number;
  color?: string;
  active?: boolean;
}

export function CalendarIcon({ size = 36, color = BRAND.navy, active = false }: Props) {
  const activeCell = useSharedValue<number>(0);

  useEffect(() => {
    if (!active) {
      cancelAnimation(activeCell);
      activeCell.value = 0;
      return;
    }
    // Cycles from cell 0 -> 1 -> 2 every 2.4s to highlight active date
    activeCell.value = withRepeat(
      withTiming(2, { duration: 2400, easing: EASE_IO }),
      -1,
      true
    );
    return () => cancelAnimation(activeCell);
  }, [active]);

  const c0Style = useAnimatedStyle(() => ({
    opacity: activeCell.value < 0.8 ? 0.6 : 0.15,
  }));
  const c1Style = useAnimatedStyle(() => ({
    opacity: activeCell.value >= 0.8 && activeCell.value < 1.5 ? 0.6 : 0.15,
  }));
  const c2Style = useAnimatedStyle(() => ({
    opacity: activeCell.value >= 1.5 ? 0.6 : 0.15,
  }));

  const scale = size / 36;

  return (
    <View
      style={{ width: size, height: size, position: 'relative' }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size} viewBox="0 0 36 36" style={StyleSheet.absoluteFill}>
        {/* White body */}
        <Rect x="2" y="6" width="32" height="28" rx="3" fill="white" stroke={color} strokeWidth="1.5" />

        {/* Navy header band */}
        <Rect x="2" y="6" width="32" height="12" rx="3" fill={color} />
        <Rect x="2" y="13" width="32" height="5" fill={color} />

        {/* Clip rings on top */}
        <Rect x="10" y="3" width="4" height="7" rx="2" fill={color} />
        <Rect x="22" y="3" width="4" height="7" rx="2" fill={color} />

        {/* Bottom row cells stay subtle */}
        <Rect x="4"  y="28" width="8" height="5" rx="1" fill={color} opacity={0.15} />
        <Rect x="14" y="28" width="8" height="5" rx="1" fill={color} opacity={0.15} />
        <Rect x="24" y="28" width="8" height="5" rx="1" fill={color} opacity={0.15} />
      </Svg>

      {/* Top row cells with animated highlight */}
      <Animated.View style={[s.cell, { left: 4 * scale, top: 21 * scale, width: 8 * scale, height: 5 * scale, backgroundColor: color }, c0Style]} />
      <Animated.View style={[s.cell, { left: 14 * scale, top: 21 * scale, width: 8 * scale, height: 5 * scale, backgroundColor: color }, c1Style]} />
      <Animated.View style={[s.cell, { left: 24 * scale, top: 21 * scale, width: 8 * scale, height: 5 * scale, backgroundColor: color }, c2Style]} />
    </View>
  );
}

const s = StyleSheet.create({
  cell: {
    position: 'absolute',
    borderRadius: 1,
  },
});
