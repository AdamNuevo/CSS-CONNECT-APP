import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { dashboardService } from '../../src/services/dashboard';
import { useAuth } from '../../src/context/AuthContext';
import { ConfirmModal } from '../../src/components/ui/ConfirmModal';
import type { Organization, MyMembership, OrgApplication } from '@ccs-hub/shared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OrgTab = 'my' | 'join' | 'applications';
type JoinCategory = 'All' | 'Technology' | 'Academic' | 'Interest';
type AppStatusFilter = 'All' | 'pending' | 'approved' | 'rejected';

// Organization logos mapping
const ORG_LOGOS: Record<string, any> = {
  lesit: require('../../assets/images/lesit.jpg'),
  msc: require('../../assets/images/msc.jpg'),
  aws: require('../../assets/images/aws.jpg'),
};

function getOrgLogo(nameOrId?: string) {
  if (!nameOrId) return ORG_LOGOS.msc;
  const str = nameOrId.toLowerCase();
  if (str.includes('lesit') || str.includes('league of excellent') || str.includes('information technology')) {
    return ORG_LOGOS.lesit;
  }
  if (str.includes('msc') || str.includes('microsoft')) {
    return ORG_LOGOS.msc;
  }
  if (str.includes('aws') || str.includes('amazon') || str.includes('builder group') || str.includes('cloud')) {
    return ORG_LOGOS.aws;
  }
  return ORG_LOGOS.msc;
}

export default function OrganizationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<OrgTab>('my');
  const [joinSearch, setJoinSearch] = useState('');
  const [joinCategory, setJoinCategory] = useState<JoinCategory>('All');
  const [appStatusFilter, setAppStatusFilter] = useState<AppStatusFilter>('All');

  // Modals & Navigation
  const [selectedOrgDetails, setSelectedOrgDetails] = useState<Organization | null>(null);
  const [applyingOrg, setApplyingOrg] = useState<Organization | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Queries
  const { data: allOrgs = [], isRefetching: refetchingAll, refetch: refetchAll } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: () => dashboardService.getOrganizations(),
  });

  const { data: myOrgs = [], isRefetching: refetchingMy, refetch: refetchMy } = useQuery<MyMembership[]>({
    queryKey: ['my-organizations'],
    queryFn: () => dashboardService.getMyOrganizations(),
  });

  const { data: myApplications = [], isRefetching: refetchingApps, refetch: refetchApps } = useQuery<OrgApplication[]>({
    queryKey: ['my-org-applications'],
    queryFn: () => dashboardService.getMyApplications(),
  });

  const isRefreshing = refetchingAll || refetchingMy || refetchingApps;

  const handleRefresh = () => {
    refetchAll();
    refetchMy();
    refetchApps();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* ── TOP APP BAR ─────────────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Organization</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── SEGMENTED TAB SELECTOR ──────────────────────────── */}
      <View style={styles.tabsContainer}>
        <View style={styles.segmentedPill}>
          <TouchableOpacity
            style={[styles.tabSegment, activeTab === 'my' && styles.tabSegmentActive]}
            onPress={() => setActiveTab('my')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabSegmentText, activeTab === 'my' && styles.tabSegmentTextActive]}>
              My Organization
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabSegment, activeTab === 'join' && styles.tabSegmentActive]}
            onPress={() => setActiveTab('join')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabSegmentText, activeTab === 'join' && styles.tabSegmentTextActive]}>
              Join Organizations
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabSegment, activeTab === 'applications' && styles.tabSegmentActive]}
            onPress={() => setActiveTab('applications')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabSegmentText, activeTab === 'applications' && styles.tabSegmentTextActive]}>
              My Applications
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── TAB CONTENT ─────────────────────────────────────── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 24 },
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#1D4ED8" />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'join' && (
          <JoinOrganizationsView
            search={joinSearch}
            setSearch={setJoinSearch}
            category={joinCategory}
            setCategory={setJoinCategory}
            onViewDetails={(org) => setSelectedOrgDetails(org)}
            onJoin={(org) => setApplyingOrg(org)}
          />
        )}

        {activeTab === 'applications' && (
          <MyApplicationsView
            filter={appStatusFilter}
            setFilter={setAppStatusFilter}
            onGoToMyOrg={() => setActiveTab('my')}
          />
        )}

        {activeTab === 'my' && (
          <MyOrganizationView
            onLeave={() => setShowLeaveModal(true)}
          />
        )}
      </ScrollView>

      {/* ── ORG DETAILS MODAL (Full page screen matching Image 5) ── */}
      {selectedOrgDetails && (
        <OrgDetailsModal
          org={selectedOrgDetails}
          onClose={() => setSelectedOrgDetails(null)}
          onJoin={() => {
            const org = selectedOrgDetails;
            setSelectedOrgDetails(null);
            setApplyingOrg(org);
          }}
        />
      )}

      {/* ── MEMBERSHIP APPLICATION MODAL (Matching Image 3) ── */}
      {applyingOrg && (
        <MembershipApplicationModal
          org={applyingOrg}
          user={user}
          onClose={() => setApplyingOrg(null)}
          onSubmitted={() => {
            setApplyingOrg(null);
            setActiveTab('applications');
          }}
        />
      )}

      {/* ── LEAVE ORG CONFIRMATION MODAL ─────────────────────── */}
      <ConfirmModal
        visible={showLeaveModal}
        title="Leave organization?"
        message="Are you sure you want to leave League of Excellent Students in Information Technology? You can apply again in a future membership period."
        icon="log-out-outline"
        iconColor="#DC2626"
        iconBg="#FEE2E2"
        confirmLabel="Leave Organization"
        confirmVariant="danger"
        cancelLabel="Stay in org"
        onConfirm={() => {
          setShowLeaveModal(false);
          Alert.alert('Organization Left', 'You are no longer an active member of LESIT.');
        }}
        onCancel={() => setShowLeaveModal(false)}
      />
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 1: JOIN ORGANIZATIONS VIEW (Image 1)
// ══════════════════════════════════════════════════════════════════

