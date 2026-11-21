import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../../src/theme/tokens';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { mobileApi, type DashboardData } from '../../src/services/dashboard';

const QUICK_ACTIONS = [
  { label: 'Schedule', icon: 'calendar-outline' as const, route: '/(tabs)/schedule' as const, tint: '#3B82F6', bg: '#EFF6FF' },
  { label: 'Consult', icon: 'chatbubbles-outline' as const, route: '/(tabs)/consult' as const, tint: '#8B5CF6', bg: '#F5F3FF' },
  { label: 'Grades', icon: 'school-outline' as const, route: '/grades' as const, tint: '#10B981', bg: '#ECFDF5' },
  { label: 'Evaluation', icon: 'clipboard-outline' as const, route: '/evaluations' as const, tint: '#F59E0B', bg: '#FFFBEB' },
  { label: 'News', icon: 'megaphone-outline' as const, route: '/announcements' as const, tint: '#EF4444', bg: '#FEF2F2' },
  { label: 'Organizations', icon: 'people-outline' as const, route: '/organizations' as const, tint: '#06B6D4', bg: '#ECFEFF' },
  { label: 'Campus Map', icon: 'map-outline' as const, route: '/campus-map' as const, tint: '#6366F1', bg: '#EEF2FF' },
  { label: 'Research', icon: 'book-outline' as const, route: '/(tabs)/research' as const, tint: '#14B8A6', bg: '#F0FDFA' },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: mobileApi.getDashboard,
  });

  if (isLoading) {
    return (
      <View style={[styles.root, { paddingTop: Math.max(insets.top, 24) }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.skeletonHeader}>
          <Skeleton width={140} height={24} borderRadius={6} />
          <Skeleton width={40} height={40} borderRadius={20} />
        </View>
        <View style={styles.contentPadding}>
          <Skeleton height={150} borderRadius={radius.lg} style={{ marginBottom: spacing.lg }} />
          <Skeleton height={160} borderRadius={radius.lg} style={{ marginBottom: spacing.lg }} />
          <Skeleton height={100} borderRadius={radius.lg} />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.root, { paddingTop: Math.max(insets.top, 24) }]}>
        <EmptyState
          title="Could not load dashboard"
          description="Please check your connection and tap to retry."
          icon="cloud-offline-outline"
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  const user = data?.user;
  const nextClass = data?.nextClass;
  const announcements = data?.latestAnnouncements ?? [];
  const upcomingEvent = data?.upcomingEvent;

  const initials = user?.firstName
    ? `${user.firstName.charAt(0)}${user.lastName ? user.lastName.charAt(0) : ''}`.toUpperCase()
    : 'U';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: Math.max(insets.top, 20) + 8,
          paddingBottom: Math.max(insets.bottom, 20) + 24,
        },
      ]}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => { refetch(); }} tintColor={colors.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.greetingContainer}>
          <Text style={styles.dateText}>{getFormattedDate()}</Text>
          <Text style={styles.greetingTitle}>
            {getGreeting()}, {user?.firstName ?? 'Student'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityLabel="Open profile"
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Next Class Hero Card */}
      <View style={styles.sectionContainer}>
        {nextClass ? (
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroBadge}>
                <Ionicons name="time-outline" size={13} color="#93C5FD" />
                <Text style={styles.heroBadgeText}>
                  NEXT CLASS • {nextClass.startTime}
                </Text>
              </View>
              <Text style={styles.heroSectionTag}>Sec {nextClass.section}</Text>
            </View>

            <Text style={styles.heroCourseTitle} numberOfLines={2}>
              {nextClass.courseTitle}
            </Text>

            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaItem}>
                <Ionicons name="location-outline" size={14} color="#BFDBFE" />
                <Text style={styles.heroMetaText} numberOfLines={1}>
                  {nextClass.room} ({nextClass.building})
                </Text>
              </View>
              <View style={styles.heroMetaItem}>
                <Ionicons name="person-outline" size={14} color="#BFDBFE" />
                <Text style={styles.heroMetaText} numberOfLines={1}>
                  {nextClass.facultyName}
                </Text>
              </View>
            </View>

            <View style={styles.heroActionsRow}>
              <TouchableOpacity
                style={styles.navigateButton}
                onPress={() =>
                  router.push(`/campus-map?room=${encodeURIComponent(nextClass.room)}` as any)
                }
                activeOpacity={0.85}
              >
                <Ionicons name="navigate" size={15} color="#1E293B" />
                <Text style={styles.navigateButtonText}>Navigate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.scheduleOutlineButton}
                onPress={() => router.push('/(tabs)/schedule')}
                activeOpacity={0.8}
              >
                <Text style={styles.scheduleOutlineText}>Full schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyHeroCard}>
            <View style={styles.emptyHeroIconCircle}>
              <Ionicons name="checkmark-circle-outline" size={26} color={colors.status.successText} />
            </View>
            <View style={styles.emptyHeroTextGroup}>
              <Text style={styles.emptyHeroTitle}>No upcoming classes today</Text>
              <Text style={styles.emptyHeroSub}>You're all caught up with your schedule.</Text>
            </View>
          </View>
        )}
      </View>

      {/* Quick Access Grid */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quick access</Text>
        <View style={styles.gridContainer}>
          {QUICK_ACTIONS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.gridTile}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.tileIconCircle, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={22} color={item.tint} />
              </View>
              <Text style={styles.tileLabel} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Featured / Upcoming Event */}
      {upcomingEvent && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Upcoming event</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/events')}>
              <Text style={styles.linkText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.eventCard}>
            <View style={styles.eventDateBadge}>
              <Text style={styles.eventMonth}>
                {new Date(upcomingEvent.startsAt).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
              </Text>
              <Text style={styles.eventDay}>
                {new Date(upcomingEvent.startsAt).getDate()}
              </Text>
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {upcomingEvent.title}
              </Text>
              <View style={styles.eventLocationRow}>
                <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.eventLocationText} numberOfLines={1}>
                  {upcomingEvent.location}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </View>
      )}

      {/* Latest Announcements */}
      {announcements.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Announcements</Text>
            <TouchableOpacity onPress={() => router.push('/announcements')}>
              <Text style={styles.linkText}>View all</Text>
            </TouchableOpacity>
          </View>

          {announcements.slice(0, 2).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.announcementCard}
              activeOpacity={0.7}
              onPress={() => router.push('/announcements')}
            >
              <View style={styles.announcementTopRow}>
                <Text style={styles.announcementSource}>
                  {item.organizationName ?? item.audience}
                </Text>
                <Text style={styles.announcementDate}>
                  {new Date(item.publishedAt ?? Date.now()).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <Text style={styles.announcementTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  contentPadding: {
    paddingHorizontal: spacing.lg,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greetingContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  greetingTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  avatarText: {
    color: colors.textInverse,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  linkText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
  },
  // Hero Next Class
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    ...shadows.floating,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    gap: 4,
  },
  heroBadgeText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.3,
  },
  heroSectionTag: {
    color: '#E2E8F0',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  heroCourseTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroMetaText: {
    fontSize: typography.sizes.xs,
    color: '#CBD5E1',
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDE047',
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    gap: 6,
    flex: 1,
  },
  navigateButtonText: {
    color: '#0F172A',
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  scheduleOutlineButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    flex: 1,
  },
  scheduleOutlineText: {
    color: colors.textInverse,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
  },
  emptyHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
  },
  emptyHeroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.status.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHeroTextGroup: {
    flex: 1,
  },
  emptyHeroTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  emptyHeroSub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  // Quick Access Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  gridTile: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  tileIconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tileLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  // Events
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
  },
  eventDateBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentMuted,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    minWidth: 44,
  },
  eventMonth: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.accent,
    letterSpacing: 0.5,
  },
  eventDay: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  eventLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventLocationText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  // Announcements
  announcementCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  announcementTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  announcementSource: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  announcementDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  announcementTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});
