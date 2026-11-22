import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTabBar } from '../../context/TabBarContext';

interface DayItem {
  key: string;
  short: string;
  dateNum: number;
  fullDate: string;
}

const WEEK_DAYS: DayItem[] = [
  { key: 'mon', short: 'Mon', dateNum: 9, fullDate: 'Monday, Nov 9' },
  { key: 'tue', short: 'Tue', dateNum: 10, fullDate: 'Tuesday, Nov 10' },
  { key: 'wed', short: 'Wed', dateNum: 11, fullDate: 'Wednesday, Nov 11' },
  { key: 'thu', short: 'Thu', dateNum: 12, fullDate: 'Thursday, Nov 12' },
  { key: 'fri', short: 'Fri', dateNum: 13, fullDate: 'Friday, Nov 13' },
  { key: 'sat', short: 'Sat', dateNum: 14, fullDate: 'Saturday, Nov 14' },
];

interface ScheduleClass {
  id: string;
  timeHour: string;
  timePeriod: string;
  title: string;
  courseCode: string;
  section: string;
  room: string;
  students: number;
  isNext?: boolean;
  scheduleTimeFull: string;
}

const WED_CLASSES: ScheduleClass[] = [
  {
    id: 'c-1',
    timeHour: '9:00',
    timePeriod: 'AM',
    title: 'Object-Oriented Programming',
    courseCode: 'IT 202',
    section: 'BSIT 2-A',
    room: 'Lab 2',
    students: 35,
    isNext: false,
    scheduleTimeFull: 'Wednesday, 9:00 – 10:30 AM',
  },
  {
    id: 'c-2',
    timeHour: '1:00',
    timePeriod: 'PM',
    title: 'Mobile Application Development',
    courseCode: 'IT 303',
    section: 'BSIT 3-A',
    room: 'Lab 2',
    students: 35,
    isNext: true,
    scheduleTimeFull: 'Wednesday, 1:00 – 2:30 PM',
  },
  {
    id: 'c-3',
    timeHour: '3:00',
    timePeriod: 'PM',
    title: 'Mobile Application Development',
    courseCode: 'IT 303',
    section: 'BSIT 3-B',
    room: 'Lab 2',
    students: 35,
    isNext: false,
    scheduleTimeFull: 'Wednesday, 3:00 – 4:30 PM',
  },
];

interface AssignedSubject {
  id: string;
  code: string;
  sectionBadge: string;
  title: string;
  schedule: string;
  room: string;
}

const ASSIGNED_SUBJECTS: AssignedSubject[] = [
  {
    id: 'sub-1',
    code: 'IT 303',
    sectionBadge: 'BSIT 3-A · BSIT 3-B',
    title: 'Mobile Application Development',
    schedule: 'Wed 1:00 – 4:30 PM',
    room: 'Lab 2, Bldg A',
  },
  {
    id: 'sub-2',
    code: 'IT 202',
    sectionBadge: 'BSIT 2-A',
    title: 'Object-Oriented Programming',
    schedule: 'Wed & Fri 9:00 – 10:30 AM',
    room: 'Rm 305, Bldg A',
  },
  {
    id: 'sub-3',
    code: 'IT 405',
    sectionBadge: 'BSIT 4-A',
    title: 'Cloud Computing',
    schedule: 'Thu 1:00 – 4:00 PM',
    room: 'Lab 1, Bldg A',
  },
];

