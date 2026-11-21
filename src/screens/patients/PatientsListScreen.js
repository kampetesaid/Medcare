import React, { useCallback, useState } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import api from '../../services/api';
import { COLORS } from '../../constants/theme';

export default function PatientsListScreen({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    setError('');
    api
      .get('/patients')
      .then((res) => setPatients(res.data))
      .catch(() => setError('Impossible de charger la liste des patients.'))
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
      <Text style={styles.title}>Patients</Text>

      {patients.length === 0 ? (
        <Card><Text style={styles.empty}>Aucun patient enregistré.</Text></Card>
      ) : (
        patients.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => navigation.navigate('PatientMedicalRecord', { patientId: p.id, patientName: p.name })}
          >
            <Card>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.meta}>
                {p.age ? `${p.age} ans` : '—'} · {p.gender || '—'}
              </Text>
              {p.phone ? <Text style={styles.meta}>{p.phone}</Text> : null}
              {p.address ? <Text style={styles.meta}>{p.address}</Text> : null}
              <Text style={styles.link}>Voir le dossier médical → </Text>
            </Card>
          </TouchableOpacity>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  name: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  link: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 8 },
  empty: { color: COLORS.textLight },
});
