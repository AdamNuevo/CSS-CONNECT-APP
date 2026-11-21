import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/theme/tokens';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of CCS Hub?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

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
        <Text style={styles.headerTitle}>Student Profile</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* Avatar and Name */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Badge
            label={user?.role?.toUpperCase() ?? 'STUDENT'}
            variant="info"
            size="small"
            style={styles.roleBadge}
          />
        </View>

        {/* Academic Details Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardSectionTitle}>Academic Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Student Number</Text>
            <Text style={styles.infoValue}>{user?.studentNumber ?? '2024-00001'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>College</Text>
            <Text style={styles.infoValue}>College of Computer Studies</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Program</Text>
            <Text style={styles.infoValue}>{user?.program ?? 'BS Information Technology'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Year Level & Section</Text>
            <Text style={styles.infoValue}>
              {user?.yearLevel ?? '1st Year'} • {user?.section ?? 'IT-101'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Campus</Text>
            <Text style={styles.infoValue}>QCU San Bartolome (Main)</Text>
          </View>
        </Card>

        {/* Account Actions */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardSectionTitle}>Security</Text>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/(auth)/set-password')}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="key-outline" size={20} color={colors.textPrimary} />
              <Text style={styles.actionLabel}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Sign Out Button */}
        <View style={styles.signOutContainer}>
          <Button
            label="Sign Out"
            variant="danger"
            size="large"
            icon={<Ionicons name="log-out-outline" size={18} color={colors.textInverse} />}
            onPress={handleSignOut}
          />
        </View>
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
  content: {
    flex: 1,
  },
  contentInner: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  profileHeaderCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textInverse,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    marginTop: spacing.sm,
  },
  infoCard: {
    padding: spacing.md,
  },
  cardSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
  },
  infoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    minHeight: 44,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  signOutContainer: {
    marginTop: spacing.md,
  },
});
