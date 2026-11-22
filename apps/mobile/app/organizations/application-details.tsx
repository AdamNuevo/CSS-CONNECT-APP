import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ApplicationDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application details</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarInitials}>MS</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.studentName}>Maria Santos</Text>
              <Text style={styles.studentIdText}>Student ID · 2024-01284</Text>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>Pending</Text>
              </View>
            </View>
          </View>

          <View style={styles.applyingToRow}>
            <View style={styles.blueDot} />
            <Text style={styles.applyingToText}>Applying to LESIT</Text>
          </View>
        </View>

        {/* Section: Student Information */}
        <Text style={styles.sectionTitle}>Student information</Text>
        <View style={styles.infoCard}>
          <Text style={styles.fieldLabel}>Email address</Text>
          <Text style={styles.fieldValue}>maria.santos@student.qcu.edu.ph</Text>

          <View style={styles.twoColRow}>
            <View style={{ flex: 1.3 }}>
              <Text style={styles.fieldLabel}>Course</Text>
              <Text style={styles.fieldValue}>BS Information Technology</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Year level</Text>
              <Text style={styles.fieldValue}>3rd year</Text>
            </View>
          </View>

          <View style={styles.standingRow}>
            <Text style={styles.fieldLabel}>Academic standing</Text>
            <View style={styles.standingBadge}>
              <Text style={styles.standingBadgeText}>Good standing</Text>
            </View>
          </View>
        </View>

        {/* Section: Purpose of Joining */}
        <Text style={styles.sectionTitle}>Purpose of joining</Text>
        <View style={styles.infoCard}>
          <Text style={styles.quoteText}>
            “I want to grow my web development skills and collaborate with students who share my interest in technology. I’d love to help organize coding workshops and contribute to community projects.”
          </Text>

          <Text style={styles.subFieldLabel}>INTERESTS & SKILLS</Text>
          <View style={styles.interestsRow}>
            <View style={styles.interestChip}>
              <Text style={styles.interestText}>Web development</Text>
            </View>
            <View style={styles.interestChip}>
              <Text style={styles.interestText}>UI/UX design</Text>
            </View>
            <View style={styles.interestChip}>
              <Text style={styles.interestText}>Volunteering</Text>
            </View>
          </View>
        </View>

        {/* Section: Requirements */}
        <View style={styles.rowBetweenTitle}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <Text style={styles.counterText}>2 of 3 submitted</Text>
        </View>

        <View style={styles.infoCard}>
          {/* Doc 1 */}
          <View style={styles.docRow}>
            <Ionicons name="document-text-outline" size={20} color="#64748B" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.docTitle}>Student ID.pdf</Text>
              <Text style={styles.docMeta}>PDF · 248 KB · Nov 18</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewLink}>View</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Doc 2 */}
          <View style={styles.docRow}>
            <Ionicons name="document-text-outline" size={20} color="#64748B" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.docTitle}>Letter of intent.pdf</Text>
              <Text style={styles.docMeta}>PDF · 112 KB · Nov 18</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewLink}>View</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Doc 3 - Missing */}
          <View style={styles.docRow}>
            <Ionicons name="document-text-outline" size={20} color="#D97706" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.docTitle}>Registration form</Text>
              <Text style={styles.docMeta}>Current semester proof of enrollment</Text>
            </View>
            <Text style={styles.missingBadgeText}>Missing</Text>
          </View>
        </View>

        {/* Section: Activity History */}
        <Text style={styles.sectionTitle}>Activity history</Text>
        <View style={styles.infoCard}>
          <View style={styles.activityItem}>
            <View style={styles.activityIconWrap}>
              <Ionicons name="calendar-outline" size={18} color="#2563EB" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.activityTitle}>Campus Tech Week</Text>
              <Text style={styles.activityMeta}>Participant · QCU · September 2026</Text>
            </View>
          </View>

          <View style={[styles.activityItem, { marginTop: 12 }]}>
            <View style={styles.activityIconWrap}>
              <Ionicons name="calendar-outline" size={18} color="#2563EB" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.activityTitle}>Community digital literacy drive</Text>
              <Text style={styles.activityMeta}>Volunteer · QCU · August 2026</Text>
            </View>
          </View>

          <Text style={styles.activityFooterNote}>
            2 activities listed on the student's profile
          </Text>
        </View>

        {/* Section: Request Timeline */}
        <Text style={styles.sectionTitle}>Request timeline</Text>
        <View style={styles.infoCard}>
          <View style={styles.timelineItem}>
            <View style={styles.timelineDotGreen} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.timelineTitle}>Application submitted</Text>
              <Text style={styles.timelineMeta}>Nov 18, 2026 · 9:42 AM</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={styles.timelineDotGreen} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.timelineTitle}>Adviser notified</Text>
              <Text style={styles.timelineMeta}>Nov 18, 2026 · 9:43 AM</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={styles.timelineDotAmber} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.timelineTitle}>Pending review</Text>
              <Text style={styles.timelineMeta}>Awaiting your decision</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <TouchableOpacity
          style={styles.decisionBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/organizations/application-decision')}
        >
          <Text style={styles.decisionBtnText}>Continue to decision</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
        <Text style={styles.bottomCaption}>
          Approve, reject with a reason, or request a revision.
        </Text>
      </View>
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
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  studentName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  studentIdText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  pendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  applyingToRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  blueDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
    marginRight: 8,
  },
  applyingToText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    marginTop: 6,
  },
  rowBetweenTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  counterText: {
    fontSize: 12,
    color: '#64748B',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  standingBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  standingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  quoteText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 14,
  },
  subFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  interestText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1D4ED8',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  docMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  viewLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  missingBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D97706',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  activityMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  activityFooterNote: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#059669',
  },
  timelineDotAmber: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D97706',
  },
  timelineLine: {
    width: 2,
    height: 16,
    backgroundColor: '#E2E8F0',
    marginLeft: 4,
    marginVertical: 2,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  timelineMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  decisionBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decisionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomCaption: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
});
