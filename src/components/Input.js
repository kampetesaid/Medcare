import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';

export default function Input({ label, icon, style, multiline, secureTextEntry, ...props }) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View style={styles.group}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, focused && styles.focused, multiline && styles.fieldMulti]}>
        {icon ? (
          <Ionicons name={icon} size={18} color={focused ? COLORS.primary : COLORS.placeholder} style={styles.icon} />
        ) : null}
        <TextInput
          style={[styles.input, multiline && styles.multiline, style]}
          placeholderTextColor={COLORS.placeholder}
          multiline={multiline}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {secureTextEntry ? (
          <TouchableOpacity onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.placeholder} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: COLORS.textLight },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  fieldMulti: { alignItems: 'flex-start' },
  focused: { borderColor: COLORS.primary },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: COLORS.text },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
});
