import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Select from '../../components/Select';
import EmptyState from '../../components/EmptyState';
import Avatar from '../../components/Avatar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, STATUS_LABELS, MODE_LABELS } from '../../constants/theme';

const STATUS_OPTIONS = [
  { label: 'En attente', value: 'en_attente' },
  { label: 'Confirmé', value: 'confirme' },
  { label: 'Terminé', value: 'termine' },
  { label: 'Annulé', value: 'annule' },
];

export default function AppointmentsListScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const canManage = user.role === 'admin' || user.role === 'doctor';

  const load = useCallback(() => {
    setError('');
    api
      .get('/appointments/mine')
      .then((res) => setAppointments(res.data))
      .catch(() => setError('Impossible de charger les rendez-vous.'))
      .finally(() => setRefreshing(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function updateStatus(id, status) {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      load();
    } catch {
      setError('Erreur lors de la mise à jour du statut.');
    }
  }

  return (
    <Screen error={error} refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <ScreenHeader title={user.role === 'patient' ? 'Mes rendez-vous' : 'Rendez-vous'} />

      {appointments.length === 0 ? (
        <EmptyState icon="calendar-outline" text="Aucun rendez-vous pour le moment." />
      ) : (
        appointments.map((a) => {
          const s = STATUS_LABELS[a.status] || STATUS_LABELS.en_attente;
          const mode = MODE_LABELS[a.mode] || MODE_LABELS.video;
          const peer = user.role === 'patient' ? a.doctor_name : a.patient_name;
          const canJoin = a.status === 'confirme' && user.role !== 'admin';
          return (
            <Card key={a.id}>
              <View style={styles.row}>
                <View style={styles.dateBox}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.date}>{a.appointment_date} · {a.appointment_time}</Text>
                </View>
                <Badge label={s.label} color={s.color} bg={s.bg} />
              </View>

              <View style={styles.peer}>
                <Avatar name={peer} size={42} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.peerName}>{peer}</Text>
                  {user.role !== 'doctor' && a.specialization ? <Text style={styles.spec}>{a.specialization}</Text> : null}
                  <View style={styles.modeRow}>
                    <Ionicons name={mode.icon} size={13} color={COLORS.textLight} />
                    <Text style={styles.modeText}>{mode.label}</Text>
                  </View>
                </View>
              </View>

              {a.reason ? <Text style={styles.reason}>{a.reason}</Text> : null}

              {canJoin ? (
                <View style={[styles.row, { marginTop: 14 }]}>
                  <Button title="Appel vidéo" icon="videocam" small style={{ flex: 1, marginRight: 8 }} onPress={() => navigation.navigate('VideoCall', { appointment: a })} />
                  <Button title="Chat" icon="chatbubbles-outline" variant="soft" small style={{ flex: 1 }} onPress={() => navigation.navigate('Chat', { appointment: a })} />
                </View>
              ) : null}

              {canManage ? (
                <View style={{ marginTop: 12 }}>
                  <Select selectedValue={a.status} onValueChange={(v) => updateStatus(a.id, v)} items={STATUS_OPTIONS} />
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateBox: { flexDirection: 'row', alignItems: 'center' },
  date: { marginLeft: 6, fontSize: 13, fontWeight: '700', color: COLORS.primary },
  peer: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  peerName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  spec: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  modeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  modeText: { marginLeft: 4, fontSize: 12, color: COLORS.textLight },
  reason: { fontSize: 13, color: COLORS.textLight, marginTop: 12, lineHeight: 18 },
});
