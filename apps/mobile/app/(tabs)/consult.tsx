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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/theme/tokens';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { mobileApi } from '../../src/services/dashboard';
import type {
  ProfessorWithSlots,
  SlotAvailability,
  ConsultationRequestWithDetails,
  DayOfWeek,
} from '@ccs-hub/shared';

const DAY_NAMES: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function getFutureDatesForDays(targetDays: DayOfWeek[]): Array<{ dateStr: string; display: string; day: DayOfWeek }> {
  const result: Array<{ dateStr: string; display: string; day: DayOfWeek }> = [];
  const now = new Date();

  for (let i = 1; i <= 14; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dayIdx = d.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    if (dayIdx >= 1 && dayIdx <= 6) {
      const dayName = DAY_NAMES[dayIdx - 1];
      if (targetDays.includes(dayName)) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const display = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        result.push({ dateStr, display, day: dayName });
      }
    }
  }

  return result;
}

export default function ConsultScreen() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'professors' | 'requests'>('professors');
  const [requestFilter, setRequestFilter] = useState('all');
  const [profSearch, setProfSearch] = useState('');

  // Booking Flow State
  const [selectedProf, setSelectedProf] = useState<ProfessorWithSlots | null>(null);
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<SlotAvailability | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Queries
  const {
    data: professors = [],
    isLoading: isLoadingProfs,
    refetch: refetchProfs,
    isRefetching: isRefetchingProfs,
  } = useQuery<ProfessorWithSlots[]>({
    queryKey: ['consultations', 'professors'],
    queryFn: mobileApi.getProfessors,
  });

  const {
    data: myRequests = [],
    isLoading: isLoadingRequests,
    refetch: refetchRequests,
    isRefetching: isRefetchingRequests,
  } = useQuery<ConsultationRequestWithDetails[]>({
    queryKey: ['consultations', 'my-requests', requestFilter],
    queryFn: () => mobileApi.getMyConsultationRequests(requestFilter),
  });

  const {
    data: slotAvailability = [],
    isLoading: isLoadingSlots,
  } = useQuery<SlotAvailability[]>({
    queryKey: ['consultations', 'availability', selectedProf?.id, selectedDate],
    queryFn: () =>
      selectedProf && selectedDate
        ? mobileApi.getProfessorAvailability(selectedProf.id, selectedDate)
        : Promise.resolve([]),
    enabled: !!(selectedProf && selectedDate),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: mobileApi.createConsultationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      closeBookingModal();
      setActiveTab('requests');
      Alert.alert(
        'Request Submitted',
        'Your consultation request has been sent to the professor. You will be notified once reviewed.'
      );
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Failed to submit consultation request.';
      Alert.alert('Booking Notice', msg);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: mobileApi.cancelConsultationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      Alert.alert('Request Cancelled', 'Your consultation request has been cancelled.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Failed to cancel consultation request.';
      Alert.alert('Cancellation Error', msg);
    },
  });

  const openBookingModal = (prof: ProfessorWithSlots) => {
    setSelectedProf(prof);
    setBookingStep(1);
    setSelectedDate('');
    setSelectedSlot(null);
    setSubject('');
    setMessage('');
  };

  const closeBookingModal = () => {
    setSelectedProf(null);
    setBookingStep(1);
    setSelectedDate('');
    setSelectedSlot(null);
    setSubject('');
    setMessage('');
  };

  const handleCancelRequest = (requestId: string) => {
    Alert.alert('Cancel Request', 'Are you sure you want to cancel this consultation request?', [
      { text: 'Keep It', style: 'cancel' },
      {
        text: 'Cancel Request',
        style: 'destructive',
        onPress: () => cancelMutation.mutate(requestId),
      },
    ]);
  };

  const filteredProfessors = professors.filter(
    (p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(profSearch.toLowerCase()) ||
      p.email.toLowerCase().includes(profSearch.toLowerCase())
  );

  const availableDates = selectedProf
    ? getFutureDatesForDays(selectedProf.slots.map((s) => s.day))
    : [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Faculty Consultation</Text>
        <Text style={styles.headerSubtitle}>Book 30-minute academic advising sessions</Text>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'professors' && styles.tabButtonActive]}
            onPress={() => setActiveTab('professors')}
          >
            <Ionicons
              name="people-outline"
              size={18}
              color={activeTab === 'professors' ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'professors' && styles.tabTextActive]}>
              Professors
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'requests' && styles.tabButtonActive]}
            onPress={() => setActiveTab('requests')}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={activeTab === 'requests' ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
              My Requests
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {activeTab === 'professors' ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingProfs}
              onRefresh={() => { refetchProfs(); }}
              tintColor={colors.primary}
            />
          }
        >
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search professor by name..."
              placeholderTextColor={colors.textMuted}
              value={profSearch}
              onChangeText={setProfSearch}
            />
            {profSearch.length > 0 && (
              <TouchableOpacity onPress={() => setProfSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {isLoadingProfs ? (
            <View style={styles.skeletonContainer}>
              <Skeleton height={140} borderRadius={radius.lg} />
              <Skeleton height={140} borderRadius={radius.lg} />
              <Skeleton height={140} borderRadius={radius.lg} />
            </View>
          ) : filteredProfessors.length === 0 ? (
            <EmptyState
              title="No Professors Found"
              description="No faculty members matched your search criteria."
              icon="search-outline"
            />
          ) : (
            filteredProfessors.map((prof) => (
              <Card key={prof.id} style={styles.profCard}>
                <View style={styles.profHeaderRow}>
                  <View style={styles.profAvatar}>
                    <Text style={styles.profAvatarText}>
                      {prof.firstName.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.profInfo}>
                    <Text style={styles.profName}>Prof. {prof.firstName} {prof.lastName}</Text>
                    <Text style={styles.profEmail}>{prof.email}</Text>
                    <Text style={styles.profDept}>College of Computer Studies</Text>
                  </View>
                </View>

                {/* Recurring Availability Slots Preview */}
                <View style={styles.availabilityBox}>
                  <Text style={styles.availabilityTitle}>Weekly Consultation Hours</Text>
                  {prof.slots.length > 0 ? (
                    <View style={styles.slotPillWrap}>
                      {prof.slots.map((s) => (
                        <View key={s.id} style={styles.slotPill}>
                          <Text style={styles.slotPillText}>
                            {s.day.slice(0, 3).toUpperCase()} {s.startTime} - {s.endTime}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noSlotsText}>No availability slots scheduled currently.</Text>
                  )}
                </View>

                <Button
                  label="Book Consultation"
                  variant="primary"
                  size="small"
                  disabled={prof.slots.length === 0}
                  onPress={() => openBookingModal(prof)}
                  style={styles.bookButton}
                />
              </Card>
            ))
          )}
        </ScrollView>
      ) : (
        /* My Requests Tab */
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingRequests}
              onRefresh={() => { refetchRequests(); }}
              tintColor={colors.primary}
            />
          }
        >
          {/* Status Filter Chips */}
          <View style={styles.filterChipRow}>
            {['all', 'pending', 'approved', 'declined'].map((f) => {
              const isSelected = requestFilter === f;
              return (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                  onPress={() => setRequestFilter(f)}
                >
                  <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
                    {f.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {isLoadingRequests ? (
            <View style={styles.skeletonContainer}>
              <Skeleton height={120} borderRadius={radius.lg} />
              <Skeleton height={120} borderRadius={radius.lg} />
            </View>
          ) : myRequests.length === 0 ? (
            <EmptyState
              title="No Consultation Requests"
              description="You have no consultation requests matching this filter."
              icon="calendar-outline"
            />
          ) : (
            myRequests.map((req) => {
              const isPending = req.status === 'pending';
              const isApproved = req.status === 'approved';
              const isDeclined = req.status === 'declined';

              return (
                <Card key={req.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <View style={styles.requestDateTimeBadge}>
                      <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                      <Text style={styles.requestDateTimeText}>
                        {req.requestedDate} • {req.startTime} - {req.endTime}
                      </Text>
                    </View>
                    <Badge
                      label={req.status.toUpperCase()}
                      variant={isApproved ? 'success' : isDeclined ? 'danger' : 'warning'}
                      size="small"
                    />
                  </View>

                  <Text style={styles.requestProfName}>{req.facultyName}</Text>
                  <Text style={styles.requestSubject}>{req.subject}</Text>
                  <Text style={styles.requestMessage}>{req.message}</Text>

                  {/* Faculty Note */}
                  {req.facultyNote && (
                    <View style={styles.noteCallout}>
                      <Text style={styles.noteCalloutTitle}>Professor Note:</Text>
                      <Text style={styles.noteCalloutBody}>{req.facultyNote}</Text>
                    </View>
                  )}

                  {/* Actions */}
                  {isPending && (
                    <View style={styles.requestActionRow}>
                      <Button
                        label="Cancel Request"
                        variant="ghost"
                        size="small"
                        onPress={() => handleCancelRequest(req.id)}
                      />
                    </View>
                  )}
                </Card>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Multi-Step Booking Modal */}
      <Modal
        visible={!!selectedProf}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeBookingModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalStepIndicator}>
                Step {bookingStep} of 4: {bookingStep === 1 ? 'Choose Date' : bookingStep === 2 ? 'Choose Slot' : bookingStep === 3 ? 'Consultation Details' : 'Review & Confirm'}
              </Text>
              <Text style={styles.modalProfTitle}>
                Prof. {selectedProf?.firstName} {selectedProf?.lastName}
              </Text>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={closeBookingModal}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollInner}>
            {/* Step 1: Choose Date */}
            {bookingStep === 1 && (
              <View style={styles.stepSection}>
                <Text style={styles.stepTitle}>Select Consultation Date</Text>
                <Text style={styles.stepSubtitle}>
                  Choose from available dates in the next 14 days matching professor availability.
                </Text>

                <View style={styles.dateGrid}>
                  {availableDates.map((item) => {
                    const isSelected = selectedDate === item.dateStr;
                    return (
                      <TouchableOpacity
                        key={item.dateStr}
                        style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                        onPress={() => setSelectedDate(item.dateStr)}
                      >
                        <Text style={[styles.dateCardDay, isSelected && styles.dateCardTextSelected]}>
                          {item.day.toUpperCase()}
                        </Text>
                        <Text style={[styles.dateCardDate, isSelected && styles.dateCardTextSelected]}>
                          {item.display}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Button
                  label="Continue to Slots"
                  variant="primary"
                  size="large"
                  disabled={!selectedDate}
                  onPress={() => setBookingStep(2)}
                  style={styles.stepButton}
                />
              </View>
            )}

            {/* Step 2: Choose 30-minute Slot */}
            {bookingStep === 2 && (
              <View style={styles.stepSection}>
                <Text style={styles.stepTitle}>Select 30-Minute Time Slot</Text>
                <Text style={styles.stepSubtitle}>Date: {selectedDate}</Text>

                {isLoadingSlots ? (
                  <Skeleton height={80} borderRadius={radius.md} />
                ) : slotAvailability.length === 0 ? (
                  <EmptyState
                    title="No Slots Available"
                    description="No available slots were found for this date."
                    icon="time-outline"
                  />
                ) : (
                  <View style={styles.slotGrid}>
                    {slotAvailability.map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id;
                      const isBooked = slot.isBooked;

                      return (
                        <TouchableOpacity
                          key={slot.id}
                          disabled={isBooked}
                          style={[
                            styles.slotButton,
                            isSelected && styles.slotButtonSelected,
                            isBooked && styles.slotButtonBooked,
                          ]}
                          onPress={() => setSelectedSlot(slot)}
                        >
                          <Ionicons
                            name={isBooked ? 'close-circle' : 'time-outline'}
                            size={16}
                            color={isBooked ? colors.textMuted : isSelected ? colors.textInverse : colors.primary}
                          />
                          <Text
                            style={[
                              styles.slotButtonText,
                              isSelected && styles.slotButtonTextSelected,
                              isBooked && styles.slotButtonTextBooked,
                            ]}
                          >
                            {slot.startTime} - {slot.endTime}
                          </Text>
                          {isBooked && <Text style={styles.bookedTag}>Booked</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                <View style={styles.navRow}>
                  <Button label="Back" variant="outline" onPress={() => setBookingStep(1)} />
                  <Button
                    label="Next: Details"
                    variant="primary"
                    disabled={!selectedSlot}
                    onPress={() => setBookingStep(3)}
                  />
                </View>
              </View>
            )}

            {/* Step 3: Fill Request Form */}
            {bookingStep === 3 && (
              <View style={styles.stepSection}>
                <Text style={styles.stepTitle}>Consultation Details</Text>
                <Text style={styles.stepSubtitle}>
                  Slot: {selectedDate} ({selectedSlot?.startTime} - {selectedSlot?.endTime})
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Subject / Topic *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Capstone Project proposal feedback"
                    placeholderTextColor={colors.textMuted}
                    value={subject}
                    onChangeText={setSubject}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Detailed Message / Questions *</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Provide details about what you want to consult on so the professor can prepare..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={4}
                    value={message}
                    onChangeText={setMessage}
                  />
                </View>

                <View style={styles.navRow}>
                  <Button label="Back" variant="outline" onPress={() => setBookingStep(2)} />
                  <Button
                    label="Review Request"
                    variant="primary"
                    disabled={subject.trim().length < 5 || message.trim().length < 10}
                    onPress={() => setBookingStep(4)}
                  />
                </View>
              </View>
            )}

            {/* Step 4: Review & Submit */}
            {bookingStep === 4 && (
              <View style={styles.stepSection}>
                <Text style={styles.stepTitle}>Review Your Request</Text>
                <Text style={styles.stepSubtitle}>Please confirm all details before submitting.</Text>

                <Card style={styles.reviewCard}>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Professor</Text>
                    <Text style={styles.reviewValue}>
                      Prof. {selectedProf?.firstName} {selectedProf?.lastName}
                    </Text>
                  </View>

                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Date</Text>
                    <Text style={styles.reviewValue}>{selectedDate}</Text>
                  </View>

                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Time Slot</Text>
                    <Text style={styles.reviewValue}>
                      {selectedSlot?.startTime} - {selectedSlot?.endTime} (30 mins)
                    </Text>
                  </View>

                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Subject</Text>
                    <Text style={styles.reviewValue}>{subject}</Text>
                  </View>

                  <View style={styles.reviewMessageBlock}>
                    <Text style={styles.reviewLabel}>Message</Text>
                    <Text style={styles.reviewMessageText}>{message}</Text>
                  </View>
                </Card>

                <View style={styles.navRow}>
                  <Button label="Back" variant="outline" onPress={() => setBookingStep(3)} />
                  <Button
                    label="Submit Request"
                    variant="primary"
                    isLoading={createMutation.isPending}
                    onPress={() => {
                      if (!selectedSlot) return;
                      createMutation.mutate({
                        slotId: selectedSlot.id,
                        requestedDate: selectedDate,
                        subject: subject.trim(),
                        message: message.trim(),
                      });
                    }}
                  />
                </View>
              </View>
            )}
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
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: '#93C5FD',
    marginTop: 2,
    marginBottom: spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.sm,
    minHeight: 40,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
  },
  tabText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: '#CBD5E1',
  },
  tabTextActive: {
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  skeletonContainer: {
    gap: spacing.md,
  },
  profCard: {
    padding: spacing.md,
  },
  profHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  profAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profAvatarText: {
    color: colors.textInverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  profInfo: {
    flex: 1,
  },
  profName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  profEmail: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  profDept: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  availabilityBox: {
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginVertical: spacing.xs,
  },
  availabilityTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  slotPillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  slotPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  slotPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  noSlotsText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  bookButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterChipTextSelected: {
    color: colors.textInverse,
  },
  requestCard: {
    padding: spacing.md,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  requestDateTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requestDateTimeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  requestProfName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 4,
  },
  requestSubject: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
    marginTop: 2,
  },
  requestMessage: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  noteCallout: {
    backgroundColor: '#FEF9C3',
    borderColor: '#FDE047',
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  noteCalloutTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#854D0E',
    marginBottom: 2,
  },
  noteCalloutBody: {
    fontSize: typography.sizes.xs,
    color: '#713F12',
  },
  requestActionRow: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    alignItems: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalStepIndicator: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
  },
  modalProfTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollInner: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  stepSection: {
    gap: spacing.md,
  },
  stepTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  stepSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  dateGrid: {
    gap: spacing.sm,
  },
  dateCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  dateCardDay: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
  },
  dateCardDate: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  dateCardTextSelected: {
    color: colors.primary,
  },
  stepButton: {
    marginTop: spacing.sm,
  },
  slotGrid: {
    gap: spacing.sm,
  },
  slotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  slotButtonBooked: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    opacity: 0.6,
  },
  slotButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  slotButtonTextSelected: {
    color: colors.primary,
  },
  slotButtonTextBooked: {
    color: colors.textMuted,
  },
  bookedTag: {
    fontSize: 11,
    color: colors.status.dangerText,
    fontWeight: '700',
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  reviewCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
    paddingBottom: 6,
  },
  reviewLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  reviewValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  reviewMessageBlock: {
    paddingTop: 4,
  },
  reviewMessageText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
});
