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
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/theme/tokens';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { mobileApi, type GradesSummaryResponse } from '../../src/services/dashboard';

export default function GradesScreen() {
  const router = useRouter();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<GradesSummaryResponse['data']>({
    queryKey: ['grades', 'my'],
    queryFn: mobileApi.getGrades,
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grades & Progress</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => { refetch(); }} tintColor={colors.primary} />
        }
      >
        {isLoading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton height={140} borderRadius={radius.lg} />
            <Skeleton height={90} borderRadius={radius.lg} />
            <Skeleton height={80} borderRadius={radius.lg} />
            <Skeleton height={80} borderRadius={radius.lg} />
          </View>
        ) : isError ? (
          <EmptyState
            title="Failed to load grades"
            description="Unable to retrieve grade records at this time."
            icon="alert-circle-outline"
            actionLabel="Retry"
            onAction={() => refetch()}
          />
        ) : (
          <>
            {/* Term GWA Hero Card */}
            <Card style={styles.heroCard}>
              <Text style={styles.heroTermText}>
                {data?.academicYear} • Term {data?.semester}
              </Text>
              <View style={styles.gwaRow}>
                <View>
                  <Text style={styles.gwaLabel}>General Weighted Average</Text>
                  <Text style={styles.gwaValue}>
                    {data?.termGwa ?? 'N/A'}
                  </Text>
                </View>
                {data?.termGwa && (
                  <Badge
                    label={parseFloat(data.termGwa) <= 1.75 ? "Dean's Lister" : 'Good Standing'}
                    variant={parseFloat(data.termGwa) <= 1.75 ? 'success' : 'info'}
                    size="medium"
                  />
                )}
              </View>

              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatLabel}>Cumulative GWA</Text>
                  <Text style={styles.heroStatValue}>{data?.cumulativeGwa ?? 'N/A'}</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatLabel}>Enrolled Units</Text>
                  <Text style={styles.heroStatValue}>{data?.totalEnrolledUnits ?? 0}</Text>
                </View>
              </View>
            </Card>

            {/* Curriculum Progress */}
            <Card style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Program Curriculum Progress</Text>
                <Text style={styles.progressPercent}>{data?.curriculumProgressPercent ?? 0}%</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, data?.curriculumProgressPercent ?? 0)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressSubtext}>
                {data?.completedUnits ?? 0} of {data?.curriculumRequiredUnits ?? 146} Units Completed
              </Text>
            </Card>

            {/* Subject Breakdown List */}
            <Text style={styles.sectionHeader}>Enrolled Subjects</Text>

            {data?.courses && data.courses.length > 0 ? (
              data.courses.map((c) => {
                const isPassed = c.status === 'passed';
                const isFailed = c.status === 'failed';

                return (
                  <Card key={c.courseId} style={styles.subjectCard}>
                    <View style={styles.subjectHeader}>
                      <View style={styles.subjectCodeCol}>
                        <Text style={styles.subjectCode}>{c.courseCode}</Text>
                        <Text style={styles.subjectTitle} numberOfLines={1}>
                          {c.courseTitle}
                        </Text>
                      </View>
                      <Badge label={`${c.units} Units`} variant="neutral" size="small" />
                    </View>

                    <View style={styles.gradeDetailsRow}>
                      <View style={styles.gradeCol}>
                        <Text style={styles.gradeColLabel}>Midterms</Text>
                        <Text style={styles.gradeColVal}>{c.midtermGrade ?? '—'}</Text>
                      </View>

                      <View style={styles.gradeCol}>
                        <Text style={styles.gradeColLabel}>Finals</Text>
                        <Text style={[styles.gradeColVal, styles.finalGradeHighlight]}>
                          {c.finalGrade ?? '—'}
                        </Text>
                      </View>

                      <View style={styles.statusCol}>
                        <Badge
                          label={isPassed ? 'PASSED' : isFailed ? 'FAILED' : 'IN PROGRESS'}
                          variant={isPassed ? 'success' : isFailed ? 'danger' : 'warning'}
                          size="small"
                        />
                      </View>
                    </View>
                  </Card>
                );
              })
            ) : (
              <EmptyState
                title="No Enrolled Subjects"
                description="No courses found for the selected term."
                icon="school-outline"
              />
            )}
          </>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
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
  heroCard: {
    backgroundColor: colors.primaryDark,
    padding: spacing.lg,
    borderRadius: radius.xl,
  },
  heroTermText: {
    color: '#93C5FD',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gwaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  gwaLabel: {
    color: '#E0E7FF',
    fontSize: typography.sizes.xs,
  },
  gwaValue: {
    color: colors.textInverse,
    fontSize: 36,
    fontWeight: '800',
    marginTop: 2,
  },
  heroStatsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#2E3D9E',
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: '#2E3D9E',
  },
  heroStatLabel: {
    color: '#93C5FD',
    fontSize: 11,
  },
  heroStatValue: {
    color: colors.textInverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginTop: 2,
  },
  progressCard: {
    padding: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  progressPercent: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.accent,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 5,
  },
  progressSubtext: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: 'right',
  },
  sectionHeader: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  subjectCard: {
    padding: spacing.md,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  subjectCodeCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  subjectCode: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  subjectTitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gradeDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  gradeCol: {
    flex: 1,
  },
  gradeColLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  gradeColVal: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  finalGradeHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  statusCol: {
    alignItems: 'flex-end',
  },
});
