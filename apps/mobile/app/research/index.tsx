import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ResearchView = 'list' | 'ai-check' | 'similar' | 'detail';
type ResearchFilter = 'All' | 'Program' | 'Year' | 'Category' | 'Tech';

interface StudyItem {
  id: string;
  programYear: string;
  category: string;
  title: string;
  authors: string;
  adviser: string;
  abstract: string;
  keywords: string[];
  techTags: string[];
  similarity?: number;
}

const SAMPLE_STUDIES: StudyItem[] = [
  {
    id: 'study-1',
    programYear: 'BSIT · 2024–2025',
    category: 'Web',
    title: 'Smart Barangay Complaint Tracker',
    authors: 'Dela Pena, Ramos, Aquino',
    adviser: 'Engr. Carlo Mendoza',
    abstract: 'A web-based citizen reporting and incident tracking system designed to streamline barangay-level complaints and resolution monitoring.',
    keywords: ['citizen reporting', 'complaint management', 'e-governance', 'web portal'],
    techTags: ['Laravel', 'MySQL'],
    similarity: 78,
  },
  {
    id: 'study-2',
    programYear: 'BSCS · 2024–2025',
    category: 'AI',
    title: 'Plant Disease Detector for Urban Gardens',
    authors: 'Garcia, Lim, Torres',
    adviser: 'Prof. Ana Villanueva',
    abstract: 'A mobile application that identifies common plant diseases from leaf photos and suggests care steps for small urban gardens.',
    keywords: ['plant disease', 'image classification', 'urban farming', 'mobile'],
    techTags: ['Python', 'TensorFlow', 'Flutter'],
    similarity: 54,
  },
  {
    id: 'study-3',
    programYear: 'BSIS · 2023–2024',
    category: 'IoT',
    title: 'IoT Flood Monitoring for Quezon City',
    authors: 'Bautista, Cruz, Santos',
    adviser: 'Dr. Rhonnel Paculanan',
    abstract: 'An automated ultrasonic sensor network deployed across critical water channels to provide real-time water level data and SMS warnings.',
    keywords: ['flood alert', 'water sensors', 'SMS notification', 'disaster response'],
    techTags: ['Arduino', 'Firebase'],
    similarity: 41,
  },
];

