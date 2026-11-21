import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Chip from '../../components/Chip';
import Avatar from '../../components/Avatar';
import { useAuth } from '../../context/AuthContext';
import { analyzeSymptoms, bookFromTriage } from '../../services/triageService';
import { hasRedFlag } from '../../utils/redFlags';
import { COLORS, FONT, RADIUS, URGENCY_LABELS, MODE_LABELS } from '../../constants/theme';
import { EMERGENCY_NUMBER } from '../../constants/config';

const QUICK_SYMPTOMS = ['Fièvre', 'Maux de tête', 'Toux', 'Douleur au ventre', 'Fatigue', 'Éruption cutanée', 'Douleur articulaire', 'Vertiges'];
const DURATIONS = ["Aujourd'hui", '2-3 jours', 'Plus d’une semaine', 'Plus d’un mois'];

export default function TriageScreen({ navigation }) {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [localEmergency, setLocalEmergency] = useState(false);
  const [pick, setPick] = useState(null); // { doctor, slot }
  const [mode, setMode] = useState('video');
  const [booking, setBooking] = useState(false);

  const addSymptom = (s) => setSymptoms((t) => (t ? `${t.trim()}, ${s.toLowerCase()}` : s));

  async function handleAnalyze() {
    setError('');
    setResult(null);
    setPick(null);
    if (symptoms.trim().length < 5) {
      setError('Décrivez vos symptômes en quelques mots pour que l’analyse soit utile.');
      return;
    }
    // Sécurité : signes d'alerte détectés localement, avant tout appel réseau
    const flagged = hasRedFlag(symptoms);
    setLocalEmergency(flagged);
    setLoading(true);
    try {
      const data = await analyzeSymptoms({ symptoms: symptoms.trim(), duration, age: user?.age, gender: user?.gender });
      setResult(data);
    } catch (err) {
      if (!flagged) {
        setError(err.response?.data?.message || "L'analyse est momentanément indisponible. Vous pouvez choisir un médecin manuellement.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleBook() {
    if (!pick) return;
    setBooking(true);
    setError('');
    try {
      await bookFromTriage({
        triageId: result.triageId,
        doctorId: pick.doctor.id,
        date: pick.slot.date,
        time: pick.slot.time,
        mode,
        summary: result.summary,
      });
      navigation.navigate('Main', { screen: 'AppointmentsTab' });
    } catch (err) {
      setError(err.response?.data?.message || 'Ce créneau n’est plus disponible. Choisissez-en un autre.');
    } finally {
      setBooking(false);
    }
  }

  const emergency = localEmergency || result?.emergency || result?.urgency === 'emergency';

  return (
    <Screen error={error}>
      <Text style={FONT.title}>Quel est votre problème ?</Text>
      <Text style={[FONT.small, { marginTop: 4, marginBottom: 20 }]}>
        Notre assistant analyse vos symptômes et vous oriente vers le bon médecin. Il ne remplace pas une consultation.
      </Text>

      {emergency ? (
        <View style={styles.emergency}>
          <Ionicons name="warning" size={22} color={COLORS.danger} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.emergencyTitle}>Ces symptômes peuvent nécessiter une prise en charge immédiate</Text>
            <Text style={styles.emergencyText}>
              Ne patientez pas pour un rendez-vous en ligne. Appelez les secours ou rendez-vous aux urgences les plus proches.
            </Text>
            <Button title={`Appeler le ${EMERGENCY_NUMBER}`} variant="danger" icon="call" small style={{ marginTop: 10, alignSelf: 'flex-start' }} onPress={() => Linking.openURL(`tel:${EMERGENCY_NUMBER}`)} />
          </View>
        </View>
      ) : null}

      <Text style={styles.label}>Symptômes fréquents</Text>
      <View style={styles.wrap}>
        {QUICK_SYMPTOMS.map((s) => (
          <Chip key={s} label={s} onPress={() => addSymptom(s)} />
        ))}
      </View>

      <Input
        label="Décrivez ce que vous ressentez"
        placeholder="Ex : depuis hier j'ai de la fièvre et de forts maux de tête…"
        value={symptoms}
        onChangeText={setSymptoms}
        multiline
      />

      <Text style={styles.label}>Depuis quand ?</Text>
      <View style={styles.wrap}>
        {DURATIONS.map((d) => (
          <Chip key={d} label={d} selected={duration === d} onPress={() => setDuration(d)} />
        ))}
      </View>

      <Button title="Analyser mes symptômes" icon="sparkles-outline" onPress={handleAnalyze} loading={loading} style={{ marginTop: 8, marginBottom: 24 }} />

      {result ? (
        <>
          <Card>
            <View style={styles.rowBetween}>
              <Text style={FONT.h2}>Orientation</Text>
              <Badge {...(URGENCY_LABELS[result.urgency] || URGENCY_LABELS.moderate)} />
            </View>
            <Text style={[FONT.body, { marginTop: 10 }]}>{result.summary}</Text>
            <View style={styles.specialty}>
              <Ionicons name="medkit-outline" size={16} color={COLORS.primaryDark} />
              <Text style={styles.specialtyText}>{result.specialty}</Text>
            </View>
            {result.advice ? <Text style={[FONT.small, { marginTop: 10 }]}>{result.advice}</Text> : null}
          </Card>

          <Text style={[FONT.h2, { marginBottom: 12 }]}>Médecins disponibles</Text>
          {(result.doctors || []).length === 0 ? (
            <Card>
              <Text style={FONT.small}>Aucun médecin de cette spécialité n’est disponible pour le moment.</Text>
              <Button title="Choisir manuellement" variant="soft" small style={{ marginTop: 12, alignSelf: 'flex-start' }} onPress={() => navigation.navigate('BookAppointment')} />
            </Card>
          ) : (
            result.doctors.map((d) => (
              <Card key={d.id}>
                <View style={styles.doctorRow}>
                  <Avatar name={d.name} size={48} tone="dark" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.doctorName}>{d.name}</Text>
                    <Text style={styles.doctorSpec}>{d.specialization}</Text>
                    {d.consultation_fee ? <Text style={FONT.small}>{d.consultation_fee} FCFA</Text> : null}
                  </View>
                </View>
                <View style={[styles.wrap, { marginTop: 12 }]}>
                  {(d.slots || []).slice(0, 6).map((s) => {
                    const selected = pick?.doctor.id === d.id && pick?.slot.date === s.date && pick?.slot.time === s.time;
                    return <Chip key={`${s.date}-${s.time}`} label={`${s.date.slice(5)} · ${s.time}`} selected={selected} onPress={() => setPick({ doctor: d, slot: s })} />;
                  })}
                </View>
              </Card>
            ))
          )}

          {pick ? (
            <Card style={{ borderColor: COLORS.primary }}>
              <Text style={FONT.h2}>Mode de consultation</Text>
              <View style={[styles.rowBetween, { marginTop: 12 }]}>
                {['video', 'chat'].map((m) => (
                  <TouchableOpacity key={m} style={[styles.mode, mode === m && styles.modeSelected]} onPress={() => setMode(m)} activeOpacity={0.85}>
                    <Ionicons name={MODE_LABELS[m].icon} size={20} color={mode === m ? COLORS.primary : COLORS.textLight} />
                    <Text style={[styles.modeText, mode === m && { color: COLORS.primaryDark }]}>{MODE_LABELS[m].label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button title="Confirmer le rendez-vous" onPress={handleBook} loading={booking} style={{ marginTop: 16 }} />
            </Card>
          ) : null}
        </>
      ) : null}

      <TouchableOpacity onPress={() => navigation.navigate('BookAppointment')} style={{ marginTop: 8 }}>
        <Text style={styles.manual}>Je préfère choisir mon médecin moi-même</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textLight, marginBottom: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  emergency: { flexDirection: 'row', backgroundColor: COLORS.dangerBg, borderRadius: RADIUS.lg, padding: 16, marginBottom: 20 },
  emergencyTitle: { fontSize: 15, fontWeight: '700', color: COLORS.danger },
  emergencyText: { fontSize: 13, color: COLORS.text, marginTop: 4, lineHeight: 18 },
  specialty: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: COLORS.primarySoft, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12, marginTop: 12 },
  specialtyText: { marginLeft: 6, color: COLORS.primaryDark, fontWeight: '700', fontSize: 13 },
  doctorRow: { flexDirection: 'row', alignItems: 'center' },
  doctorName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  doctorSpec: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  mode: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, marginHorizontal: 4 },
  modeSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryMist },
  modeText: { marginLeft: 8, fontWeight: '600', color: COLORS.textLight },
  manual: { textAlign: 'center', color: COLORS.primary, fontWeight: '600', fontSize: 14 },
});
