import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, STATUS_LABELS, MODE_LABELS } from '../../constants/theme';

export default function DoctorDashboardScreen() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(() => {
    setError('');
    api
      .get(`/appointments/mine?date=${today}`)
      .then((res) => setAppointments(res.data))
      .catch(() => setError('Impossible de charger vos rendez-vous.'))
      .finally(() => setRefreshing(false));
  }, [today]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen error={error} refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <ScreenHeader title={`Bonjour, ${user.name}`} subtitle={`Consultations du jour · ${today}`} />

      {appointments.length === 0 ? (
        <EmptyState icon="calendar-outline" text="Aucune consultation prévue aujourd'hui." />
      ) : (
        appointments.map((a) => {
          const s = STATUS_LABELS[a.status] || STATUS_LABELS.en_attente;
          const mode = MODE_LABELS[a.mode] || MODE_LABELS.video;
          return (
            <Card key={a.id}>
              <View style={styles.row}>
                <Text style={styles.time}>{a.appointment_time}</Text>
                <Badge label={s.label} color={s.color} bg={s.bg} />
              </View>
              <Text style={styles.patient}>{a.patient_name}</Text>
              <View style={styles.modeRow}>
                <Ionicons name={mode.icon} size={14} color={COLORS.textLight} />
                <Text style={styles.meta}>{mode.label}</Text>
              </View>
              {a.reason ? (
                <View style={styles.summary}>
                  <Text style={styles.summaryLabel}>Motif / orientation</Text>
                  <Text style={styles.summaryText}>{a.reason}</Text>
                </View>
              ) : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  time: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  patient: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  modeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  meta: { fontSize: 13, color: COLORS.textLight, marginLeft: 5 },
  summary: { backgroundColor: COLORS.primaryMist, borderRadius: 10, padding: 10, marginTop: 12 },
  summaryLabel: { fontSize: 11, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.6 },
  summaryText: { fontSize: 13, color: COLORS.text, marginTop: 3, lineHeight: 18 },
});
