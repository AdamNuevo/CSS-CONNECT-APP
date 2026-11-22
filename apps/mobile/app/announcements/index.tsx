import React, { useState } from 'react';
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
import { mobileApi, type AnnouncementsResponse } from '../../src/services/dashboard';

interface AnnouncementItem {
  id: string;
  category: string;
  audienceKey: 'dean' | 'ccs' | 'org';
  date: string;
  title: string;
  body: string;
  isPinned?: boolean;
}

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    category: "Dean's Office",
    audienceKey: 'dean',
    date: 'Nov 6',
    title: 'Midterm examination schedule is now posted',
    body: 'Check the schedule per section and room assignment before the exam week begins.',
    isPinned: true,
  },
  {
    id: 'ann-2',
    category: 'CCS',
    audienceKey: 'ccs',
    date: 'Nov 5',
    title: 'Research Colloquium call for attendees',
    body: 'Open to all CCS students. Register through the Events tab to get your QR pass.',
    isPinned: false,
  },
  {
    id: 'ann-3',
    category: 'Organizations',
    audienceKey: 'org',
    date: 'Nov 3',
    title: 'Computer Society general assembly',
    body: 'Officers will share the agenda and venue ahead of the meeting.',
    isPinned: false,
  },
  {
    id: 'ann-4',
    category: "Dean's Office",
    audienceKey: 'dean',
    date: 'Oct 30',
    title: 'Reminder: faculty evaluation is open',
    body: 'Complete your evaluations for all instructors before the deadline.',
    isPinned: false,
  },
];

const AUDIENCE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'dean', label: 'Dean' },
  { key: 'ccs', label: 'CCS' },
  { key: 'org', label: 'Organizations' },
];

export default function AnnouncementsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedAudience, setSelectedAudience] = useState<string>('all');

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<AnnouncementsResponse>({
    queryKey: ['announcements', selectedAudience],
    queryFn: () => mobileApi.getAnnouncements(selectedAudience),
  });

  // Map server announcements if available; otherwise use reference mock data
  const serverItems: AnnouncementItem[] = (data?.data ?? []).map((item) => {
    const isDean = item.audience === 'dean' || item.organizationName?.toLowerCase().includes('dean');
    const isCCS = item.audience === 'ccs' || item.audience === 'college';
    const audienceKey: 'dean' | 'ccs' | 'org' = isDean ? 'dean' : isCCS ? 'ccs' : 'org';
    const category = item.organizationName || (isDean ? "Dean's Office" : isCCS ? 'CCS' : 'Organizations');
    const date = item.publishedAt
      ? new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Recent';

    return {
      id: item.id,
      category,
      audienceKey,
      date,
      title: item.title,
      body: item.body,
      isPinned: item.isPinned,
    };
  });

  const baseList = serverItems.length > 0 ? serverItems : DEFAULT_ANNOUNCEMENTS;

  const filteredAnnouncements = baseList.filter((item) => {
    if (selectedAudience === 'all') return true;
    return item.audienceKey === selectedAudience;
  });

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Announcements</Text>
      </View>

      {/* Filter Chips Bar */}
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
                activeOpacity={0.8}
                accessibilityRole="button"
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

      {/* Announcements List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentInner,
          { paddingBottom: Math.max(insets.bottom, 24) + 24 },
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => { refetch(); }} tintColor="#1D4ED8" />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredAnnouncements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="megaphone-outline" size={44} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No announcements</Text>
            <Text style={styles.emptySubtitle}>There are no announcements in this category right now.</Text>
          </View>
        ) : (
          filteredAnnouncements.map((item) => (
            <View key={item.id} style={styles.card}>
              {/* Card Meta Row: Category · Date on Left, Pinned Badge on Right */}
              <View style={styles.cardHeader}>
                <Text style={styles.metaText}>
                  {item.category} · {item.date}
                </Text>

                {item.isPinned && (
                  <View style={styles.pinnedBadge}>
                    <Text style={styles.pinnedText}>Pinned</Text>
                  </View>
                )}
              </View>

              {/* Title */}
              <Text style={styles.cardTitle}>{item.title}</Text>

              {/* Description Body */}
              <Text style={styles.cardBody}>{item.body}</Text>
            </View>
          ))
        )}
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
    paddingTop: 8,
    paddingBottom: 14,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  filterBar: {
    paddingBottom: 14,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipSelected: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  filterTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '400',
  },
  pinnedBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pinnedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
