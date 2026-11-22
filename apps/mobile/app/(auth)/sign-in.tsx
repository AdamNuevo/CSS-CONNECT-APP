import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, savedEmail } = useAuth();

  const [email, setEmail] = useState(savedEmail ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(!!savedEmail);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Incorrect email or password. Check your details and try again.');
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    try {
      const result = await signIn({ email: email.trim(), password, keepSignedIn });
      if (result.mustChangePassword) {
        router.replace('/(auth)/set-password');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      const serverMessage =
        err.response?.data?.error?.message ||
        'Incorrect email or password. Check your details and try again.';
      setErrorMessage(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const hasError = !!errorMessage;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* ── TOP NAVY BRANDING BANNER ──────────────────────── */}
      <View style={[styles.headerNavy, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <Image
          source={require('../../assets/images/qcu-logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.appTitle}>CCS Hub</Text>
        <Text style={styles.universitySubtitle}>Quezon City University</Text>
      </View>

      {/* ── WHITE CONTENT CONTAINER (Fills 100% of rest of screen) ── */}
      <View style={styles.bodyWrap}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Text */}
          <Text style={styles.welcomeTitle}>Welcome back</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to continue.</Text>

          {/* Error Banner */}
          {hasError ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color="#DC2626"
                style={{ marginRight: 8, marginTop: 1 }}
              />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* QCU Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>QCU email</Text>
            <View style={[styles.inputContainer, hasError && styles.inputContainerError]}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={hasError ? '#EF4444' : '#94A3B8'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="juan.delacruz@qcu.edu.ph"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.inputContainer, hasError && styles.inputContainerError]}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={hasError ? '#EF4444' : '#94A3B8'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.showButton}
                activeOpacity={0.7}
              >
                <Text style={styles.showButtonText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Options Row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.7}
              onPress={() => setKeepSignedIn((prev) => !prev)}
            >
              <View style={[styles.checkbox, keepSignedIn && styles.checkboxActive]}>
                {keepSignedIn && (
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Keep me signed in</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In CTA Button */}
          <TouchableOpacity
            style={[styles.signInButton, loading && styles.signInButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.signInButtonText}>Sign in</Text>
            )}
          </TouchableOpacity>

          {/* First time prompt footer */}
          <Text style={styles.footerPrompt}>
            First time signing in? Use the temporary password sent to your QCU email.
          </Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E1F42',
  },

  /* Header Branding */
  headerNavy: {
    backgroundColor: '#0E1F42',
    alignItems: 'center',
    paddingBottom: 24,
  },
  logoImage: {
    width: 68,
    height: 68,
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  universitySubtitle: {
    fontSize: 12,
    color: '#93C5FD',
    letterSpacing: 0.2,
  },

  /* Pure White Container Covering Bottom 100% */
  bodyWrap: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    backgroundColor: '#FFFFFF',
  },

  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },

  /* Error Banner */
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
    lineHeight: 18,
    fontWeight: '500',
  },

  /* Input Fields */
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    height: '100%',
  },
  showButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  showButtonText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Options Row */
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#475569',
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '500',
  },

  /* CTA Button */
  signInButton: {
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
  signInButtonDisabled: {
    opacity: 0.65,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* Footer Prompt */
  footerPrompt: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 24,
    paddingHorizontal: 16,
  },
});
