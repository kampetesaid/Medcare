import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../services/api';
import { COLORS } from '../../constants/theme';

const emptyPrescription = { medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' };

export default function PatientMedicalRecordScreen({ route }) {
  const { patientId, patientName } = route.params;
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [prescriptions, setPrescriptions] = useState([{ ...emptyPrescription }]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setError('');
    api
      .get(`/medical-records/patient/${patientId}`)
      .then((res) => setRecords(res.data))
      .catch(() => setError('Impossible de charger le dossier médical.'))
      .finally(() => setRefreshing(false));
  }, [patientId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function updatePrescription(index, field, value) {
    setPrescriptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function addPrescriptionRow() {
    setPrescriptions((prev) => [...prev, { ...emptyPrescription }]);
  }

  async function handleSubmit() {
    setError('');
    setSuccess('');
    if (!diagnosis) {
      setError('Le diagnostic est requis.');
      return;
    }
    setSaving(true);
    try {
      const validPrescriptions = prescriptions.filter((p) => p.medicationName.trim() !== '');
      await api.post('/medical-records', {
        patientId,
        diagnosis,
        notes,
        followUpDate: followUpDate || null,
        prescriptions: validPrescriptions,
      });
      setSuccess('Dossier médical enregistré avec succès.');
      setDiagnosis('');
      setNotes('');
      setFollowUpDate('');
      setPrescriptions([{ ...emptyPrescription }]);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      error={error}
      success={success}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load();
      }}
    >
      <Text style={styles.title}>Dossier de {patientName}</Text>

      <Button
        title={showForm ? 'Annuler' : '+ Nouveau diagnostic / ordonnance'}
        variant={showForm ? 'outline' : 'primary'}
        onPress={() => setShowForm(!showForm)}
        style={{ marginBottom: 14 }}
      />

      {showForm && (
        <Card>
          <Text style={styles.cardTitle}>Nouveau diagnostic</Text>
          <Input label="Diagnostic" value={diagnosis} onChangeText={setDiagnosis} multiline />
          <Input label="Notes de traitement" value={notes} onChangeText={setNotes} multiline />
          <Input
            label="Date de suivi (AAAA-MM-JJ, optionnel)"
            value={followUpDate}
            onChangeText={setFollowUpDate}
          />

          <Text style={styles.subTitle}>Ordonnance</Text>
          {prescriptions.map((p, i) => (
            <View key={i} style={styles.prescriptionBlock}>
              <Input
                label={`Médicament ${i + 1}`}
                value={p.medicationName}
                onChangeText={(v) => updatePrescription(i, 'medicationName', v)}
              />
              <Input
                label="Dosage"
                value={p.dosage}
                onChangeText={(v) => updatePrescription(i, 'dosage', v)}
              />
              <Input
                label="Fréquence"
                value={p.frequency}
                onChangeText={(v) => updatePrescription(i, 'frequency', v)}
              />
              <Input
                label="Durée"
                value={p.duration}
                onChangeText={(v) => updatePrescription(i, 'duration', v)}
              />
            </View>
          ))}
          <Button
            title="+ Ajouter un médicament"
            variant="outline"
            onPress={addPrescriptionRow}
            style={{ marginBottom: 14 }}
          />

          <Button title="Enregistrer le dossier" variant="success" onPress={handleSubmit} loading={saving} />
        </Card>
      )}

      {records.length === 0 ? (
        <Card><Text style={styles.empty}>Aucun dossier médical pour le moment.</Text></Card>
      ) : (
        records.map((r) => (
          <Card key={r.id}>
            <View style={styles.headerRow}>
              <Text style={styles.doctor}>Dr. {r.doctor_name}</Text>
              <Text style={styles.date}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</Text>
            </View>
            <Text style={styles.label}>Diagnostic</Text>
            <Text style={styles.value}>{r.diagnosis || '—'}</Text>
            {r.prescriptions?.length > 0 && (
              <>
                <Text style={[styles.label, { marginTop: 8 }]}>Ordonnance</Text>
                {r.prescriptions.map((p) => (
                  <Text key={p.id} style={styles.value}>
                    {p.medication_name} — {[p.dosage, p.frequency, p.duration].filter(Boolean).join(' · ')}
                  </Text>
                ))}
              </>
            )}
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  subTitle: { fontSize: 14, fontWeight: '700', marginTop: 6, marginBottom: 8 },
  prescriptionBlock: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, marginBottom: 6 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  doctor: { fontWeight: '700', fontSize: 15 },
  date: { color: COLORS.textLight, fontSize: 12 },
  label: { fontWeight: '700', fontSize: 13, color: COLORS.textLight },
  value: { fontSize: 14, marginTop: 2 },
  empty: { color: COLORS.textLight },
});
