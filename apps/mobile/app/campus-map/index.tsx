import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Place {
  id: string;
  name: string;
  roomName: string;
  subtitle: string;
  isNextClass?: boolean;
  walkTime: string;
  distance: string;
  type: 'building' | 'garden' | 'court' | 'library';
}

const PLACES: Place[] = [
  {
    id: 'bldg-a',
    name: 'Bldg A',
    roomName: 'Lab 2',
    subtitle: 'Bldg A · 2nd floor · CCS',
    isNextClass: true,
    walkTime: '3 min walk',
    distance: '210 m',
    type: 'building',
  },
  {
    id: 'bldg-b',
    name: 'Bldg B',
    roomName: 'Lecture Hall 201',
    subtitle: 'Bldg B · 2nd floor · Engineering',
    isNextClass: false,
    walkTime: '5 min walk',
    distance: '340 m',
    type: 'building',
  },
  {
    id: 'garden',
    name: 'Garden',
    roomName: 'Campus Eco Garden',
    subtitle: 'Open grounds · Beside Bldg A',
    isNextClass: false,
    walkTime: '2 min walk',
    distance: '130 m',
    type: 'garden',
  },
  {
    id: 'court',
    name: 'Open court',
    roomName: 'Open Court & Pavilion',
    subtitle: 'Athletics & Student Activities Area',
    isNextClass: false,
    walkTime: '4 min walk',
    distance: '270 m',
    type: 'court',
  },
  {
    id: 'library',
    name: 'Library',
    roomName: 'Main Campus Library',
    subtitle: 'Learning Commons · 1st & 2nd floor',
    isNextClass: false,
    walkTime: '3 min walk',
    distance: '180 m',
    type: 'library',
  },
];

