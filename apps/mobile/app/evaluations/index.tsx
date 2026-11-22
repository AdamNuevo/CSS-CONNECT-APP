import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/theme/tokens';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { mobileApi } from '../../src/services/dashboard';
import {
  EVALUATION_CRITERIA,
  type FacultyEvaluationItem,
  type StudentEvaluationStatus,
} from '@ccs-hub/shared';

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Satisfactory',
  4: 'Very Good',
  5: 'Outstanding',
};

export default function EvaluationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeItem, setActiveItem] = useState<FacultyEvaluationItem | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<StudentEvaluationStatus>({
    queryKey: ['evaluations', 'status'],
    queryFn: mobileApi.getEvaluationStatus,
  });

  const submitMutation = useMutation({
    mutationFn: mobileApi.submitEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setActiveItem(null);
      setRatings({});
      setComments('');
      Alert.alert('Evaluation Submitted', 'Thank you for your feedback. Your evaluation has been recorded anonymously.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Failed to submit evaluation';
      Alert.alert('Submission Error', msg);
    },
  });

  const handleOpenModal = (item: FacultyEvaluationItem) => {
    setActiveItem(item);
    // Initialize default ratings to 5
    const initial: Record<string, number> = {};
    EVALUATION_CRITERIA.forEach((c) => {
      initial[c.id] = 5;
    });
    setRatings(initial);
    setComments('');
  };

  const handleSetRating = (criterionId: string, value: number) => {
    setRatings((prev) => ({ ...prev, [criterionId]: value }));
  };

  const handleSubmit = () => {
    if (!data?.period?.id || !activeItem) return;

    submitMutation.mutate({
      periodId: data.period.id,
      facultyId: activeItem.facultyId,
      courseId: activeItem.courseId,
      ratings,
      comments: comments.trim() || undefined,
    });
  };

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
        <Text style={styles.headerTitle}>Faculty Evaluation</Text>
      </View>

      {/* ── UNDER DEVELOPMENT BANNER ─────────────────────────── */}
      <View style={styles.devBanner}>
        <Ionicons name="construct-outline" size={15} color="#92400E" />
        <Text style={styles.devBannerText}>🚧 Faculty Evaluation — Under Development</Text>
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
            <Skeleton height={110} borderRadius={radius.lg} />
            <Skeleton height={100} borderRadius={radius.lg} />
            <Skeleton height={100} borderRadius={radius.lg} />
          </View>
        ) : isError ? (
          <EmptyState
            title="Failed to load evaluations"
            description="Unable to reach the evaluation server."
            icon="alert-circle-outline"
            actionLabel="Retry"
            onAction={() => refetch()}
          />
        ) : !data?.isActive ? (
          <EmptyState
            title="Evaluation Closed"
            description="There is no active faculty evaluation period at this time."
            icon="lock-closed-outline"
          />
        ) : (
          <>
            {/* Period Banner Card */}
            <Card style={styles.periodCard}>
              <View style={styles.periodHeader}>
                <Ionicons name="information-circle" size={20} color={colors.accent} />
                <Text style={styles.periodLabel}>{data.period?.label}</Text>
              </View>
              <Text style={styles.periodDeadline}>
                Deadline:{' '}
                {data.period?.closesAt
                  ? new Date(data.period.closesAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'TBA'}
              </Text>
              <View style={styles.progressCounterRow}>
                <Text style={styles.progressCountText}>
                  Progress: {data.completedCount} of {data.totalCount} Instructors Evaluated
                </Text>
                <Badge
                  label={data.completedCount === data.totalCount ? 'COMPLETE' : 'INCOMPLETE'}
                  variant={data.completedCount === data.totalCount ? 'success' : 'warning'}
                  size="small"
                />
              </View>
            </Card>

            {/* List of instructors */}
            <Text style={styles.sectionTitle}>Your Instructors</Text>

            {data.items.map((item: any) => (
              <Card key={`${item.courseId}-${item.facultyId}`} style={styles.instructorCard}>
                <View style={styles.instructorInfo}>
                  <Text style={styles.facultyName}>{item.facultyName}</Text>
                  <Text style={styles.courseDetails}>
                    {item.courseCode} — {item.courseTitle}
                  </Text>
                  <Text style={styles.sectionBadge}>Section: {item.section}</Text>
                </View>

                <View style={styles.instructorActionRow}>
                  {item.isSubmitted ? (
                    <View style={styles.submittedPill}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.status.successText} />
                      <Text style={styles.submittedText}>Evaluated</Text>
                    </View>
                  ) : (
                    <Button
                      label="Evaluate"
                      variant="primary"
                      size="small"
                      onPress={() => handleOpenModal(item)}
                    />
                  )}
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      {/* Evaluation Form Modal */}
      <Modal
        visible={!!activeItem}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveItem(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>Evaluate Instructor</Text>
              <Text style={styles.modalSubtitle}>{activeItem?.facultyName}</Text>
              <Text style={styles.modalCourseCode}>{activeItem?.courseCode} ({activeItem?.courseTitle})</Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setActiveItem(null)}
            >
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.criteriaList}>
              {EVALUATION_CRITERIA.map((criterion, idx) => {
                const currentRating = ratings[criterion.id] ?? 5;

                return (
                  <View key={criterion.id} style={styles.criterionBox}>
                    <Text style={styles.criterionIndex}>Criterion {idx + 1}</Text>
                    <Text style={styles.criterionLabel}>{criterion.label}</Text>
                    <Text style={styles.criterionDesc}>{criterion.description}</Text>

                    {/* 1-5 Rating Scale Buttons */}
                    <View style={styles.ratingRow}>
                      {[1, 2, 3, 4, 5].map((val) => {
                        const isSelected = currentRating === val;
                        return (
                          <TouchableOpacity
                            key={val}
                            style={[styles.ratingBtn, isSelected && styles.ratingBtnSelected]}
                            onPress={() => handleSetRating(criterion.id, val)}
                          >
                            <Text
                              style={[
                                styles.ratingBtnText,
                                isSelected && styles.ratingBtnTextSelected,
                              ]}
                            >
                              {val}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    <Text style={styles.selectedRatingLabel}>
                      Rating: {currentRating} — {RATING_LABELS[currentRating]}
                    </Text>
                  </View>
                );
              })}

              {/* Qualitative Comments */}
              <View style={styles.commentsBox}>
                <Text style={styles.commentsLabel}>Optional Comments or Suggestions</Text>
                <TextInput
                  style={styles.commentsInput}
                  multiline
                  numberOfLines={4}
                  placeholder="Enter constructive feedback for the instructor..."
                  placeholderTextColor={colors.textMuted}
                  value={comments}
                  onChangeText={setComments}
                  maxLength={1000}
                />
              </View>
            </View>

            <View style={styles.modalActionRow}>
              <Button
                label="Submit Anonymous Evaluation"
                variant="primary"
                size="large"
                loading={submitMutation.isPending}
                onPress={handleSubmit}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  periodCard: {
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  periodLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  periodDeadline: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  progressCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  progressCountText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  instructorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  instructorInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  facultyName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  courseDetails: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionBadge: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  instructorActionRow: {
    alignItems: 'flex-end',
  },
  submittedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.status.successBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  submittedText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.status.successText,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
    marginTop: 2,
  },
  modalCourseCode: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  criteriaList: {
    gap: spacing.lg,
  },
  criterionBox: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  criterionIndex: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
  },
  criterionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  criterionDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  ratingBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBtnSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ratingBtnText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  ratingBtnTextSelected: {
    color: colors.textInverse,
  },
  selectedRatingLabel: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  commentsBox: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentsLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  commentsInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalActionRow: {
    marginTop: spacing.md,
  },
  devBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  devBannerText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#92400E',
  },
});
