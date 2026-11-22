import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, radius, typography } from '../../src/theme/tokens';
import { mobileApi, type GradesSummaryResponse } from '../../src/services/dashboard';

const DEFAULT_GRADES_DATA = {
  termGwa: '1.50',
  totalEnrolledUnits: 21,
  completedUnits: 96,
  curriculumRequiredUnits: 150,
  termLabel: '1st Semester · Midterm',
  courses: [
    {
      courseId: 'c-1',
      courseCode: 'IT 301',
      courseTitle: 'Web Systems and Technologies',
      units: 3,
      grade: '1.25',
      status: 'Passing',
    },
    {
      courseId: 'c-2',
      courseCode: 'IT 302',
      courseTitle: 'Information Assurance and Security 1',
      units: 3,
      grade: '1.50',
      status: 'Passing',
    },
    {
      courseId: 'c-3',
      courseCode: 'IT 303',
      courseTitle: 'Mobile Application Development',
      units: 3,
      grade: '1.75',
      status: 'Passing',
    },
    {
      courseId: 'c-4',
      courseCode: 'IT 304',
      courseTitle: 'Capstone Project 1',
      units: 3,
      grade: '1.50',
      status: 'Passing',
    },
  ],
};

export default function GradesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    data,
    refetch,
    isRefetching,
  } = useQuery<GradesSummaryResponse['data']>({
    queryKey: ['grades', 'my'],
    queryFn: mobileApi.getGrades,
  });

  const termGwa = data?.termGwa ?? DEFAULT_GRADES_DATA.termGwa;
  const enrolledUnits = data?.totalEnrolledUnits ?? DEFAULT_GRADES_DATA.totalEnrolledUnits;
  const completedUnits = data?.completedUnits ?? DEFAULT_GRADES_DATA.completedUnits;
  const totalUnits = data?.curriculumRequiredUnits ?? DEFAULT_GRADES_DATA.curriculumRequiredUnits;
  const progressPercent = Math.min(100, Math.round((completedUnits / totalUnits) * 100));

  const courses = data?.courses && data.courses.length > 0
    ? data.courses.map((c) => ({
        courseId: c.courseId,
        courseCode: c.courseCode,
        courseTitle: c.courseTitle,
        units: c.units,
        grade: c.midtermGrade ?? c.finalGrade ?? '1.50',
        status: 'Passing',
      }))
    : DEFAULT_GRADES_DATA.courses;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 12 }]}>
      {/* ── Top Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#0F224A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grades</Text>
      </View>

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
        {/* ── Summary Hero Card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>Term GWA (midterm)</Text>
              <Text style={styles.heroStatValue}>{termGwa}</Text>
            </View>
            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>Units enrolled</Text>
              <Text style={styles.heroStatValue}>{enrolledUnits}</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabelsRow}>
              <Text style={styles.progressLabel}>Program progress</Text>
              <Text style={styles.progressUnitsText}>
                {completedUnits} of {totalUnits} units
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
        </View>

        {/* ── Subjects Breakdown Card ── */}
        <View style={styles.subjectsCard}>
          <Text style={styles.termLabel}>{DEFAULT_GRADES_DATA.termLabel}</Text>

          <View style={styles.coursesList}>
            {courses.map((course, idx) => (
              <View
                key={course.courseId}
                style={[
                  styles.courseRow,
                  idx !== courses.length - 1 && styles.courseRowBorder,
                ]}
              >
                <View style={styles.courseInfoCol}>
                  <Text style={styles.courseTitle}>{course.courseTitle}</Text>
                  <Text style={styles.courseSubtext}>
                    {course.courseCode} · {course.units} units
                  </Text>
                </View>

                <View style={styles.courseGradeCol}>
                  <Text style={styles.courseGradeText}>{course.grade}</Text>
                  <View style={styles.passingBadge}>
                    <Text style={styles.passingBadgeText}>{course.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F224A',
    letterSpacing: -0.5,
  },

  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  /* Hero Card */
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 16,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroStatCol: {
    flex: 1,
  },
  heroStatLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  heroStatValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F224A',
    letterSpacing: -0.5,
  },

  progressSection: {
    marginTop: 4,
  },
  progressLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  progressUnitsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F224A',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#1E40AF',
  },

  /* Subjects Card */
  subjectsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  termLabel: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 16,
  },
  coursesList: {
    gap: 16,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
  },
  courseRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  courseInfoCol: {
    flex: 1,
    paddingRight: 12,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F224A',
    lineHeight: 19,
    marginBottom: 3,
  },
  courseSubtext: {
    fontSize: 12,
    color: '#94A3B8',
  },

  courseGradeCol: {
    alignItems: 'flex-end',
  },
  courseGradeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F224A',
  },
  passingBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  passingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },
});
