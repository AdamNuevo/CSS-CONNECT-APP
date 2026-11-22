import React, { useState } from 'react';
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

interface FacultyApplicant {
  id: string;
  name: string;
  studentId: string;
  course: string;
  appliedDate: string;
  status: 'Pending' | 'More Information' | 'Approved' | 'Rejected';
}

const APPLICANTS: FacultyApplicant[] = [
  {
    id: 'app-1',
    name: 'Maria Santos',
    studentId: '2024-01284',
    course: 'BS Information Technology · 3rd year',
    appliedDate: 'Nov 18, 2026',
    status: 'Pending',
  },
  {
    id: 'app-2',
    name: 'John Dela Cruz',
    studentId: '2025-00427',
    course: 'BS Computer Science · 2nd year',
    appliedDate: 'Nov 17, 2026',
    status: 'More Information',
  },
  {
    id: 'app-3',
    name: 'Angela Reyes',
    studentId: '2025-00916',
    course: 'BS Information Technology · 2nd year',
    appliedDate: 'Nov 16, 2026',
    status: 'Approved',
  },
  {
    id: 'app-4',
    name: 'Carlo Mendoza',
    studentId: '2026-00283',
    course: 'BS Information Technology · 1st year',
    appliedDate: 'Nov 15, 2026',
    status: 'Rejected',
  },
];

