import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTabBar } from '../../context/TabBarContext';

interface FacultyConsultRequest {
  id: string;
  initials: string;
  studentName: string;
  section: string;
  studentNumber: string;
  topic: string;
  dateTime: string;
  location: string;
  message: string;
  status: 'pending' | 'approved' | 'declined';
}

const INITIAL_REQUESTS: FacultyConsultRequest[] = [
  {
    id: 'req-1',
    initials: 'JD',
    studentName: 'Juan Dela Cruz',
    section: 'BSIT 3-A',
    studentNumber: '23-0012',
    topic: 'Capstone topic feedback',
    dateTime: 'Wed, Nov 11 · 4:30 PM',
    location: 'Faculty room, Bldg A',
    message: 'I would like feedback on my capstone title and how to narrow the scope before the proposal defense.',
    status: 'pending',
  },
  {
    id: 'req-2',
    initials: 'ML',
    studentName: 'Maria Lopez',
    section: 'BSCS 2-B',
    studentNumber: '24-0089',
    topic: 'Midterm project clarification',
    dateTime: 'Thu, Nov 12 · 10:00 AM',
    location: 'Faculty room, Bldg A',
    message: 'Need help understanding the algorithm constraints for project 2.',
    status: 'pending',
  },
  {
    id: 'req-3',
    initials: 'RN',
    studentName: 'Rico Navarro',
    section: 'BSIT 3-B',
    studentNumber: '23-0441',
    topic: 'Grade inquiry',
    dateTime: 'Fri, Nov 13 · 2:00 PM',
    location: 'Faculty room, Bldg A',
    message: 'Requesting a brief consultation to verify my lab quiz 3 score.',
    status: 'pending',
  },
];

interface AvailabilitySlot {
  id: string;
  day: string;
  timeRange: string;
  location: string;
  status: '1 booked' | 'Open';
}

const INITIAL_AVAILABILITY: AvailabilitySlot[] = [
  {
    id: 'av-1',
    day: 'Monday',
    timeRange: '2:00 – 4:00 PM',
    location: 'Faculty room, Bldg A',
    status: '1 booked',
  },
  {
    id: 'av-2',
    day: 'Wednesday',
    timeRange: '4:30 – 5:30 PM',
    location: 'Faculty room, Bldg A',
    status: '1 booked',
  },
  {
    id: 'av-3',
    day: 'Thursday',
    timeRange: '10:00 AM – 12:00 PM',
    location: 'Lab 1, Bldg A',
    status: 'Open',
  },
];

