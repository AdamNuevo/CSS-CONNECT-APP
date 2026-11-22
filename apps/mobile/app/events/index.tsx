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
      setSelectedEvent((prev) =>
        prev
          ? {
              ...prev,
              isRegistered: true,
              qrPayload: data.qrPayload,
              registrationId: data.id,
              attendanceStatus: data.attendanceStatus,
            }
          : null
      );
      Alert.alert(
        'Registration Confirmed',
        'You have been registered for this event. Your ticket code is now available.'
      );
    },
    onError: (err: any) => {
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Could not complete registration.';
      Alert.alert('Registration Failed', message);
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

      <Modal
        visible={!!selectedEvent}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedEvent(null)}
      >
        {selectedEvent ? (
          <EventDetail
            event={selectedEvent}
            insetsTop={Math.max(insets.top, 16)}
            insetsBottom={Math.max(insets.bottom, 20)}
            registering={registerMutation.isPending}
            onClose={() => setSelectedEvent(null)}
            onRegister={() => registerMutation.mutate(selectedEvent.id)}
          />
        ) : null}
      </Modal>

      <Modal
        visible={showMyEventsModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowMyEventsModal(false)}
      >
        <View style={styles.modalRoot}>
          <View style={[styles.modalHeader, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowMyEventsModal(false)}
              accessibilityLabel="Close my events"
            >
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>My events</Text>
            <View style={{ width: 38 }} />
          </View>
          <View style={styles.tabsRow}>
            {(['registered', 'attended'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabPill, myEventsTab === tab && styles.tabPillActive]}
                onPress={() => setMyEventsTab(tab)}
              >
                <Text style={[styles.tabPillText, myEventsTab === tab && styles.tabPillTextActive]}>
                  {tab === 'registered' ? 'Registered' : 'Attended'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 20) + 24 },
            ]}
          >
            {registeredEvents
              .filter((evt) =>
                myEventsTab === 'attended' ? evt.attendanceStatus === 'attended' : true
              )
              .map((evt) => (
                <TouchableOpacity
                  key={evt.id}
                  style={styles.eventCard}
                  onPress={() => {
                    setShowMyEventsModal(false);
                    setSelectedEvent(evt);
                  }}
                >
                  <Text style={styles.eventTitle}>{evt.title}</Text>
                  <Text style={styles.eventMetaText}>
                    {formatEventWhen(evt.startsAt, evt.endsAt)}
                  </Text>
                </TouchableOpacity>
              ))}
            {registeredEvents.filter((evt) =>
              myEventsTab === 'attended' ? evt.attendanceStatus === 'attended' : true
            ).length === 0 ? (
              <Text style={styles.emptyText}>
                {myEventsTab === 'attended'
                  ? 'You have not checked in to an event yet.'
                  : 'You have not registered for an event yet.'}
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function formatEventWhen(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const date = start.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${startTime} – ${endTime}`;
}

function EventDetail({
  event,
  insetsTop,
  insetsBottom,
  registering,
  onClose,
  onRegister,
}: {
  event: EnrichedEvent;
  insetsTop: number;
  insetsBottom: number;
  registering: boolean;
  onClose: () => void;
  onRegister: () => void;
}) {
  const deadlinePassed = event.registrationDeadline
    ? new Date(event.registrationDeadline).getTime() < Date.now()
    : false;
  const isFull = event.availableSlots !== null && event.availableSlots <= 0;
  const slotsLabel =
    event.maxSlots == null
      ? `${event.registrationCount} registered`
      : `${event.availableSlots ?? 0} of ${event.maxSlots} slots left`;

  return (
    <View style={styles.modalRoot}>
      <View style={[styles.modalHeader, { paddingTop: insetsTop + 4 }]}>
        <TouchableOpacity style={styles.backButton} onPress={onClose} accessibilityLabel="Close event">
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Event details</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.detailContent, { paddingBottom: insetsBottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{event.category.toUpperCase()}</Text>
        </View>
        <Text style={styles.detailTitle}>{event.title}</Text>
        {event.organizerName ? (
          <Text style={styles.organizerText}>{event.organizerName}</Text>
        ) : null}

        <View style={styles.detailCard}>
          <DetailRow icon="calendar-outline" label={formatEventWhen(event.startsAt, event.endsAt)} />
          <DetailRow icon="location-outline" label={event.location} />
          <DetailRow icon="people-outline" label={slotsLabel} />
          {event.registrationDeadline ? (
            <DetailRow
              icon="time-outline"
              label={`Register by ${new Date(event.registrationDeadline).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}`}
            />
          ) : null}
        </View>

        <Text style={styles.sectionLabel}>About this event</Text>
        <Text style={styles.detailBody}>{event.description}</Text>

        {event.isRegistered && event.qrPayload ? (
          <View style={styles.ticketBox}>
            <Text style={styles.ticketLabel}>Your ticket code</Text>
            <Text style={styles.ticketCode}>{event.qrPayload}</Text>
            <Text style={styles.ticketHint}>Show this code at the venue for attendance.</Text>
          </View>
        ) : null}

        {event.isRegistered ? (
          <View style={styles.registeredNotice}>
            <Ionicons name="checkmark-circle" size={18} color="#059669" />
            <Text style={styles.registeredNoticeText}>You are registered for this event.</Text>
          </View>
        ) : deadlinePassed ? (
          <Text style={styles.closedText}>Registration for this event is closed.</Text>
        ) : isFull ? (
          <Text style={styles.closedText}>This event is full.</Text>
        ) : (
          <TouchableOpacity
            style={[styles.registerButton, registering && styles.registerButtonDisabled]}
            onPress={onRegister}
            disabled={registering}
            activeOpacity={0.85}
          >
            <Text style={styles.registerButtonText}>
              {registering ? 'Registering…' : 'Register'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={16} color="#64748B" />
      <Text style={styles.detailRowText}>{label}</Text>
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
  modalRoot: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
  },
  organizerText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
    marginTop: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  detailRowText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  detailBody: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 20,
  },
  ticketBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 16,
    marginBottom: 16,
  },
  ticketLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
    marginBottom: 6,
  },
  ticketCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  ticketHint: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  registeredNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 14,
  },
  registeredNoticeText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  closedText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 12,
  },
  registerButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonDisabled: {
    opacity: 0.65,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  tabPillText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 24,
  },
});
