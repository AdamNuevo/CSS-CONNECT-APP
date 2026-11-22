import React, { useEffect, useState } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withTiming,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { SPRING_CARD, EASE_IO, BRAND } from './animation-config';

export interface FloatConfig {
  readonly duration: number;
  readonly yAmp: number;
  readonly xAmp: number;
  readonly rotDeg: number;
  readonly phase: number;
}

interface Props {
  children: React.ReactNode;
  cardSize: number;
  startOffsetX: number;
  startOffsetY: number;
  delay: number;
  floatConfig: FloatConfig;
  active: boolean;
  reducedMotion: boolean;
  style?: ViewStyle;
}

export function FloatingCard({
  children, cardSize, startOffsetX, startOffsetY,
  delay, floatConfig, active, reducedMotion, style,
}: Props) {
  const [entranceDone, setEntranceDone] = useState(false);

  const translateX = useSharedValue(reducedMotion ? 0 : startOffsetX);
  const translateY = useSharedValue(reducedMotion ? 0 : startOffsetY);
  const opacity    = useSharedValue(reducedMotion ? 1 : 0);
  const rotate     = useSharedValue(0);

  // Entrance — plays once on mount with a pop and slight overshoot
  useEffect(() => {
    if (reducedMotion) { setEntranceDone(true); return; }

    opacity.value = withDelay(delay, withTiming(1, { duration: 280 }));
    translateX.value = withDelay(delay, withSpring(0, SPRING_CARD));
    translateY.value = withDelay(delay, withSpring(0, SPRING_CARD, (finished) => {
      'worklet';
      if (finished) runOnJS(setEntranceDone)(true);
    }));
  }, []);

  // Idle float — starts after entrance, pauses when screen is unfocused
  useEffect(() => {
    if (!entranceDone) return;

    if (!active || reducedMotion) {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(rotate);
      translateX.value = withTiming(0, { duration: 400 });
      translateY.value = withTiming(0, { duration: 400 });
      rotate.value     = withTiming(0, { duration: 400 });
      return;
    }

    const { duration, yAmp, xAmp, rotDeg, phase } = floatConfig;

    // Phase offsets shift when each card's cycle starts, keeping them out of sync
    translateY.value = withDelay(phase,
      withRepeat(withTiming(-yAmp, { duration, easing: EASE_IO }), -1, true));
    translateX.value = withDelay(phase + 300,
      withRepeat(withTiming(xAmp, { duration: duration + 500, easing: EASE_IO }), -1, true));
    rotate.value = withDelay(phase + 150,
      withRepeat(withTiming(rotDeg, { duration: duration + 200, easing: EASE_IO }), -1, true));

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(rotate);
    };
  }, [active, entranceDone, reducedMotion]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[s.card, { width: cardSize, height: cardSize }, style, animStyle]}>
      {children}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    position: 'absolute',
    borderRadius: 14,
    backgroundColor: BRAND.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});
