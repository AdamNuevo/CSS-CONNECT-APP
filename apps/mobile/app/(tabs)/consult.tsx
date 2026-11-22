import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/theme/tokens';
import { mobileApi } from '../../src/services/dashboard';
import { ConfirmModal } from '../../src/components/ui/ConfirmModal';
import { useTabBar } from '../../src/context/TabBarContext';
import { useAuth } from '../../src/context/AuthContext';
import { FacultyConsultView } from '../../src/components/faculty/FacultyConsultView';
import type {
  ProfessorWithSlots,
  SlotAvailability,
  ConsultationRequestWithDetails,
} from '@ccs-hub/shared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── MOCK DATA MATCHING DESIGN REFERENCE ─────────────────────────
interface MockProf {
  id: string;
  name: string;
  specialty: string;
  department: string;
  nextAvailable: string;
  location: string;
  weeklySlots: Array<{ day: string; time: string; status: 'selected' | 'open' }>;
  dates: Array<{ day: string; dateNum: string; fullDate: string }>;
  timeSlots: Array<{ time: string; available: boolean }>;
}

const DEFAULT_PROFS: MockProf[] = [
  {
    id: 'prof-elena',
    name: 'Prof. Elena Santos',
    specialty: 'Capstone Project · Research Methods',
    department: 'Computer Studies Department',
    nextAvailable: 'Next: Mon, Nov 23 · 2:00–4:00 PM',
    location: 'Faculty Office, Bldg A',
    weeklySlots: [
      { day: 'Monday', time: '2:00–4:00 PM', status: 'selected' },
      { day: 'Wednesday', time: '9:00–11:00 AM', status: 'open' },
      { day: 'Thursday', time: '10:00 AM–12:00 PM', status: 'open' },
    ],
    dates: [
      { day: 'MON', dateNum: '23', fullDate: 'Monday, November 23, 2026' },
      { day: 'WED', dateNum: '25', fullDate: 'Wednesday, November 25, 2026' },
      { day: 'THU', dateNum: '26', fullDate: 'Thursday, November 26, 2026' },
    ],
    timeSlots: [
      { time: '2:00–3:00 PM', available: true },
      { time: '3:00–4:00 PM', available: true },
    ],
  },
  {
    id: 'prof-miguel',
    name: 'Prof. Miguel Reyes',
    specialty: 'Mobile Application · Programming',
    department: 'Computer Studies Department',
    nextAvailable: 'Next: Tue, Nov 24 · 9:00–11:00 AM',
    location: 'Faculty Room, Bldg B',
    weeklySlots: [
      { day: 'Tuesday', time: '9:00–11:00 AM', status: 'selected' },
      { day: 'Thursday', time: '1:00–3:00 PM', status: 'open' },
    ],
    dates: [
      { day: 'TUE', dateNum: '24', fullDate: 'Tuesday, November 24, 2026' },
      { day: 'THU', dateNum: '26', fullDate: 'Thursday, November 26, 2026' },
    ],
    timeSlots: [
      { time: '9:00–10:00 AM', available: true },
      { time: '10:00–11:00 AM', available: true },
    ],
  },
  {
    id: 'prof-ana',
    name: 'Prof. Ana Santos',
    specialty: 'Statistics · Data Analysis',
    department: 'Humanities Department',
    nextAvailable: 'Next: Mon, Nov 23 · 9:00–11:00 AM',
    location: 'Virtual (Google Meet)',
    weeklySlots: [
      { day: 'Monday', time: '9:00–11:00 AM', status: 'selected' },
      { day: 'Wednesday', time: '2:00–4:00 PM', status: 'open' },
    ],
    dates: [
      { day: 'MON', dateNum: '23', fullDate: 'Monday, November 23, 2026' },
      { day: 'WED', dateNum: '25', fullDate: 'Wednesday, November 25, 2026' },
    ],
    timeSlots: [
      { time: '9:00–10:00 AM', available: true },
      { time: '10:00–11:00 AM', available: true },
    ],
  },
];

interface MockRequest {
  id: string;
  topic: string;
  profName: string;
  dateTime: string;
  location: string;
  status: 'pending' | 'approved' | 'declined';
  declineReason?: string;
}

