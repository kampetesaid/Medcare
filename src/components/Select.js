import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS, RADIUS } from '../constants/theme';

export default function Select({ label, selectedValue, onValueChange, items, placeholder }) {
  return (
    <View style={styles.group}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.wrapper}>
        <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={{ color: COLORS.text }}>
          {placeholder ? <Picker.Item label={placeholder} value="" color={COLORS.placeholder} /> : null}
          {items.map((item) => (
            <Picker.Item key={String(item.value)} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: COLORS.textLight },
  wrapper: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
});
