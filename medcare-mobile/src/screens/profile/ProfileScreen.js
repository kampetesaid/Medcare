import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import { COLORS, ROLE_LABELS } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  return (
    <Screen>
      <View style={styles.head}>
        <Avatar name={user.name} size={84} tone="dark" />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={{ marginTop: 10 }}>
          <Badge label={ROLE_LABELS[user.role]} color={COLORS.primaryDark} bg={COLORS.primarySoft} />
        </View>
      </View>
      <Card>
        <Text style={styles.about}>Medcare · version 1.0.0</Text>
      </Card>
      <Button title="Se déconnecter" variant="outline" icon="log-out-outline" onPress={logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', marginVertical: 24 },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 14 },
  email: { fontSize: 14, color: COLORS.textLight, marginTop: 2 },
  about: { color: COLORS.textLight, fontSize: 13, textAlign: 'center' },
});
