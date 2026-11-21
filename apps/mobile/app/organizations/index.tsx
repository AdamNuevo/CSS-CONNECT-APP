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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../../src/theme/tokens';
import { dashboardService } from '../../src/services/dashboard';
import { useAuth } from '../../src/context/AuthContext';
import type { Organization, MyMembership, OrgApplication } from '@ccs-hub/shared';

type OrgTab = 'my' | 'join' | 'applications';
type JoinCategory = 'All' | 'Technology' | 'Academic' | 'Interest';
type AppStatusFilter = 'All' | 'pending' | 'approved' | 'rejected';

export default function OrganizationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<OrgTab>('my');
  const [joinSearch, setJoinSearch] = useState('');
  const [joinCategory, setJoinCategory] = useState<JoinCategory>('All');
  const [appStatusFilter, setAppStatusFilter] = useState<AppStatusFilter>('All');

  // Modals
  const [selectedOrgDetails, setSelectedOrgDetails] = useState<Organization | null>(null);
  const [applyingOrg, setApplyingOrg] = useState<Organization | null>(null);
  const [applyStep, setApplyStep] = useState(1);
  const [applyReason, setApplyReason] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Cloud computing', 'Web development']);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Queries
  const {
    data: allOrgs = [],
    isLoading: loadingAll,
    refetch: refetchAll,
    isRefetching: refetchingAll,
  } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: () => dashboardService.getOrganizations(),
  });

  const {
    data: myOrgs = [],
    isLoading: loadingMy,
    refetch: refetchMy,
    isRefetching: refetchingMy,
  } = useQuery<MyMembership[]>({
    queryKey: ['my-organizations'],
    queryFn: () => dashboardService.getMyOrganizations(),
  });

  const {
    data: myApplications = [],
    isLoading: loadingApps,
    refetch: refetchApps,
    isRefetching: refetchingApps,
  } = useQuery<OrgApplication[]>({
    queryKey: ['my-org-applications'],
    queryFn: () => dashboardService.getMyApplications(),
  });

  const isRefreshing = refetchingAll || refetchingMy || refetchingApps;

  const handleRefresh = () => {
    refetchAll();
    refetchMy();
    refetchApps();
  };

  const applyMutation = useMutation({
    mutationFn: async ({ orgId, note }: { orgId: string; note: string }) => {
      return dashboardService.applyToOrganization(orgId, note || undefined);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations'] });
      qc.invalidateQueries({ queryKey: ['my-organizations'] });
      qc.invalidateQueries({ queryKey: ['my-org-applications'] });
      setApplyingOrg(null);
      setSelectedOrgDetails(null);
      setApplyReason('');
      setActiveTab('applications');
      Alert.alert('Application submitted', 'Your membership form has been submitted for review.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.error?.message || 'Failed to submit application.');
    },
  });

  const activeOrgIds = new Set(myOrgs.map((m) => m.organizationId));

  // Toggle interest tags
  const toggleInterest = (tag: string) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* Top Navigation */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Organization</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      {/* Segmented Pill Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.segmentedPill}>
          <TouchableOpacity
            style={[styles.tabSegment, activeTab === 'my' && styles.tabSegmentActive]}
            onPress={() => setActiveTab('my')}
          >
            <Text style={[styles.tabSegmentText, activeTab === 'my' && styles.tabSegmentTextActive]}>
              My Organization
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabSegment, activeTab === 'join' && styles.tabSegmentActive]}
            onPress={() => setActiveTab('join')}
          >
            <Text style={[styles.tabSegmentText, activeTab === 'join' && styles.tabSegmentTextActive]}>
              Join Organizations
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabSegment, activeTab === 'applications' && styles.tabSegmentActive]}
            onPress={() => setActiveTab('applications')}
          >
            <Text style={[styles.tabSegmentText, activeTab === 'applications' && styles.tabSegmentTextActive]}>
              My Applications
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Body */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 24 },
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'my' && (
          <MyOrganizationView
            myOrgs={myOrgs}
            onExplore={() => setActiveTab('join')}
          />
        )}

        {activeTab === 'join' && (
          <JoinOrganizationsView
            allOrgs={allOrgs}
            activeOrgIds={activeOrgIds}
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
            applications={myApplications}
            filter={appStatusFilter}
            setFilter={setAppStatusFilter}
            onExplore={() => setActiveTab('join')}
            onGoToMyOrg={() => setActiveTab('my')}
          />
        )}
      </ScrollView>

      {/* Org Details Modal */}
      {selectedOrgDetails && (
        <OrgDetailsModal
          org={selectedOrgDetails}
          isMember={activeOrgIds.has(selectedOrgDetails.id)}
          onClose={() => setSelectedOrgDetails(null)}
          onJoin={() => {
            const org = selectedOrgDetails;
            setSelectedOrgDetails(null);
            setApplyingOrg(org);
          }}
        />
      )}

      {/* Membership Application Modal */}
      {applyingOrg && (
        <MembershipApplicationModal
          org={applyingOrg}
          user={user}
          step={applyStep}
          setStep={setApplyStep}
          reason={applyReason}
          setReason={setApplyReason}
          selectedInterests={selectedInterests}
          toggleInterest={toggleInterest}
          agreedToTerms={agreedToTerms}
          setAgreedToTerms={setAgreedToTerms}
          isSubmitting={applyMutation.isPending}
          onClose={() => setApplyingOrg(null)}
          onSubmit={() => {
            applyMutation.mutate({
              orgId: applyingOrg.id,
              note: applyReason,
            });
          }}
        />
      )}
    </View>
  );
}

