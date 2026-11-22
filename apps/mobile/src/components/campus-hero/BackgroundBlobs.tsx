import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withDelay,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Ellipse } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';
import { BLOB_BREATHE, BRAND, EASE_IO } from './animation-config';

interface Props {
  size: number;
  active: boolean;
  reducedMotion: boolean;
  entranceDelay?: number;
}

export function BackgroundBlobs({ size, active, reducedMotion, entranceDelay = 0 }: Props) {
  const opacity = useSharedValue<number>(0);
  const scaleA  = useSharedValue<number>(0.85);
  const scaleB  = useSharedValue<number>(0.85);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 1; scaleA.value = 1; scaleB.value = 1;
      return;
    }
    opacity.value = withDelay(entranceDelay, withTiming(1, { duration: 480 }));
    scaleA.value  = withDelay(entranceDelay, withTiming(1, { duration: 500, easing: EASE_IO }));
    scaleB.value  = withDelay(entranceDelay + 180, withTiming(1, { duration: 500, easing: EASE_IO }));
  }, []);

  useEffect(() => {
    if (reducedMotion || !active) {
      cancelAnimation(scaleA);
      cancelAnimation(scaleB);
      return;
    }
    scaleA.value = withRepeat(
      withTiming(1.04, { duration: BLOB_BREATHE.duration, easing: EASE_IO }), -1, true
    );
    scaleB.value = withDelay(
      BLOB_BREATHE.duration / 2,
      withRepeat(withTiming(1.03, { duration: BLOB_BREATHE.duration + 1200, easing: EASE_IO }), -1, true)
    );
    return () => { cancelAnimation(scaleA); cancelAnimation(scaleB); };
  }, [active, reducedMotion]);

  const outerStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scaleA.value }] }));
  const innerStyle = useAnimatedStyle(() => ({ transform: [{ scale: scaleB.value }] }));

  const blobW = size * 0.74;
  const blobH = size * 0.44;

  return (
    <View style={s.centerContainer} pointerEvents="none">
      <Animated.View style={[s.blobCenter, outerStyle]}>
        <Svg width={blobW} height={blobH} viewBox="0 0 280 160">
          <Ellipse cx="140" cy="80" rx="136" ry="76" fill={BRAND.blobA} opacity={0.65} />
        </Svg>
      </Animated.View>
      <Animated.View style={[s.blobCenter, innerStyle]}>
        <Svg width={blobW * 0.86} height={blobH * 0.84} viewBox="0 0 240 130">
          <Ellipse cx="120" cy="65" rx="116" ry="60" fill={BRAND.blobB} opacity={0.85} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  centerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blobCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
