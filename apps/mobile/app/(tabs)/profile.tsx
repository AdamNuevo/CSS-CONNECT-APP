import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../../src/theme/tokens';
import { useAuth } from '../../src/context/AuthContext';

export default function ProfileTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out of CCS Hub?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
      : user?.firstName
      ? user.firstName.charAt(0).toUpperCase()
      : 'U';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: Math.max(insets.top, 20) + 12,
          paddingBottom: Math.max(insets.bottom, 20) + 24,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" />

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
          title="Notifications"
          subtitle="View announcements and reminders"
          onPress={() => router.push('/announcements')}
        />
        <View style={styles.menuDivider} />
        <MenuRow
          icon="lock-closed-outline"
          iconTint="#059669"
          iconBg="#ECFDF5"
          title="Change Password"
          subtitle="Update your portal security credentials"
          onPress={() => router.push('/(auth)/set-password')}
        />
        <View style={styles.menuDivider} />
        <MenuRow
          icon="log-out-outline"
          iconTint="#DC2626"
          iconBg="#FEF2F2"
          title="Sign out"
          titleColor="#DC2626"
          onPress={handleSignOut}
        />
      </View>

      {/* University Credit */}
      <Text style={styles.creditText}>
        CCS Hub v1.0 • Quezon City University
      </Text>
    </ScrollView>
  );
}

function MenuRow({
  icon,
  iconTint,
  iconBg,
  title,
  subtitle,
  titleColor,
  onPress,
}: {
  icon: string;
  iconTint: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  titleColor?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={menuStyles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[menuStyles.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={20} color={iconTint} />
      </View>
      <View style={menuStyles.textGroup}>
        <Text style={[menuStyles.title, titleColor ? { color: titleColor } : {}]}>
          {title}
        </Text>
        {subtitle ? <Text style={menuStyles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const menuStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.floating,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
    letterSpacing: 0.5,
  },
  fullName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  idNumber: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  badgeChip: {
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.successBg,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.successText,
  },
  statusText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.status.successText,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 66,
  },
  creditText: {
    textAlign: 'center',
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
});
