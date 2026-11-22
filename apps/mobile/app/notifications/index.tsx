import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface NotificationItem {
  id: string;
  type: 'revision' | 'rejected' | 'approved';
  badgeLabel: string;
  recipient: string;
  message: string;
  channel: string;
  timestamp: string;
  status: string;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'revision',
    badgeLabel: 'Revision requested',
    recipient: 'To John Dela Cruz',
    message: 'Please upload a signed letter of intent, then resubmit your LESIT application.',
    channel: 'In-app + email',
    timestamp: 'Nov 19, 2026 · 10:15 AM',
    status: 'Delivered',
  },
  {
    id: 'notif-2',
    type: 'rejected',
    badgeLabel: 'Application rejected',
    recipient: 'To Carlo Mendoza',
    message: 'Your application was declined because the required eligibility documents could not be verified.',
    channel: 'In-app + email',
    timestamp: 'Nov 16, 2026 · 2:30 PM',
    status: 'Delivered',
  },
  {
    id: 'notif-3',
    type: 'approved',
    badgeLabel: 'Application approved',
    recipient: 'To Angela Reyes',
    message: 'Welcome to LESIT! Your application has been approved and you are now a member of the organization.',
    channel: 'In-app + email',
    timestamp: 'Nov 16, 2026 · 9:20 AM',
    status: 'Delivered',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'sent' | 'all'>('sent');

  const filtered = filter === 'sent' ? NOTIFICATIONS : NOTIFICATIONS;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & subtitle */}
        <Text style={styles.mainTitle}>Keep students in the loop.</Text>
        <Text style={styles.subtitle}>
          Track application updates sent to your students.
        </Text>

        {/* 2 Stat Cards */}
        <View style={styles.statCardsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>03</Text>
            <Text style={styles.statLabel}>Sent this month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#059669' }]}>00</Text>
            <Text style={styles.statLabel}>Failed deliveries</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'sent' && styles.filterChipActive]}
            onPress={() => setFilter('sent')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'sent' && styles.filterChipTextActive,
              ]}
            >
              Sent updates
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'all' && styles.filterChipTextActive,
              ]}
            >
              All outcomes
            </Text>
          </TouchableOpacity>
        </View>

        {/* List Section Heading */}
        <Text style={styles.sectionHeading}>Recent student updates</Text>

        {/* Notification Cards */}
        {filtered.map((item) => {
          const isRevision = item.type === 'revision';
          const isRejected = item.type === 'rejected';
          const isApproved = item.type === 'approved';

          return (
            <View key={item.id} style={styles.notifCard}>
              {/* Badge + Delivered Row */}
              <View style={styles.cardTopRow}>
                <View
                  style={[
                    styles.typeBadge,
                    isRevision && styles.badgeRevision,
                    isRejected && styles.badgeRejected,
                    isApproved && styles.badgeApproved,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBadgeText,
                      isRevision && styles.badgeTextRevision,
                      isRejected && styles.badgeTextRejected,
                      isApproved && styles.badgeTextApproved,
                    ]}
                  >
                    {item.badgeLabel}
                  </Text>
                </View>
                <Text style={styles.deliveredStatus}>{item.status}</Text>
              </View>

              {/* Recipient */}
              <Text style={styles.recipientText}>{item.recipient}</Text>

              {/* Message */}
              <Text style={styles.messageText}>{item.message}</Text>

              {/* Delivery Channel + View Link */}
              <View style={styles.channelRow}>
                <Ionicons name="mail-outline" size={15} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.channelText}>{item.channel}</Text>
                <TouchableOpacity activeOpacity={0.7} style={{ marginLeft: 8 }}>
                  <Text style={styles.viewLink}>View</Text>
                </TouchableOpacity>
              </View>

              {/* Timestamp */}
              <Text style={styles.timestampText}>{item.timestamp}</Text>
            </View>
          );
        })}
      </ScrollView>
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
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 20,
  },
  statCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  statNum: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 24,
    marginBottom: 14,
  },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeRevision: {
    backgroundColor: '#EFF6FF',
  },
  badgeRejected: {
    backgroundColor: '#FEF2F2',
  },
  badgeApproved: {
    backgroundColor: '#ECFDF5',
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextRevision: {
    color: '#2563EB',
  },
  badgeTextRejected: {
    color: '#DC2626',
  },
  badgeTextApproved: {
    color: '#059669',
  },
  deliveredStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  recipientText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  messageText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  channelText: {
    fontSize: 12,
    color: '#64748B',
  },
  viewLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  timestampText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
