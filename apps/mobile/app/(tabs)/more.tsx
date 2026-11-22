import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/theme/tokens';
import { ConfirmModal } from '../../src/components/ui/ConfirmModal';

type MenuItem = {
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
  isDev?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Events',
    subtitle: 'Campus events and activities',
    icon: 'ticket-outline',
    route: '/events',
    color: '#7C3AED',
  },
  {
    label: 'Research',
    subtitle: 'Academic research resources',
    icon: 'book-outline',
    route: '/research',
    color: '#0EA5E9',
  },
  {
    label: 'Organizations',
    subtitle: 'Student orgs and clubs',
    icon: 'people-outline',
    route: '/organizations',
    color: '#10B981',
  },
  {
    label: 'Grades',
    subtitle: 'Academic performance records',
    icon: 'bar-chart-outline',
    route: '/grades',
    color: '#F59E0B',
  },
  {
    label: 'Faculty Evaluation',
    subtitle: 'Rate your instructors',
    icon: 'star-outline',
    route: '/evaluations',
    color: '#EF4444',
    isDev: true,
  },
  {
    label: 'Profile',
    subtitle: 'Account settings and info',
    icon: 'person-circle-outline',
    route: '/profile',
    color: '#64748B',
  },
];

export default function MoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showDevModal, setShowDevModal] = useState(false);

  const handleItemPress = (item: MenuItem) => {
    if (item.isDev) {
      setShowDevModal(true);
    } else {
      router.push(item.route as any);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
        <Text style={styles.headerSub}>All features & settings</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.listContent, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.row}
            onPress={() => handleItemPress(item)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.color + '18' }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowSub}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Under Development Popup for Faculty Evaluation */}
      <ConfirmModal
        visible={showDevModal}
        title="Under Development"
        message="Faculty Evaluation is currently under development and will be available in an upcoming update."
        icon="construct-outline"
        iconColor="#D97706"
        iconBg="#FEF3C7"
        confirmLabel="Close"
        cancelLabel=""
        onConfirm={() => setShowDevModal(false)}
        onCancel={() => setShowDevModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 4,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: '#0F172A',
  },
  rowSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