// ============================================================================
// TAB 1: MY ORGANIZATION VIEW
// ============================================================================

function MyOrganizationView({
  myOrgs,
  onExplore,
}: {
  myOrgs: MyMembership[];
  onExplore: () => void;
}) {
  const currentOrg = myOrgs[0]?.organization ?? {
    id: 'lesit',
    name: 'League of Excellent Students in Information Technology',
    acronym: 'LESIT',
    description: 'A community of QCU students growing through technology, collaboration, and service.',
    category: 'Technology',
    memberCount: 245,
    adviserName: 'Mr. Geovanni Jamac, MIT',
    presidentName: 'Kristine Bernil Perez',
  };

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.heroHeading}>Your campus, your community.</Text>
        <Text style={styles.heroSubheading}>Stay connected with the organization you call home.</Text>
      </View>

      {/* Main Org Card */}
      <View style={styles.orgHeroCard}>
        <View style={styles.orgHeroTop}>
          <View style={styles.orgLogoCircle}>
            <Ionicons name="people" size={24} color="#059669" />
          </View>
          <View style={styles.activeMemberBadge}>
            <Text style={styles.activeMemberText}>ACTIVE MEMBER</Text>
          </View>
        </View>

        <Text style={styles.orgHeroTitle}>{currentOrg.name}</Text>
        <Text style={styles.orgHeroDescription}>{currentOrg.description}</Text>

        <View style={styles.orgHeroFooter}>
          <View style={styles.memberPill}>
            <Text style={styles.memberPillText}>245 members</Text>
          </View>
          <Text style={styles.memberSinceText}>Member since Aug 2025</Text>
        </View>
      </View>

      {/* Adviser & Officers */}
      <View style={styles.blockContainer}>
        <Text style={styles.blockTitle}>Adviser & officers</Text>
        <View style={styles.leadershipCard}>
          <View style={styles.leadershipItem}>
            <Text style={styles.leaderName}>Mr. Geovanni Jamac, MIT</Text>
            <Text style={styles.leaderRole}>Faculty adviser</Text>
          </View>
          <View style={styles.leaderDivider} />
          <View style={styles.leadershipItem}>
            <Text style={styles.leaderName}>Kristine Bernil Perez</Text>
            <Text style={styles.leaderRole}>President</Text>
          </View>
        </View>
      </View>

      {/* Latest Announcement */}
      <View style={styles.blockContainer}>
        <View style={styles.blockHeaderRow}>
          <Text style={styles.blockTitle}>Latest announcement</Text>
          <TouchableOpacity>
            <Text style={styles.linkAction}>View all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.announcementCard}>
          <View style={styles.announcementHeaderRow}>
            <View style={styles.pinnedPill}>
              <Text style={styles.pinnedPillText}>PINNED</Text>
            </View>
            <Text style={styles.announcementDate}>Nov 15, 2026</Text>
          </View>
          <Text style={styles.announcementHeadline}>Let's kick off the semester together</Text>
          <Text style={styles.announcementBody}>
            Our general assembly is on Nov 27. Meet the officers, hear our plans, and find your team.
          </Text>
        </View>
      </View>

      {/* Upcoming Activity */}
      <View style={styles.blockContainer}>
        <View style={styles.blockHeaderRow}>
          <Text style={styles.blockTitle}>Upcoming activity</Text>
          <TouchableOpacity>
            <Text style={styles.linkAction}>View all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityCard}>
          <View style={styles.activityDateBox}>
            <Text style={styles.activityMonth}>NOV</Text>
            <Text style={styles.activityDay}>28</Text>
          </View>
          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle}>Build your first website</Text>
            <Text style={styles.activityMeta}>1:00-4:00 PM • Computer Lab 2</Text>
            <Text style={styles.activityTag}>Workshop • Open to all members</Text>
          </View>
        </View>
      </View>

      {/* Organization Documents */}
      <View style={styles.blockContainer}>
        <Text style={styles.blockTitle}>Organization documents</Text>
        <View style={styles.documentsCard}>
          <TouchableOpacity style={styles.documentRow} activeOpacity={0.7}>
            <View style={styles.docIconBox}>
              <Ionicons name="document-text-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.docTextGroup}>
              <Text style={styles.docTitle}>Constitution & by-laws</Text>
              <Text style={styles.docMeta}>PDF • 1.2 MB</Text>
            </View>
            <Ionicons name="download-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.leaderDivider} />

          <TouchableOpacity style={styles.documentRow} activeOpacity={0.7}>
            <View style={styles.docIconBox}>
              <Ionicons name="document-text-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.docTextGroup}>
              <Text style={styles.docTitle}>Membership handbook</Text>
              <Text style={styles.docMeta}>PDF • 840 KB</Text>
            </View>
            <Ionicons name="download-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Leave Organization */}
      <View style={styles.leaveContainer}>
        <TouchableOpacity style={styles.leaveButton}>
          <Text style={styles.leaveButtonText}>Leave Organization</Text>
        </TouchableOpacity>
        <Text style={styles.leaveHint}>You can apply again next semester before the period ends.</Text>
      </View>
    </View>
  );
}