export function FacultyClassesView() {
  const insets = useSafeAreaInsets();
  const { setTabBarHidden } = useTabBar();

  const [activeTab, setActiveTab] = useState<'schedule' | 'subjects'>('schedule');
  const [selectedDay, setSelectedDay] = useState<string>('wed');
  const [selectedClass, setSelectedClass] = useState<ScheduleClass | null>(null);

  const handleOpenDetails = (c: ScheduleClass) => {
    setSelectedClass(c);
    setTabBarHidden(true);
  };

  const handleCloseDetails = () => {
    setSelectedClass(null);
    setTabBarHidden(false);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CLASS DETAILS MODAL / SCREEN (Image 2)
  // ─────────────────────────────────────────────────────────────────────────────
  if (selectedClass) {
    return (
      <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
        <StatusBar barStyle="dark-content" />
        
        {/* Nav header */}
        <View style={styles.detailsHeader}>
          <TouchableOpacity onPress={handleCloseDetails} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.detailsHeaderTitle}>Class details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.detailsScroll}
          contentContainerStyle={[
            styles.detailsScrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Next class badge */}
          {selectedClass.isNext && (
            <View style={styles.nextClassPill}>
              <Text style={styles.nextClassPillText}>Next class</Text>
            </View>
          )}

          {/* Big title */}
          <Text style={styles.detailsClassTitle}>{selectedClass.title}</Text>

          {/* Info cards list */}
          <View style={styles.infoCardsWrap}>
            {/* Subject */}
            <View style={styles.infoCardRow}>
              <View style={styles.iconBox}>
                <Ionicons name="book-outline" size={20} color="#2563EB" />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Subject</Text>
                <Text style={styles.infoCardValue}>
                  {selectedClass.courseCode} · {selectedClass.title}
                </Text>
              </View>
            </View>

            {/* Section */}
            <View style={styles.infoCardRow}>
              <View style={styles.iconBox}>
                <Ionicons name="people-outline" size={20} color="#2563EB" />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Section</Text>
                <Text style={styles.infoCardValue}>
                  {selectedClass.section} · {selectedClass.students} students
                </Text>
              </View>
            </View>

            {/* Schedule */}
            <View style={styles.infoCardRow}>
              <View style={styles.iconBox}>
                <Ionicons name="time-outline" size={20} color="#2563EB" />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Schedule</Text>
                <Text style={styles.infoCardValue}>{selectedClass.scheduleTimeFull}</Text>
              </View>
            </View>

            {/* Classroom */}
            <View style={styles.infoCardRow}>
              <View style={styles.iconBox}>
                <Ionicons name="business-outline" size={20} color="#2563EB" />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Classroom</Text>
                <Text style={styles.infoCardValue}>{selectedClass.room}, Bldg A · 2nd floor</Text>
              </View>
            </View>

            {/* Academic term */}
            <View style={styles.infoCardRow}>
              <View style={styles.iconBox}>
                <Ionicons name="calendar-outline" size={20} color="#2563EB" />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Academic term</Text>
                <Text style={styles.infoCardValue}>1st Semester, AY 2025–2026</Text>
              </View>
            </View>
          </View>

          {/* Action buttons */}
          <TouchableOpacity
            style={styles.navigateBtn}
            activeOpacity={0.85}
            onPress={() => Alert.alert('Navigate', `Opening route to ${selectedClass.room}, Bldg A`)}
          >
            <Ionicons name="location" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.navigateBtnText}>Navigate to room</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roomInfoBtn}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Room Info', `${selectedClass.room} · Capacity: 40 seats · Air-conditioned with projector.`)}
          >
            <Ionicons name="business-outline" size={18} color="#1E3A8A" style={{ marginRight: 8 }} />
            <Text style={styles.roomInfoBtnText}>Room info</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN CLASSES DASHBOARD (Images 1 & 6)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Classes</Text>
        <Text style={styles.headerSubtitle}>1st Semester · AY 2025–2026</Text>
      </View>

      {/* Segmented Control: Schedule vs Subjects */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'schedule' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('schedule')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, activeTab === 'schedule' && styles.segmentTextActive]}>
            Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'subjects' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('subjects')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, activeTab === 'subjects' && styles.segmentTextActive]}>
            Subjects
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── TAB 1: SCHEDULE (Image 6) ─── */}
      {activeTab === 'schedule' ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Horizontal Day Selector */}
          <View style={styles.daysRow}>
            {WEEK_DAYS.map((d) => {
              const isSelected = selectedDay === d.key;
              return (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.dayCard, isSelected && styles.dayCardSelected]}
                  onPress={() => setSelectedDay(d.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayShort, isSelected && styles.dayShortSelected]}>
                    {d.short}
                  </Text>
                  <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>
                    {d.dateNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Subheader: Day & Class count */}
          <View style={styles.subHeaderRow}>
            <Text style={styles.subHeaderDate}>Wednesday, Nov 11</Text>
            <Text style={styles.subHeaderCount}>4 classes</Text>
          </View>

          {/* Classes timeline */}
          <View style={styles.classesList}>
            {WED_CLASSES.map((item) => (
              <View key={item.id} style={styles.scheduleRow}>
                {/* Time column */}
                <View style={styles.timeCol}>
                  <Text style={styles.timeHour}>{item.timeHour}</Text>
                  <Text style={styles.timeAmpm}>{item.timePeriod}</Text>
                </View>

                {/* Class card */}
                <TouchableOpacity
                  style={styles.classCard}
                  activeOpacity={0.85}
                  onPress={() => handleOpenDetails(item)}
                >
                  <View style={styles.cardTopRow}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    {item.isNext && (
                      <View style={styles.nextBadgeSmall}>
                        <Text style={styles.nextBadgeSmallText}>Next</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.cardCodeSection}>
                    {item.courseCode} · {item.section}
                  </Text>
                  <Text style={styles.cardRoomStudents}>
                    {item.room} · {item.students} students
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        /* ─── TAB 2: SUBJECTS (Image 1) ─── */
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.assignedHeading}>Assigned subjects</Text>

          <View style={styles.subjectsList}>
            {ASSIGNED_SUBJECTS.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                style={styles.subjectCard}
                activeOpacity={0.85}
                onPress={() => {
                  const matched = WED_CLASSES.find((c) => c.courseCode === sub.code) || {
                    id: sub.id,
                    timeHour: '1:00',
                    timePeriod: 'PM',
                    title: sub.title,
                    courseCode: sub.code,
                    section: sub.sectionBadge,
                    room: sub.room,
                    students: 35,
                    isNext: false,
                    scheduleTimeFull: sub.schedule,
                  };
                  handleOpenDetails(matched);
                }}
              >
                <View style={styles.subjectTopRow}>
                  <Text style={styles.subjectCode}>{sub.code}</Text>
                  <View style={styles.sectionPill}>
                    <Text style={styles.sectionPillText}>{sub.sectionBadge}</Text>
                  </View>
                </View>

                <Text style={styles.subjectTitle}>{sub.title}</Text>

                <View style={styles.subjectMetaLine}>
                  <Ionicons name="time-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                  <Text style={styles.subjectMetaText}>{sub.schedule}</Text>
                </View>

                <View style={[styles.subjectMetaLine, { marginTop: 4 }]}>
                  <Ionicons name="business-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                  <Text style={styles.subjectMetaText}>{sub.room}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
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
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '400',
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

  /* Day selector */
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayCard: {
    width: 50,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  dayCardSelected: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  dayShort: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  dayShortSelected: {
    color: '#BFDBFE',
    fontWeight: '600',
  },
  dayNum: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  dayNumSelected: {
    color: '#FFFFFF',
  },

  /* Subheader */
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  subHeaderDate: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  subHeaderCount: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Classes List */
  classesList: {
    gap: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timeCol: {
    width: 52,
    paddingTop: 8,
    alignItems: 'flex-start',
  },
  timeHour: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  timeAmpm: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  classCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 8,
  },
  nextBadgeSmall: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  nextBadgeSmallText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  cardCodeSection: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  cardRoomStudents: {
    fontSize: 12,
    color: '#94A3B8',
  },

  /* Subjects Tab */
  assignedHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  subjectsList: {
    gap: 12,
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  subjectTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  sectionPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  subjectMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectMetaText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Class Details Screen */
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailsScroll: {
    flex: 1,
  },
  detailsScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  nextClassPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  nextClassPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  detailsClassTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
    lineHeight: 32,
  },
  infoCardsWrap: {
    gap: 16,
    marginBottom: 28,
  },
  infoCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoCardValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D4ED8',
    height: 48,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  navigateBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  roomInfoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  roomInfoBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E3A8A',
  },
});
