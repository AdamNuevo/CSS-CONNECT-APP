import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = ['Seminar', 'Workshop', 'Competition', 'Webinar'];

export default function CreateEventScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Workshop');
  const [date, setDate] = useState('Nov 20, 2026');
  const [time, setTime] = useState('1:00 PM');
  const [venue, setVenue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublish = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter an event title.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert('Event Published', 'Your event has been successfully created!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 600);
  };

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
        <Text style={styles.headerTitle}>Create event</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashed Poster Upload Box */}
        <TouchableOpacity style={styles.uploadBox} activeOpacity={0.8}>
          <View style={styles.uploadIconWrap}>
            <Ionicons name="image-outline" size={28} color="#2563EB" />
          </View>
          <Text style={styles.uploadText}>Upload event poster</Text>
        </TouchableOpacity>

        {/* Event Title */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Event title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Intro to Cloud Computing"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Category Chips */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.categoryText, isSelected && styles.categoryTextSelected]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date and Time Side-by-side */}
        <View style={styles.dateTimeRow}>
          <View style={[styles.fieldBlock, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="Nov 20, 2026"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={[styles.fieldBlock, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Time</Text>
            <TextInput
              style={styles.input}
              value={time}
              onChangeText={setTime}
              placeholder="1:00 PM"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Venue */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Venue</Text>
          <View style={styles.venueInputWrap}>
            <Ionicons
              name="location-outline"
              size={18}
              color="#64748B"
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.venueInput}
              value={venue}
              onChangeText={setVenue}
              placeholder="e.g. CCS Lab 2, Bldg A"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Publish CTA Button */}
        <TouchableOpacity
          style={styles.publishBtn}
          activeOpacity={0.85}
          onPress={handlePublish}
          disabled={isSubmitting}
        >
          <Text style={styles.publishBtnText}>
            {isSubmitting ? 'Publishing...' : 'Publish event'}
          </Text>
        </TouchableOpacity>
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
  uploadBox: {
    height: 140,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  fieldBlock: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  categoryChipSelected: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  venueInputWrap: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  publishBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  publishBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
