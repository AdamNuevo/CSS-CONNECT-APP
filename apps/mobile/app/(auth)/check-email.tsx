import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';

export default function CheckEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { requestTemporaryPassword } = useAuth();

  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    setResending(true);
    setStatusMessage(null);
    try {
      await requestTemporaryPassword(email);
      setCooldown(60);
      setStatusMessage('A new temporary password has been sent.');
    } catch (err: any) {
      setStatusMessage(
        err.response?.data?.error?.message ||
        'Unable to resend email right now. Please wait a moment.'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* ── TOP NAV BAR WITH "● CCS Hub" ─────────────────── */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={styles.brandText}>CCS Hub</Text>
        </View>

        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrap}>
          {/* Circular Mail Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={32} color="#2563EB" />
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            If your details match the CCS list, we sent a temporary password to your QCU email. It expires in 24 hours.
          </Text>

          {/* 3 Step Instruction Card */}
          <View style={styles.stepsCard}>
            <View style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.stepText}>Open the email from CCS Connect.</Text>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepText}>Sign in with the temporary password.</Text>
            </View>

            <View style={[styles.stepRow, { marginBottom: 0 }]}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={styles.stepText}>Create your own password.</Text>
            </View>
          </View>

          {statusMessage ? (
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>{statusMessage}</Text>
            </View>
          ) : null}
        </View>

        {/* Buttons */}
        <View style={styles.footerWrap}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace('/(auth)/sign-in')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Go to sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleResend}
            disabled={cooldown > 0 || resending}
            style={styles.resendButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.resendText, (cooldown > 0 || resending) && styles.resendDisabled]}>
              {cooldown > 0
                ? `Resend available in ${cooldown}s`
                : resending
                ? 'Sending…'
                : "Didn't get it? Resend email"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1D4ED8',
  },
  brandText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    justifyContent: 'space-between',
  },
  contentWrap: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 28,
  },

  /* Steps Card */
  stepsCard: {
    width: '100%',
    backgroundColor: '#F0F6FE',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#1E293B',
    lineHeight: 18,
  },

  statusBox: {
    width: '100%',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 13,
    color: '#059669',
    textAlign: 'center',
    fontWeight: '500',
  },

  /* Footer */
  footerWrap: {
    marginTop: 32,
    width: '100%',
  },
  primaryButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resendButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '500',
  },
  resendDisabled: {
    color: '#94A3B8',
  },
});
