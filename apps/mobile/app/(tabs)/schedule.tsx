import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/theme/tokens';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { mobileApi } from '../../src/services/dashboard';
import type { EnrichedClassSchedule, DayOfWeek } from '@ccs-hub/shared';

const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
];

function getInitialDay(): DayOfWeek {
  const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  if (dayIndex >= 1 && dayIndex <= 6) {
    return DAYS[dayIndex - 1].key;
  }
  return 'monday';
}

export default function ScheduleScreen() {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getInitialDay);

  const {
    data: schedules = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<EnrichedClassSchedule[]>({
    queryKey: ['schedule', 'weekly'],
    queryFn: mobileApi.getWeeklySchedule,
  });

  const daySchedules = schedules
    .filter((s) => s.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Class Schedule</Text>
        <Text style={styles.headerSubtitle}>1st Semester AY 2026-2027</Text>
      </View>

      {/* Day Selector Tabs */}
      <View style={styles.daySelectorContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelectorScroll}
        >
          {DAYS.map((day) => {
            const isSelected = selectedDay === day.key;
            const countForDay = schedules.filter((s) => s.day === day.key).length;
            return (
              <TouchableOpacity
                key={day.key}
                style={[styles.dayTab, isSelected && styles.dayTabSelected]}
                onPress={() => setSelectedDay(day.key)}
                accessibilityLabel={day.label}
              >
                <Text style={[styles.dayTabShort, isSelected && styles.dayTabTextSelected]}>
                  {day.short}
                </Text>
                {countForDay > 0 && (
                  <View style={[styles.dayCountPill, isSelected && styles.dayCountPillSelected]}>
                    <Text style={[styles.dayCountText, isSelected && styles.dayCountTextSelected]}>
                      {countForDay}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => { refetch(); }} tintColor={colors.primary} />
        }
      >
        {isLoading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton height={110} borderRadius={radius.lg} style={styles.skeletonItem} />
            <Skeleton height={110} borderRadius={radius.lg} style={styles.skeletonItem} />
            <Skeleton height={110} borderRadius={radius.lg} />
          </View>
        ) : isError ? (
          <EmptyState
            title="Could not load schedule"
            description="Unable to fetch your class schedule at this time."
            icon="alert-circle-outline"
            actionLabel="Try Again"
            onAction={() => refetch()}
          />
        ) : daySchedules.length === 0 ? (
          <EmptyState
            title="No Classes Scheduled"
            description={`You have no classes scheduled for ${DAYS.find((d) => d.key === selectedDay)?.label}.`}
            icon="calendar-outline"
          />
        ) : (
          daySchedules.map((item) => (
            <Card key={item.id} style={styles.classCard}>
              <View style={styles.timeRow}>
                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={14} color={colors.primary} />
                  <Text style={styles.timeText}>
                    {item.startTime} - {item.endTime}
                  </Text>
                </View>
                <Badge label={`${item.units} Units`} variant="neutral" size="small" />
              </View>

              <Text style={styles.courseCode}>{item.courseCode}</Text>
              <Text style={styles.courseTitle}>{item.courseTitle}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.metaText}>Room {item.room}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.metaText}>Sec {item.section}</Text>
                </View>
              </View>

              <View style={styles.facultyRow}>
                <Ionicons name="person-outline" size={14} color={colors.textMuted} />
                <Text style={styles.facultyText}>{item.facultyName}</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: '#93C5FD',
    marginTop: 2,
  },
  daySelectorContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  daySelectorScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  dayTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 40,
  },
  dayTabSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayTabShort: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  dayTabTextSelected: {
    color: colors.textInverse,
    fontWeight: typography.weights.bold,
  },
  dayCountPill: {
    backgroundColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dayCountPillSelected: {
    backgroundColor: '#3747AC',
  },
  dayCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dayCountTextSelected: {
    color: colors.textInverse,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  skeletonContainer: {
    gap: spacing.md,
  },
  skeletonItem: {
    marginBottom: spacing.xs,
  },
  classCard: {
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  timeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  courseCode: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  courseTitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  facultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
    marginTop: 2,
  },
  facultyText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
});
