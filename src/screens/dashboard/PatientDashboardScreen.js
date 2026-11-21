import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONT, RADIUS, SHADOW, STATUS_LABELS, MODE_LABELS } from '../../constants/theme';

export default function PatientDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    setError('');
    api
      .get('/appointments/mine')
      .then((res) => setAppointments(res.data))
      .catch(() => setError('Impossible de charger vos rendez-vous.'))
      .finally(() => setRefreshing(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const upcoming = appointments.filter((a) => a.status !== 'annule' && a.status !== 'termine');
  const firstName = (user.name || '').split(' ')[0];

  return (
    <Screen error={error} refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <Text style={FONT.small}>Bonjour,</Text>
      <Text style={[FONT.title, { marginBottom: 20 }]}>{firstName}</Text>

      <TouchableOpacity activeOpacity={0.92} onPress={() => navigation.navigate('Triage')} style={SHADOW.raised}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Consulter un médecin</Text>
            <Text style={styles.heroText}>Décrivez vos symptômes : nous vous orientons vers le bon spécialiste.</Text>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="arrow-forward" size={22} color={COLORS.primary} />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={[FONT.h2, { marginTop: 28, marginBottom: 12 }]}>Prochains rendez-vous</Text>

      {upcoming.length === 0 ? (
        <EmptyState icon="calendar-outline" text="Aucun rendez-vous à venir." />
      ) : (
        upcoming.map((a) => {
          const s = STATUS_LABELS[a.status] || STATUS_LABELS.en_attente;
          const mode = MODE_LABELS[a.mode] || MODE_LABELS.video;
          return (
            <Card key={a.id}>
              <View style={styles.row}>
                <Text style={styles.date}>{a.appointment_date} · {a.appointment_time}</Text>
                <Badge label={s.label} color={s.color} bg={s.bg} />
              </View>
              <Text style={styles.doc}>{a.doctor_name}</Text>
              <View style={styles.modeRow}>
                <Ionicons name={mode.icon} size={14} color={COLORS.textLight} />
                <Text style={styles.meta}>{a.specialization} · {mode.label}</Text>
              </View>
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: RADIUS.xl, padding: 22, flexDirection: 'row', alignItems: 'center' },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  heroText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 6, lineHeight: 18, paddingRight: 12 },
  heroIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  date: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  doc: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  modeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  meta: { fontSize: 13, color: COLORS.textLight, marginLeft: 5 },
});
