import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../constants/theme';

export default function Avatar({ name = '?', size = 44, tone = 'soft' }) {
  const initials = name
    .replace(/^(Dr\.?|Pr\.?)\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
  const dark = tone === 'dark';
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: dark ? COLORS.primary : COLORS.primarySoft,
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Text style={{ color: dark ? '#fff' : COLORS.primaryDark, fontWeight: '700', fontSize: size * 0.36 }}>
        {initials}
      </Text>
    </View>
  );
}
