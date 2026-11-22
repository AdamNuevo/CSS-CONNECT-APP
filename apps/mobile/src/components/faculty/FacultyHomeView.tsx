import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

interface ClassItem {
  time: string;
  ampm: string;
  code: string;
  section: string;
  room: string;
}

const TODAY_CLASSES: ClassItem[] = [
  {
    time: '9:00',
    ampm: 'AM',
    code: 'IT 202',
    section: 'BSIT 2-A',
    room: 'Rm 305',
  },
  {
    time: '1:00',
    ampm: 'PM',
    code: 'IT 303',
    section: 'BSIT 3-A',
    room: 'Lab 2',
  },
  {
    time: '3:00',
    ampm: 'PM',
    code: 'IT 303',
    section: 'BSIT 3-B',
    room: 'Lab 2',
  },
];

export function FacultyHomeView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const displayName = user?.lastName ? `Prof. ${user.lastName}` : 'Prof. Reyes';
  const initials = 'PR';

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.greetingWrap}>
          <Text style={styles.greetingSub}>Good morning,</Text>
          <Text style={styles.greetingName}>{displayName}</Text>
        </View>

        <View style={styles.headerIconsRow}>
          <TouchableOpacity
            style={styles.bellBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/notifications')}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={24} color="#3B82F6" />
            <View style={styles.bellBadge} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarBtn}
            activeOpacity={0.8}
            onPress={() => router.push('/profile')}
            accessibilityLabel="Profile"
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Next Class Dark Navy Card */}
        <View style={styles.nextClassCard}>
          <View style={styles.nextClassTimeRow}>
            <Ionicons name="time-outline" size={15} color="#93C5FD" style={{ marginRight: 6 }} />
            <Text style={styles.nextClassTimeText}>Next class · 1:00 PM</Text>
          </View>

          <Text style={styles.nextClassTitle}>Mobile Application Development</Text>
          <Text style={styles.nextClassSubtitle}>IT 303 · BSIT 3-A · Lab 2, Bldg A</Text>

          {/* Action Buttons Row */}
          <View style={styles.classBtnRow}>
            <TouchableOpacity
              style={styles.navigateBtn}
              activeOpacity={0.85}
              onPress={() => router.push('/campus-map')}
            >
              <Ionicons name="navigate-outline" size={16} color="#0F172A" style={{ marginRight: 6 }} />
              <Text style={styles.navigateBtnText}>Navigate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detailsBtn}
              activeOpacity={0.85}
              onPress={() => setDetailsModalVisible(true)}
            >
              <Text style={styles.detailsBtnText}>Class details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Consultation Requests Banner */}
        <TouchableOpacity
          style={styles.consultBanner}
          activeOpacity={0.85}
          onPress={() => router.navigate('/(tabs)/consult')}
        >
          <View style={styles.consultIconWrap}>
            <Ionicons name="chatbubble-outline" size={20} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.consultTitle}>3 consultation requests</Text>
            <Text style={styles.consultSubtitle}>
              Juan Dela Cruz and 2 others are waiting.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Today's Classes Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today’s classes</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.navigate('/(tabs)/schedule')}
          >
            <Text style={styles.fullScheduleLink}>Full schedule</Text>
          </TouchableOpacity>
        </View>

        {/* Classes Card List */}
        <View style={styles.classesCard}>
          {TODAY_CLASSES.map((item, idx) => (
            <React.Fragment key={`${item.code}-${item.section}-${idx}`}>
              <TouchableOpacity
                style={styles.classRow}
                activeOpacity={0.7}
                onPress={() => setDetailsModalVisible(true)}
              >
                <View style={styles.timeCol}>
                  <Text style={styles.classTimeNum}>{item.time}</Text>
                  <Text style={styles.classTimeAmpm}>{item.ampm}</Text>
                </View>

                <View style={styles.classInfoCol}>
                  <Text style={styles.classCodeText}>
                    {item.code} · {item.section}
                  </Text>
                </View>

                <Text style={styles.classRoomText}>{item.room}</Text>
              </TouchableOpacity>
              {idx < TODAY_CLASSES.length - 1 && <View style={styles.classDivider} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      {/* Class Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Class Details</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubject}>IT 303 · Mobile Application Development</Text>
            <Text style={styles.modalSchedule}>Section: BSIT 3-A · 1:00 PM – 3:00 PM</Text>
            <Text style={styles.modalVenue}>Room: Computer Lab 2, Building A</Text>
            <Text style={styles.modalStudents}>Enrolled Students: 42 students</Text>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              activeOpacity={0.85}
              onPress={() => setDetailsModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greetingWrap: {
    flex: 1,
  },
  greetingSub: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  greetingName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  nextClassCard: {
    backgroundColor: '#0F1E4A',
    borderRadius: 20,
    padding: 20,
    marginTop: 4,
    shadowColor: '#0F1E4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  nextClassTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  nextClassTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#93C5FD',
  },
  nextClassTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 6,
  },
  nextClassSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 18,
  },
  classBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navigateBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FACC15',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigateBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailsBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  consultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginTop: 16,
    gap: 14,
  },
  consultIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  consultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  consultSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  fullScheduleLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  classesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    paddingVertical: 4,
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  timeCol: {
    width: 50,
  },
  classTimeNum: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  classTimeAmpm: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  classInfoCol: {
    flex: 1,
    paddingHorizontal: 8,
  },
  classCodeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  classRoomText: {
    fontSize: 13,
    color: '#64748B',
  },
  classDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubject: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 10,
  },
  modalSchedule: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 6,
  },
  modalVenue: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 6,
  },
  modalStudents: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  modalCloseBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