export function FacultyConsultView() {
  const insets = useSafeAreaInsets();
  const { setTabBarHidden } = useTabBar();

  const [activeTab, setActiveTab] = useState<'requests' | 'availability' | 'history'>('requests');
  const [requestsList, setRequestsList] = useState<FacultyConsultRequest[]>(INITIAL_REQUESTS);
  const [availabilityList, setAvailabilityList] = useState<AvailabilitySlot[]>(INITIAL_AVAILABILITY);
  const [selectedRequest, setSelectedRequest] = useState<FacultyConsultRequest | null>(null);

  // Add availability modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDay, setNewDay] = useState('Friday');
  const [newTime, setNewTime] = useState('1:00 – 3:00 PM');
  const [newLoc, setNewLoc] = useState('Faculty room, Bldg A');

  const handleOpenDetails = (req: FacultyConsultRequest) => {
    setSelectedRequest(req);
    setTabBarHidden(true);
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
    setTabBarHidden(false);
  };

  const handleApprove = (id: string) => {
    setRequestsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' as const } : r))
    );
    Alert.alert('Approved', 'Consultation request has been approved.');
    if (selectedRequest?.id === id) {
      handleCloseDetails();
    }
  };

  const handleDecline = (id: string) => {
    setRequestsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'declined' as const } : r))
    );
    Alert.alert('Declined', 'Consultation request has been declined.');
    if (selectedRequest?.id === id) {
      handleCloseDetails();
    }
  };

  const handleAddSlot = () => {
    if (!newDay || !newTime) return;
    const newSlot: AvailabilitySlot = {
      id: `av-${Date.now()}`,
      day: newDay,
      timeRange: newTime,
      location: newLoc || 'Faculty room, Bldg A',
      status: 'Open',
    };
    setAvailabilityList([...availabilityList, newSlot]);
    setShowAddModal(false);
    Alert.alert('Success', 'Availability slot added.');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. REQUEST DETAILS SCREEN (Image 5)
  // ─────────────────────────────────────────────────────────────────────────────
  if (selectedRequest) {
    return (
      <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
        <StatusBar barStyle="dark-content" />

        {/* Nav header */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={handleCloseDetails} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navBarTitle}>Request details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 80 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Student Profile Card */}
          <View style={styles.studentCard}>
            <View style={styles.studentAvatarCircle}>
              <Text style={styles.studentAvatarText}>{selectedRequest.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.studentNameText}>{selectedRequest.studentName}</Text>
              <Text style={styles.studentSubText}>
                {selectedRequest.section} · {selectedRequest.studentNumber}
              </Text>
            </View>
          </View>

          {/* Details Card */}
          <View style={styles.infoCard}>
            {/* Topic */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="chatbubble-outline" size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Topic</Text>
                <Text style={styles.infoValue}>{selectedRequest.topic}</Text>
              </View>
            </View>

            {/* Requested slot */}
            <View style={[styles.infoRow, { marginTop: 14 }]}>
              <View style={styles.infoIconBox}>
                <Ionicons name="calendar-outline" size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Requested slot</Text>
                <Text style={styles.infoValue}>{selectedRequest.dateTime}</Text>
              </View>
            </View>

            {/* Location */}
            <View style={[styles.infoRow, { marginTop: 14 }]}>
              <View style={styles.infoIconBox}>
                <Ionicons name="location-outline" size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{selectedRequest.location}</Text>
              </View>
            </View>
          </View>

          {/* Message from student */}
          <View style={styles.messageCard}>
            <Text style={styles.messageHeading}>Message from student</Text>
            <Text style={styles.messageBody}>{selectedRequest.message}</Text>
          </View>
        </ScrollView>

        {/* Sticky Action Buttons */}
        <View style={[styles.stickyBottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={styles.declineBtn}
            activeOpacity={0.8}
            onPress={() => handleDecline(selectedRequest.id)}
          >
            <Text style={styles.declineBtnText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.approveBtn}
            activeOpacity={0.85}
            onPress={() => handleApprove(selectedRequest.id)}
          >
            <Text style={styles.approveBtnText}>Approve</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. MAIN CONSULTATIONS VIEW (Images 3 & 4)
  // ─────────────────────────────────────────────────────────────────────────────
  const pendingRequests = requestsList.filter((r) => r.status === 'pending');
  const pastRequests = requestsList.filter((r) => r.status !== 'pending');

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Consultations</Text>
      </View>

      {/* Segmented Control Pills */}
      <View style={styles.tabContainer}>
        {(['requests', 'availability', 'history'] as const).map((tab) => {
          const active = activeTab === tab;
          const label = tab === 'requests' ? 'Requests' : tab === 'availability' ? 'Availability' : 'History';
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.segmentBtn, active && styles.segmentBtnActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ─── TAB 1: REQUESTS (Image 4) ─── */}
      {activeTab === 'requests' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.requestsList}>
            {pendingRequests.map((req) => (
              <View key={req.id} style={styles.requestCard}>
                {/* Header row with avatar, name, chevron */}
                <TouchableOpacity
                  style={styles.requestTopRow}
                  activeOpacity={0.8}
                  onPress={() => handleOpenDetails(req)}
                >
                  <View style={styles.cardAvatar}>
                    <Text style={styles.cardAvatarText}>{req.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardStudentName}>{req.studentName}</Text>
                    <Text style={styles.cardStudentSection}>{req.section}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>

                {/* Topic */}
                <Text style={styles.cardTopic}>{req.topic}</Text>

                {/* Time */}
                <View style={styles.cardMetaLine}>
                  <Ionicons name="time-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                  <Text style={styles.cardMetaText}>{req.dateTime}</Text>
                </View>

                {/* Actions row: Decline / Approve */}
                <View style={styles.cardActionRow}>
                  <TouchableOpacity
                    style={styles.cardDeclineBtn}
                    activeOpacity={0.8}
                    onPress={() => handleDecline(req.id)}
                  >
                    <Text style={styles.cardDeclineText}>Decline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cardApproveBtn}
                    activeOpacity={0.85}
                    onPress={() => handleApprove(req.id)}
                  >
                    <Text style={styles.cardApproveText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {pendingRequests.length === 0 && (
              <View style={styles.emptyWrap}>
                <Ionicons name="checkmark-done-circle-outline" size={48} color="#059669" />
                <Text style={styles.emptyTitle}>All caught up!</Text>
                <Text style={styles.emptySub}>No pending consultation requests at this time.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* ─── TAB 2: AVAILABILITY (Image 3) ─── */}
      {activeTab === 'availability' && (
        <View style={{ flex: 1 }}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.availSectionHeading}>Your weekly availability</Text>

            <View style={styles.availList}>
              {availabilityList.map((slot) => {
                const isBooked = slot.status === '1 booked';
                return (
                  <View key={slot.id} style={styles.availCard}>
                    <View style={styles.availTopRow}>
                      <Text style={styles.availDayTitle}>{slot.day}</Text>
                      <View
                        style={[
                          styles.availStatusBadge,
                          isBooked ? styles.availBadgeBooked : styles.availBadgeOpen,
                        ]}
                      >
                        <Text
                          style={[
                            styles.availStatusText,
                            isBooked ? styles.availStatusTextBooked : styles.availStatusTextOpen,
                          ]}
                        >
                          {slot.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.availMetaLine}>
                      <Ionicons name="time-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                      <Text style={styles.availMetaText}>{slot.timeRange}</Text>
                    </View>

                    <View style={[styles.availMetaLine, { marginTop: 4 }]}>
                      <Ionicons name="business-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                      <Text style={styles.availMetaText}>{slot.location}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Sticky Add availability button */}
          <View style={[styles.stickyBottomBar, { paddingBottom: 84 }]}>
            <TouchableOpacity
              style={styles.addAvailBtn}
              activeOpacity={0.85}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.addAvailBtnText}>Add availability</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ─── TAB 3: HISTORY ─── */}
      {activeTab === 'history' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.requestsList}>
            {pastRequests.map((req) => (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.requestTopRow}>
                  <View style={styles.cardAvatar}>
                    <Text style={styles.cardAvatarText}>{req.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardStudentName}>{req.studentName}</Text>
                    <Text style={styles.cardStudentSection}>{req.section}</Text>
                  </View>
                  <View
                    style={[
                      styles.badgeSmall,
                      req.status === 'approved' ? styles.badgeApproved : styles.badgeDeclined,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeSmallText,
                        req.status === 'approved' ? styles.badgeApprovedText : styles.badgeDeclinedText,
                      ]}
                    >
                      {req.status === 'approved' ? 'Approved' : 'Declined'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardTopic}>{req.topic}</Text>
                <View style={styles.cardMetaLine}>
                  <Ionicons name="time-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                  <Text style={styles.cardMetaText}>{req.dateTime}</Text>
                </View>
              </View>
            ))}

            {pastRequests.length === 0 && (
              <View style={styles.emptyWrap}>
                <Ionicons name="file-tray-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No past records</Text>
                <Text style={styles.emptySub}>Consultations you approve or decline will appear here.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Add Availability Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add availability slot</Text>

            <Text style={styles.inputLabel}>Day of week</Text>
            <TextInput
              style={styles.modalInput}
              value={newDay}
              onChangeText={setNewDay}
              placeholder="e.g. Friday"
            />

            <Text style={styles.inputLabel}>Time range</Text>
            <TextInput
              style={styles.modalInput}
              value={newTime}
              onChangeText={setNewTime}
              placeholder="e.g. 1:00 – 3:00 PM"
            />

            <Text style={styles.inputLabel}>Location / Room</Text>
            <TextInput
              style={styles.modalInput}
              value={newLoc}
              onChangeText={setNewLoc}
              placeholder="e.g. Faculty room, Bldg A"
            />

            <View style={styles.modalBtnsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAddSlot}>
                <Text style={styles.modalSaveBtnText}>Save slot</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },

  /* Segmented Control */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  /* Requests List */
  requestsList: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  requestTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardAvatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardStudentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardStudentSection: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  cardTopic: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardMetaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  cardActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cardDeclineBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDeclineText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  cardApproveBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardApproveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Availability Tab */
  availSectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  availList: {
    gap: 12,
  },
  availCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  availTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  availDayTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  availStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  availBadgeBooked: {
    backgroundColor: '#EFF6FF',
  },
  availBadgeOpen: {
    backgroundColor: '#ECFDF5',
  },
  availStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  availStatusTextBooked: {
    color: '#2563EB',
  },
  availStatusTextOpen: {
    color: '#059669',
  },
  availMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availMetaText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  addAvailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D4ED8',
    height: 48,
    borderRadius: 12,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  addAvailBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Request Details View (Image 5) */
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  studentAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  studentAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  studentNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  studentSubText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  messageHeading: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 8,
  },
  messageBody: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  declineBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F87171',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
  approveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Badges */
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeSmallText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeApproved: {
    backgroundColor: '#ECFDF5',
  },
  badgeApprovedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  badgeDeclined: {
    backgroundColor: '#FEF2F2',
  },
  badgeDeclinedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 14,
  },
  modalBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#1D4ED8',
  },
  modalSaveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
