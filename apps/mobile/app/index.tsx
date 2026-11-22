import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../src/context/AuthContext';
import { CampusHero } from '../src/components/campus-hero';

const { width: W } = Dimensions.get('window');

const NAVY = '#1A2E5A';
const BLUE = '#1E3A8A';
const ICON_BLUE = '#2563EB';

const FEATURES = [
  { icon: 'stats-chart' as const, label: 'Track your academic progress.' },
  { icon: 'calendar' as const, label: 'Manage your class schedule.' },
  { icon: 'notifications' as const, label: 'Stay updated with announcements.' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading, mustChangePassword } = useAuth();

  const bannerAnim = useRef(new Animated.Value(-60)).current;
  const bannerOpac = useRef(new Animated.Value(0)).current;

  const titleAnim = useRef(new Animated.Value(20)).current;
  const titleOpac = useRef(new Animated.Value(0)).current;

  const feat1Anim = useRef(new Animated.Value(24)).current;
  const feat1Opac = useRef(new Animated.Value(0)).current;
  const feat2Anim = useRef(new Animated.Value(24)).current;
  const feat2Opac = useRef(new Animated.Value(0)).current;
  const feat3Anim = useRef(new Animated.Value(24)).current;
  const feat3Opac = useRef(new Animated.Value(0)).current;

  const btnAnim = useRef(new Animated.Value(24)).current;
  const btnOpac = useRef(new Animated.Value(0)).current;

  const featAnims = [
    { y: feat1Anim, op: feat1Opac },
    { y: feat2Anim, op: feat2Opac },
    { y: feat3Anim, op: feat3Opac },
  ];

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      router.replace(mustChangePassword ? '/(auth)/set-password' : '/(tabs)');
    }
  }, [isAuthenticated, isLoading, mustChangePassword, router]);

  useEffect(() => {
    const dur = (ms: number) => ({ duration: ms, useNativeDriver: true });

    Animated.sequence([
      Animated.parallel([
        Animated.spring(bannerAnim, { toValue: 0, tension: 55, friction: 8, useNativeDriver: true }),
        Animated.timing(bannerOpac, { toValue: 1, ...dur(380) }),
      ]),
      Animated.parallel([
        Animated.timing(titleAnim, { toValue: 0, ...dur(320) }),
        Animated.timing(titleOpac, { toValue: 1, ...dur(320) }),
      ]),
      Animated.stagger(
        90,
        featAnims.map(({ y, op }) =>
          Animated.parallel([
            Animated.timing(y, { toValue: 0, ...dur(280) }),
            Animated.timing(op, { toValue: 1, ...dur(280) }),
          ])
        )
      ),
      Animated.parallel([
        Animated.timing(btnAnim, { toValue: 0, ...dur(280) }),
        Animated.timing(btnOpac, { toValue: 1, ...dur(280) }),
      ]),
    ]).start();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingRoot}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingLogoRing}>
          <Image
            source={require('../assets/QCU_Logo_2019.png')}
            style={styles.loadingLogoImg}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.loadingTitle}>CCS Hub</Text>
        <ActivityIndicator color="#ffffff80" style={{ marginTop: 28 }} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  const TOP_PAD = Math.max(insets.top, 36);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ScrollView wraps everything so the banner scrolls naturally with the page */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: Math.max(insets.bottom, 24) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── NAVY BANNER WITH SVG CURVED WAVE ── */}
        <Animated.View
          style={[
            styles.banner,
            { paddingTop: TOP_PAD + 12 },
            { opacity: bannerOpac, transform: [{ translateY: bannerAnim }] },
          ]}
        >
          {/* Logo circle */}
          <View style={styles.logoRing}>
            <Image
              source={require('../assets/QCU_Logo_2019.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.bannerLabel}>CCS Hub</Text>

          {/* Organic wave with soft periwinkle accent matching reference artwork */}
          <Svg
            width={W}
            height={50}
            viewBox="0 0 375 50"
            style={styles.waveSvg}
            preserveAspectRatio="none"
          >
            <Path d="M0,0 L375,0 L375,12 C285,46 170,12 0,36 Z" fill={NAVY} />
            <Path d="M0,36 C170,12 285,46 375,12 L375,24 C285,54 170,22 0,44 Z" fill="#D2E3FC" />
            <Path d="M0,44 C170,22 285,54 375,24 L375,50 L0,50 Z" fill="#FFFFFF" />
          </Svg>
        </Animated.View>

        {/* ── BODY CONTENT ── */}
        <View style={styles.body}>
          {/* Headline */}
          <Animated.View style={{ opacity: titleOpac, transform: [{ translateY: titleAnim }] }}>
            <Text style={styles.headline}>{'Welcome to\nCCS Hub!'}</Text>
            <Text style={styles.subtitle}>
              {'Your all-in-one portal for academic\nand campus services.'}
            </Text>
          </Animated.View>

          {/* ── HERO ILLUSTRATION AREA (perfectly centered) ── */}
          <CampusHero size={Math.min(W * 0.94, 380)} style={styles.heroSpacing} />

          {/* ── FEATURE ROWS ── */}
          <View style={styles.featuresContainer}>
            {FEATURES.map(({ icon, label }, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.featureRow,
                  {
                    opacity: featAnims[i].op,
                    transform: [{ translateY: featAnims[i].y }],
                  },
                ]}
              >
                <Ionicons name={icon} size={22} color={ICON_BLUE} style={styles.featIcon} />
                <Text style={styles.featLabel}>{label}</Text>
              </Animated.View>
            ))}
          </View>

          {/* ── GET STARTED BUTTON ── */}
          <Animated.View
            style={{ opacity: btnOpac, transform: [{ translateY: btnAnim }], marginTop: 22 }}
          >
            <TouchableOpacity
              style={styles.ctaBtn}
              activeOpacity={0.82}
              onPress={() => router.push('/(auth)/sign-in')}
            >
              <Text style={styles.ctaText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#ffffff22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  loadingLogoImg: { width: 68, height: 68 },
  loadingTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },

  banner: {
    backgroundColor: NAVY,
    alignItems: 'center',
    paddingBottom: 48,
    position: 'relative',
  },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  logoImg: { width: 54, height: 54 },
  bannerLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  waveSvg: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
  },

  body: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  headline: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    color: NAVY,
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
    marginBottom: 4,
  },

  heroSpacing: {
    marginVertical: 8,
    alignSelf: 'center',
  },

  featuresContainer: {
    marginTop: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  featIcon: {
    width: 28,
    marginRight: 12,
  },
  featLabel: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    flex: 1,
  },

  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 17,
    shadowColor: BLUE,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 7,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
