import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.card,
  },
});
