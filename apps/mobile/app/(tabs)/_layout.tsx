import React from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useTabBar } from '../../src/context/TabBarContext';

// ─── Color tokens ─────────────────────────────────────────────────────────────
const ACTIVE   = '#1D4ED8';   // blue-700
const INACTIVE = '#94A3B8';   // slate-400
const FAB_BG   = '#2563EB';   // blue-600
const NAV_BG   = '#FFFFFF';

interface TabBarRoute {
  key: string;
  name: string;
  params?: Record<string, unknown>;
}

interface CustomTabBarProps {
  state?: {
    index: number;
    routes: TabBarRoute[];
  };
  descriptors?: Record<string, { options?: any }>;
  navigation?: {
    emit?: (event: { type: string; target?: string; canPreventDefault?: boolean }) => {
      defaultPrevented: boolean;
    };
    navigate?: (name: string, params?: Record<string, unknown>) => void;
  };
}

// ─── Custom Tab Bar ────────────────────────────────────────────────────────────
// All hooks are called unconditionally at the top; role-based rendering happens
// after all hooks are resolved to avoid the "fewer/more hooks" React error.
function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  // ── ALL hooks first ──────────────────────────────────────────────────────────
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { isTabBarHidden } = useTabBar();
  const { user } = useAuth();

  // ── Derived values ───────────────────────────────────────────────────────────
  const isFaculty = user?.role === 'faculty';

  // Check if the active screen opted out of the tab bar
  const screenWantsHidden = (() => {
    if (state && descriptors && state.routes && typeof state.index === 'number') {
      const currentRoute = state.routes[state.index];
      const options = descriptors[currentRoute.key]?.options;
      return options?.tabBarStyle?.display === 'none' || options?.tabBarVisible === false;
    }
    return false;
  })();

  // ── Shared helpers ───────────────────────────────────────────────────────────
  const checkFocused = (routeName: string) => {
    if (state && typeof state.index === 'number' && state.routes && state.routes[state.index]) {
      const activeName = state.routes[state.index].name;
      if (activeName === routeName) return true;
    }
    if (routeName === 'index') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    }
    if (routeName === 'org') return pathname.includes('org');
    if (routeName === 'schedule') return pathname.includes('schedule');
    return pathname.includes(routeName);
  };

  const handleTabPress = (routeName: string) => {
    try {
      if (navigation && typeof navigation.emit === 'function') {
        const targetRoute = state?.routes?.find((r: TabBarRoute) => r.name === routeName);
        const event = navigation.emit({
          type: 'tabPress',
          target: targetRoute?.key ?? '',
          canPreventDefault: true,
        });
        if (event?.defaultPrevented) return;
      }
    } catch {
      // Fallback directly to router
    }

    if (routeName === 'index') {
      router.navigate('/(tabs)');
    } else {
      router.navigate(`/(tabs)/${routeName}` as any);
    }
  };

  // ── Early returns AFTER all hooks ────────────────────────────────────────────
  if (isTabBarHidden || screenWantsHidden) return null;

  const bottomSafe = Math.max(insets.bottom, 8);

  // ────────────────────────────────────────────────────────────────────────────
  // FACULTY: Flat tab bar with 6 tabs (Home | Org | Classes | Consult | Locator | Research)
  // ────────────────────────────────────────────────────────────────────────────
  if (isFaculty) {
    const facultyTabs: Array<{
      name: string;
      label: string;
      icon: keyof typeof Ionicons.glyphMap;
      iconFocused: keyof typeof Ionicons.glyphMap;
    }> = [
      { name: 'index',    label: 'Home',     icon: 'home-outline',               iconFocused: 'home' },
      { name: 'org',      label: 'Org',      icon: 'people-outline',             iconFocused: 'people' },
      { name: 'schedule', label: 'Classes',  icon: 'calendar-outline',           iconFocused: 'calendar' },
      { name: 'consult',  label: 'Consult',  icon: 'chatbubble-ellipses-outline', iconFocused: 'chatbubble-ellipses' },
      { name: 'locator',  label: 'Locator',  icon: 'location-outline',           iconFocused: 'location' },
      { name: 'research', label: 'Research', icon: 'book-outline',               iconFocused: 'book' },
    ];

    return (
      <View style={[styles.facultyBarOuter, { paddingBottom: bottomSafe }]}>
        <View style={styles.facultyBar}>
          {facultyTabs.map((tab) => {
            const focused = checkFocused(tab.name);
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.facultyTabBtn}
                onPress={() => handleTabPress(tab.name)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
              >
                <Ionicons
                  name={focused ? tab.iconFocused : tab.icon}
                  size={22}
                  color={focused ? ACTIVE : INACTIVE}
                />
                <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STUDENT: Floating pill with center FAB (Home | Org | [Classes] | Consult | More)
  // ────────────────────────────────────────────────────────────────────────────
  const isClassesActive = checkFocused('schedule');

  const routeConfig: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; iconFocused: keyof typeof Ionicons.glyphMap }> = {
    index:   { label: 'Home',    icon: 'home-outline',               iconFocused: 'home' },
    org:     { label: 'Org',     icon: 'people-outline',             iconFocused: 'people' },
    consult: { label: 'Consult', icon: 'chatbubble-ellipses-outline', iconFocused: 'chatbubble-ellipses' },
    more:    { label: 'More',    icon: 'grid-outline',               iconFocused: 'grid' },
  };

  const leftRoutes  = ['index', 'org'];
  const rightRoutes = ['consult', 'more'];

  return (
    <View
      style={[styles.outerWrapper, { paddingBottom: bottomSafe }]}
      pointerEvents="box-none"
    >
      {/* Center Classes FAB — elevated above pill */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => handleTabPress('schedule')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Classes"
      >
        <View style={[styles.fabInner, isClassesActive && styles.fabInnerActive]}>
          <Ionicons
            name={isClassesActive ? 'calendar' : 'calendar-outline'}
            size={26}
            color="#FFFFFF"
          />
        </View>
      </TouchableOpacity>

      {/* Pill row */}
      <View style={styles.pill}>
        {/* Left two tabs: Home & Org */}
        {leftRoutes.map((routeName) => {
          const focused = checkFocused(routeName);
          const cfg = routeConfig[routeName];
          if (!cfg) return null;
          return (
            <TouchableOpacity
              key={routeName}
              style={styles.tabBtn}
              onPress={() => handleTabPress(routeName)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={cfg.label}
            >
              <Ionicons
                name={focused ? cfg.iconFocused : cfg.icon}
                size={22}
                color={focused ? ACTIVE : INACTIVE}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Center Classes spacer with label */}
        <TouchableOpacity
          style={styles.fabSpacer}
          onPress={() => handleTabPress('schedule')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Classes"
        >
          <Text style={[styles.tabLabel, isClassesActive && styles.tabLabelActive]}>
            Classes
          </Text>
        </TouchableOpacity>

        {/* Right two tabs: Consult & More */}
        {rightRoutes.map((routeName) => {
          const focused = checkFocused(routeName);
          const cfg = routeConfig[routeName];
          if (!cfg) return null;
          return (
            <TouchableOpacity
              key={routeName}
              style={styles.tabBtn}
              onPress={() => handleTabPress(routeName)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={cfg.label}
            >
              <Ionicons
                name={focused ? cfg.iconFocused : cfg.icon}
                size={22}
                color={focused ? ACTIVE : INACTIVE}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const PILL_HEIGHT = 62;
const FAB_SIZE    = 54;
const PROTRUSION  = 14; // How far the FAB extends above the pill top edge

const styles = StyleSheet.create({
  // ── Faculty flat bar ──────────────────────────────────────────────────────────
  facultyBarOuter: {
    backgroundColor: NAV_BG,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  facultyBar: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
  },
  facultyTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
  },

  // ── Student floating pill ─────────────────────────────────────────────────────
  outerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: PROTRUSION,
  },
  fab: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    zIndex: 10,
  },
  fabInner: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: FAB_BG,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
  },
  fabInnerActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#EFF6FF',
    transform: [{ scale: 1.05 }],
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    marginHorizontal: 16,
    height: PILL_HEIGHT,
    paddingHorizontal: 8,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignSelf: 'stretch',
  },
  fabSpacer: {
    width: FAB_SIZE + 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 6,
    height: '100%',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
  },

  // ── Shared label styles ───────────────────────────────────────────────────────
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: INACTIVE,
    marginTop: 1,
  },
  tabLabelActive: {
    color: ACTIVE,
    fontWeight: '700',
  },
});

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...(props as any)} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="org" />
      <Tabs.Screen name="schedule" />
      <Tabs.Screen name="consult" />
      <Tabs.Screen name="more" />
      <Tabs.Screen name="locator" />
      <Tabs.Screen name="research" />
    </Tabs>
  );
}
