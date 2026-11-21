import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/theme/tokens';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';

interface RoomData {
  code: string;
  name: string;
  building: string;
  floor: number;
  description: string;
}

const CAMPUS_ROOMS: RoomData[] = [
  {
    code: 'CCS-101',
    name: 'Lecture Room 101',
    building: 'Main Building',
    floor: 1,
    description: 'Ground floor lecture hall with multimedia projector and air conditioning.',
  },
  {
    code: 'CCS-102',
    name: 'Lecture Room 102',
    building: 'Main Building',
    floor: 1,
    description: 'Ground floor lecture room next to faculty office and student lounge.',
  },
  {
    code: 'CCS-201',
    name: 'Lecture Room 201',
    building: 'Main Building',
    floor: 2,
    description: 'Second floor CS lecture room with dual interactive whiteboards.',
  },
  {
    code: 'CCS-202',
    name: 'Lecture Room 202',
    building: 'Main Building',
    floor: 2,
    description: 'Second floor CS lecture room with dual display monitors.',
  },
  {
    code: 'CCS-Lab1',
    name: 'Computer Laboratory 1',
    building: 'Annex Building',
    floor: 2,
    description: 'Advanced software development laboratory with 35 development workstations.',
  },
  {
    code: 'CCS-Lab2',
    name: 'Computer Laboratory 2',
    building: 'Annex Building',
    floor: 2,
    description: 'Networks and cybersecurity lab equipped with Cisco hardware test rigs.',
  },
];

export default function CampusMapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ room?: string }>();
  const [searchQuery, setSearchQuery] = useState(params.room ?? '');

  const filteredRooms = CAMPUS_ROOMS.filter(
    (r) =>
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.building.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Campus Room Locator</Text>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search room (e.g. CCS-101, Lab, Annex)..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* Campus Location Map Graphic Card */}
        <Card style={styles.mapCard}>
          <View style={styles.mapGraphic}>
            <Ionicons name="business" size={48} color={colors.primary} />
            <Text style={styles.mapCampusTitle}>Quezon City University — Main Campus</Text>
            <Text style={styles.mapCampusSubtitle}>San Bartolome, Novaliches, Quezon City</Text>
          </View>
        </Card>

        <Text style={styles.resultsTitle}>
          {filteredRooms.length} {filteredRooms.length === 1 ? 'Room' : 'Rooms'} Found
        </Text>

        {filteredRooms.map((room) => {
          const isTarget = params.room && room.code.toLowerCase() === params.room.toLowerCase();

          return (
            <Card key={room.code} style={isTarget ? { ...styles.roomCard, ...styles.targetRoomCard } : styles.roomCard}>
              <View style={styles.roomHeader}>
                <View>
                  <Text style={styles.roomCode}>{room.code}</Text>
                  <Text style={styles.roomName}>{room.name}</Text>
                </View>
                <Badge
                  label={`Floor ${room.floor}`}
                  variant={isTarget ? 'warning' : 'info'}
                  size="small"
                />
              </View>

              <View style={styles.buildingRow}>
                <Ionicons name="location" size={14} color={colors.accent} />
                <Text style={styles.buildingText}>{room.building}</Text>
              </View>

              <Text style={styles.roomDesc}>{room.description}</Text>

              {isTarget && (
                <View style={styles.targetBadgeRow}>
                  <Ionicons name="navigate-circle" size={16} color={colors.status.pendingText} />
                  <Text style={styles.targetBadgeText}>Navigating to this classroom</Text>
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 46,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  mapCard: {
    padding: spacing.lg,
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  mapGraphic: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  mapCampusTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  mapCampusSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  resultsTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  roomCard: {
    padding: spacing.md,
  },
  targetRoomCard: {
    borderColor: colors.accent,
    borderWidth: 2,
    backgroundColor: '#F8FAFC',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  roomCode: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  roomName: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  buildingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 4,
  },
  buildingText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
  },
  roomDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  targetBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.status.pendingBg,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  targetBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.status.pendingText,
  },
});