// ============================================================================
// TAB 2: JOIN ORGANIZATIONS VIEW
// ============================================================================

function JoinOrganizationsView({
  allOrgs,
  activeOrgIds,
  search,
  setSearch,
  category,
  setCategory,
  onViewDetails,
  onJoin,
}: {
  allOrgs: Organization[];
  activeOrgIds: Set<string>;
  search: string;
  setSearch: (s: string) => void;
  category: JoinCategory;
  setCategory: (c: JoinCategory) => void;
  onViewDetails: (org: Organization) => void;
  onJoin: (org: Organization) => void;
}) {
  const categories: JoinCategory[] = ['All', 'Technology', 'Academic', 'Interest'];

  const defaultOrgs: Organization[] = [
    {
      id: 'msc-qcu',
      name: 'Microsoft Student Community QCU',
      acronym: 'MSC',
      category: 'Technology',
      description: 'Learn, build, and share with students passionate about Microsoft technologies.',
      isActive: true,
      memberCount: 196,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'aws-qcu',
      name: 'AWS Student Builder Group at Quezon City University',
      acronym: 'AWS-SBG',
      category: 'Technology',
      description: 'Explore cloud computing through hands-on labs, community projects, and peer learning.',
      isActive: true,
      memberCount: 154,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const orgList = allOrgs.length > 0 ? allOrgs : defaultOrgs;

  const filtered = orgList.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.acronym.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      category === 'All' || (org.category ?? 'Technology').toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.heroHeading}>Find where you belong.</Text>
        <Text style={styles.heroSubheading}>Explore communities. Build skills. Meet your people.</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search organizations"
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

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryPill, category === cat && styles.categoryPillActive]}
            onPress={() => setCategory(cat)}
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

      {/* Organizations List */}
      {filtered.map((org) => {
        const isJoined = activeOrgIds.has(org.id);

        return (
          <View key={org.id} style={styles.joinOrgCard}>
            <View style={styles.joinOrgTop}>
              <View style={styles.joinOrgLogo}>
                <Ionicons name="cube-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.joinOrgHeaderRight}>
                <Text style={styles.joinOrgName}>{org.name}</Text>
                <View style={styles.tagPill}>
                  <Text style={styles.tagPillText}>{org.category ?? 'Technology'}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.joinOrgBio}>{org.description}</Text>

            <Text style={styles.joinOrgLeaders}>
              Adviser: Ms. Joan F. Lover, MAE, LPT • President: Andrea Cruz
            </Text>

            <View style={styles.joinOrgStatsRow}>
              <Text style={styles.joinOrgStatsText}>196 members • Applications open</Text>
            </View>

            <View style={styles.joinOrgActions}>
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => onViewDetails(org)}
                activeOpacity={0.8}
              >
                <Text style={styles.viewDetailsButtonText}>View details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.joinNowButton, isJoined && styles.joinedButton]}
                onPress={() => onJoin(org)}
                disabled={isJoined}
                activeOpacity={0.85}
              >
                <Text style={styles.joinNowButtonText}>
                  {isJoined ? 'Joined' : 'Join Organization'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* Chapter Next Steps Guide */}
      <View style={styles.guideCard}>
        <Text style={styles.guideTitle}>Your next chapter starts here</Text>
        <Text style={styles.guideSteps}>1. Explore • 2. Apply • 3. Get approved</Text>
        <Text style={styles.guideDesc}>
          Read the requirements, submit your form, and track progress in My Applications.
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// TAB 3: MY APPLICATIONS VIEW
// ============================================================================