export default function ResearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentView, setCurrentView] = useState<ResearchView>('list');
  const [previousView, setPreviousView] = useState<ResearchView>('list');
  const [selectedStudy, setSelectedStudy] = useState<StudyItem>(SAMPLE_STUDIES[1]);

  // Main list state
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ResearchFilter>('All');

  // AI check form state
  const [aiTitle, setAiTitle] = useState('');
  const [aiProblem, setAiProblem] = useState('');
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiTech, setAiTech] = useState('');

  const navigateToDetail = (study: StudyItem, from: ResearchView) => {
    setSelectedStudy(study);
    setPreviousView(from);
    setCurrentView('detail');
  };

  const handleBack = () => {
    if (currentView === 'detail') {
      setCurrentView(previousView);
    } else if (currentView === 'similar') {
      setCurrentView('ai-check');
    } else if (currentView === 'ai-check') {
      setCurrentView('list');
    } else {
      router.back();
    }
  };

  const handleRunAiCheck = () => {
    setCurrentView('similar');
  };

  const filteredStudies = SAMPLE_STUDIES.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.authors.toLowerCase().includes(q) ||
      s.techTags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SCREEN 1: MAIN RESEARCH LIST (Image 5)                      */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {currentView === 'list' && (
        <View style={styles.flexOne}>
          {/* Top Bar with back button */}
          <View style={[styles.listTopBar, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.flexOne}
            contentContainerStyle={[styles.scrollPadding, { paddingBottom: Math.max(insets.bottom, 20) + 30 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Title & Subtitle */}
            <Text style={styles.mainTitle}>Research</Text>
            <Text style={styles.mainSubtitle}>Capstone and research repository</Text>

            {/* Search Input */}
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Title, keyword, researcher"
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

            {/* Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPillsRow}
            >
              {(['All', 'Program', 'Year', 'Category', 'Tech'] as ResearchFilter[]).map((f) => {
                const isActive = activeFilter === f;
                return (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterPill, isActive && styles.filterPillActive]}
                    onPress={() => setActiveFilter(f)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Check your idea with AI Card */}
            <TouchableOpacity
              style={styles.aiCheckCard}
              onPress={() => setCurrentView('ai-check')}
              activeOpacity={0.85}
            >
              <View style={styles.aiIconBox}>
                <Ionicons name="sparkles" size={20} color="#4F46E5" />
              </View>
              <View style={styles.aiTextCol}>
                <Text style={styles.aiCardTitle}>Check your idea with AI</Text>
                <Text style={styles.aiCardSub}>Find similar past studies before you propose.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Study Cards List */}
            {filteredStudies.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.studyCard}
                onPress={() => navigateToDetail(item, 'list')}
                activeOpacity={0.85}
              >
                <View style={styles.studyCardTopRow}>
                  <Text style={styles.studyMetaText}>{item.programYear}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                  </View>
                </View>

                <Text style={styles.studyCardTitle}>{item.title}</Text>
                <Text style={styles.studyCardAuthors}>{item.authors}</Text>

                <View style={styles.techTagsRow}>
                  {item.techTags.map((tech) => (
                    <View key={tech} style={styles.techTagPill}>
                      <Text style={styles.techTagText}>{tech}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SCREEN 2: AI RESEARCH CHECK FORM (Image 6)                  */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {currentView === 'ai-check' && (
        <View style={styles.flexOne}>
          {/* Header */}
          <View style={[styles.subScreenHeader, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.subScreenHeaderTitle}>AI research check</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={styles.flexOne}
            contentContainerStyle={[styles.formContent, { paddingBottom: Math.max(insets.bottom, 20) + 30 }]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.formIntroText}>
              Enter what you have so far. The AI looks for related studies in the repository and shows how similar they are.
            </Text>

            {/* Field 1 */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Proposed research title</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Smart waste segregation app"
                placeholderTextColor="#94A3B8"
                value={aiTitle}
                onChangeText={setAiTitle}
              />
            </View>

            {/* Field 2 */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Problem statement</Text>
              <TextInput
                style={styles.formTextarea}
                placeholder="What problem will your research solve?"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={aiProblem}
                onChangeText={setAiProblem}
              />
            </View>

            {/* Field 3 */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Keywords</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Separate with commas"
                placeholderTextColor="#94A3B8"
                value={aiKeywords}
                onChangeText={setAiKeywords}
              />
            </View>

            {/* Field 4 */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Proposed technologies</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Flutter, Firebase"
                placeholderTextColor="#94A3B8"
                value={aiTech}
                onChangeText={setAiTech}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={handleRunAiCheck}
              activeOpacity={0.85}
            >
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              <Text style={styles.primaryActionButtonText}>Find similar studies</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SCREEN 3: SIMILAR STUDIES RESULTS (Image 4)                 */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {currentView === 'similar' && (
        <View style={styles.flexOne}>
          {/* Header */}
          <View style={[styles.subScreenHeader, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.subScreenHeaderTitle}>Similar studies</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={styles.flexOne}
            contentContainerStyle={[styles.formContent, { paddingBottom: Math.max(insets.bottom, 20) + 30 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Score Navy Banner */}
            <View style={styles.similarHeroBanner}>
              <Text style={styles.similarScoreLarge}>78%</Text>
              <View style={styles.similarHeroTextCol}>
                <Text style={styles.similarHeroTitle}>Highest similarity</Text>
                <Text style={styles.similarHeroSub}>3 related studies found in the repository</Text>
              </View>
            </View>

            {/* Related studies section */}
            <Text style={styles.similarSectionTitle}>Related studies</Text>

            {SAMPLE_STUDIES.map((item) => {
              const sim = item.similarity ?? 50;
              const isHigh = sim >= 70;
              const isMedium = sim >= 50 && sim < 70;
              const barColor = isHigh ? '#EF4444' : isMedium ? '#F59E0B' : '#2563EB';
              const badgeBg = isHigh ? '#FEE2E2' : isMedium ? '#FEF3C7' : '#DBEAFE';
              const badgeColor = isHigh ? '#DC2626' : isMedium ? '#D97706' : '#2563EB';

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.relatedCard}
                  onPress={() => navigateToDetail(item, 'similar')}
                  activeOpacity={0.85}
                >
                  <View style={styles.relatedCardHeader}>
                    <Text style={styles.studyMetaText}>{item.programYear}</Text>
                    <View style={[styles.similarityBadge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.similarityBadgeText, { color: badgeColor }]}>
                        {sim}% similar
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.relatedCardTitle}>{item.title}</Text>

                  {/* Similarity Progress Bar */}
                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${sim}%`, backgroundColor: barColor }]} />
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Insights Section */}
            <Text style={[styles.similarSectionTitle, { marginTop: 12 }]}>Insights</Text>

            <View style={styles.insightsCard}>
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>Similar parts</Text>
                <Text style={styles.insightDesc}>Problem focus and the main user group overlap.</Text>
              </View>

              <View style={[styles.insightItem, { marginTop: 14 }]}>
                <Text style={styles.insightLabel}>Research gaps</Text>
                <Text style={styles.insightDesc}>Existing studies do not cover offline use.</Text>
              </View>

              <View style={[styles.insightItem, { marginTop: 14 }]}>
                <Text style={styles.insightLabel}>Ways to stand out</Text>
                <Text style={styles.insightDesc}>Add a feature the compared studies lack.</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SCREEN 4: RESEARCH DETAIL (Image 3)                         */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {currentView === 'detail' && (
        <View style={styles.flexOne}>
          {/* Header */}
          <View style={[styles.subScreenHeader, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.subScreenHeaderTitle}>Research</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={styles.flexOne}
            contentContainerStyle={[styles.formContent, { paddingBottom: Math.max(insets.bottom, 20) + 100 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Meta Row: [AI] BSCS · 2024-2025 */}
            <View style={styles.detailMetaRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{selectedStudy.category}</Text>
              </View>
              <Text style={styles.detailProgramYearText}>{selectedStudy.programYear}</Text>
            </View>

            {/* Title */}
            <Text style={styles.detailTitle}>{selectedStudy.title}</Text>

            {/* Researchers & Adviser Card */}
            <View style={styles.detailResearchersCard}>
              <Text style={styles.detailCardLabel}>Researchers</Text>
              <Text style={styles.detailCardValue}>{selectedStudy.authors}</Text>

              <Text style={[styles.detailCardLabel, { marginTop: 12 }]}>Adviser</Text>
              <Text style={styles.detailCardValue}>{selectedStudy.adviser}</Text>
            </View>

            {/* Abstract */}
            <View style={styles.detailSectionBlock}>
              <Text style={styles.detailSectionHeading}>Abstract</Text>
              <Text style={styles.detailSectionBody}>{selectedStudy.abstract}</Text>
            </View>

            {/* Keywords */}
            <View style={styles.detailSectionBlock}>
              <Text style={styles.detailSectionHeading}>Keywords</Text>
              <View style={styles.detailPillsRow}>
                {selectedStudy.keywords.map((kw) => (
                  <View key={kw} style={styles.detailKeywordPill}>
                    <Text style={styles.detailKeywordText}>{kw}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Technologies used */}
            <View style={styles.detailSectionBlock}>
              <Text style={styles.detailSectionHeading}>Technologies used</Text>
              <View style={styles.detailPillsRow}>
                {selectedStudy.techTags.map((tech) => (
                  <View key={tech} style={styles.detailTechPill}>
                    <Text style={styles.detailTechText}>{tech}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Sticky Bottom CTA: View full document */}
          <View style={[styles.detailStickyFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={styles.detailDocumentButton}
              onPress={() => Alert.alert('Full Document', 'Document access request has been sent for review.')}
              activeOpacity={0.85}
            >
              <Ionicons name="document-text" size={18} color="#FFFFFF" />
              <Text style={styles.detailDocumentButtonText}>View full document</Text>
            </TouchableOpacity>
            <Text style={styles.detailDocumentNotice}>
              The full document is available to CCS students and faculty.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  flexOne: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listTopBar: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  scrollPadding: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  mainSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },
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
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* AI Check Idea Card */
  aiCheckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  aiIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  aiTextCol: {
    flex: 1,
  },
  aiCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  aiCardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  /* Main Study Card */
  studyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  studyCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  studyMetaText: {
    fontSize: 12,
    color: '#64748B',
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
  },
  studyCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 4,
  },
  studyCardAuthors: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
  },
  techTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  techTagPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  techTagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },

  /* SubScreen Headers */
  subScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  subScreenHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  formContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  formIntroText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: '#0F172A',
  },
  formTextarea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    height: 100,
    fontSize: 14,
    color: '#0F172A',
    textAlignVertical: 'top',
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1D4ED8',
    borderRadius: 12,
    height: 50,
    marginTop: 12,
  },
  primaryActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Similar Studies Hero Banner */
  similarHeroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1E4B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    gap: 16,
  },
  similarScoreLarge: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FACC15',
    letterSpacing: -1,
  },
  similarHeroTextCol: {
    flex: 1,
  },
  similarHeroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  similarHeroSub: {
    fontSize: 13,
    color: '#93C5FD',
    marginTop: 3,
  },
  similarSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  relatedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  relatedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  similarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  similarityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  relatedCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  progressBarTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  insightsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  insightItem: {},
  insightLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  insightDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },

  /* Detail Screen (Image 3) */
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  detailProgramYearText: {
    fontSize: 13,
    color: '#64748B',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 30,
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  detailResearchersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  detailCardLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  detailCardValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailSectionBlock: {
    marginBottom: 20,
  },
  detailSectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  detailSectionBody: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  detailPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailKeywordPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailKeywordText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  detailTechPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailTechText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  detailStickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  detailDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1D4ED8',
    borderRadius: 12,
    height: 48,
  },
  detailDocumentButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailDocumentNotice: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
});
