import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function EmptyState({ icon = 'folder-open-outline', text }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.circle}>
        <Ionicons name={icon} size={26} color={COLORS.primary} />
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 36 },
  circle: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  text: { color: COLORS.textLight, fontSize: 14, textAlign: 'center', maxWidth: 260 },
});
