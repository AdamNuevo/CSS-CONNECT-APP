import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withDelay,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { SPARKS_CFG, BRAND, EASE_IO } from './animation-config';

interface Props {
  size: number;
  active: boolean;
  reducedMotion: boolean;
}

export function PhoneMock({ size, active, reducedMotion }: Props) {
  const ph = size * 0.49;
  const pw = size * 0.285;

  const sp0 = useSharedValue<number>(0.3);
  const sp1 = useSharedValue<number>(0.6);
  const sp2 = useSharedValue<number>(0.2);

  useEffect(() => {
    if (reducedMotion || !active) {
      cancelAnimation(sp0); cancelAnimation(sp1); cancelAnimation(sp2);
      sp0.value = 0.3; sp1.value = 0.6; sp2.value = 0.2;
      return;
    }
    sp0.value = withRepeat(withTiming(1, { duration: SPARKS_CFG.durations[0], easing: EASE_IO }), -1, true);
    sp1.value = withDelay(SPARKS_CFG.durations[0] / 2,
      withRepeat(withTiming(0.2, { duration: SPARKS_CFG.durations[1], easing: EASE_IO }), -1, true));
    sp2.value = withDelay(SPARKS_CFG.durations[2] / 3,
      withRepeat(withTiming(0.9, { duration: SPARKS_CFG.durations[2], easing: EASE_IO }), -1, true));

    return () => { cancelAnimation(sp0); cancelAnimation(sp1); cancelAnimation(sp2); };
  }, [active, reducedMotion]);

  const spark0Style = useAnimatedStyle(() => ({ opacity: sp0.value }));
  const spark1Style = useAnimatedStyle(() => ({ opacity: sp1.value }));
  const spark2Style = useAnimatedStyle(() => ({ opacity: sp2.value }));

  const logoSz = pw * 0.38;
  const topOffset = ph * 0.08;

  return (
    <View style={{ width: pw, height: ph, position: 'relative' }}>
      <Svg width={pw} height={ph} style={StyleSheet.absoluteFill}>
        <Rect x="0" y="0" width={pw} height={ph} rx={pw * 0.12} fill={BRAND.navy} />
        <Rect x={pw * 0.06} y={pw * 0.14} width={pw * 0.88} height={ph - pw * 0.28} rx={pw * 0.06} fill={BRAND.screen} />
      </Svg>

      <View style={[s.screen, { top: pw * 0.14, left: pw * 0.06, width: pw * 0.88, height: ph - pw * 0.28, borderRadius: pw * 0.06 }]}>
        <Image
          source={require('../../../assets/images/qcu-logo.png')}
          style={{ width: logoSz, height: logoSz, marginTop: topOffset }}
          resizeMode="contain"
          accessibilityElementsHidden
        />
        <Text style={[s.label, { fontSize: pw * 0.14 }]}>CCS Hub</Text>
      </View>

      {/* Spark / tick lines near the top of the phone */}
      <View style={{ position: 'absolute', top: -ph * 0.04, left: 0, width: pw, height: ph * 0.26 }} pointerEvents="none">
        <Animated.View style={[StyleSheet.absoluteFill, spark0Style]}>
          <Svg width={pw} height={ph * 0.26}>
            <Line x1={pw * 0.74} y1="6" x2={pw * 0.82} y2="1" stroke={BRAND.spark} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFill, spark1Style]}>
          <Svg width={pw} height={ph * 0.26}>
            <Line x1={pw * 0.86} y1="12" x2={pw * 0.94} y2="6" stroke={BRAND.spark} strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFill, spark2Style]}>
          <Svg width={pw} height={ph * 0.26}>
            <Line x1={pw * 0.92} y1="20" x2={pw * 1.0}  y2="15" stroke={BRAND.spark} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  label: {
    color: BRAND.navy,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.3,
  },
});
