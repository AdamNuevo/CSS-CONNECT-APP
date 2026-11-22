import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors, spacing, typography, radius, shadows } from '../../src/theme/tokens';
import { dashboardService } from '../../src/services/dashboard';
import { useAuth } from '../../src/context/AuthContext';
import { ConfirmModal } from '../../src/components/ui/ConfirmModal';
import type { EnrichedEvent, EventCategory } from '@ccs-hub/shared';

type EventFilter = 'All' | 'Seminar' | 'Workshop' | 'Competition';

export default function EventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<EventFilter>('All');
  const [selectedEvent, setSelectedEvent] = useState<EnrichedEvent | null>(null);
  const [showMyEventsModal, setShowMyEventsModal] = useState(false);
  const [myEventsTab, setMyEventsTab] = useState<'registered' | 'attended'>('registered');

  const {
    data: eventList = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<EnrichedEvent[]>({
    queryKey: ['events'],
    queryFn: () => dashboardService.getEvents(),
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return dashboardService.registerForEvent(eventId);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['events'] });
      setSelectedEvent((prev) => (prev ? { ...prev, isRegistered: true } : null));
      Alert.alert('Registration Confirmed', 'You have been registered for this event. Your digital QR ticket is now available.');
    },
    onError: (err: any) => {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Could not complete registration.');
    },
  });

  const sampleEvents: EnrichedEvent[] = [
    {
      id: 'evt-1',
      title: 'Intro to Cloud Computing Workshop',
      category: 'workshop' as EventCategory,
      description: 'A hands-on introduction to deploying and managing applications in the cloud. Bring your laptop.',
      location: 'CCS Lab 2, Bldg A',
      startsAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      endsAt: new Date(Date.now() + 86400000 * 2 + 10800000).toISOString(),
      registrationDeadline: new Date(Date.now() + 86400000).toISOString(),
      maxSlots: 60,
      availableSlots: 38,
      registrationCount: 22,
      createdBy: 'admin',
      isRegistered: true,
      qrPayload: 'CCS-EVT-CLOUD-2026-9921',
      organizerName: 'CCS Computer Society',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: true,
    },
    {
      id: 'evt-2',
      title: 'Cybersecurity Awareness Seminar',
      category: 'seminar' as EventCategory,
      description: 'Learn best practices in web application security and penetration testing fundamentals.',
      location: 'AVR, Bldg B',
      startsAt: new Date(Date.now() + 86400000 * 4).toISOString(),
      endsAt: new Date(Date.now() + 86400000 * 4 + 7200000).toISOString(),
      registrationDeadline: new Date(Date.now() + 86400000 * 3).toISOString(),
      maxSlots: 150,
      availableSlots: 120,
      registrationCount: 30,
      createdBy: 'admin',
      isRegistered: false,
      organizerName: 'QCU Cyber Security Club',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: true,
    },
  ];

  const sourceEvents = eventList.length > 0 ? eventList : sampleEvents;

  const filteredEvents = sourceEvents.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeFilter === 'All' || evt.category.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const registeredEvents = sourceEvents.filter((e) => e.isRegistered);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header with Back Button */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
        <View style={styles.headerLeftRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.titleArea}>
            <Text style={styles.screenTitle}>Events</Text>
            <Text style={styles.screenSubtitle}>Organized by CCS and student orgs</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.myTicketsButton}
          onPress={() => setShowMyEventsModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="ticket-outline" size={18} color={colors.primary} />
          {registeredEvents.length > 0 && (
            <View style={styles.ticketBadge}>
              <Text style={styles.ticketBadgeText}>{registeredEvents.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events"
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

      {/* Category Filter Pills */}
      <View style={styles.filtersRow}>
        {(['All', 'Seminar', 'Workshop', 'Competition'] as EventFilter[]).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterPill, activeFilter === cat && styles.filterPillActive]}
            onPress={() => setActiveFilter(cat)}
          >
            <Text style={[styles.filterPillText, activeFilter === cat && styles.filterPillTextActive]}>
              {cat}
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
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => { refetch(); }} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredEvents.map((evt) => (
          <TouchableOpacity
            key={evt.id}
            style={styles.eventCard}
            onPress={() => setSelectedEvent(evt)}
            activeOpacity={0.85}
          >
            <View style={styles.eventCardHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{evt.category.toUpperCase()}</Text>
              </View>
              {evt.isRegistered && (
                <View style={styles.registeredBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#059669" />
                  <Text style={styles.registeredBadgeText}>Registered</Text>
                </View>
              )}
            </View>

            <Text style={styles.eventTitle}>{evt.title}</Text>
            <Text style={styles.eventDesc} numberOfLines={2}>{evt.description}</Text>

            <View style={styles.eventMetaRow}>
              <Ionicons name="calendar-outline" size={13} color="#64748B" />
              <Text style={styles.eventMetaText}>
                {new Date(evt.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text style={styles.metaDot}>•</Text>
              <Ionicons name="location-outline" size={13} color="#64748B" />
              <Text style={styles.eventMetaText}>{evt.location}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleArea: {
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  screenSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  myTicketsButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  ticketBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterPillText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  registeredBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  eventDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventMetaText: {
    fontSize: 12,
    color: '#64748B',
  },
  metaDot: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