function MyApplicationsView({
  applications,
  filter,
  setFilter,
  onExplore,
  onGoToMyOrg,
}: {
  applications: OrgApplication[];
  filter: AppStatusFilter;
  setFilter: (f: AppStatusFilter) => void;
  onExplore: () => void;
  onGoToMyOrg: () => void;
}) {
  const filters: AppStatusFilter[] = ['All', 'pending', 'approved', 'rejected'];

  const sampleApps = [
    {
      id: 'app-1',
      orgName: 'Microsoft Student Community QCU',
      category: 'Technology',
      status: 'pending',
      date: 'Nov 20, 2026',
      appCode: 'APP-108',
      headline: 'Waiting for approval',
      body: "Officers are reviewing your membership form. We'll notify you once a decision is made.",
      actionText: 'View submitted application',
    },
    {
      id: 'app-2',
      orgName: 'League of Excellent Students in Information Technology',
      category: 'Technology',
      status: 'approved',
      date: 'Aug 18, 2025',
      appCode: 'APP-068',
      headline: 'Welcome to the community!',
      body: "You're officially a member. Your organization is now available in My Organization.",
      actionText: 'Go to My Organization',
    },
    {
      id: 'app-3',
      orgName: 'AWS Student Builder Group at Quezon City University',
      category: 'Technology',
      status: 'rejected',
      date: 'Nov 15, 2026',
      appCode: 'APP-122',
      headline: 'Application not approved',
      body: 'Your proof of enrollment was missing. You may submit a new application with the document before Nov 30.',
      actionText: 'View decision details',
    },
  ];

  const appList = applications.length > 0
    ? applications.map((a, idx) => {
        const isApproved = a.status === 'active';
        const isPending = a.status === 'pending';
        return {
          id: a.id,
          orgName: a.organizationName ?? 'Student Organization',
          category: 'Technology',
          status: isApproved ? 'approved' : isPending ? 'pending' : 'rejected',
          date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          appCode: `APP-${100 + idx}`,
          headline:
            isPending
              ? 'Waiting for approval'
              : isApproved
              ? 'Welcome to the community!'
              : 'Application not approved',
          body:
            isPending
              ? "Officers are reviewing your membership form. We'll notify you once a decision is made."
              : isApproved
              ? "You're officially a member. Your organization is now available in My Organization."
              : 'Your submission was not accepted at this time.',
          actionText:
            isApproved ? 'Go to My Organization' : 'View submitted application',
        };
      })
    : sampleApps;

  const filteredApps = appList.filter(
    (a) => filter === 'All' || a.status.toLowerCase() === filter.toLowerCase()
  );

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.heroHeading}>Every step, in one place.</Text>
        <Text style={styles.heroSubheading}>Track your applications and see what comes next.</Text>
      </View>

      {/* Application Update Banner */}
      <View style={styles.updateBanner}>
        <View style={styles.updateTopRow}>
          <Text style={styles.updateTag}>APPLICATION UPDATE</Text>
          <Text style={styles.updateTime}>2 hours ago</Text>
        </View>
        <Text style={styles.updateTitle}>
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
          >
            <Text style={[styles.appFilterText, filter === f && styles.appFilterTextActive]}>
              {f === 'All' ? `All (${appList.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Applications List */}
      {filteredApps.map((app) => (
        <View key={app.id} style={styles.appCard}>
          <View style={styles.appCardHeader}>
            <View style={styles.appLogoCircle}>
              <Ionicons name="ribbon-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.appHeaderInfo}>
              <Text style={styles.appOrgTitle}>{app.orgName}</Text>
              <View style={styles.appStatusRow}>
                <View
                  style={[
                    styles.statusChip,
                    app.status === 'pending'
                      ? styles.statusPending
                      : app.status === 'approved'
                      ? styles.statusApproved
                      : styles.statusRejected,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      app.status === 'pending'
                        ? styles.textPending
                        : app.status === 'approved'
                        ? styles.textApproved
                        : styles.textRejected,
                    ]}
                  >
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Text>
                </View>
                <Text style={styles.appMetaCode}>Submitted {app.date} • {app.appCode}</Text>
              </View>
            </View>
          </View>

          {/* Decision Box */}
          <View
            style={[
              styles.decisionBox,
              app.status === 'pending'
                ? styles.boxPending
                : app.status === 'approved'
                ? styles.boxApproved
                : styles.boxRejected,
            ]}
          >
            <Text
              style={[
                styles.decisionHeadline,
                app.status === 'pending'
                  ? styles.textPending
                  : app.status === 'approved'
                  ? styles.textApproved
                  : styles.textRejected,
              ]}
            >
              {app.headline}
            </Text>
            <Text style={styles.decisionBody}>{app.body}</Text>
          </View>

          {/* Action Link */}
          <TouchableOpacity
            style={styles.appActionRow}
            onPress={app.status === 'approved' ? onGoToMyOrg : undefined}
          >
            <Text style={styles.appActionText}>{app.actionText} →</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

// ============================================================================
// MODAL: ORGANIZATION DETAILS
// ============================================================================

function OrgDetailsModal({
  org,
  isMember,
  onClose,
  onJoin,
}: {
  org: Organization;
  isMember: boolean;
  onClose: () => void;
  onJoin: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <View style={[styles.modalTopBar, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity onPress={onClose} style={styles.modalBackButton}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTopBarTitle}>Organization</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.detailsHero}>
            <View style={styles.detailsLogoBadge}>
              <Ionicons name="logo-microsoft" size={32} color={colors.primary} />
            </View>
            <View style={styles.tagPill}>
              <Text style={styles.tagPillText}>{org.category ?? 'TECHNOLOGY'}</Text>
            </View>
            <Text style={styles.detailsSubtext}>196 members • QCU</Text>
            <Text style={styles.detailsTitle}>{org.name}</Text>
            <Text style={styles.detailsMotto}>Learn together. Build with purpose.</Text>
            <Text style={styles.detailsBio}>{org.description}</Text>
          </View>

          {/* Meet Leadership */}
          <View style={styles.modalCardBlock}>
            <Text style={styles.blockTitle}>Meet the leadership</Text>
            <View style={styles.leadershipItem}>
              <Text style={styles.leaderRole}>Faculty adviser</Text>
              <Text style={styles.leaderName}>Ms. Joan F. Lover, MAE, LPT</Text>
            </View>
            <View style={[styles.leadershipItem, { marginTop: spacing.sm }]}>
              <Text style={styles.leaderRole}>President</Text>
              <Text style={styles.leaderName}>Andrea Cruz</Text>
            </View>
          </View>

          {/* Our Purpose */}
          <View style={styles.modalCardBlock}>
            <Text style={styles.blockTitle}>Our purpose</Text>
            <Text style={styles.purposeLabel}>MISSION</Text>
            <Text style={styles.purposeText}>
              Empower students with practical digital skills, collaborative learning, and opportunities to create meaningful technology.
            </Text>
            <Text style={[styles.purposeLabel, { marginTop: spacing.md }]}>VISION</Text>
            <Text style={styles.purposeText}>
              An inclusive community of student innovators building solutions that make a positive impact.
            </Text>
          </View>

          {/* Before You Apply */}
          <View style={styles.modalCardBlock}>
            <Text style={styles.blockTitle}>Before you apply</Text>
            <CheckRow text="Currently enrolled at Quezon City University" />
            <CheckRow text="Open to all programs and year levels" />
            <CheckRow text="Valid student ID or proof of enrollment" />
            <CheckRow text="Completed membership application form" />

            <View style={styles.noticeBox}>
              <Text style={styles.noticeTitle}>Applications close November 30, 2026</Text>
              <Text style={styles.noticeSub}>No membership fee required.</Text>
            </View>
          </View>

          {/* Learn by doing */}
          <View style={styles.modalCardBlock}>
            <Text style={styles.blockTitle}>Learn by doing</Text>
            <View style={styles.activityCard}>
              <View style={styles.activityDateBox}>
                <Text style={styles.activityMonth}>NOV</Text>
                <Text style={styles.activityDay}>04</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Intro to Microsoft Azure</Text>
                <Text style={styles.activityMeta}>Dec 4 • 2:00 PM • Microsoft Hub</Text>
                <Text style={styles.activityTag}>Workshops • Mentoring • Community projects</Text>
              </View>
            </View>
          </View>

          {/* Let's connect */}
          <View style={styles.modalCardBlock}>
            <Text style={styles.blockTitle}>Let's connect</Text>
            <Text style={styles.connectLink}>msc@qcu.edu.ph</Text>
            <Text style={styles.connectSub}>Facebook: Microsoft Student Community QCU</Text>
            <Text style={styles.connectSub}>Student Organizations Office • QCU San Bartolome</Text>
          </View>
        </ScrollView>

        {/* Sticky Bottom Action */}
        <View style={[styles.modalBottomBar, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
          <TouchableOpacity
            style={[styles.primaryButton, isMember && styles.buttonDisabled]}
            onPress={onJoin}
            disabled={isMember}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              {isMember ? 'Already a member' : 'Join Organization'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.modalBottomHint}>Submit a membership form to get started.</Text>
        </View>
      </View>
    </Modal>
  );
}

function CheckRow({ text }: { text: string }) {
  return (
    <View style={checkStyles.row}>
      <Ionicons name="checkmark-circle" size={17} color={colors.status.successText} style={{ marginRight: 8 }} />
      <Text style={checkStyles.text}>{text}</Text>
    </View>
  );
}

const checkStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  text: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    flex: 1,
  },
});

// ============================================================================
// MODAL: MEMBERSHIP APPLICATION FORM
// ============================================================================

function MembershipApplicationModal({
  org,
  user,
  step,
  setStep,
  reason,
  setReason,
  selectedInterests,
  toggleInterest,
  agreedToTerms,
  setAgreedToTerms,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  org: Organization;
  user: any;
  step: number;
  setStep: (s: number) => void;
  reason: string;
  setReason: (r: string) => void;
  selectedInterests: string[];
  toggleInterest: (t: string) => void;
  agreedToTerms: boolean;
  setAgreedToTerms: (a: boolean) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const insets = useSafeAreaInsets();
  const interestOptions = ['Cloud computing', 'Web development', 'Mobile development', 'AI / ML', 'UI/UX Design'];

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <View style={[styles.modalTopBar, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity onPress={onClose} style={styles.modalBackButton}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTopBarTitle}>Membership application</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.applyTitle}>Make it official.</Text>
          <Text style={styles.applySubtitle}>
            Apply to {org.name}. Tell us a little about yourself. Fields marked * are required.
          </Text>

          {/* Stepper Indicator */}
          <View style={styles.stepperContainer}>
            <Text style={styles.stepperText}>1. Your details • 2. Tell us more • 3. Membership</Text>
          </View>

          {/* Pre-filled Student Profile */}
          <View style={styles.modalCardBlock}>
            <Text style={styles.formSectionTitle}>Student information</Text>
            <Text style={styles.formSectionSub}>Pre-filled from your student profile</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Full name *</Text>
              <TextInput
                style={styles.disabledInput}
                editable={false}
                value={`${user?.firstName ?? 'Samantha'} ${user?.lastName ?? 'Dela Cruz'}`}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Student number *</Text>
              <TextInput
                style={styles.disabledInput}
                editable={false}
                value={user?.studentNumber ?? '2024-10402'}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>School email *</Text>
              <TextInput
                style={styles.disabledInput}
                editable={false}
                value={user?.email ?? 'samantha.delacruz@qcu.edu.ph'}
              />
            </View>

            <View style={styles.rowTwoCols}>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: spacing.sm }]}>
                <Text style={styles.inputLabel}>Program *</Text>
                <TextInput
                  style={styles.disabledInput}
                  editable={false}
                  value={user?.program ?? 'BSIT'}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Year level *</Text>
                <TextInput
                  style={styles.disabledInput}
                  editable={false}
                  value={user?.yearLevel ?? '3rd year'}
                />
              </View>
            </View>
          </View>

          {/* A little about you */}
          <View style={styles.modalCardBlock}>
            <Text style={styles.formSectionTitle}>A little about you</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Why would you like to join? *</Text>
              <TextInput
                style={styles.textAreaInput}
                multiline
                numberOfLines={3}
                placeholder="I want to build my cloud skills, work with other students, and contribute to community projects."
                placeholderTextColor={colors.textMuted}
                value={reason}
                onChangeText={setReason}
              />
            </View>

            <Text style={styles.inputLabel}>Areas of interest</Text>
            <View style={styles.interestWrap}>
              {interestOptions.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.interestChip,
                    selectedInterests.includes(item) && styles.interestChipActive,
                  ]}
                  onPress={() => toggleInterest(item)}
                >
                  <Text
                    style={[
                      styles.interestChipText,
                      selectedInterests.includes(item) && styles.interestChipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Proof of Enrollment */}
          <View style={styles.modalCardBlock}>
            <Text style={styles.formSectionTitle}>Proof of enrollment *</Text>
            <View style={styles.uploadCard}>
              <View style={styles.uploadLeft}>
                <Ionicons name="document-attach" size={20} color={colors.primary} />
                <View style={{ marginLeft: spacing.sm }}>
                  <Text style={styles.uploadedFileName}>Proof_of_enrollment.pdf</Text>
                  <Text style={styles.uploadedFileSize}>248 KB • Uploaded successfully</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.replaceBtn}>
                <Text style={styles.replaceBtnText}>Replace</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.uploadHint}>Student ID or enrollment form • PDF, JPG, PNG • Max 5 MB</Text>
          </View>

          {/* Checkbox agreement */}
          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}>
              {agreedToTerms && <Ionicons name="checkmark" size={14} color="#FFF" />}
            </View>
            <Text style={styles.agreementText}>
              I confirm that my information is correct and agree to the organization's guidelines and data privacy policy.
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom submit */}
        <View style={[styles.modalBottomBar, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
          <TouchableOpacity
            style={[styles.primaryButton, (!agreedToTerms || isSubmitting) && styles.buttonDisabled]}
            disabled={!agreedToTerms || isSubmitting}
            onPress={onSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? 'Submitting…' : 'Submit application'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.modalBottomHint}>After submitting, track your status in My Applications.</Text>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonPlaceholder: {
    width: 40,
  },
  topBarTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  tabsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  segmentedPill: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: radius.full,
    padding: 3,
  },
  tabSegment: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  tabSegmentActive: {
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  tabSegmentText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  tabSegmentTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionHeader: {
    marginBottom: spacing.lg,
  },
  heroHeading: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  heroSubheading: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  // My Org
  orgHeroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  orgHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  orgLogoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeMemberBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  activeMemberText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: '#15803D',
    letterSpacing: 0.5,
  },
  orgHeroTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  orgHeroDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  orgHeroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  memberPillText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  memberSinceText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  blockContainer: {
    marginBottom: spacing.lg,
  },
  blockHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  blockTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  linkAction: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
  },
  leadershipCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leadershipItem: {
    paddingVertical: 4,
  },
  leaderName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  leaderRole: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  leaderDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  announcementCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  announcementHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  pinnedPill: {
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  pinnedPillText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.accent,
  },
  announcementDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  announcementHeadline: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  announcementBody: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  activityDateBox: {
    backgroundColor: colors.accentMuted,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    minWidth: 48,
  },
  activityMonth: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.accent,
  },
  activityDay: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  activityTag: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: typography.weights.medium,
    marginTop: 2,
  },
  documentsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  docIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  docTextGroup: {
    flex: 1,
  },
  docTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  docMeta: {
    fontSize: 10,
    color: colors.textMuted,
  },
  leaveContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  leaveButton: {
    paddingVertical: spacing.xs,
  },
  leaveButtonText: {
    fontSize: typography.sizes.xs,
    color: '#DC2626',
    fontWeight: typography.weights.semibold,
  },
  leaveHint: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  // Join Tab
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  pillsScroll: {
    marginBottom: spacing.lg,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  categoryPillTextActive: {
    color: colors.textInverse,
    fontWeight: typography.weights.bold,
  },
  orgsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  openTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  openCount: {
    fontSize: 11,
    color: colors.textMuted,
  },
  joinOrgCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  joinOrgTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  joinOrgLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  joinOrgHeaderRight: {
    flex: 1,
  },
  joinOrgName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginTop: 2,
  },
  tagPillText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  joinOrgBio: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginVertical: spacing.xs,
  },
  joinOrgLeaders: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  joinOrgStatsRow: {
    marginBottom: spacing.md,
  },
  joinOrgStatsText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: typography.weights.medium,
  },
  joinOrgActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  viewDetailsButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  joinNowButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinedButton: {
    backgroundColor: '#059669',
  },
  joinNowButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
  },
  guideCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  guideTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: 2,
  },
  guideSteps: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
    marginBottom: 4,
  },
  guideDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  // My Applications Tab
  updateBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: spacing.md,
  },
  updateTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  updateTag: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.accent,
  },
  updateTime: {
    fontSize: 10,
    color: colors.textMuted,
  },
  updateTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  appFilterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appFilterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  appFilterText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  appFilterTextActive: {
    color: colors.textInverse,
    fontWeight: typography.weights.bold,
  },
  appCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  appCardHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  appLogoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  appHeaderInfo: {
    flex: 1,
  },
  appOrgTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  appStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusApproved: {
    backgroundColor: '#DCFCE7',
  },
  statusRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  textPending: {
    color: '#D97706',
  },
  textApproved: {
    color: '#15803D',
  },
  textRejected: {
    color: '#DC2626',
  },
  appMetaCode: {
    fontSize: 10,
    color: colors.textMuted,
  },
  decisionBox: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  boxPending: {
    backgroundColor: '#FFFBEB',
  },
  boxApproved: {
    backgroundColor: '#F0FDF4',
  },
  boxRejected: {
    backgroundColor: '#FEF2F2',
  },
  decisionHeadline: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  decisionBody: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  appActionRow: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  appActionText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
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
  detailsHero: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  detailsLogoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailsSubtext: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: spacing.xs,
  },
  detailsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  detailsMotto: {
    fontSize: typography.sizes.xs,
    color: colors.accent,
    fontWeight: typography.weights.semibold,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  detailsBio: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  modalCardBlock: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  purposeLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.accent,
    marginBottom: 2,
  },
  purposeText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  noticeBox: {
    backgroundColor: colors.accentMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  noticeTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  noticeSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  connectLink: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
    marginBottom: 4,
  },
  connectSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
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
  // Application Form Modal
  applyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  applySubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  stepperContainer: {
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  stepperText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
  formSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  formSectionSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  disabledInput: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 44,
    fontSize: typography.sizes.xs,
    color: colors.textPrimary,
  },
  rowTwoCols: {
    flexDirection: 'row',
  },
  textAreaInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    height: 80,
    fontSize: typography.sizes.xs,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  interestWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 6,
  },
  interestChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  interestChipActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  interestChipText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  interestChipTextActive: {
    color: colors.accent,
    fontWeight: typography.weights.bold,
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  uploadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  uploadedFileName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  uploadedFileSize: {
    fontSize: 10,
    color: colors.textMuted,
  },
  replaceBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  replaceBtnText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
  uploadHint: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 6,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  agreementText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    flex: 1,
  },
});
