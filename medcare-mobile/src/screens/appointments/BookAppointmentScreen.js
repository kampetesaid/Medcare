import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Select from '../../components/Select';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../services/api';
import { COLORS, FONT, RADIUS, MODE_LABELS } from '../../constants/theme';

const pad = (n) => String(n).padStart(2, '0');
const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const webInput = { flex: 1, marginRight: 8, padding: 13, fontSize: 15, borderRadius: 12, border: `1.5px solid ${COLORS.border}`, fontFamily: 'inherit', color: COLORS.text, backgroundColor: '#fff' };

/** Réservation manuelle (alternative à l'orientation par IA). */
export default function BookAppointmentScreen({ navigation }) {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [when, setWhen] = useState(new Date(Date.now() + 24 * 3600 * 1000));
  const [picker, setPicker] = useState(null); // 'date' | 'time' | null
  const [mode, setMode] = useState('video');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/doctors').then((res) => setDoctors(res.data)).catch(() => setError('Impossible de charger les médecins.'));
  }, []);

  function onPick(_, selected) {
    const kind = picker;
    if (Platform.OS === 'android') setPicker(null);
    if (!selected) return;
    const next = new Date(when);
    if (kind === 'date') next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    else next.setHours(selected.getHours(), selected.getMinutes());
    setWhen(next);
  }

  async function handleSubmit() {
    setError('');
    setSuccess('');
    if (!doctorId) return setError('Merci de choisir un médecin.');
    if (when.getTime() < Date.now()) return setError('Choisissez un créneau dans le futur.');
    setLoading(true);
    try {
      await api.post('/appointments', { doctorId, date: fmtDate(when), time: fmtTime(when), mode, reason });
      setSuccess('Rendez-vous enregistré.');
      setTimeout(() => navigation.navigate('Main', { screen: 'AppointmentsTab' }), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la prise de rendez-vous.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen error={error} success={success}>
      <Text style={[FONT.title, { marginBottom: 20 }]}>Prendre rendez-vous</Text>

      <Select
        label="Médecin"
        placeholder="Choisir un médecin"
        selectedValue={doctorId}
        onValueChange={setDoctorId}
        items={doctors.map((d) => ({ label: `${d.name} — ${d.specialization}`, value: String(d.id) }))}
      />

      <Text style={styles.label}>Date et heure</Text>
      {Platform.OS === 'web' ? (
        // Navigateur : champs date/heure HTML (le sélecteur natif n'existe pas sur le web)
        <View style={styles.row}>
          {React.createElement('input', {
            type: 'date',
            value: fmtDate(when),
            min: fmtDate(new Date()),
            onChange: (e) => {
              const [y, m, d] = e.target.value.split('-').map(Number);
              if (!y) return;
              const next = new Date(when);
              next.setFullYear(y, m - 1, d);
              setWhen(next);
            },
            style: webInput,
          })}
          {React.createElement('input', {
            type: 'time',
            value: fmtTime(when),
            onChange: (e) => {
              const [h, mi] = e.target.value.split(':').map(Number);
              if (Number.isNaN(h)) return;
              const next = new Date(when);
              next.setHours(h, mi);
              setWhen(next);
            },
            style: webInput,
          })}
        </View>
      ) : (
        <>
          <View style={styles.row}>
            <TouchableOpacity style={styles.pick} onPress={() => setPicker('date')}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
              <Text style={styles.pickText}>{fmtDate(when)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pick} onPress={() => setPicker('time')}>
              <Ionicons name="time-outline" size={18} color={COLORS.primary} />
              <Text style={styles.pickText}>{fmtTime(when)}</Text>
            </TouchableOpacity>
          </View>
          {picker ? (
            <DateTimePicker value={when} mode={picker} minimumDate={new Date()} is24Hour display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onPick} />
          ) : null}
        </>
      )}

      <Text style={[styles.label, { marginTop: 16 }]}>Type de consultation</Text>
      <View style={styles.row}>
        {['video', 'chat'].map((m) => (
          <TouchableOpacity key={m} style={[styles.mode, mode === m && styles.modeOn]} onPress={() => setMode(m)}>
            <Ionicons name={MODE_LABELS[m].icon} size={20} color={mode === m ? COLORS.primary : COLORS.textLight} />
            <Text style={[styles.modeText, mode === m && { color: COLORS.primaryDark }]}>{MODE_LABELS[m].label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 16 }} />
      <Input label="Motif de consultation (optionnel)" value={reason} onChangeText={setReason} multiline />
      <Button title="Confirmer le rendez-vous" onPress={handleSubmit} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: COLORS.textLight },
  row: { flexDirection: 'row' },
  pick: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 14, marginRight: 8 },
  pickText: { marginLeft: 10, fontSize: 15, color: COLORS.text, fontWeight: '600' },
  mode: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: '#fff', marginRight: 8 },
  modeOn: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryMist },
  modeText: { marginLeft: 8, fontWeight: '600', color: COLORS.textLight },
});