const DEFAULT_REQUESTS: MockRequest[] = [
  {
    id: 'req-1',
    topic: 'Capstone topic feedback',
    profName: 'Prof. Elena Santos',
    dateTime: 'Mon, Nov 23 · 2:00–3:00 PM',
    location: 'Faculty Office, Bldg A',
    status: 'pending',
  },
  {
    id: 'req-2',
    topic: 'Programming exercise help',
    profName: 'Prof. Miguel Reyes',
    dateTime: 'Tue, Nov 24 · 9:00–10:00 AM',
    location: 'Faculty Room, Bldg B',
    status: 'approved',
  },
  {
    id: 'req-3',
    topic: 'Statistics project guidance',
    profName: 'Prof. Ana Santos',
    dateTime: 'Mon, Nov 23 · 10:00–11:00 AM',
    location: 'Virtual (Google Meet)',
    status: 'declined',
    declineReason: 'Professor is on official leave that day. Please pick another slot.',
  },
];

function StudentConsultView() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { setTabBarHidden } = useTabBar();

  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'professors' | 'requests'>('professors');
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved' | 'past'>('all');

  // Booking Flow Steps: 0 = None, 1 = Choose Schedule, 2 = Consultation Request, 3 = Review Request, 4 = Request Submitted
  const [bookingStep, setBookingStep] = useState<number>(0);
  const [selectedProf, setSelectedProf] = useState<MockProf | null>(null);

  // Hide bottom tab bar whenever user is inside any booking step
  useEffect(() => {
    setTabBarHidden(bookingStep > 0);
  }, [bookingStep, setTabBarHidden]);

  // Handle Android hardware back press when in booking flow
  useEffect(() => {
    if (bookingStep > 0) {
      const onBackPress = () => {
        handleBack();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }
  }, [bookingStep]);

  // Booking Form State
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('2:00–3:00 PM');
  const [topic, setTopic] = useState('Capstone Project · Architecture');
  const [reason, setReason] = useState(
    'Need guidance on finalizing my capstone topic and confirming the project scope.'
  );
  const [additionalMessage, setAdditionalMessage] = useState('I will bring my initial proposal for review.');

  // Local Requests list
  const [requestsList, setRequestsList] = useState<MockRequest[]>(DEFAULT_REQUESTS);

  // Confirmation Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<MockRequest | null>(null);

  // API Queries (gracefully integrated with fallback to design data)
  const { data: serverProfs = [], isRefetching: isRefetchingProfs, refetch: refetchProfs } = useQuery<
    ProfessorWithSlots[]
  >({
    queryKey: ['consultations', 'professors'],
    queryFn: mobileApi.getProfessors,
  });

  const { data: serverRequests = [], isRefetching: isRefetchingRequests, refetch: refetchRequests } = useQuery<
    ConsultationRequestWithDetails[]
  >({
    queryKey: ['consultations', 'my-requests', requestFilter],
    queryFn: () => mobileApi.getMyConsultationRequests(requestFilter),
  });

  const handleStartBooking = (prof: MockProf) => {
    setSelectedProf(prof);
    setSelectedDateIdx(0);
    setSelectedTimeSlot(prof.timeSlots[0]?.time ?? '2:00–3:00 PM');
    setBookingStep(1);
  };

  const handleBack = () => {
    if (bookingStep > 1 && bookingStep < 4) {
      setBookingStep((prev) => prev - 1);
    } else {
      setBookingStep(0);
      setSelectedProf(null);
    }
  };

  const handleSubmitRequest = () => {
    if (!selectedProf) return;
    const newReq: MockRequest = {
      id: `req-${Date.now()}`,
      topic: topic || 'Academic Advising',
      profName: selectedProf.name,
      dateTime: `${selectedProf.dates[selectedDateIdx]?.day}, Nov ${selectedProf.dates[selectedDateIdx]?.dateNum} · ${selectedTimeSlot}`,
      location: selectedProf.location,
      status: 'pending',
    };
    setRequestsList([newReq, ...requestsList]);
    setBookingStep(4); // Advance to Submitted confirmation screen
  };

  // ══════════════════════════════════════════════════════════════════
  // STEP 4: REQUEST SUBMITTED CONFIRMATION (Screen 5 in reference)
  // ══════════════════════════════════════════════════════════════════
  if (bookingStep === 4 && selectedProf) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => { setBookingStep(0); setSelectedProf(null); }} style={styles.navBackBtn}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Request details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.flowScroll} contentContainerStyle={styles.flowScrollContent}>
          {/* Success Check Badge */}
          <View style={styles.successIconWrap}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={32} color="#2563EB" />
            </View>
            <Text style={styles.successTitle}>Request submitted!</Text>
            <Text style={styles.successSubtitle}>
              Your request has been sent to {selectedProf.name}.
            </Text>
          </View>

          {/* Details Card */}
          <View style={styles.submittedCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Request status</Text>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>Pending</Text>
              </View>
            </View>

            <Text style={styles.statusNoticeTitle}>Waiting for professor's approval</Text>
            <Text style={styles.statusNoticeDesc}>
              You will receive a notification when the instructor accepts or modifies this consultation request.
            </Text>

            {/* Prof Mini Card */}
            <View style={styles.profMiniCard}>
              <View style={styles.profMiniIcon}>
                <Ionicons name="school-outline" size={20} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profMiniName}>{selectedProf.name}</Text>
                <Text style={styles.profMiniDept}>{selectedProf.department}</Text>
              </View>
            </View>

            {/* Appointment Details */}
            <Text style={styles.appointmentHeader}>Appointment details</Text>
            <View style={styles.infoLine}>
              <Ionicons name="calendar-outline" size={16} color="#64748B" style={styles.infoLineIcon} />
              <Text style={styles.infoLineText}>
                {selectedProf.dates[selectedDateIdx]?.fullDate}
              </Text>
            </View>
            <View style={styles.infoLine}>
              <Ionicons name="time-outline" size={16} color="#64748B" style={styles.infoLineIcon} />
              <Text style={styles.infoLineText}>{selectedTimeSlot}</Text>
            </View>
            <View style={styles.infoLine}>
              <Ionicons name="location-outline" size={16} color="#64748B" style={styles.infoLineIcon} />
              <Text style={styles.infoLineText}>{selectedProf.location}</Text>
            </View>

            {/* Notice Footer */}
            <View style={styles.cancelNoticeBox}>
              <Text style={styles.cancelNoticeText}>
                Need to cancel? You can cancel up to 2 hours before the scheduled time in My requests.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => {
              setBookingStep(0);
              setSelectedProf(null);
              setActiveTab('requests');
            }}
          >
            <Text style={styles.primaryBtnText}>View in My requests</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // STEP 3: REVIEW REQUEST (Screen 4 in reference)
  // ══════════════════════════════════════════════════════════════════
  if (bookingStep === 3 && selectedProf) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={handleBack} style={styles.navBackBtn}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Review request</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.flowScroll} contentContainerStyle={styles.flowScrollContent}>
          <Text style={styles.stepMainTitle}>Ready to send?</Text>
          <Text style={styles.stepMainSubtitle}>Review your consultation request details below.</Text>

          {/* Prof Card */}
          <View style={styles.profMiniCard}>
            <View style={styles.profMiniIcon}>
              <Ionicons name="school-outline" size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profMiniName}>{selectedProf.name}</Text>
              <Text style={styles.profMiniSpecialty}>{selectedProf.specialty}</Text>
            </View>
          </View>

          {/* Preferred Schedule Card */}
          <View style={styles.sectionReviewCard}>
            <View style={styles.reviewCardHeader}>
              <Text style={styles.reviewCardTitle}>Preferred schedule</Text>
              <TouchableOpacity onPress={() => setBookingStep(1)}>
                <Text style={styles.changeLink}>Change</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.scheduleRowReview}>
              <Ionicons name="calendar-outline" size={16} color="#2563EB" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.scheduleReviewDate}>
                  {selectedProf.dates[selectedDateIdx]?.fullDate}
                </Text>
                <Text style={styles.scheduleReviewTime}>
                  {selectedTimeSlot} · {selectedProf.location}
                </Text>
              </View>
            </View>
          </View>

          {/* Request Details Card */}
          <View style={styles.sectionReviewCard}>
            <View style={styles.reviewCardHeader}>
              <Text style={styles.reviewCardTitle}>Request details</Text>
              <TouchableOpacity onPress={() => setBookingStep(2)}>
                <Text style={styles.changeLink}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.reviewFieldLabel}>Topic</Text>
            <Text style={styles.reviewFieldValue}>{topic}</Text>

            <Text style={[styles.reviewFieldLabel, { marginTop: 12 }]}>Reason for consultation</Text>
            <Text style={styles.reviewFieldValue}>{reason}</Text>

            {additionalMessage ? (
              <>
                <Text style={[styles.reviewFieldLabel, { marginTop: 12 }]}>Additional message</Text>
                <Text style={styles.reviewFieldValue}>{additionalMessage}</Text>
              </>
            ) : null}
          </View>

          {/* Response Time Notice */}
          <View style={styles.calloutRow}>
            <Ionicons name="information-circle-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
            <Text style={styles.calloutText}>
              The instructor typically responds within 24–48 hours.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => setShowSubmitModal(true)}
          >
            <Text style={styles.primaryBtnText}>Submit request</Text>
          </TouchableOpacity>

          <ConfirmModal
            visible={showSubmitModal}
            title="Submit consultation request?"
            message={`Your request for "${topic}" will be submitted to ${selectedProf.name} for review.`}
            icon="calendar-outline"
            iconColor="#1D4ED8"
            iconBg="#EFF6FF"
            confirmLabel="Submit request"
            confirmVariant="primary"
            cancelLabel="Keep editing"
            onConfirm={() => {
              setShowSubmitModal(false);
              handleSubmitRequest();
            }}
            onCancel={() => setShowSubmitModal(false)}
          />
        </ScrollView>
      </View>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // STEP 2: CONSULTATION DETAILS FORM (Screen 3 in reference)
  // ══════════════════════════════════════════════════════════════════
  if (bookingStep === 2 && selectedProf) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={handleBack} style={styles.navBackBtn}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Consultation request</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.flowScroll} contentContainerStyle={styles.flowScrollContent}>
          {/* Prof Card */}
          <View style={styles.profMiniCard}>
            <View style={styles.profMiniIcon}>
              <Ionicons name="school-outline" size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profMiniName}>{selectedProf.name}</Text>
              <Text style={styles.profMiniSpecialty}>{selectedProf.specialty}</Text>
            </View>
          </View>

          {/* Consultation topic */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Consultation topic *</Text>
            <TextInput
              style={styles.textInputSingle}
              value={topic}
              onChangeText={setTopic}
              placeholder="e.g. Capstone Project · Architecture"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Reason for consultation */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Reason for consultation *</Text>
            <TextInput
              style={styles.textInputMulti}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              placeholder="Briefly state why you need consultation..."
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Selected Schedule Card */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Selected schedule *</Text>
            <View style={styles.selectedScheduleBox}>
              <View style={styles.scheduleRowInner}>
                <Ionicons name="calendar-outline" size={18} color="#2563EB" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.scheduleDateText}>
                    {selectedProf.dates[selectedDateIdx]?.fullDate}
                  </Text>
                  <Text style={styles.scheduleTimeText}>
                    {selectedTimeSlot} · {selectedProf.location}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setBookingStep(1)}>
                  <Text style={styles.changeLink}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Additional message */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Additional message (optional)</Text>
            <TextInput
              style={styles.textInputMulti}
              value={additionalMessage}
              onChangeText={setAdditionalMessage}
              multiline
              numberOfLines={3}
              placeholder="Any attachments or questions you want to prepare..."
              placeholderTextColor="#94A3B8"
            />
          </View>

          <Text style={styles.requiredCaption}>* Required fields</Text>

          <TouchableOpacity
            style={[styles.primaryBtn, (!topic.trim() || !reason.trim()) && styles.primaryBtnDisabled]}
            activeOpacity={0.85}
            disabled={!topic.trim() || !reason.trim()}
            onPress={() => setBookingStep(3)}
          >
            <Text style={styles.primaryBtnText}>Review request</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // STEP 1: CHOOSE A SCHEDULE (Screen 2 in reference)
  // ══════════════════════════════════════════════════════════════════
  if (bookingStep === 1 && selectedProf) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={handleBack} style={styles.navBackBtn}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Choose a schedule</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.flowScroll} contentContainerStyle={styles.flowScrollContent}>
          {/* Prof Card */}
          <View style={styles.profMiniCard}>
            <View style={styles.profMiniIcon}>
              <Ionicons name="school-outline" size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profMiniName}>{selectedProf.name}</Text>
              <Text style={styles.profMiniSpecialty}>{selectedProf.specialty}</Text>
            </View>
          </View>

          {/* Weekly Availability */}
          <Text style={styles.subHeading}>Weekly availability</Text>
          <View style={styles.weeklyCard}>
            {selectedProf.weeklySlots.map((slot, idx) => (
              <View
                key={slot.day}
                style={[styles.weeklyRow, idx < selectedProf.weeklySlots.length - 1 && styles.weeklyRowBorder]}
              >
                <View>
                  <Text style={styles.weeklyDay}>{slot.day}</Text>
                  <Text style={styles.weeklyTime}>{slot.time}</Text>
                </View>
                {slot.status === 'selected' ? (
                  <View style={styles.selectedPill}>
                    <Text style={styles.selectedPillText}>Selected</Text>
                  </View>
                ) : (
                  <View style={styles.openPill}>
                    <Text style={styles.openPillText}>Open</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Choose a date */}
          <View style={styles.rowBetweenHeading}>
            <Text style={styles.subHeading}>Choose a date</Text>
            <Text style={styles.monthLabel}>November 2026</Text>
          </View>

          <View style={styles.dateCardsRow}>
            {selectedProf.dates.map((d, index) => {
              const isSelected = selectedDateIdx === index;
              return (
                <TouchableOpacity
                  key={d.dateNum}
                  style={[styles.dateCard, isSelected && styles.dateCardActive]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedDateIdx(index)}
                >
                  <Text style={[styles.dateCardDay, isSelected && styles.dateCardDayActive]}>
                    {d.day}
                  </Text>
                  <Text style={[styles.dateCardNum, isSelected && styles.dateCardNumActive]}>
                    {d.dateNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Choose a time */}
          <View style={[styles.rowBetweenHeading, { marginTop: 22 }]}>
            <Text style={styles.subHeading}>Choose a time</Text>
            <Text style={styles.slotDurationLabel}>60 min per slot</Text>
          </View>

          <View style={styles.timeSlotsGrid}>
            {selectedProf.timeSlots.map((slot) => {
              const isSelected = selectedTimeSlot === slot.time;
              return (
                <TouchableOpacity
                  key={slot.time}
                  style={[styles.timeSlotBtn, isSelected && styles.timeSlotBtnActive]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedTimeSlot(slot.time)}
                >
                  <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextActive]}>
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Location row */}
          <View style={styles.locationFooterRow}>
            <Ionicons name="location-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
            <Text style={styles.locationFooterText}>{selectedProf.location}</Text>
          </View>

          {/* Continue CTA */}
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => setBookingStep(2)}
          >
            <Text style={styles.primaryBtnText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // MAIN VIEW: TABS (Professors / My requests) (Screens 1 & 6)
  // ══════════════════════════════════════════════════════════════════
  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* ── HEADER TITLE ────────────────────────────────────────── */}
      <View style={styles.headerArea}>
        <Text style={styles.screenTitle}>Consultations</Text>
      </View>

      {/* ── SEGMENTED TAB SELECTOR ──────────────────────────────── */}
      <View style={styles.segmentedTabsContainer}>
        <TouchableOpacity
          style={[styles.segmentedTab, activeTab === 'professors' && styles.segmentedTabActive]}
          activeOpacity={0.85}
          onPress={() => setActiveTab('professors')}
        >
          <Text style={[styles.segmentedTabText, activeTab === 'professors' && styles.segmentedTabTextActive]}>
            Professors
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentedTab, activeTab === 'requests' && styles.segmentedTabActive]}
          activeOpacity={0.85}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.segmentedTabText, activeTab === 'requests' && styles.segmentedTabTextActive]}>
            My requests
          </Text>
        </TouchableOpacity>
      </View>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB 1: PROFESSORS LIST (Screen 1 in reference)             */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'professors' ? (
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingProfs}
              onRefresh={() => { refetchProfs(); }}
              tintColor="#1D4ED8"
            />
          }
        >
          {/* Section Heading */}
          <View style={styles.sectionTitleBlock}>
            <Text style={styles.sectionTitleText}>Who would you like to consult?</Text>
            <Text style={styles.sectionSubtitleText}>Available professors</Text>
          </View>

          {/* Professor Cards List */}
          {DEFAULT_PROFS.map((prof) => (
            <TouchableOpacity
              key={prof.id}
              style={styles.profListCard}
              activeOpacity={0.85}
              onPress={() => handleStartBooking(prof)}
            >
              <View style={styles.profCardTopRow}>
                {/* Avatar Icon */}
                <View style={styles.profAvatarWrap}>
                  <Ionicons name="school-outline" size={20} color="#2563EB" />
                </View>

                {/* Info */}
                <View style={styles.profCardDetails}>
                  <Text style={styles.profCardName}>{prof.name}</Text>
                  <Text style={styles.profCardSpecialty}>{prof.specialty}</Text>
                </View>

                {/* Chevron */}
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </View>

              <Text style={styles.profCardDept}>{prof.department}</Text>

              {/* Next Availability Pill */}
              <View style={styles.nextSlotRow}>
                <Ionicons name="calendar-outline" size={13} color="#2563EB" style={{ marginRight: 5 }} />
                <Text style={styles.nextSlotText}>{prof.nextAvailable}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        /* ══════════════════════════════════════════════════════════ */
        /* TAB 2: MY REQUESTS (Screen 6 in reference)                 */
        /* ══════════════════════════════════════════════════════════ */
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingRequests}
              onRefresh={() => { refetchRequests(); }}
              tintColor="#1D4ED8"
            />
          }
        >
          {/* Section Heading */}
          <View style={styles.sectionTitleBlock}>
            <Text style={styles.sectionTitleText}>Your consultation requests</Text>
            <Text style={styles.sectionSubtitleText}>Track updates from your professors</Text>
          </View>

          {/* Filter Chips */}
          <View style={styles.filterChipsRow}>
            {(
              [
                { id: 'all', label: `All (${requestsList.length})` },
                { id: 'pending', label: 'Pending' },
                { id: 'approved', label: 'Approved' },
                { id: 'past', label: 'Past' },
              ] as const
            ).map((chip) => {
              const isActive = requestFilter === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setRequestFilter(chip.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Requests Cards List */}
          {requestsList
            .filter((req) => {
              if (requestFilter === 'pending') return req.status === 'pending';
              if (requestFilter === 'approved') return req.status === 'approved';
              if (requestFilter === 'past') return req.status === 'declined';
              return true;
            })
            .map((req) => {
              const isPending = req.status === 'pending';
              const isApproved = req.status === 'approved';
              const isDeclined = req.status === 'declined';

              return (
                <View key={req.id} style={styles.requestItemCard}>
                  {/* Header Row: Topic & Status Badge */}
                  <View style={styles.reqCardHeader}>
                    <Text style={styles.reqTopicText}>{req.topic}</Text>
                    <View
                      style={[
                        styles.reqBadge,
                        isApproved && styles.reqBadgeApproved,
                        isDeclined && styles.reqBadgeDeclined,
                        isPending && styles.reqBadgePending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.reqBadgeText,
                          isApproved && styles.reqBadgeTextApproved,
                          isDeclined && styles.reqBadgeTextDeclined,
                          isPending && styles.reqBadgeTextPending,
                        ]}
                      >
                        {isApproved ? 'Approved' : isDeclined ? 'Declined' : 'Pending'}
                      </Text>
                    </View>
                  </View>

                  {/* Professor */}
                  <Text style={styles.reqProfNameText}>{req.profName}</Text>

                  {/* Date & Time */}
                  <View style={styles.reqMetaLine}>
                    <Ionicons name="time-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                    <Text style={styles.reqMetaText}>{req.dateTime}</Text>
                  </View>

                  {/* Location */}
                  <View style={styles.reqMetaLine}>
                    <Ionicons name="location-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                    <Text style={styles.reqMetaText}>{req.location}</Text>
                  </View>

                  {/* Reason Callout if Declined */}
                  {req.declineReason && (
                    <View style={styles.declineCallout}>
                      <Text style={styles.declineCalloutText}>{req.declineReason}</Text>
                    </View>
                  )}

                  {/* Cancel Button if Pending */}
                  {isPending && (
                    <TouchableOpacity
                      style={{ marginTop: 10, alignSelf: 'flex-start' }}
                      onPress={() => {
                        setRequestToCancel(req);
                        setShowCancelModal(true);
                      }}
                    >
                      <Text style={{ fontSize: 12, color: '#DC2626', fontWeight: '600' }}>
                        Cancel request
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
        </ScrollView>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        visible={showCancelModal}
        title="Cancel consultation request?"
        message={`Are you sure you want to cancel your consultation request with ${requestToCancel?.profName}?`}
        icon="alert-circle-outline"
        iconColor="#DC2626"
        iconBg="#FEF2F2"
        confirmLabel="Cancel request"
        confirmVariant="danger"
        cancelLabel="Keep request"
        onConfirm={() => {
          if (requestToCancel) {
            setRequestsList((prev) => prev.filter((r) => r.id !== requestToCancel.id));
          }
          setShowCancelModal(false);
          setRequestToCancel(null);
        }}
        onCancel={() => {
          setShowCancelModal(false);
          setRequestToCancel(null);
        }}
      />
    </View>
  );
}

export default function ConsultScreen() {
  const { user } = useAuth();
  if (user?.role === 'faculty') {
    return <FacultyConsultView />;
  }
  return <StudentConsultView />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* Screen Title & Top Bar */
  headerArea: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },

  /* Segmented Tab Controls */
  segmentedTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginHorizontal: 20,
    padding: 3,
    marginBottom: 16,
  },
  segmentedTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  segmentedTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentedTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  segmentedTabTextActive: {
    fontWeight: '700',
    color: '#0F172A',
  },

  /* Main Scroll */
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  sectionTitleBlock: {
    marginBottom: 16,
  },
  sectionTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitleText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },

  /* Professor Cards */
  profListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  profCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profCardDetails: {
    flex: 1,
  },
  profCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  profCardSpecialty: {
    fontSize: 12,
    color: '#64748B',
  },
  profCardDept: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 10,
    marginBottom: 8,
  },
  nextSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextSlotText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },

  /* My Requests Filter Chips */
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#1E40AF',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  /* Request Item Card */
  requestItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reqCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reqTopicText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  reqBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reqBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  reqBadgeApproved: {
    backgroundColor: '#DCFCE7',
  },
  reqBadgeDeclined: {
    backgroundColor: '#FEE2E2',
  },
  reqBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reqBadgeTextPending: {
    color: '#D97706',
  },
  reqBadgeTextApproved: {
    color: '#166534',
  },
  reqBadgeTextDeclined: {
    color: '#DC2626',
  },
  reqProfNameText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 10,
  },
  reqMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reqMetaText: {
    fontSize: 12,
    color: '#64748B',
  },
  declineCallout: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  declineCalloutText: {
    fontSize: 12,
    color: '#DC2626',
    lineHeight: 16,
  },

  /* Flow Navigation Bar */
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  navBackBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  flowScroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flowScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 64,
  },

  /* Mini Prof Card in Flow */
  profMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profMiniIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profMiniName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  profMiniSpecialty: {
    fontSize: 12,
    color: '#64748B',
  },
  profMiniDept: {
    fontSize: 12,
    color: '#64748B',
  },

  /* Step Subheadings */
  subHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  rowBetweenHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  slotDurationLabel: {
    fontSize: 12,
    color: '#64748B',
  },

  /* Weekly Availability Card */
  weeklyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  weeklyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  weeklyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  weeklyDay: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  weeklyTime: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  selectedPill: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  openPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },

  /* Date Cards */
  dateCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateCard: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCardActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  dateCardDay: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  dateCardDayActive: {
    color: '#FFFFFF',
  },
  dateCardNum: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  dateCardNumActive: {
    color: '#FFFFFF',
  },

  /* Time Slots */
  timeSlotsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  timeSlotBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  timeSlotBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  timeSlotTextActive: {
    color: '#1D4ED8',
  },

  locationFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  locationFooterText: {
    fontSize: 13,
    color: '#64748B',
  },

  /* Step 2 Form Fields */
  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  textInputSingle: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  textInputMulti: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  selectedScheduleBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  scheduleRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleDateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  scheduleTimeText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  changeLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  requiredCaption: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 24,
  },

  /* Review Request Step */
  stepMainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  stepMainSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
  },
  sectionReviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  reviewCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  scheduleRowReview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  scheduleReviewDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  scheduleReviewTime: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  reviewFieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  reviewFieldValue: {
    fontSize: 13,
    color: '#0F172A',
    marginTop: 3,
    lineHeight: 18,
  },
  calloutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  calloutText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },

  /* Success Confirmation Screen */
  successIconWrap: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  submittedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 28,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  statusNoticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  statusNoticeDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  appointmentHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 14,
    marginBottom: 10,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLineIcon: {
    marginRight: 8,
  },
  infoLineText: {
    fontSize: 13,
    color: '#334155',
  },
  cancelNoticeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
  },
  cancelNoticeText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },

  /* Primary Button */
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
