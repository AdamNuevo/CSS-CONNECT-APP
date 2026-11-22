import React, { useEffect, useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  cancelAnimation,
  useReducedMotion,
  runOnJS,
} from 'react-native-reanimated';
import { NavigationContext } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { BackgroundBlobs } from './BackgroundBlobs';
import { PhoneMock } from './PhoneMock';
import { FloatingCard } from './FloatingCard';
import { GradCapIcon } from './icons/GradCapIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { BarChartIcon } from './icons/BarChartIcon';
import {
  SPRING_PHONE,
  FLOAT_PHONE,
  FLOAT_CARDS,
  CARD_STAGGER_MS,
  TAP_SPRING,
  EASE_IO,
  BRAND,
} from './animation-config';

interface CampusHeroProps {
  size?: number;
  autoPlay?: boolean;
  style?: StyleProp<ViewStyle>;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function useSafeIsFocused(): boolean {
  const navigation = React.useContext(NavigationContext);
  const [isFocused, setIsFocused] = React.useState<boolean>(() =>
    navigation ? navigation.isFocused() : true
  );

  React.useEffect(() => {
    if (!navigation) return;

    const unsubFocus = navigation.addListener('focus', () => setIsFocused(true));
    const unsubBlur = navigation.addListener('blur', () => setIsFocused(false));

    return () => {
      unsubFocus();
      unsubBlur();
    };
  }, [navigation]);

  return isFocused;
}

export function CampusHero({ size = SCREEN_WIDTH, autoPlay = true, style }: CampusHeroProps) {
  const isFocused = useSafeIsFocused();
  const prefersReducedMotion = useReducedMotion();
  const reduced = Boolean(prefersReducedMotion);
  const active = autoPlay && isFocused && !reduced;

  const canvasH = size * 0.72;
  const cardSize = size * 0.165;
  const iconSize = cardSize * 0.58;

  const [entranceDone, setEntranceDone] = useState(false);

  const phoneY = useSharedValue<number>(reduced ? 0 : 24);
  const phoneOpacity = useSharedValue<number>(reduced ? 1 : 0);
  const phoneRot = useSharedValue<number>(FLOAT_PHONE.baseTilt);
  const phoneScale = useSharedValue<number>(1);

  useEffect(() => {
    if (reduced) {
      setEntranceDone(true);
      return;
    }

    phoneOpacity.value = withTiming(1, { duration: 320 });
    phoneY.value = withSpring(0, SPRING_PHONE, (finished) => {
      'worklet';
      if (finished) runOnJS(setEntranceDone)(true);
    });
  }, []);

  useEffect(() => {
    if (!entranceDone) return;

    if (!active) {
      cancelAnimation(phoneY);
      cancelAnimation(phoneRot);
      phoneY.value = withTiming(0, { duration: 350 });
      phoneRot.value = withTiming(FLOAT_PHONE.baseTilt, { duration: 350 });
      return;
    }

    phoneY.value = withRepeat(
      withTiming(-FLOAT_PHONE.yAmplitude, { duration: FLOAT_PHONE.duration, easing: EASE_IO }),
      -1,
      true
    );
    phoneRot.value = withRepeat(
      withTiming(FLOAT_PHONE.baseTilt + FLOAT_PHONE.rotDeg, {
        duration: FLOAT_PHONE.duration * 1.15,
        easing: EASE_IO,
      }),
      -1,
      true
    );

    return () => {
      cancelAnimation(phoneY);
      cancelAnimation(phoneRot);
    };
  }, [active, entranceDone]);

  const handlePhonePress = () => {
    if (reduced) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    phoneScale.value = withSpring(0.96, TAP_SPRING, (fin) => {
      'worklet';
      if (fin) phoneScale.value = withSpring(1, TAP_SPRING);
    });
  };

  const phoneAnimStyle = useAnimatedStyle(() => ({
    opacity: phoneOpacity.value,
    transform: [
      { translateY: phoneY.value },
      { rotate: `${phoneRot.value}deg` },
      { scale: phoneScale.value },
    ],
  }));

  const centerX = (size - cardSize) / 2;
  const centerY = (canvasH - cardSize) / 2;

  const capPos = { top: canvasH * 0.08, left: size * 0.08 };
  const calPos = { top: canvasH * 0.12, right: size * 0.08 };
  const megaPos = { bottom: canvasH * 0.08, left: size * 0.06 };
  const chartPos = { bottom: canvasH * 0.1, right: size * 0.08 };

  const capOffsetX = centerX - capPos.left;
  const capOffsetY = centerY - capPos.top;

  const calOffsetX = centerX - (size - calPos.right - cardSize);
  const calOffsetY = centerY - calPos.top;

  const megaOffsetX = centerX - megaPos.left;
  const megaOffsetY = centerY - (canvasH - megaPos.bottom - cardSize);

  const chartOffsetX = centerX - (size - chartPos.right - cardSize);
  const chartOffsetY = centerY - (canvasH - chartPos.bottom - cardSize);

  return (
    <View
      style={[{ width: size, height: canvasH, alignItems: 'center', justifyContent: 'center' }, style]}
      accessible
      accessibilityLabel="CCS Hub illustration"
    >
      <View
        style={StyleSheet.absoluteFill}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <BackgroundBlobs size={size} active={active} reducedMotion={reduced} />

        <FloatingCard
          cardSize={cardSize}
          startOffsetX={capOffsetX}
          startOffsetY={capOffsetY}
          delay={CARD_STAGGER_MS}
          floatConfig={FLOAT_CARDS[0]}
          active={active}
          reducedMotion={reduced}
          style={capPos}
        >
          <GradCapIcon size={iconSize} color={BRAND.navy} />
        </FloatingCard>

        <FloatingCard
          cardSize={cardSize}
          startOffsetX={calOffsetX}
          startOffsetY={calOffsetY}
          delay={CARD_STAGGER_MS * 2}
          floatConfig={FLOAT_CARDS[1]}
          active={active}
          reducedMotion={reduced}
          style={calPos}
        >
          <CalendarIcon size={iconSize} color={BRAND.navy} active={active} />
        </FloatingCard>

        <FloatingCard
          cardSize={cardSize}
          startOffsetX={megaOffsetX}
          startOffsetY={megaOffsetY}
          delay={CARD_STAGGER_MS * 3}
          floatConfig={FLOAT_CARDS[2]}
          active={active}
          reducedMotion={reduced}
          style={megaPos}
        >
          <MegaphoneIcon size={iconSize} color={BRAND.navy} active={active} />
        </FloatingCard>

        <FloatingCard
          cardSize={cardSize}
          startOffsetX={chartOffsetX}
          startOffsetY={chartOffsetY}
          delay={CARD_STAGGER_MS * 4}
          floatConfig={FLOAT_CARDS[3]}
          active={active}
          reducedMotion={reduced}
          style={chartPos}
        >
          <BarChartIcon size={iconSize} color={BRAND.navy} active={active} />
        </FloatingCard>

        <View style={s.phoneCenterContainer} pointerEvents="box-none">
          <Animated.View style={phoneAnimStyle}>
            <Pressable onPress={handlePhonePress}>
              <PhoneMock size={size} active={active} reducedMotion={reduced} />
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  phoneCenterContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
