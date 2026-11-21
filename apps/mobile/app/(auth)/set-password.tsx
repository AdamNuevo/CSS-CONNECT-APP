import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/ui/Input';
import { colors, spacing, typography, radius, shadows } from '../../src/theme/tokens';
import { useAuth } from '../../src/context/AuthContext';

export default function SetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setNewPassword, signOut } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPasswordInput] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isFormValid =
    currentPassword.length > 0 && hasMinLength && hasUppercase && hasNumber && passwordsMatch;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setErrorMessage(null);
    setLoading(true);
    try {
      await setNewPassword({ currentPassword, newPassword, confirmPassword });
      router.replace('/(tabs)');
    } catch (err: any) {
      const serverMessage =
        err.response?.data?.error?.message ||
        'Failed to update password. Please check your current password.';
      setErrorMessage(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
        <View style={styles.backButton} />
        <Text style={styles.topBarTitle}>Security Setup</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Set new password</Text>
          <Text style={styles.subtitle}>
            Please replace your temporary password with a permanent, secure password.
          </Text>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={colors.status.dangerText}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Current / Temporary Password</Text>
            <Input
              placeholder="Enter current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              isPassword
              leftIcon="lock-closed-outline"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>New Password</Text>
            <Input
              placeholder="Create new password"
              value={newPassword}
              onChangeText={setNewPasswordInput}
              isPassword
              leftIcon="key-outline"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Confirm New Password</Text>
            <Input
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              leftIcon="key-outline"
            />
          </View>

          {/* Checklist */}
          <View style={styles.rulesContainer}>
            <Text style={styles.rulesHeader}>Password requirements:</Text>
            <RequirementItem satisfied={hasMinLength} label="At least 8 characters" />
            <RequirementItem satisfied={hasUppercase} label="At least one uppercase letter" />
            <RequirementItem satisfied={hasNumber} label="At least one number" />
            <RequirementItem satisfied={passwordsMatch} label="Passwords match" />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, (!isFormValid || loading) && styles.buttonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={!isFormValid || loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Updating…' : 'Set new password'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={signOut} style={styles.signOutButton} activeOpacity={0.7}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RequirementItem({ satisfied, label }: { satisfied: boolean; label: string }) {
  return (
    <View style={ruleStyles.row}>
      <Ionicons
        name={satisfied ? 'checkmark-circle' : 'ellipse-outline'}
        size={15}
        color={satisfied ? colors.status.successText : colors.textMuted}
        style={{ marginRight: 8 }}
      />
      <Text style={[ruleStyles.text, satisfied && ruleStyles.satisfied]}>{label}</Text>
    </View>
  );
}

const ruleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  text: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  satisfied: {
    color: colors.status.successText,
    fontWeight: typography.weights.medium,
  },
});

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
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
  },
  topBarTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.dangerBg,
    borderColor: colors.status.dangerBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    flex: 1,
    color: colors.status.dangerText,
    fontSize: typography.sizes.sm,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  rulesContainer: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rulesHeader: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  signOutButton: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  signOutText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
});
