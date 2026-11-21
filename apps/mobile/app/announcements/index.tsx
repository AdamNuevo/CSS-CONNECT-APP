import React, { useState } from 'react';
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
import { mobileApi, type AnnouncementsResponse } from '../../src/services/dashboard';

const AUDIENCE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'dean', label: "Dean's Office" },
  { key: 'ccs', label: 'CCS Dept' },
  { key: 'org', label: 'Student Orgs' },
];

export default function AnnouncementsScreen() {
  const router = useRouter();
  const [selectedAudience, setSelectedAudience] = useState('all');

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<AnnouncementsResponse>({
    queryKey: ['announcements', selectedAudience],
    queryFn: () => mobileApi.getAnnouncements(selectedAudience),
  });

  const announcements = data?.data ?? [];

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
        <Text style={styles.headerTitle}>Announcements</Text>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {AUDIENCE_FILTERS.map((f) => {
            const isSelected = selectedAudience === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => setSelectedAudience(f.key)}
                accessibilityLabel={f.label}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => { refetch(); }} tintColor={colors.primary} />
        }
      >
        {isLoading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton height={130} borderRadius={radius.lg} />
            <Skeleton height={130} borderRadius={radius.lg} />
            <Skeleton height={130} borderRadius={radius.lg} />
          </View>
        ) : isError ? (
          <EmptyState
            title="Failed to load announcements"
            description="Could not connect to the announcement feed."
            icon="alert-circle-outline"
            actionLabel="Retry"
            onAction={() => refetch()}
          />
        ) : announcements.length === 0 ? (
          <EmptyState
            title="No Announcements"
            description="There are no announcements in this category right now."
            icon="megaphone-outline"
          />
        ) : (
          announcements.map((item) => (
            <Card key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.badgeRow}>
                  {item.isPinned && (
                    <Badge label="PINNED" variant="warning" size="small" />
                  )}
                  <Badge
                    label={item.organizationName ?? item.audience.toUpperCase()}
                    variant="info"
                    size="small"
                  />
                </View>
                {item.publishedAt && (
                  <Text style={styles.dateText}>
                    {new Date(item.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                )}
              </View>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>

              <View style={styles.authorRow}>
                <Ionicons name="person-circle-outline" size={16} color={colors.textMuted} />
                <Text style={styles.authorText}>{item.authorName}</Text>
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
  filterBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  filterTextSelected: {
    color: colors.textInverse,
    fontWeight: typography.weights.bold,
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
  card: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 6,
  },
  body: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
  },
  authorText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
});
