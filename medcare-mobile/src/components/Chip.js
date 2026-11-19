import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: '#fff',
    marginRight: 8, marginBottom: 8,
  },
  selected: { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primary },
  text: { fontSize: 13, color: COLORS.textLight, fontWeight: '600' },
  textSelected: { color: COLORS.primaryDark },
});
