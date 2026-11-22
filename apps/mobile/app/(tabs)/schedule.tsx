import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, radius, typography } from '../../src/theme/tokens';
import { mobileApi } from '../../src/services/dashboard';
import { useAuth } from '../../src/context/AuthContext';
import { FacultyClassesView } from '../../src/components/faculty/FacultyClassesView';
import type { EnrichedClassSchedule, DayOfWeek } from '@ccs-hub/shared';

interface DayItem {
  key: DayOfWeek;
  short: string;
  dateNum: number;
  fullDate: string;
}

const WEEK_DAYS: DayItem[] = [
  { key: 'monday', short: 'Mon', dateNum: 9, fullDate: 'Monday, Nov 9' },
  { key: 'tuesday', short: 'Tue', dateNum: 10, fullDate: 'Tuesday, Nov 10' },
  { key: 'wednesday', short: 'Wed', dateNum: 11, fullDate: 'Wednesday, Nov 11' },
  { key: 'thursday', short: 'Thu', dateNum: 12, fullDate: 'Thursday, Nov 12' },
  { key: 'friday', short: 'Fri', dateNum: 13, fullDate: 'Friday, Nov 13' },
  { key: 'saturday', short: 'Sat', dateNum: 14, fullDate: 'Saturday, Nov 14' },
];

const DEFAULT_WEDNESDAY_CLASSES = [
  {
    id: 's-1',
    timeHour: '8:00',
    timePeriod: 'AM',
    title: 'Web Systems and Technologies',
    details: 'IT 301 · Rm 304',
    instructor: 'Prof. Maria Santos',
    isNext: false,
  },
  {
    id: 's-2',
    timeHour: '10:00',
    timePeriod: 'AM',
    title: 'Information Assurance and Security 1',
    details: 'IT 302 · Lab 1',
    instructor: 'Engr. Carlo Mendoza',
    isNext: false,
  },
  {
    id: 's-3',
    timeHour: '1:00',
    timePeriod: 'PM',
    title: 'Mobile Application Development',
    details: 'IT 303 · Lab 3',
    instructor: 'Prof. Paolo Reyes',
    isNext: true,
  },
  {
    id: 's-4',
    timeHour: '3:00',
    timePeriod: 'PM',
    title: 'Capstone Project 1',
    details: 'IT 305 · Rm 210',
    instructor: 'Prof. Ana Villanueva',
    isNext: false,
  },
];

function StudentScheduleView() {
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('wednesday');

  const {
    data: apiSchedules = [],
    refetch,
    isRefetching,
  } = useQuery<EnrichedClassSchedule[]>({
    queryKey: ['schedule', 'weekly'],
    queryFn: mobileApi.getWeeklySchedule,
  });

  const activeDayItem = WEEK_DAYS.find((d) => d.key === selectedDay) ?? WEEK_DAYS[2];

  // Map API data if present, otherwise use reference data
  const apiDayClasses = apiSchedules
    .filter((s) => s.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((s, idx) => {
      const parts = s.startTime.split(' ');
      return {
        id: s.id,
        timeHour: parts[0] || s.startTime,
        timePeriod: parts[1] || 'AM',
        title: s.courseTitle,
        details: `${s.courseCode} · Rm ${s.room}`,
        instructor: s.facultyName,
        isNext: idx === 2,
      };
    });

  const displayClasses = apiDayClasses.length > 0 ? apiDayClasses : DEFAULT_WEDNESDAY_CLASSES;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 12 }]}>
      {/* ── Top Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
        <Text style={styles.headerSubtitle}>1st Semester · AY 2025-2026</Text>
      </View>

      {/* ── Horizontal Day Picker ── */}
      <View style={styles.daysContainer}>
        {WEEK_DAYS.map((item) => {
          const isSelected = selectedDay === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.dayCard, isSelected && styles.dayCardSelected]}
              onPress={() => setSelectedDay(item.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.dayShort, isSelected && styles.dayShortSelected]}>
                {item.short}
              </Text>
              <Text style={[styles.dateNum, isSelected && styles.dateNumSelected]}>
                {item.dateNum}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Content Area ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { refetch(); }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Day & count summary */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryDate}>{activeDayItem.fullDate}</Text>
          <Text style={styles.summaryCount}>
            {displayClasses.length} {displayClasses.length === 1 ? 'class' : 'classes'}
          </Text>
        </View>

        {/* Timeline rows */}
        <View style={styles.timelineList}>
          {displayClasses.map((item) => (
            <View key={item.id} style={styles.timelineRow}>
              {/* Time column */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeHour}>{item.timeHour}</Text>
                <Text style={styles.timePeriod}>{item.timePeriod}</Text>
              </View>

              {/* Class card */}
              <View style={styles.classCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.classTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {item.isNext && (
                    <View style={styles.nextBadge}>
                      <Text style={styles.nextBadgeText}>Next</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.classDetails}>{item.details}</Text>
                <Text style={styles.classInstructor}>{item.instructor}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function ScheduleScreen() {
  const { user } = useAuth();
  if (user?.role === 'faculty') {
    return <FacultyClassesView />;
  }
  return <StudentScheduleView />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F224A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },

  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dayCard: {
    flex: 1,
    marginHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dayCardSelected: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
    shadowColor: '#1E40AF',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  dayShort: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 3,
  },
  dayShortSelected: {
    color: '#E0E7FF',
  },
  dateNum: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F224A',
  },
  dateNumSelected: {
    color: '#FFFFFF',
  },

  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  summaryDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F224A',
  },
  summaryCount: {
    fontSize: 13,
    color: '#64748B',
  },

  timelineList: {
    gap: 14,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timeColumn: {
    width: 60,
    paddingTop: 8,
    paddingRight: 8,
  },
  timeHour: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F224A',
  },
  timePeriod: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },

  classCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  classTitle: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F224A',
    lineHeight: 20,
    paddingRight: 6,
  },
  nextBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  nextBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#EA580C',
  },

  classDetails: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 3,
  },
  classInstructor: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
