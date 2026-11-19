import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import api from '../../services/api';
import { COLORS } from '../../constants/theme';

export default function MyMedicalRecordScreen() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    setError('');
    api
      .get('/auth/me')
      .then((res) => {
        const pid = res.data.profile?.id;
        if (!pid) {
          setRecords([]);
          return Promise.resolve();
        }
        return api.get(`/medical-records/patient/${pid}`).then((r) => setRecords(r.data));
      })
      .catch(() => setError('Impossible de charger votre dossier médical.'))
      .finally(() => setRefreshing(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen
      error={error}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load();
      }}
    >
      <Text style={styles.title}>Mon dossier médical</Text>

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

            {r.notes ? (
              <>
                <Text style={styles.label}>Notes</Text>
                <Text style={styles.value}>{r.notes}</Text>
              </>
            ) : null}

            {r.follow_up_date ? (
              <Text style={styles.followUp}>Suivi prévu le {r.follow_up_date}</Text>
            ) : null}

            {r.prescriptions?.length > 0 && (
              <>
                <Text style={[styles.label, { marginTop: 10 }]}>Ordonnance</Text>
                {r.prescriptions.map((p) => (
                  <View key={p.id} style={styles.prescriptionRow}>
                    <Text style={styles.medName}>{p.medication_name}</Text>
                    <Text style={styles.medDetails}>
                      {[p.dosage, p.frequency, p.duration].filter(Boolean).join(' · ') || '—'}
                    </Text>
                  </View>
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
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  doctor: { fontWeight: '700', fontSize: 15 },
  date: { color: COLORS.textLight, fontSize: 12 },
  label: { fontWeight: '700', fontSize: 13, marginTop: 6, color: COLORS.textLight },
  value: { fontSize: 14, marginTop: 2 },
  followUp: { fontSize: 13, color: COLORS.primary, marginTop: 8 },
  prescriptionRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 6,
  },
  medName: { fontWeight: '600', fontSize: 14 },
  medDetails: { fontSize: 12, color: COLORS.textLight },
  empty: { color: COLORS.textLight },
});
