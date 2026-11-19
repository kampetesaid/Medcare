import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import { COLORS, RADIUS } from '../../constants/theme';
import { APP_TAGLINE } from '../../constants/config';

function RoleCard({ icon, title, text, onPress }) {
  return (
    <TouchableOpacity style={styles.role} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.roleIcon}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.roleTitle}>{title}</Text>
        <Text style={styles.roleText}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.placeholder} />
    </TouchableOpacity>
  );
}

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.hero}>
        <SafeAreaView edges={['top']} style={styles.heroInner}>
          <Logo variant="full" size={190} />
          <Text style={styles.tagline}>{APP_TAGLINE}</Text>
        </SafeAreaView>
      </View>

      <View style={styles.sheet}>
        <Text style={styles.heading}>Créer un compte</Text>
        <RoleCard
          icon="person-outline"
          title="Je suis patient"
          text="Décrivez vos symptômes, consultez par vidéo ou par chat."
          onPress={() => navigation.navigate('Register', { role: 'patient' })}
        />
        <RoleCard
          icon="medkit-outline"
          title="Je suis médecin"
          text="Recevez des patients orientés vers votre spécialité."
          onPress={() => navigation.navigate('Register', { role: 'doctor' })}
        />
        <Button title="J'ai déjà un compte" variant="outline" onPress={() => navigation.navigate('Login')} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, justifyContent: 'center' },
  heroInner: { alignItems: 'center', paddingBottom: 24 },
  tagline: { color: COLORS.textLight, fontSize: 14, marginTop: 4, textAlign: 'center', paddingHorizontal: 40 },
  sheet: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  heading: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  role: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  roleTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  roleText: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
});
