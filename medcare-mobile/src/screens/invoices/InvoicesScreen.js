import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Select from '../../components/Select';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, INVOICE_STATUS_LABELS } from '../../constants/theme';

export default function InvoicesScreen() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [patientId, setPatientId] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [medicationCost, setMedicationCost] = useState('');
  const [labTestCost, setLabTestCost] = useState('');
  const [discount, setDiscount] = useState('');

  const canManage = user.role === 'admin' || user.role === 'doctor';

  const load = useCallback(() => {
    setError('');
    if (user.role === 'patient') {
      api
        .get('/auth/me')
        .then((res) => {
          const pid = res.data.profile?.id;
          if (!pid) return Promise.resolve();
          return api.get(`/invoices/patient/${pid}`).then((r) => setInvoices(r.data));
        })
        .catch(() => setError('Impossible de charger vos factures.'))
        .finally(() => setRefreshing(false));
    } else if (user.role === 'admin') {
      api
        .get('/invoices')
        .then((res) => setInvoices(res.data))
        .catch(() => setError('Impossible de charger les factures.'))
        .finally(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
  }, [user.role]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    if (canManage) {
      api.get('/patients').then((res) => setPatients(res.data)).catch(() => {});
    }
  }, [canManage]);

  async function handleSubmit() {
    setError('');
    setSuccess('');
    if (!patientId) {
      setError('Merci de choisir un patient.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/invoices', {
        patientId,
        consultationFee,
        medicationCost,
        labTestCost,
        discount,
      });
      setSuccess('Facture générée avec succès.');
      setPatientId('');
      setConsultationFee('');
      setMedicationCost('');
      setLabTestCost('');
      setDiscount('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la génération de la facture.');
    } finally {
      setSaving(false);
    }
  }

  async function markPaid(id) {
    try {
      await api.put(`/invoices/${id}/status`, { status: 'payee' });
      load();
    } catch (err) {
      setError('Impossible de mettre à jour la facture.');
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
      <Text style={styles.title}>Facturation</Text>

      {canManage && (
        <Button
          title={showForm ? 'Annuler' : '+ Générer une facture'}
          variant={showForm ? 'outline' : 'primary'}
          onPress={() => setShowForm(!showForm)}
          style={{ marginBottom: 14 }}
        />
      )}

      {showForm && (
        <Card>
          <Select
            label="Patient"
            placeholder="-- Choisir un patient --"
            selectedValue={patientId}
            onValueChange={setPatientId}
            items={patients.map((p) => ({ label: p.name, value: String(p.id) }))}
          />
          <Input label="Frais de consultation" value={consultationFee} onChangeText={setConsultationFee} keyboardType="numeric" />
          <Input label="Coût des médicaments" value={medicationCost} onChangeText={setMedicationCost} keyboardType="numeric" />
          <Input label="Frais d'analyses" value={labTestCost} onChangeText={setLabTestCost} keyboardType="numeric" />
          <Input label="Réduction" value={discount} onChangeText={setDiscount} keyboardType="numeric" />
          <Button title="Générer la facture" variant="success" onPress={handleSubmit} loading={saving} />
        </Card>
      )}

      {invoices.length === 0 ? (
        <Card><Text style={styles.empty}>Aucune facture pour le moment.</Text></Card>
      ) : (
        invoices.map((inv) => {
          const s = INVOICE_STATUS_LABELS[inv.status];
          return (
            <Card key={inv.id}>
              <View style={styles.row}>
                {user.role === 'admin' && <Text style={styles.patient}>{inv.patient_name}</Text>}
                <Badge label={s.label} color={s.color} bg={s.bg} />
              </View>
              <Text style={styles.line}>Consultation : {inv.consultation_fee} FCFA</Text>
              <Text style={styles.line}>Médicaments : {inv.medication_cost} FCFA</Text>
              <Text style={styles.line}>Analyses : {inv.lab_test_cost} FCFA</Text>
              <Text style={styles.line}>Réduction : {inv.discount} FCFA</Text>
              <Text style={styles.total}>Total : {inv.total_amount} FCFA</Text>

              {user.role === 'admin' && inv.status !== 'payee' && (
                <Button
                  title="Marquer payée"
                  variant="outline"
                  onPress={() => markPaid(inv.id)}
                  style={{ marginTop: 10 }}
                />
              )}
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  patient: { fontWeight: '700', fontSize: 15 },
  line: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  total: { fontSize: 15, fontWeight: '700', marginTop: 8, color: COLORS.text },
  empty: { color: COLORS.textLight },
});
