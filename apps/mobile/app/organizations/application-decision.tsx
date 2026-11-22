import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type OutcomeType = 'approve' | 'reject' | 'request_info';

export default function ApplicationDecisionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [outcome, setOutcome] = useState<OutcomeType>('request_info');
  const [message, setMessage] = useState(
    'Please upload your registration form for the current semester so I can verify your enrollment and complete your application review.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Decision Submitted',
        outcome === 'approve'
          ? 'Maria Santos has been approved as an active member of LESIT!'
          : outcome === 'reject'
          ? 'Application has been declined.'
          : 'Revision request has been sent to Maria Santos.',
        [{ text: 'OK', onPress: () => router.navigate('/organizations') }]
      );
    }, 500);
  };

  const getActionBtnLabel = () => {
    if (outcome === 'approve') return 'Approve student';
    if (outcome === 'reject') return 'Decline application';
    return 'Send request';
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application decision</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Student Mini Card */}
        <View style={styles.studentCard}>
          <View style={styles.studentHeaderRow}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarInitials}>MS</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.studentName}>Maria Santos</Text>
              <Text style={styles.studentMeta}>2024-01284 · BSIT · 3rd year</Text>
            </View>
          </View>

          {/* Missing Warning Banner */}
          <View style={styles.warningBox}>
            <Text style={styles.warningExclamation}>!</Text>
            <Text style={styles.warningText}>Registration form is missing.</Text>
          </View>
        </View>

        {/* Section: Choose an outcome */}
        <Text style={styles.sectionTitle}>Choose an outcome</Text>

        {/* Option 1: Approve */}
        <TouchableOpacity
          style={[styles.outcomeCard, outcome === 'approve' && styles.outcomeCardActive]}
          onPress={() => setOutcome('approve')}
          activeOpacity={0.8}
        >
          <View style={[styles.radioCircle, outcome === 'approve' && styles.radioCircleActive]}>
            {outcome === 'approve' && <View style={styles.radioDot} />}
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.outcomeTitle, { color: '#059669' }]}>Approve</Text>
            <Text style={styles.outcomeSubtitle}>
              Accept and add the student to the organization.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Option 2: Reject */}
        <TouchableOpacity
          style={[styles.outcomeCard, outcome === 'reject' && styles.outcomeCardActive]}
          onPress={() => setOutcome('reject')}
          activeOpacity={0.8}
        >
          <View style={[styles.radioCircle, outcome === 'reject' && styles.radioCircleActive]}>
            {outcome === 'reject' && <View style={styles.radioDot} />}
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.outcomeTitle, { color: '#DC2626' }]}>Reject</Text>
            <Text style={styles.outcomeSubtitle}>
              Decline the application and provide a reason.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Option 3: Request More Information */}
        <TouchableOpacity
          style={[
            styles.outcomeCard,
            outcome === 'request_info' && styles.outcomeCardBlueActive,
          ]}
          onPress={() => setOutcome('request_info')}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.radioCircle,
              outcome === 'request_info' && styles.radioCircleBlueActive,
            ]}
          >
            {outcome === 'request_info' && <View style={styles.radioDotBlue} />}
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.outcomeTitle, { color: '#1E3A8A' }]}>
              Request More Information
            </Text>
            <Text style={styles.outcomeSubtitle}>
              Ask the student to complete missing information.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Section: Message to student */}
        <View style={styles.fieldHeaderRow}>
          <Text style={styles.sectionTitle}>Message to student *</Text>
        </View>
        <Text style={styles.fieldCaption}>
          Required when rejecting or requesting a revision.
        </Text>

        <View style={styles.textAreaCard}>
          <TextInput
            style={styles.textArea}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            placeholder="Write your message to the student..."
            placeholderTextColor="#94A3B8"
          />
          <View style={styles.textAreaFooter}>
            <Text style={styles.textAreaHint}>Be specific about what needs to change.</Text>
            <Text style={styles.charCount}>{message.length} / 500</Text>
          </View>
        </View>

        {/* Section: Notification preview */}
        <Text style={styles.sectionTitle}>Notification preview</Text>
        <View style={styles.previewCard}>
          <Text style={styles.previewChannel}>To Maria Santos · In-app + email</Text>
          <Text style={styles.previewTitle}>
            {outcome === 'approve'
              ? 'Your LESIT application has been approved!'
              : outcome === 'reject'
              ? 'Update on your LESIT application'
              : 'Your LESIT application needs a revision'}
          </Text>
          <Text style={styles.previewBody}>
            {outcome === 'approve'
              ? 'Welcome to LESIT! Your application has been approved and you are now an active member.'
              : outcome === 'reject'
              ? 'Your application was reviewed and could not be approved at this time.'
              : 'Your adviser has requested your current registration form. Open your application to upload the document and resubmit.'}
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.85}
          onPress={handleSend}
          disabled={isSubmitting}
        >
          <Text style={styles.actionBtnText}>{getActionBtnLabel()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.bottomCaption}>
          Sending will change the status to Needs Revision and notify the student.
        </Text>
      </View>
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
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
  },
  studentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  studentMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  warningExclamation: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
    marginRight: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#B45309',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  fieldHeaderRow: {
    marginTop: 12,
  },
  fieldCaption: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
    marginTop: -6,
  },
  outcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 10,
  },
  outcomeCardActive: {
    borderColor: '#94A3B8',
  },
  outcomeCardBlueActive: {
    borderColor: '#1E3A8A',
    borderWidth: 1.5,
    backgroundColor: '#F8FAFC',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#0F172A',
  },
  radioCircleBlueActive: {
    borderColor: '#1E3A8A',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F172A',
  },
  radioDotBlue: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E3A8A',
  },
  outcomeTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  outcomeSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  textAreaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    marginBottom: 20,
  },
  textArea: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  textAreaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginTop: 8,
  },
  textAreaHint: {
    fontSize: 11,
    color: '#64748B',
  },
  charCount: {
    fontSize: 11,
    color: '#64748B',
  },
  previewCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 16,
    marginBottom: 20,
  },
  previewChannel: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '600',
    marginBottom: 6,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  previewBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  actionBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  bottomCaption: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
});