interface OrgItem {
  id: string;
  name: string;
  category: string;
  description: string;
  adviser: string;
  president: string;
  memberCount: number;
}

const JOIN_ORGS: OrgItem[] = [
  {
    id: 'msc-qcu',
    name: 'Microsoft Student Community QCU',
    category: 'Technology',
    description: 'Learn, build, and share with students passionate about Microsoft technologies.',
    adviser: 'Ms. Joan F. Lawan, MAIE, LPT',
    president: 'Andrea Cruz',
    memberCount: 186,
  },
  {
    id: 'aws-qcu',
    name: 'AWS Student Builder Group at Quezon City University',
    category: 'Technology',
    description: 'Explore cloud computing through hands-on labs, community projects, and peer learning.',
    adviser: 'Dr. Rhonnel S. Paculanan',
    president: 'Joshua Mendoza',
    memberCount: 124,
  },
];

function JoinOrganizationsView({
  search,
  setSearch,
  category,
  setCategory,
  onViewDetails,
  onJoin,
}: {
  search: string;
  setSearch: (s: string) => void;
  category: JoinCategory;
  setCategory: (c: JoinCategory) => void;
  onViewDetails: (org: any) => void;
  onJoin: (org: any) => void;
}) {
  const categories: JoinCategory[] = ['All', 'Technology', 'Academic', 'Interest'];

  const filtered = JOIN_ORGS.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      category === 'All' || org.category.toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <View>
      {/* Title & Subtitle */}
      <View style={styles.sectionHeadingWrap}>
        <Text style={styles.mainTitle}>Find where you belong.</Text>
        <Text style={styles.mainSubtitle}>Explore communities. Build skills. Meet your people.</Text>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search organizations"
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryPill, category === cat && styles.categoryPillActive]}
            onPress={() => setCategory(cat)}
            activeOpacity={0.8}
          >
            <Text style={[styles.categoryPillText, category === cat && styles.categoryPillTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Section Header */}
      <View style={styles.orgsHeaderRow}>
        <Text style={styles.openTitle}>Open for membership</Text>
        <Text style={styles.openCount}>{filtered.length} organizations</Text>
      </View>

      {/* Organization Cards */}
      {filtered.map((org) => (
        <View key={org.id} style={styles.orgCard}>
          {/* Top Row: Avatar Logo, Title & Category */}
          <View style={styles.orgCardTopRow}>
            <Image source={getOrgLogo(org.name)} style={styles.orgAvatarImg} resizeMode="cover" />
            <View style={styles.orgCardTitleCol}>
              <Text style={styles.orgCardTitle}>{org.name}</Text>
              <Text style={styles.orgCategoryText}>{org.category}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.orgBioText}>{org.description}</Text>

          {/* Leadership */}
          <View style={styles.leadersBlock}>
            <Text style={styles.adviserText}>
              <Text style={{ fontWeight: '700', color: '#1E293B' }}>Adviser: </Text>
              {org.adviser}
            </Text>
            <Text style={styles.presidentText}>President: {org.president}</Text>
          </View>

          {/* Member Count & Status */}
          <Text style={styles.statsText}>{org.memberCount} members · Applications open</Text>

          {/* Action Buttons Row */}
          <View style={styles.cardActionsRow}>
            <TouchableOpacity
              style={styles.viewDetailsBtn}
              onPress={() => onViewDetails(org)}
              activeOpacity={0.8}
            >
              <Text style={styles.viewDetailsBtnText}>View details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.joinOrgBtn}
              onPress={() => onJoin(org)}
              activeOpacity={0.85}
            >
              <Text style={styles.joinOrgBtnText}>Join Organization</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Chapter Next Steps Card */}
      <View style={styles.nextChapterCard}>
        <Text style={styles.chapterTitle}>Your next chapter starts here</Text>
        <View style={styles.chapterStepsRow}>
          <Text style={styles.chapterStepsText}>
            1 Explore  <Ionicons name="arrow-forward" size={11} color="#2563EB" />  2 Apply  <Ionicons name="arrow-forward" size={11} color="#2563EB" />  3 Get approved
          </Text>
        </View>
        <Text style={styles.chapterDesc}>
          Read the requirements, submit your form, and track progress in My Applications.
        </Text>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 2: MY APPLICATIONS VIEW (Image 2)
// ══════════════════════════════════════════════════════════════════

interface AppItem {
  id: string;
  orgName: string;
  status: 'pending' | 'approved' | 'rejected';
  statusSubtitle: string;
  dateMeta: string;
  headline: string;
  body: string;
  actionText: string;
}

const SAMPLE_APPLICATIONS: AppItem[] = [
  {
    id: 'app-1',
    orgName: 'Microsoft Student Community QCU',
    status: 'pending',
    statusSubtitle: 'Under review',
    dateMeta: 'Submitted Nov 20, 2026 · Application #APP-026',
    headline: 'Waiting for approval',
    body: "Officers are reviewing your membership form. We'll notify you when a decision is made.",
    actionText: 'View submitted application',
  },
  {
    id: 'app-2',
    orgName: 'League of Excellent Students in Information Technology',
    status: 'approved',
    statusSubtitle: 'Membership active',
    dateMeta: 'Approved Aug 19, 2026 · Application #APP-008',
    headline: 'Welcome to the community!',
    body: "You're officially a member. Your organization is now available in My Organization.",
    actionText: 'Go to My Organization',
  },
  {
    id: 'app-3',
    orgName: 'AWS Student Builder Group at Quezon City University',
    status: 'rejected',
    statusSubtitle: 'Action needed',
    dateMeta: 'Updated Nov 19, 2026 · Application #APP-021',
    headline: 'Application not approved',
    body: 'Your proof of enrollment was missing. You may submit a new application with the document before Nov 30.',
    actionText: 'View decision details',
  },
];

function MyApplicationsView({
  filter,
  setFilter,
  onGoToMyOrg,
}: {
  filter: AppStatusFilter;
  setFilter: (f: AppStatusFilter) => void;
  onGoToMyOrg: () => void;
}) {
  const filters: AppStatusFilter[] = ['All', 'pending', 'approved', 'rejected'];

  const filteredApps = SAMPLE_APPLICATIONS.filter((app) => {
    if (filter === 'All') return true;
    return app.status === filter;
  });

  return (
    <View>
      {/* Title & Subtitle */}
      <View style={styles.sectionHeadingWrap}>
        <Text style={styles.mainTitle}>Every step, in one place.</Text>
        <Text style={styles.mainSubtitle}>Track your applications and see what comes next.</Text>
      </View>

      {/* Application Update Banner */}
      <View style={styles.updateCard}>
        <View style={styles.updateCardTop}>
          <Text style={styles.updateCardTag}>APPLICATION UPDATE</Text>
          <Text style={styles.updateCardTime}>2 hours ago</Text>
        </View>
        <Text style={styles.updateCardHeadline}>
          Your Microsoft Student Community application is now under review.
        </Text>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterPillsRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.appFilterPill, filter === f && styles.appFilterPillActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.appFilterText, filter === f && styles.appFilterTextActive]}>
              {f === 'All' ? `All (${SAMPLE_APPLICATIONS.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Applications List */}
      {filteredApps.map((app) => {
        const isPending = app.status === 'pending';
        const isApproved = app.status === 'approved';
        const isRejected = app.status === 'rejected';

        return (
          <View key={app.id} style={styles.appCard}>
            {/* Top row: Avatar & Org Name */}
            <View style={styles.appCardHeader}>
              <Image source={getOrgLogo(app.orgName)} style={styles.appAvatarImg} resizeMode="cover" />
              <View style={styles.appTitleCol}>
                <Text style={styles.appOrgTitle}>{app.orgName}</Text>
                <View style={styles.appStatusRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      isPending && styles.statusBadgePending,
                      isApproved && styles.statusBadgeApproved,
                      isRejected && styles.statusBadgeRejected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        isPending && styles.statusBadgeTextPending,
                        isApproved && styles.statusBadgeTextApproved,
                        isRejected && styles.statusBadgeTextRejected,
                      ]}
                    >
                      {isPending ? 'Pending' : isApproved ? 'Approved' : 'Rejected'}
                    </Text>
                  </View>
                  <Text style={styles.statusSubtitleText}>{app.statusSubtitle}</Text>
                </View>
              </View>
            </View>

            {/* Date Meta */}
            <Text style={styles.appDateMetaText}>{app.dateMeta}</Text>

            {/* Decision Callout Card */}
            <View
              style={[
                styles.decisionBox,
                isPending && styles.decisionBoxPending,
                isApproved && styles.decisionBoxApproved,
                isRejected && styles.decisionBoxRejected,
              ]}
            >
              <Text
                style={[
                  styles.decisionHeadline,
                  isPending && styles.decisionHeadlinePending,
                  isApproved && styles.decisionHeadlineApproved,
                  isRejected && styles.decisionHeadlineRejected,
                ]}
              >
                {app.headline}
              </Text>
              <Text style={styles.decisionBody}>{app.body}</Text>
            </View>

            {/* Action Row */}
            <TouchableOpacity
              style={styles.appActionRow}
              onPress={isApproved ? onGoToMyOrg : undefined}
              activeOpacity={0.75}
            >
              <Text style={styles.appActionText}>
                {app.actionText} <Ionicons name="arrow-forward" size={13} color="#2563EB" />
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      {/* Notification prompt footer */}
      <Text style={styles.notificationPromptText}>
        We'll send a notification whenever your status changes.
      </Text>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB 3: MY ORGANIZATION VIEW (Image 4)
// ══════════════════════════════════════════════════════════════════

function MyOrganizationView({ onLeave }: { onLeave: () => void }) {
  return (
    <View>
      {/* Title & Subtitle */}
      <View style={styles.sectionHeadingWrap}>
        <Text style={styles.mainTitle}>Your campus, your community.</Text>
        <Text style={styles.mainSubtitle}>Stay connected with the organization you call home.</Text>
      </View>

      {/* Main Org Hero Card */}
      <View style={styles.myOrgHeroCard}>
        <View style={styles.myOrgHeaderRow}>
          <Image source={ORG_LOGOS.lesit} style={styles.myOrgAvatarImg} resizeMode="cover" />
          <View style={styles.myOrgHeaderInfo}>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>ACTIVE MEMBER</Text>
            </View>
            <Text style={styles.myOrgTitle}>League of Excellent Students in Information Technology</Text>
          </View>
        </View>

        <Text style={styles.myOrgBio}>
          A community of QCU students growing through technology, collaboration, and service.
        </Text>

        <View style={styles.myOrgStatsPill}>
          <Text style={styles.myOrgMembersText}>248 members</Text>
          <Text style={styles.myOrgMemberSince}>Member since Aug 2026</Text>
        </View>
      </View>

      {/* Adviser & officers */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionBlockTitle}>Adviser & officers</Text>
        <View style={styles.whiteCardPadded}>
          <View style={styles.leaderItem}>
            <Text style={styles.leaderName}>Mr. Geovanni Jomoc, MIT</Text>
            <Text style={styles.leaderRole}>Faculty adviser</Text>
          </View>
          <View style={[styles.leaderItem, { marginTop: 12 }]}>
            <Text style={styles.leaderName}>Alwin Geoff Perez</Text>
            <Text style={styles.leaderRole}>President</Text>
          </View>
        </View>
      </View>

      {/* Latest announcement */}
      <View style={styles.sectionBlock}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionBlockTitle}>Latest announcement</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllLink}>View all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.whiteCardPadded}>
          <View style={styles.announcementMetaRow}>
            <View style={styles.pinnedBadge}>
              <Text style={styles.pinnedBadgeText}>PINNED</Text>
            </View>
            <Text style={styles.announcementDateText}>Nov 18, 2026</Text>
          </View>
          <Text style={styles.announcementHeadline}>Let's kick off the semester together</Text>
          <Text style={styles.announcementBody}>
            Our general assembly is on Nov 27. Meet the officers, hear our plans, and find your team.
          </Text>
        </View>
      </View>

      {/* Upcoming activity */}
      <View style={styles.sectionBlock}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionBlockTitle}>Upcoming activity</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllLink}>View all</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.whiteCardPadded, { flexDirection: 'row', alignItems: 'center' }]}>
          <View style={styles.activityDateBox}>
            <Text style={styles.activityDateMonth}>NOV</Text>
            <Text style={styles.activityDateDay}>28</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.activityTitle}>Build your first website</Text>
            <Text style={styles.activityMeta}>1:00–4:00 PM · Computer Lab 3</Text>
            <Text style={styles.activityTag}>Workshop · Open to all members</Text>
          </View>
        </View>
      </View>

      {/* Organization documents */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionBlockTitle}>Organization documents</Text>
        <View style={styles.whiteCardPadded}>
          <View style={styles.docRow}>
            <Text style={styles.docName}>Constitution & by-laws</Text>
            <Text style={styles.docSize}>PDF · 1.2 MB</Text>
          </View>
          <View style={styles.docDivider} />
          <View style={styles.docRow}>
            <Text style={styles.docName}>Membership handbook</Text>
            <Text style={styles.docSize}>PDF · 840 KB</Text>
          </View>
        </View>
      </View>

      {/* Leave Organization */}
      <View style={styles.leaveBlock}>
        <TouchableOpacity onPress={onLeave} activeOpacity={0.7}>
          <Text style={styles.leaveText}>Leave Organization</Text>
        </TouchableOpacity>
        <Text style={styles.leaveHint}>You can apply again in a future membership period.</Text>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// MODAL 1: ORGANIZATION DETAILS (Image 5)
// ══════════════════════════════════════════════════════════════════

function OrgDetailsModal({
  org,
  onClose,
  onJoin,
}: {
  org: any;
  onClose: () => void;
  onJoin: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        {/* Top Header */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Organization</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 30 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Branding */}
          <View style={styles.detailsHeroWrap}>
            <Image source={getOrgLogo(org.name)} style={styles.detailsBigAvatar} resizeMode="cover" />
            <View style={styles.categoryBadgePill}>
              <Text style={styles.categoryBadgePillText}>TECHNOLOGY</Text>
            </View>
            <Text style={styles.detailsMemberCount}>186 members · QCU</Text>
            <Text style={styles.detailsHeroTitle}>{org.name}</Text>
            <Text style={styles.detailsMotto}>Learn together. Build with purpose.</Text>
            <Text style={styles.detailsBioText}>
              A student-led community that helps QCU learners explore Microsoft technologies through workshops, peer mentoring, and real-world projects.
            </Text>
          </View>

          {/* Meet the leadership */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionBlockTitle}>Meet the leadership</Text>
            <View style={styles.whiteCardPadded}>
              <Text style={styles.roleLabel}>Faculty adviser</Text>
              <Text style={styles.leaderNameBold}>Ms. Joan F. Lawan, MAIE, LPT</Text>
              <Text style={[styles.roleLabel, { marginTop: 12 }]}>President</Text>
              <Text style={styles.leaderNameBold}>Andrea Cruz</Text>
            </View>
          </View>

          {/* Our purpose */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionBlockTitle}>Our purpose</Text>
            <View style={styles.whiteCardPadded}>
              <Text style={styles.purposeHead}>MISSION</Text>
              <Text style={styles.purposeBody}>
                Empower students with practical digital skills, collaborative learning, and opportunities to create meaningful technology.
              </Text>
              <Text style={[styles.purposeHead, { marginTop: 14 }]}>VISION</Text>
              <Text style={styles.purposeBody}>
                An inclusive community of student innovators building solutions that make a positive impact.
              </Text>
            </View>
          </View>

          {/* Before you apply */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionBlockTitle}>Before you apply</Text>
            <View style={styles.whiteCardPadded}>
              <RequirementLine text="Currently enrolled at Quezon City University" />
              <RequirementLine text="Open to all programs and year levels" />
              <RequirementLine text="Valid student ID or proof of enrollment" />
              <RequirementLine text="Completed membership application form" />

              <View style={styles.appDeadlineNoticeBox}>
                <Text style={styles.appDeadlineNoticeTitle}>Applications close November 30, 2026</Text>
                <Text style={styles.appDeadlineNoticeSub}>No membership fee required.</Text>
              </View>
            </View>
          </View>

          {/* Learn by doing */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionBlockTitle}>Learn by doing</Text>
            <View style={[styles.whiteCardPadded, { flexDirection: 'row', alignItems: 'center' }]}>
              <View style={styles.activityDateBox}>
                <Text style={styles.activityDateMonth}>DEC</Text>
                <Text style={styles.activityDateDay}>04</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.activityTitle}>Intro to Microsoft Azure</Text>
                <Text style={styles.activityMeta}>Dec 4 · 2:00 PM · Innovation Hub</Text>
                <Text style={styles.activityTag}>Workshops · Mentoring · Community projects</Text>
              </View>
            </View>
          </View>

          {/* Let's connect */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionBlockTitle}>Let's connect</Text>
            <View style={styles.whiteCardPadded}>
              <Text style={styles.emailConnectLink}>msc@qcu.edu.ph</Text>
              <Text style={styles.connectMeta}>Facebook · Microsoft Student Community QCU</Text>
              <Text style={styles.connectMeta}>Student Organization Office · QCU San Bartolome</Text>
            </View>
          </View>

          {/* Bottom Button */}
          <TouchableOpacity style={styles.primarySolidBtn} onPress={onJoin} activeOpacity={0.85}>
            <Text style={styles.primarySolidBtnText}>Join Organization</Text>
          </TouchableOpacity>
          <Text style={styles.underBtnHint}>Submit a membership form to get started.</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

function RequirementLine({ text }: { text: string }) {
  return (
    <View style={styles.reqLineRow}>
      <Ionicons name="checkmark" size={16} color="#1D4ED8" style={{ marginRight: 8, marginTop: 1 }} />
      <Text style={styles.reqLineText}>{text}</Text>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// MODAL 2: MEMBERSHIP APPLICATION FORM (Image 3)
// ══════════════════════════════════════════════════════════════════

function MembershipApplicationModal({
  org,
  user,
  onClose,
  onSubmitted,
}: {
  org: any;
  user: any;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState(
    user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Samantha Dela Cruz'
  );
  const [studentNumber, setStudentNumber] = useState(user?.studentNumber ?? '2024-10482');
  const [schoolEmail, setSchoolEmail] = useState(user?.email ?? 'samantha.delacruz@qcu.edu.ph');
  const [program, setProgram] = useState(user?.program ?? 'BSIT');
  const [yearLevel, setYearLevel] = useState(user?.yearLevel ?? '3rd year');

  const [reason, setReason] = useState(
    'I want to build my cloud skills, learn with other students, and contribute to community projects.'
  );
  const [interests, setInterests] = useState(['Cloud computing', 'Web development']);
  const [agreed, setAgreed] = useState(true);

  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowConfirm(false);
      Alert.alert(
        'Application Submitted',
        'Your membership form has been submitted for review. Track progress in My Applications.'
      );
      onSubmitted();
    }, 600);
  };

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        {/* Top Header */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Membership application</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 30 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Text style={styles.applyHeaderTitle}>Make it official.</Text>
          <Text style={styles.applyHeaderOrg}>Apply to {org.name}</Text>
          <Text style={styles.applyHeaderCaption}>
            Tell us a little about yourself. Fields marked * are required.
          </Text>

          {/* Stepper Banner */}
          <View style={styles.stepperBanner}>
            <Text style={styles.stepperText}>
              1 Your details  <Ionicons name="arrow-forward" size={11} color="#2563EB" />  2 Officer review  <Ionicons name="arrow-forward" size={11} color="#2563EB" />  3 Membership
            </Text>
          </View>

          {/* Card 1: Student information */}
          <View style={styles.formCard}>
            <Text style={styles.formCardTitle}>Student information</Text>
            <Text style={styles.formCardSub}>Pre-filled from your student profile</Text>

            <View style={styles.inputFieldWrap}>
              <Text style={styles.fieldLabel}>Full name *</Text>
              <TextInput
                style={styles.formInput}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputFieldWrap}>
              <Text style={styles.fieldLabel}>Student number *</Text>
              <TextInput
                style={styles.formInput}
                value={studentNumber}
                onChangeText={setStudentNumber}
              />
            </View>

            <View style={styles.inputFieldWrap}>
              <Text style={styles.fieldLabel}>School email *</Text>
              <TextInput
                style={styles.formInput}
                value={schoolEmail}
                onChangeText={setSchoolEmail}
                keyboardType="email-address"
              />
            </View>

            {/* Row: Program & Year Level */}
            <View style={styles.row}>
              <View style={[styles.inputFieldWrap, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.fieldLabel}>Program *</Text>
                <View style={styles.dropdownInput}>
                  <Text style={styles.dropdownInputText}>{program}</Text>
                  <Ionicons name="chevron-down" size={16} color="#64748B" />
                </View>
              </View>

              <View style={[styles.inputFieldWrap, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Year level *</Text>
                <View style={styles.dropdownInput}>
                  <Text style={styles.dropdownInputText}>{yearLevel}</Text>
                  <Ionicons name="chevron-down" size={16} color="#64748B" />
                </View>
              </View>
            </View>
          </View>

          {/* Card 2: A little about you */}
          <View style={styles.formCard}>
            <Text style={styles.formCardTitle}>A little about you</Text>

            <View style={styles.inputFieldWrap}>
              <Text style={styles.fieldLabel}>Why would you like to join? *</Text>
              <TextInput
                style={[styles.formInput, styles.formInputArea]}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
              />
            </View>

            <Text style={styles.fieldLabel}>Areas of interest</Text>
            <View style={styles.interestsRow}>
              {['Cloud computing', 'Web development'].map((interest) => (
                <View key={interest} style={styles.interestPill}>
                  <Text style={styles.interestPillText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Card 3: Proof of enrollment */}
          <View style={styles.formCard}>
            <Text style={styles.formCardTitle}>Proof of enrollment *</Text>

            <View style={styles.uploadBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadFileName}>Proof_of_enrollment.pdf</Text>
                <Text style={styles.uploadFileSize}>248 KB · Uploaded successfully</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.replaceLink}>Replace</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.uploadHint}>Student ID or enrollment form · PDF, JPG, PNG · Max 5 MB</Text>
          </View>

          {/* Checkbox Agreement */}
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.8}
            onPress={() => setAgreed(!agreed)}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
              {agreed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxText}>
              I confirm that my information is correct and agree to the organization's guidelines and data privacy policy.
            </Text>
          </TouchableOpacity>

          {/* Submit Application Button */}
          <TouchableOpacity
            style={[styles.primarySolidBtn, (!agreed || isSubmitting) && styles.btnDisabled]}
            onPress={() => setShowConfirm(true)}
            disabled={!agreed || isSubmitting}
            activeOpacity={0.85}
          >
            <Text style={styles.primarySolidBtnText}>
              {isSubmitting ? 'Submitting…' : 'Submit application'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.underBtnHint}>After submitting, track your status in My Applications.</Text>
        </ScrollView>

        {/* Confirmation Modal */}
        <ConfirmModal
          visible={showConfirm}
          title="Submit membership application?"
          message={`Are you sure you want to submit your membership application to ${org.name}? Your application will be reviewed by the student officers.`}
          icon="shield-checkmark-outline"
          iconColor="#1D4ED8"
          iconBg="#EEF2FF"
          confirmLabel="Submit application"
          confirmVariant="primary"
          cancelLabel="Keep editing"
          loading={isSubmitting}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      </View>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },
  modalRoot: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },

  /* Top Navigation */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#F5F8FC',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },

  /* Segmented Tab Controls */
  tabsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  segmentedPill: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    gap: 8,
  },
  tabSegment: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  tabSegmentActive: {
    backgroundColor: '#E0EBFF',
  },
  tabSegmentText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  tabSegmentTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },

  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  /* Headings */
  sectionHeadingWrap: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  mainSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },

  /* Search Bar */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },

  /* Category Pills */
  pillsScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryPillText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  /* Open for membership section */
  orgsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  openTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  openCount: {
    fontSize: 13,
    color: '#64748B',
  },

  /* Org Card */
  orgCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  orgCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  orgAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  orgCardTitleCol: {
    flex: 1,
  },
  orgCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  orgCategoryText: {
    fontSize: 12,
    color: '#2563EB',
    marginTop: 2,
    fontWeight: '500',
  },
  orgBioText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  leadersBlock: {
    marginBottom: 8,
  },
  adviserText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  presidentText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  statsText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
    marginBottom: 14,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  viewDetailsBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#EDF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  joinOrgBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinOrgBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* Next Chapter Banner */
  nextChapterCard: {
    backgroundColor: '#EDF4FF',
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  chapterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  chapterStepsRow: {
    marginBottom: 6,
  },
  chapterStepsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  chapterDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },

  /* My Applications Tab */
  updateCard: {
    backgroundColor: '#EDF4FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  updateCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  updateCardTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  updateCardTime: {
    fontSize: 11,
    color: '#64748B',
  },
  updateCardHeadline: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  appFilterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  appFilterPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  appFilterText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  appFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  appCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  appCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  appTitleCol: {
    flex: 1,
  },
  appOrgTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  appStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeApproved: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadgeTextPending: {
    color: '#D97706',
  },
  statusBadgeTextApproved: {
    color: '#15803D',
  },
  statusBadgeTextRejected: {
    color: '#DC2626',
  },
  statusSubtitleText: {
    fontSize: 12,
    color: '#64748B',
  },
  appDateMetaText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  decisionBox: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  decisionBoxPending: {
    backgroundColor: '#FEF9EE',
  },
  decisionBoxApproved: {
    backgroundColor: '#F0FDF4',
  },
  decisionBoxRejected: {
    backgroundColor: '#FEF2F2',
  },
  decisionHeadline: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  decisionHeadlinePending: {
    color: '#B45309',
  },
  decisionHeadlineApproved: {
    color: '#15803D',
  },
  decisionHeadlineRejected: {
    color: '#B91C1C',
  },
  decisionBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  appActionRow: {
    alignSelf: 'flex-start',
  },
  appActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  notificationPromptText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },

  /* My Organization Tab */
  myOrgHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  myOrgHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  myOrgAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    marginTop: 2,
  },
  myOrgHeaderInfo: {
    flex: 1,
  },
  activePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
    marginBottom: 6,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    letterSpacing: 0.3,
  },
  myOrgTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 21,
  },
  myOrgBio: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  myOrgStatsPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F8FC',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myOrgMembersText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  myOrgMemberSince: {
    fontSize: 12,
    color: '#64748B',
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionBlockTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  whiteCardPadded: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  leaderItem: {},
  leaderName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  leaderRole: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  announcementMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  pinnedBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  pinnedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  announcementDateText: {
    fontSize: 12,
    color: '#64748B',
  },
  announcementHeadline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  announcementBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  activityDateBox: {
    width: 46,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EDF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityDateMonth: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  activityDateDay: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  activityMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  activityTag: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '500',
    marginTop: 2,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  docName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  docSize: {
    fontSize: 12,
    color: '#64748B',
  },
  docDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  leaveBlock: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  leaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 4,
  },
  leaveHint: {
    fontSize: 12,
    color: '#64748B',
  },

  /* Organization Details Modal */
  detailsHeroWrap: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  detailsBigAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    marginBottom: 10,
  },
  categoryBadgePill: {
    backgroundColor: '#EDF4FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  categoryBadgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  detailsMemberCount: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  detailsHeroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  detailsMotto: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 8,
  },
  detailsBioText: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  roleLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  leaderNameBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  purposeHead: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 3,
  },
  purposeBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  reqLineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reqLineText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
    lineHeight: 18,
  },
  appDeadlineNoticeBox: {
    backgroundColor: '#EDF4FF',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  appDeadlineNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
    marginBottom: 2,
  },
  appDeadlineNoticeSub: {
    fontSize: 12,
    color: '#64748B',
  },
  emailConnectLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 4,
  },
  connectMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  primarySolidBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  primarySolidBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  underBtnHint: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },

  /* Membership Application Form */
  applyHeaderTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  applyHeaderOrg: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 6,
  },
  applyHeaderCaption: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  stepperBanner: {
    backgroundColor: '#EDF4FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },
  stepperText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  formCardSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 14,
  },
  inputFieldWrap: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  formInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  formInputArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  dropdownInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  dropdownInputText: {
    fontSize: 14,
    color: '#0F172A',
  },
  interestsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  interestPill: {
    backgroundColor: '#EDF4FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  interestPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
  },
  uploadFileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  uploadFileSize: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  replaceLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  uploadHint: {
    fontSize: 11,
    color: '#94A3B8',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
