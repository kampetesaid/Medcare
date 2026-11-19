import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONT } from '../constants/theme';

export default function ScreenHeader({ title, subtitle, right }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={FONT.title}>{title}</Text>
        {subtitle ? <Text style={[FONT.small, { marginTop: 2 }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
});
