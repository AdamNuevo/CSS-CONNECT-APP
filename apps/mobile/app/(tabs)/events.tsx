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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors, spacing, typography, radius, shadows } from '../../src/theme/tokens';
import { dashboardService } from '../../src/services/dashboard';
import { useAuth } from '../../src/context/AuthContext';
import type { EnrichedEvent, EventCategory } from '@ccs-hub/shared';

type EventFilter = 'All' | 'Seminar' | 'Workshop' | 'Competition';

export default function EventsScreen() {
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
      if (selectedEvent) {
        setSelectedEvent({
          ...selectedEvent,
          registrationCount: 22,
      createdBy: 'admin',
      isRegistered: true,
          qrPayload: data.qrPayload,
        });
      }
      Alert.alert('Registration Successful', 'You have been registered! Your QR ticket is ready.');
    },
    onError: (err: any) => {
      Alert.alert('Registration Failed', err.response?.data?.error?.message || 'Could not register for this event.');
    },
  });

  // Sample fallback events matching the mockup if DB has few
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
      registrationCount: 22,
      createdBy: 'admin',
      isRegistered: true,
      qrPayload: 'CCS-EVT-CYBER-2026-8812',
      organizerName: 'QCU Cybersecurity Guild',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: true,
    },
    {
      id: 'evt-3',
      title: 'Capstone Pitch Competition',
      category: 'competition' as EventCategory,
      description: 'Annual project showcase for senior IT and CS students. Present your prototype to industry judges.',
      location: 'Auditorium',
      startsAt: new Date(Date.now() + 86400000 * 10).toISOString(),
      endsAt: new Date(Date.now() + 86400000 * 10 + 14400000).toISOString(),
      registrationDeadline: new Date(Date.now() + 86400000 * 8).toISOString(),
      maxSlots: 20,
      availableSlots: 12,
      registrationCount: 30,
      createdBy: 'admin',
      isRegistered: false,
      organizerName: 'College of Computer Studies',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: true,
    },
    {
      id: 'evt-4',
      title: 'Intro to AI Webinar',
      category: 'seminar' as EventCategory,
      description: 'Explore neural networks, LLMs, and real-world AI applications.',
      location: 'Online',
      startsAt: new Date(Date.now() + 86400000 * 12).toISOString(),
      endsAt: new Date(Date.now() + 86400000 * 12 + 7200000).toISOString(),
      registrationDeadline: new Date(Date.now() + 86400000 * 11).toISOString(),
      maxSlots: 300,
      availableSlots: 200,
      registrationCount: 30,
      createdBy: 'admin',
      isRegistered: false,
      organizerName: 'CCS AI Research Lab',
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

      {/* Top Header */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 20) + 12 }]}>
        <View style={styles.titleArea}>
          <Text style={styles.screenTitle}>Events</Text>
          <Text style={styles.screenSubtitle}>Organized by CCS and student orgs</Text>
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

      {/* Events List */}
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
        {filteredEvents.map((event) => {
          const styleConfig = getCategoryStyle(event.category);

          return (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              activeOpacity={0.8}
              onPress={() => setSelectedEvent(event)}
            >
              {/* Left Colored Category Box */}
              <View style={[styles.eventIconBox, { backgroundColor: styleConfig.bg }]}>
                <Ionicons name={styleConfig.icon as any} size={22} color={styleConfig.color} />
                <Text style={[styles.eventCategoryTag, { color: styleConfig.color }]}>
                  {styleConfig.label}
                </Text>
              </View>

              {/* Right Event Content */}
              <View style={styles.eventContent}>
                <Text style={styles.eventCardTitle} numberOfLines={2}>
                  {event.title}
                </Text>
                <View style={styles.eventMetaRow}>
                  <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                  <Text style={styles.eventMetaText}>
                    {new Date(event.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} •{' '}
                    {new Date(event.startsAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.eventMetaRow}>
                  <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                  <Text style={styles.eventMetaText} numberOfLines={1}>
                    {event.location}
                  </Text>
                </View>

                <View style={styles.eventFooterRow}>
                  <Text style={styles.eventSlotsText}>
                    {event.availableSlots !== null ? `${event.availableSlots} slots left` : 'Open registration'}
                  </Text>
                  {event.isRegistered && (
                    <View style={styles.registeredPill}>
                      <Ionicons name="checkmark-circle" size={11} color="#15803D" />
                      <Text style={styles.registeredPillText}>Registered</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          user={user}
          onClose={() => setSelectedEvent(null)}
          onRegister={() => registerMutation.mutate(selectedEvent.id)}
          isRegistering={registerMutation.isPending}
          onViewTicket={() => {
            setSelectedEvent(null);
            setShowMyEventsModal(true);
          }}
        />
      )}

      {/* My Events Modal */}
      {showMyEventsModal && (
        <MyEventsModal
          registeredEvents={registeredEvents}
          tab={myEventsTab}
          setTab={setMyEventsTab}
          user={user}
          onClose={() => setShowMyEventsModal(false)}
        />
      )}
    </View>
  );
}

function getCategoryStyle(cat: string) {
  switch (cat.toLowerCase()) {
    case 'workshop':
      return {
        bg: '#FEF3C7',
        color: '#D97706',
        icon: 'construct-outline',
        label: 'Workshop',
      };
    case 'seminar':
      return {
        bg: '#EDE9FE',
        color: '#6366F1',
        icon: 'easel-outline',
        label: 'Seminar',
      };
    case 'competition':
      return {
        bg: '#FFE4E6',
        color: '#E11D48',
        icon: 'trophy-outline',
        label: 'Competition',
      };
    default:
      return {
        bg: '#D1FAE5',
        color: '#059669',
        icon: 'globe-outline',
        label: 'Webinar',
      };
  }
}

// ============================================================================
// MODAL 1: EVENT DETAILS
// ============================================================================

function EventDetailsModal({
  event,
  user,
  onClose,
  onRegister,
  isRegistering,
  onViewTicket,
}: {
  event: EnrichedEvent;
  user: any;
  onClose: () => void;
  onRegister: () => void;
  isRegistering: boolean;
  onViewTicket: () => void;
}) {
  const insets = useSafeAreaInsets();
  const styleConfig = getCategoryStyle(event.category);

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        {/* Top Header */}
        <View style={[styles.modalTopBar, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity onPress={onClose} style={styles.modalBackButton}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTopBarTitle}>Event details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
          {/* Poster Placeholder */}
          <View style={styles.posterBox}>
            <Ionicons name="image-outline" size={32} color="#D97706" />
            <Text style={styles.posterText}>Event poster</Text>
          </View>

          {/* Category Tag */}
          <View style={[styles.detailsCategoryPill, { backgroundColor: styleConfig.bg }]}>
            <Text style={[styles.detailsCategoryText, { color: styleConfig.color }]}>
              {styleConfig.label}
            </Text>
          </View>

          {/* Title & Organizer */}
          <Text style={styles.detailsEventTitle}>{event.title}</Text>
          <Text style={styles.detailsOrganizer}>
            by {event.organizerName ?? 'CCS Computer Society'}
          </Text>

          {/* Metadata Card */}
          <View style={styles.metaInfoCard}>
            <InfoRow
              icon="calendar-outline"
              label="Date"
              value={new Date(event.startsAt).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            />
            <InfoRow
              icon="time-outline"
              label="Time"
              value={`${new Date(event.startsAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })} - ${new Date(event.endsAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}`}
            />
            <InfoRow icon="location-outline" label="Venue" value={event.location} />
            <InfoRow
              icon="calendar-number-outline"
              label="Register by"
              value={new Date(event.registrationDeadline ?? event.startsAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            />
            <InfoRow
              icon="people-outline"
              label="Slots"
              value={event.availableSlots !== null ? `${event.availableSlots} of ${event.maxSlots ?? 60} left` : 'Open'}
            />
          </View>

          {/* About Section */}
          <View style={styles.aboutCard}>
            <Text style={styles.aboutHeader}>About</Text>
            <Text style={styles.aboutBody}>
              {event.description ||
                'A hands-on introduction to deploying and managing applications in the cloud. Bring your laptop.'}
            </Text>
          </View>
        </ScrollView>

        {/* Sticky Action Button */}
        <View style={[styles.modalBottomBar, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
          {event.isRegistered ? (
            <TouchableOpacity style={styles.primaryButton} onPress={onViewTicket} activeOpacity={0.85}>
              <Ionicons name="qr-code-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.primaryButtonText}>View My Ticket</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.primaryButton, isRegistering && styles.buttonDisabled]}
              onPress={onRegister}
              disabled={isRegistering}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>
                {isRegistering ? 'Registering…' : 'Register for this event'}
              </Text>
            </TouchableOpacity>
          )}
          <Text style={styles.modalBottomHint}>You will get a personal QR code after registering.</Text>
        </View>
      </View>
    </Modal>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <View style={infoStyles.iconBox}>
        <Ionicons name={icon as any} size={18} color={colors.primary} />
      </View>
      <View style={infoStyles.textGroup}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  iconBox: {
    width: 32,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  textGroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  value: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
});

// ============================================================================
// MODAL 2: MY EVENTS (QR TICKET)
// ============================================================================

function MyEventsModal({
  registeredEvents,
  tab,
  setTab,
  user,
  onClose,
}: {
  registeredEvents: EnrichedEvent[];
  tab: 'registered' | 'attended';
  setTab: (t: 'registered' | 'attended') => void;
  user: any;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const primaryTicket = registeredEvents[0];

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        {/* Top Header */}
        <View style={[styles.modalTopBar, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity onPress={onClose} style={styles.modalBackButton}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTopBarTitle}>My events</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Segmented Filter */}
        <View style={styles.ticketTabsRow}>
          <TouchableOpacity
            style={[styles.ticketTabItem, tab === 'registered' && styles.ticketTabItemActive]}
            onPress={() => setTab('registered')}
          >
            <Text style={[styles.ticketTabText, tab === 'registered' && styles.ticketTabTextActive]}>
              Registered
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ticketTabItem, tab === 'attended' && styles.ticketTabItemActive]}
            onPress={() => setTab('attended')}
          >
            <Text style={[styles.ticketTabText, tab === 'attended' && styles.ticketTabTextActive]}>
              Attended
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
          {/* Main QR Code Ticket Card */}
          {primaryTicket ? (
            <View style={styles.ticketCard}>
              <View style={styles.ticketTopBadge}>
                <Text style={styles.ticketTopBadgeText}>Registered</Text>
              </View>

              <Text style={styles.ticketEventTitle}>{primaryTicket.title}</Text>
              <Text style={styles.ticketEventSubtitle}>
                {new Date(primaryTicket.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} •{' '}
                {new Date(primaryTicket.startsAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} •{' '}
                {primaryTicket.location}
              </Text>

              {/* Graphic QR Code Box */}
              <View style={styles.qrContainer}>
                <View style={styles.qrBoxVisual}>
                  <VisualQrCode payload={primaryTicket.qrPayload ?? 'CCS-EVT-2026-CLOUD'} />
                </View>
              </View>

              {/* Attendee Info */}
              <Text style={styles.attendeeName}>
                {user?.firstName ?? 'Juan'} {user?.lastName ?? 'Dela Cruz'}
              </Text>
              <Text style={styles.attendeeDetails}>
                {user?.studentNumber ?? '23-0012'} • {user?.program ?? 'BSIT'} {user?.section ?? '3-A'}
              </Text>

              <Text style={styles.ticketInstructions}>
                Show this QR to the organizer at the entrance.
              </Text>
            </View>
          ) : (
            <View style={styles.emptyTicketCard}>
              <Ionicons name="ticket-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTicketTitle}>No event registrations yet</Text>
              <Text style={styles.emptyTicketSub}>Register for an event to receive your QR entry ticket.</Text>
            </View>
          )}

          {/* Secondary Event List */}
          {registeredEvents.slice(1).map((evt) => (
            <View key={evt.id} style={styles.secondaryEventCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.secondaryEventTitle}>{evt.title}</Text>
                <Text style={styles.secondaryEventTime}>
                  {new Date(evt.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} •{' '}
                  {new Date(evt.startsAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.ticketMiniBadge}>
                <Text style={styles.ticketMiniBadgeText}>Registered</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

// Clean visual QR pattern generator
function VisualQrCode({ payload }: { payload: string }) {
  return (
    <View style={qrStyles.matrix}>
      {/* Top Left Corner Marker */}
      <View style={[qrStyles.cornerMarker, { top: 12, left: 12 }]}>
        <View style={qrStyles.innerDot} />
      </View>
      {/* Top Right Corner Marker */}
      <View style={[qrStyles.cornerMarker, { top: 12, right: 12 }]}>
        <View style={qrStyles.innerDot} />
      </View>
      {/* Bottom Left Corner Marker */}
      <View style={[qrStyles.cornerMarker, { bottom: 12, left: 12 }]}>
        <View style={qrStyles.innerDot} />
      </View>

      {/* Center Simulated QR Pattern */}
      <View style={qrStyles.centerPattern}>
        <View style={qrStyles.patternRow}>
          <View style={qrStyles.b} /><View style={qrStyles.w} /><View style={qrStyles.b} /><View style={qrStyles.b} />
        </View>
        <View style={qrStyles.patternRow}>
          <View style={qrStyles.w} /><View style={qrStyles.b} /><View style={qrStyles.w} /><View style={qrStyles.b} />
        </View>
        <View style={qrStyles.patternRow}>
          <View style={qrStyles.b} /><View style={qrStyles.b} /><View style={qrStyles.b} /><View style={qrStyles.w} />
        </View>
        <View style={qrStyles.patternRow}>
          <View style={qrStyles.b} /><View style={qrStyles.w} /><View style={qrStyles.b} /><View style={qrStyles.b} />
        </View>
      </View>
    </View>
  );
}

const qrStyles = StyleSheet.create({
  matrix: {
    width: 170,
    height: 170,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#0F172A',
    borderRadius: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerMarker: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderWidth: 5,
    borderColor: '#0F172A',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerDot: {
    width: 14,
    height: 14,
    backgroundColor: '#0F172A',
    borderRadius: 2,
  },
  centerPattern: {
    width: 60,
    height: 60,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  b: {
    width: 10,
    height: 10,
    backgroundColor: '#0F172A',
    borderRadius: 1,
  },
  w: {
    width: 10,
    height: 10,
    backgroundColor: '#FFF',
  },
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  titleArea: {
    flex: 1,
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
  myTicketsButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    ...shadows.card,
  },
  ticketBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.accent,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: typography.weights.bold,
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
  // Event Card
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  eventIconBox: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    paddingHorizontal: 4,
  },
  eventCategoryTag: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    marginTop: 4,
  },
  eventContent: {
    flex: 1,
  },
  eventCardTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  eventMetaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  eventFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  eventSlotsText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: typography.weights.medium,
  },
  registeredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    gap: 3,
  },
  registeredPillText: {
    fontSize: 10,
    color: '#15803D',
    fontWeight: typography.weights.semibold,
  },
  // Modal Common
  modalRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  modalBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTopBarTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  modalScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  posterBox: {
    height: 140,
    backgroundColor: '#FEF3C7',
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  posterText: {
    fontSize: typography.sizes.xs,
    color: '#B45309',
    fontWeight: typography.weights.semibold,
    marginTop: 4,
  },
  detailsCategoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: spacing.xs,
  },
  detailsCategoryText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  detailsEventTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  detailsOrganizer: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    marginTop: 2,
  },
  metaInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  aboutCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  aboutHeader: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  aboutBody: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  modalBottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 50,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
  },
  modalBottomHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  // My Events Modal
  ticketTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: radius.full,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: 3,
  },
  ticketTabItem: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  ticketTabItemActive: {
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  ticketTabText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  ticketTabTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  ticketCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  ticketTopBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  ticketTopBadgeText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: '#15803D',
  },
  ticketEventTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  ticketEventSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  qrBoxVisual: {
    padding: spacing.sm,
    backgroundColor: '#FFF',
    borderRadius: radius.lg,
  },
  attendeeName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  attendeeDetails: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ticketInstructions: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptyTicketCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  emptyTicketTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  emptyTicketSub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  secondaryEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  secondaryEventTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  secondaryEventTime: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ticketMiniBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  ticketMiniBadgeText: {
    fontSize: 10,
    color: '#15803D',
    fontWeight: typography.weights.bold,
  },
});
