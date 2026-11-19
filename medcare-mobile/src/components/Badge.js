import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Badge({ label, color, bg }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '700' },
});
