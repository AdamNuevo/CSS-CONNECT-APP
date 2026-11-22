import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/theme/tokens';
import { useAuth } from '../../src/context/AuthContext';
import { ConfirmModal } from '../../src/components/ui/ConfirmModal';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOutConfirm = async () => {
    setSigningOut(true);
    try {
      await signOut();
      setShowSignOutModal(false);
      router.replace('/(auth)/sign-in');
    } finally {
      setSigningOut(false);
    }
  };

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
      : user?.firstName
      ? user.firstName.charAt(0).toUpperCase()
      : 'U';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header with Back Button */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.root}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom, 20) + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.fullName}>
            {user?.firstName} {user?.lastName}
          </Text>

          <Text style={styles.idNumber}>
            {user?.studentNumber ?? user?.employeeNumber ?? '2024-00001'}
          </Text>

          <View style={styles.badgeRow}>
            {user?.program ? (
              <View style={styles.badgeChip}>
                <Text style={styles.badgeText}>{user.program}</Text>
              </View>
            ) : null}
            {user?.yearLevel ? (
              <View style={styles.badgeChip}>
                <Text style={styles.badgeText}>{user.yearLevel}</Text>
              </View>
            ) : null}
            {user?.section ? (
              <View style={styles.badgeChip}>
                <Text style={styles.badgeText}>{user.section}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Enrolled • Regular</Text>
          </View>
        </View>

        {/* Account Settings Menu */}
        <View style={styles.menuCard}>
          <MenuRow
            icon="shield-checkmark-outline"
            iconTint="#2563EB"
            iconBg="#EFF6FF"
            title="Officer Mode"
            subtitle="Manage student organization events"
            onPress={() => router.push('/organizations')}
          />
          <View style={styles.menuDivider} />
          <MenuRow
            icon="notifications-outline"
            iconTint="#7C3AED"
            iconBg="#F5F3FF"
            title="Notification Settings"
            subtitle="Push notifications & announcements"
            onPress={() => {}}
          />
          <View style={styles.menuDivider} />
          <MenuRow
            icon="key-outline"
            iconTint="#059669"
            iconBg="#ECFDF5"
            title="Change Password"
            subtitle="Update your security credentials"
            onPress={() => router.push('/(auth)/set-password')}
          />
        </View>

        {/* Support Section */}
        <View style={styles.menuCard}>
          <MenuRow
            icon="help-circle-outline"
            iconTint="#D97706"
            iconBg="#FFFBEB"
            title="Help & Support"
            subtitle="FAQs, IT desk contact"
            onPress={() => {}}
          />
          <View style={styles.menuDivider} />
          <MenuRow
            icon="document-text-outline"
            iconTint="#64748B"
            iconBg="#F8FAFC"
            title="Privacy Policy & Terms"
            subtitle="How your student data is handled"
            onPress={() => {}}
          />
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => setShowSignOutModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>CCS Hub Mobile v1.0.0 • QCU CCS</Text>
      </ScrollView>

      {/* Confirm Sign Out Modal */}
      <ConfirmModal
        visible={showSignOutModal}
        title="Sign Out"
        message="Are you sure you want to sign out of CCS Hub? You will need to log in again to access your account."
        icon="log-out-outline"
        iconColor="#DC2626"
        iconBg="#FEE2E2"
        confirmLabel="Sign Out"
        confirmVariant="danger"
        cancelLabel="Stay logged in"
        loading={signingOut}
        onConfirm={handleSignOutConfirm}
        onCancel={() => setShowSignOutModal(false)}
      />
    </View>
  );
}

function MenuRow({
  icon,
  iconTint,
  iconBg,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconTint: string;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconTint} />
      </View>
      <View style={styles.menuTextCol}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#DBEAFE',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fullName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  idNumber: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 14,
  },
  badgeChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 68,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 6,
    marginBottom: 20,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
  },
});
