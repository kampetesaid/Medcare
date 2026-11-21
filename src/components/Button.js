import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';

const VARIANTS = {
  primary: { bg: COLORS.primary, text: '#fff' },
  soft: { bg: COLORS.primarySoft, text: COLORS.primaryDark },
  success: { bg: COLORS.success, text: '#fff' },
  danger: { bg: COLORS.danger, text: '#fff' },
  outline: { bg: 'transparent', text: COLORS.primary, border: COLORS.primary },
  ghost: { bg: 'transparent', text: COLORS.primary },
  light: { bg: '#fff', text: COLORS.navy },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  small,
  style,
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        small && styles.small,
        { backgroundColor: v.bg, borderWidth: v.border ? 1.5 : 0, borderColor: v.border },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={small ? 16 : 18} color={v.text} style={{ marginRight: 8 }} /> : null}
          <Text style={[styles.text, small && styles.textSmall, { color: v.text }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 50,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: { minHeight: 38, paddingHorizontal: 14, borderRadius: RADIUS.sm },
  content: { flexDirection: 'row', alignItems: 'center' },
  text: { fontSize: 16, fontWeight: '600' },
  textSmall: { fontSize: 14 },
  disabled: { opacity: 0.5 },
});
