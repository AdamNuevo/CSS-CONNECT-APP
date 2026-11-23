import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Faculty-only Locator screen (stub)
export default function LocatorScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Room Locator</Text>
      <Text style={styles.sub}>Find classrooms and faculty rooms on campus.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  title:     { fontSize: 22, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  sub:       { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 32 },
});
