import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius, shadows } from '../../src/theme/tokens';

type ResearchFilter = 'All' | 'Program' | 'Year' | 'Category' | 'Tech';

interface StudyItem {
  id: string;
  programYear: string;
  category: string;
  title: string;
  authors: string;
  techTags: string[];
}

export default function ResearchScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ResearchFilter>('All');

  const studies: StudyItem[] = [
    {
      id: 'study-1',
      programYear: 'BSIT • 2024–2025',
      category: 'Web',
      title: 'Smart Barangay Complaint Tracker',
      authors: 'Dela Pena, Ramos, Aquino',
      techTags: ['Laravel', 'MySQL'],
    },
    {
      id: 'study-2',
      programYear: 'BSCS • 2024–2025',
      category: 'AI',
      title: 'Plant Disease Detector for Urban Gardens',
      authors: 'Garcia, Lim, Torres',
      techTags: ['Python', 'TensorFlow'],
    },
    {
      id: 'study-3',
      programYear: 'BSIS • 2023–2024',
      category: 'IoT',
      title: 'IoT Flood Monitoring for Quezon City',
      authors: 'Bautista, Cruz, Santos',
      techTags: ['Arduino', 'Firebase'],
    },
  ];

  const filtered = studies.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.authors.toLowerCase().includes(q) ||
      s.techTags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 20) + 12 }]}>
        <Text style={styles.screenTitle}>Research</Text>
        <Text style={styles.screenSubtitle}>Capstone and research repository</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Title, keyword, researcher"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filtersRow}>
        {(['All', 'Program', 'Year', 'Category', 'Tech'] as ResearchFilter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterPillText, activeFilter === f && styles.filterPillTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Check Idea With AI Card */}
        <TouchableOpacity style={styles.aiCard} activeOpacity={0.8}>
          <View style={styles.aiIconBox}>
            <Ionicons name="sparkles" size={20} color={colors.accent} />
          </View>
          <View style={styles.aiTextGroup}>
            <Text style={styles.aiTitle}>Check your idea with AI</Text>
            <Text style={styles.aiSubtitle}>Find similar past studies before you propose.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Study Cards */}
        {filtered.map((item) => (
          <View key={item.id} style={styles.studyCard}>
            <View style={styles.studyTopRow}>
              <Text style={styles.studyProgramYear}>{item.programYear}</Text>
              <View style={styles.studyCategoryTag}>
                <Text style={styles.studyCategoryText}>{item.category}</Text>
              </View>
            </View>

            <Text style={styles.studyTitle}>{item.title}</Text>
            <Text style={styles.studyAuthors}>{item.authors}</Text>

            <View style={styles.techTagsRow}>
              {item.techTags.map((tech) => (
                <View key={tech} style={styles.techTagPill}>
                  <Text style={styles.techTagText}>{tech}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  screenTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  filterPillTextActive: {
    color: colors.textInverse,
    fontWeight: typography.weights.bold,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  aiIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  aiTextGroup: {
    flex: 1,
  },
  aiTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  aiSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  studyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  studyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  studyProgramYear: {
    fontSize: 11,
    color: colors.textMuted,
  },
  studyCategoryTag: {
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  studyCategoryText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.accent,
  },
  studyTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  studyAuthors: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  techTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  techTagPill: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  techTagText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
});
