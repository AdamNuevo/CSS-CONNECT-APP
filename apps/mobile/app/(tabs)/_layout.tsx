import React, { useState } from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ConfirmModal } from '../../src/components/ui/ConfirmModal';

// ─── Color tokens ────────────────────────────────────────────────────────────
const ACTIVE   = '#4F46E5';   // indigo-600
const INACTIVE = '#94A3B8';   // slate-400
const FAB_BG   = '#4F46E5';

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
  navigation?: {
    emit?: (event: { type: string; target?: string; canPreventDefault?: boolean }) => {
      defaultPrevented: boolean;
    };
    navigate?: (name: string, params?: Record<string, unknown>) => void;
  };
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const [showDevModal, setShowDevModal] = useState(false);

  const isCampusMapActive = pathname.includes('campus-map');

  const checkFocused = (routeName: string) => {
    if (state && typeof state.index === 'number' && state.routes && state.routes[state.index]) {
      return state.routes[state.index].name === routeName;
    }
    if (routeName === 'index') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    }
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

  const handleFABPress = () => {
    setShowDevModal(true);
  };

  // Visible items config
  const routeConfig: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; iconFocused: keyof typeof Ionicons.glyphMap }> = {
    index:    { label: 'Home',     icon: 'home-outline',               iconFocused: 'home' },
    schedule: { label: 'Schedule', icon: 'calendar-outline',           iconFocused: 'calendar' },
    consult:  { label: 'Consult',  icon: 'chatbubble-ellipses-outline', iconFocused: 'chatbubble-ellipses' },
    more:     { label: 'More',     icon: 'grid-outline',               iconFocused: 'grid' },
  };

  const leftRoutes = ['index', 'schedule'];
  const rightRoutes = ['consult', 'more'];

  const bottomSafe = Math.max(insets.bottom, 10);

  return (
    <>
      <View
        style={[
          styles.outerWrapper,
          { paddingBottom: bottomSafe },
        ]}
        pointerEvents="box-none"
      >
        {/* FAB — nestled into top edge of the pill */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleFABPress}
          activeOpacity={0.85}
          accessibilityLabel="Campus Map"
          accessibilityRole="button"
        >
          <View style={[styles.fabInner, isCampusMapActive && styles.fabInnerActive]}>
            <Ionicons name="map" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Pill container */}
        <View style={styles.pill}>
          {/* Left two tabs: Home & Schedule */}
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

          {/* Center FAB spacer */}
          <View style={styles.fabSpacer} />

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

      {/* Under Development Popup for Campus Map */}
      <ConfirmModal
        visible={showDevModal}
        title="Under Development"
        message="Campus Map is currently under development and will be available in an upcoming update."
        icon="construct-outline"
        iconColor="#D97706"
        iconBg="#FEF3C7"
        confirmLabel="Close"
        cancelLabel=""
        onConfirm={() => setShowDevModal(false)}
        onCancel={() => setShowDevModal(false)}
      />
    </>
  );
}

const PILL_HEIGHT = 60;
const FAB_SIZE    = 52;
const PROTRUSION  = 12; // 12px extends above the pill top edge

const styles = StyleSheet.create({
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
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
  },
  fabInnerActive: {
    backgroundColor: '#3730A3',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    marginHorizontal: 20,
    height: PILL_HEIGHT,
    paddingHorizontal: 8,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 8,
    alignSelf: 'stretch',
  },
  fabSpacer: {
    width: FAB_SIZE + 6,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
  },
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
      <Tabs.Screen name="schedule" />
      <Tabs.Screen name="consult" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}