export default function CampusMapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ room?: string }>();

  const [searchQuery, setSearchQuery] = useState(params.room ?? '');
  const [selectedPlace, setSelectedPlace] = useState<Place>(PLACES[0]);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSelect = (place: Place) => {
    setSelectedPlace(place);
    setIsNavigating(false);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) return;
    const match = PLACES.find(
      (p) =>
        p.name.toLowerCase().includes(text.toLowerCase()) ||
        p.roomName.toLowerCase().includes(text.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(text.toLowerCase())
    );
    if (match) {
      setSelectedPlace(match);
    }
  };

  return (
    <View style={styles.container}>
      {/* ── UNDER DEVELOPMENT BANNER ──────────────────────── */}
      <View style={styles.devBanner}>
        <Ionicons name="construct-outline" size={15} color="#92400E" />
        <Text style={styles.devBannerText}>🚧 Campus Map — Under Development</Text>
      </View>

      {/* ── MAP CANVAS (SCHEMATIC) ─────────────────────────── */}
      <View style={styles.mapCanvas}>
        {/* Pathway grid background lines */}
        <Svg
          style={StyleSheet.absoluteFill}
          width="100%"
          height="100%"
        >
          {/* Vertical main central boulevard / road */}
          <Rect
            x={SCREEN_WIDTH * 0.46}
            y={0}
            width={SCREEN_WIDTH * 0.08}
            height="100%"
            fill="#E2E8F0"
          />

          {/* Horizontal crossroad separating top and middle */}
          <Rect
            x={0}
            y={240}
            width={SCREEN_WIDTH}
            height={26}
            fill="#E2E8F0"
          />

          {/* Horizontal crossroad separating middle and bottom */}
          <Rect
            x={0}
            y={370}
            width={SCREEN_WIDTH}
            height={26}
            fill="#E2E8F0"
          />

          {/* Dotted walking navigation path */}
          {selectedPlace.id === 'bldg-a' ? (
            <>
              {/* Blue dotted path from bottom right corridor up to Bldg A */}
              <Path
                d={`M ${SCREEN_WIDTH * 0.5} 490 L ${SCREEN_WIDTH * 0.5} 175 L ${SCREEN_WIDTH * 0.38} 175`}
                fill="none"
                stroke="#1D4ED8"
                strokeWidth={3}
                strokeDasharray="5, 6"
              />
              {/* Destination pulse dot */}
              <Circle
                cx={SCREEN_WIDTH * 0.38}
                cy={175}
                r={6}
                fill="#1D4ED8"
              />
              <Circle
                cx={SCREEN_WIDTH * 0.38}
                cy={175}
                r={12}
                fill="rgba(29, 78, 216, 0.2)"
              />
              {/* User start position dot */}
              <Circle
                cx={SCREEN_WIDTH * 0.5}
                cy={490}
                r={7}
                fill="#2563EB"
              />
              <Circle
                cx={SCREEN_WIDTH * 0.5}
                cy={490}
                r={14}
                fill="rgba(37, 99, 235, 0.2)"
              />
            </>
          ) : (
            <>
              {/* Navigation path to selected building */}
              <Path
                d={`M ${SCREEN_WIDTH * 0.5} 490 L ${SCREEN_WIDTH * 0.5} 290`}
                fill="none"
                stroke="#3B82F6"
                strokeWidth={3}
                strokeDasharray="5, 6"
              />
              <Circle
                cx={SCREEN_WIDTH * 0.5}
                cy={490}
                r={7}
                fill="#2563EB"
              />
            </>
          )}
        </Svg>

        {/* ── BUILDINGS & AREAS OVERLAY ─────────────────────── */}
        <View style={styles.buildingsContainer}>
          {/* Top Row: Bldg A & Bldg B */}
          <View style={styles.row}>
            {/* Bldg A */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleSelect(PLACES[0])}
              style={[
                styles.buildingCard,
                selectedPlace.id === 'bldg-a' && styles.cardSelected,
              ]}
            >
              <Text
                style={[
                  styles.buildingText,
                  selectedPlace.id === 'bldg-a' && styles.buildingTextSelected,
                ]}
              >
                Bldg A
              </Text>
            </TouchableOpacity>

            {/* Bldg B */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleSelect(PLACES[1])}
              style={[
                styles.buildingCard,
                selectedPlace.id === 'bldg-b' && styles.cardSelected,
              ]}
            >
              <Text
                style={[
                  styles.buildingText,
                  selectedPlace.id === 'bldg-b' && styles.buildingTextSelected,
                ]}
              >
                Bldg B
              </Text>
            </TouchableOpacity>
          </View>

          {/* Middle Row: Garden & Open court */}
          <View style={[styles.row, { marginTop: 42 }]}>
            {/* Garden */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleSelect(PLACES[2])}
              style={[
                styles.gardenCard,
                selectedPlace.id === 'garden' && styles.cardSelected,
              ]}
            >
              <Text style={styles.gardenText}>Garden</Text>
            </TouchableOpacity>

            {/* Open court */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleSelect(PLACES[3])}
              style={[
                styles.courtCard,
                selectedPlace.id === 'court' && styles.cardSelected,
              ]}
            >
              <Text style={styles.courtText}>Open court</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Row: Library */}
          <View style={[styles.row, { marginTop: 42 }]}>
            {/* Library */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleSelect(PLACES[4])}
              style={[
                styles.buildingCard,
                selectedPlace.id === 'library' && styles.cardSelected,
              ]}
            >
              <Text
                style={[
                  styles.buildingText,
                  selectedPlace.id === 'library' && styles.buildingTextSelected,
                ]}
              >
                Library
              </Text>
            </TouchableOpacity>

            {/* Spacer matching right quadrant */}
            <View style={{ flex: 1 }} />
          </View>
        </View>
      </View>

      {/* ── FLOATING TOP SEARCH BAR & FILTER ───────────────── */}
      <View style={[styles.topBarContainer, { paddingTop: Math.max(insets.top, 16) + 10 }]}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButtonCircle}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#334155" />
        </TouchableOpacity>

        {/* Pill Search Input */}
        <View style={styles.searchPill}>
          <Ionicons name="search" size={19} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search room or building"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Round Button */}
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
          <Ionicons name="options-outline" size={20} color="#334155" />
        </TouchableOpacity>
      </View>

      {/* ── FLOATING BOTTOM DESTINATION CARD ───────────────── */}
      <View
        style={[
          styles.bottomCard,
          { paddingBottom: Math.max(insets.bottom, 16) + 12 },
        ]}
      >
        {/* Row 1: Icon, Details, and Badge */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={
                selectedPlace.type === 'garden'
                  ? 'leaf-outline'
                  : selectedPlace.type === 'court'
                  ? 'basketball-outline'
                  : selectedPlace.type === 'library'
                  ? 'book-outline'
                  : 'phone-portrait-outline'
              }
              size={22}
              color="#3B82F6"
            />
          </View>

          <View style={styles.cardDetails}>
            <Text style={styles.cardTitle}>{selectedPlace.roomName}</Text>
            <Text style={styles.cardSubtitle}>{selectedPlace.subtitle}</Text>
          </View>

          {selectedPlace.isNextClass && (
            <View style={styles.nextClassBadge}>
              <Text style={styles.nextClassBadgeText}>Your next class</Text>
            </View>
          )}
        </View>

        {/* Row 2: Walk Time & Distance */}
        <View style={styles.statsRow}>
          <Ionicons name="time-outline" size={14} color="#64748B" />
          <Text style={styles.statText}>{selectedPlace.walkTime}</Text>
          <Text style={styles.statDot}>·</Text>
          <Ionicons name="location-outline" size={14} color="#64748B" />
          <Text style={styles.statText}>{selectedPlace.distance}</Text>
        </View>

        {/* Row 3: Action Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            isNavigating && styles.actionButtonActive,
          ]}
          activeOpacity={0.85}
          onPress={() => setIsNavigating(!isNavigating)}
        >
          <Ionicons
            name={isNavigating ? 'checkmark-circle' : 'navigate'}
            size={18}
            color="#FFFFFF"
            style={styles.actionButtonIcon}
          />
          <Text style={styles.actionButtonText}>
            {isNavigating ? 'Navigating in progress...' : 'Start navigation'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF2F7',
  },
  /* Top Floating Search Area */
  topBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchPill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    paddingVertical: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  /* Schematic Map Canvas */
  mapCanvas: {
    flex: 1,
    backgroundColor: '#EDF2F7',
  },
  buildingsContainer: {
    paddingTop: 120,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 24,
  },

  /* Building Cards */
  buildingCard: {
    flex: 1,
    height: 96,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#F8FAFF',
  },
  buildingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  buildingTextSelected: {
    color: '#1D4ED8',
    fontWeight: '700',
  },

  /* Garden Card */
  gardenCard: {
    flex: 1,
    height: 84,
    backgroundColor: '#DCFCE7',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  gardenText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },

  /* Open Court Card */
  courtCard: {
    flex: 1,
    height: 110,
    backgroundColor: '#E0EDFE',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  courtText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },

  /* Bottom Floating Destination Card */
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  nextClassBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  nextClassBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },

  /* Walk Stats */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 16,
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  statDot: {
    fontSize: 13,
    color: '#94A3B8',
    marginHorizontal: 4,
  },

  /* CTA Button */
  actionButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1E40AF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonActive: {
    backgroundColor: '#059669',
  },
  actionButtonIcon: {
    transform: [{ rotate: '45deg' }],
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* Dev banner */
  devBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  devBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
});