export function FacultyOrgView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 'dashboard' = My Organization (Image 7)
  // 'requests' = Membership requests list (Image 6 from earlier prompt)
  const [viewState, setViewState] = useState<'dashboard' | 'requests'>('dashboard');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'More Information'>('All');

  const filteredApplicants = APPLICANTS.filter((a) => {
    if (filter === 'All') return true;
    return a.status === filter;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. MEMBERSHIP REQUESTS VIEW (Drill-down screen)
  // ─────────────────────────────────────────────────────────────────────────────
  if (viewState === 'requests') {
    return (
      <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
        <StatusBar barStyle="dark-content" />

        {/* Header bar with Back button */}
        <View style={styles.requestsNavBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setViewState('dashboard')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navBarTitle}>Membership requests</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Main heading */}
          <Text style={styles.mainTitle}>Find your next members.</Text>
          <Text style={styles.orgSubtitle}>LEAGUE OF EXCELLENT STUDENTS IN IT</Text>

          {/* Quick stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>08</Text>
              <Text style={styles.statLabel}>Pending review</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>02</Text>
              <Text style={styles.statLabel}>Awaiting revision</Text>
            </View>
          </View>

          {/* Filter Pills */}
          <View style={styles.filtersRow}>
            {(['All', 'Pending', 'More Information'] as const).map((f) => {
              const active = filter === f;
              const count = f === 'All' ? 12 : f === 'Pending' ? 8 : 2;
              const label = f === 'All' ? `All ${count}` : f === 'Pending' ? `Pending ${count}` : `More Information ${count}`;
              return (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => setFilter(f)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* List subhead */}
          <View style={styles.listSubheadRow}>
            <Text style={styles.listSubheadTitle}>All applications</Text>
            <View style={styles.sortDropdown}>
              <Text style={styles.sortDropdownText}>Newest first</Text>
              <Ionicons name="chevron-down" size={14} color="#64748B" style={{ marginLeft: 4 }} />
            </View>
          </View>

          {/* Applicant Cards */}
          <View style={styles.cardsList}>
            {filteredApplicants.map((item) => {
              let badgeBg = '#FEF3C7';
              let badgeColor = '#D97706';
              if (item.status === 'Approved') {
                badgeBg = '#ECFDF5';
                badgeColor = '#059669';
              } else if (item.status === 'Rejected') {
                badgeBg = '#FEF2F2';
                badgeColor = '#DC2626';
              } else if (item.status === 'More Information') {
                badgeBg = '#EFF6FF';
                badgeColor = '#2563EB';
              }

              return (
                <View key={item.id} style={styles.applicantCard}>
                  <View style={styles.applicantTopRow}>
                    <Text style={styles.applicantName}>{item.name}</Text>
                    <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.badgeText, { color: badgeColor }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.applicantMeta}>Student ID · {item.studentId}</Text>
                  <Text style={styles.applicantMeta}>{item.course}</Text>

                  <View style={styles.applicantBottomRow}>
                    <Text style={styles.appliedDate}>Applied {item.appliedDate}</Text>
                    <TouchableOpacity
                      style={styles.viewAppBtn}
                      activeOpacity={0.8}
                      onPress={() => router.push('/organizations/application-details')}
                    >
                      <Text style={styles.viewAppBtnText}>View Application</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. MAIN "MY ORGANIZATION" DASHBOARD (Image 7)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Organization</Text>
        <Text style={styles.headerSubtitle}>Membership management</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Org Card */}
        <View style={styles.mainOrgCard}>
          <View style={styles.orgHeaderRow}>
            <Image
              source={require('../../../assets/images/lesit.jpg')}
              style={styles.orgLogo}
              resizeMode="contain"
            />
            <View style={styles.adviserBadge}>
              <Text style={styles.adviserBadgeText}>ORGANIZATION ADVISER</Text>
            </View>
          </View>

          <Text style={styles.orgFullName}>
            League of Excellent Students in Information Technology
          </Text>
          <Text style={styles.orgDescription}>
            A community of QCU students growing through technology, collaboration, and service.
          </Text>

          {/* Inner Stats Box */}
          <View style={styles.innerStatsBox}>
            <View style={styles.innerStatCol}>
              <Text style={styles.innerStatNumber}>248</Text>
              <Text style={styles.innerStatLabel}>Current members</Text>
            </View>
            <View style={styles.innerStatCol}>
              <Text style={styles.innerStatYear}>2026–2027</Text>
              <Text style={styles.innerStatLabel}>Academic year</Text>
            </View>
          </View>
        </View>

        {/* 2 Stat Cards Row */}
        <View style={styles.dashboardStatsRow}>
          <TouchableOpacity
            style={styles.dashStatCard}
            activeOpacity={0.85}
            onPress={() => setViewState('requests')}
          >
            <Text style={styles.dashStatNumber}>08</Text>
            <Text style={styles.dashStatLabel}>Pending applications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dashStatCard}
            activeOpacity={0.85}
            onPress={() => {
              setFilter('More Information');
              setViewState('requests');
            }}
          >
            <Text style={styles.dashStatNumber}>02</Text>
            <Text style={styles.dashStatLabel}>Awaiting revision</Text>
          </TouchableOpacity>
        </View>

        {/* Big CTA Button: Review applications */}
        <TouchableOpacity
          style={styles.reviewAppsBtn}
          activeOpacity={0.85}
          onPress={() => setViewState('requests')}
        >
          <Text style={styles.reviewAppsBtnText}>Review applications</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {/* Recently Approved Section */}
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionHeadingText}>Recently approved</Text>
          <TouchableOpacity onPress={() => setViewState('requests')}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        {/* Recently approved card */}
        <View style={styles.approvedCard}>
          <View style={styles.approvedTopRow}>
            <Text style={styles.approvedStudentName}>Angela Reyes</Text>
            <View style={styles.approvedBadge}>
              <Text style={styles.approvedBadgeText}>Approved</Text>
            </View>
          </View>

          <Text style={styles.approvedSub}>2025-00916 · BSIT · 2nd year</Text>
          <Text style={styles.approvedDateText}>Accepted into LESIT on Nov 16, 2026.</Text>

          <View style={styles.addedBadgeRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#059669" style={{ marginRight: 6 }} />
            <Text style={styles.addedBadgeText}>Added to organization</Text>
          </View>
        </View>
      </ScrollView>
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
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  /* Main Org Card */
  mainOrgCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orgHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  orgLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  adviserBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  adviserBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  orgFullName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    lineHeight: 24,
  },
  orgDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  innerStatsBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  innerStatCol: {
    flex: 1,
  },
  innerStatNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  innerStatYear: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  innerStatLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },

  /* 2 Stat Cards Row */
  dashboardStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dashStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  dashStatNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  dashStatLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Big Review Apps Button */
  reviewAppsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    height: 52,
    borderRadius: 14,
    marginBottom: 24,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  reviewAppsBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Section Heading */
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeadingText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },

  /* Recently Approved Card */
  approvedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  approvedTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  approvedStudentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  approvedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  approvedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  approvedSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  approvedDateText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 14,
  },
  addedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addedBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },

  /* Requests Nav Bar */
  requestsNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  orgSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginTop: 4,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  listSubheadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listSubheadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sortDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortDropdownText: {
    fontSize: 13,
    color: '#64748B',
  },
  cardsList: {
    gap: 12,
  },
  applicantCard: {
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
  applicantTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  applicantMeta: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  applicantBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  appliedDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  viewAppBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewAppBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
});
