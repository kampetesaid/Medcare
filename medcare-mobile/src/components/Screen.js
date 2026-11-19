import React from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';

export default function Screen({ children, error, success, refreshing, onRefresh, style, contentStyle }) {
  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />
        ) : undefined
      }
    >
      {error ? (
        <View style={[styles.box, { backgroundColor: COLORS.dangerBg }]}>
          <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
          <Text style={[styles.boxText, { color: COLORS.danger }]}>{error}</Text>
        </View>
      ) : null}
      {success ? (
        <View style={[styles.box, { backgroundColor: COLORS.successBg }]}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
          <Text style={[styles.boxText, { color: COLORS.success }]}>{success}</Text>
        </View>
      ) : null}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 48 },
  box: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: RADIUS.md, marginBottom: 16 },
  boxText: { flex: 1, marginLeft: 8, fontSize: 14 },
});
