import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import api from '../../services/api';
import { COLORS } from '../../constants/theme';

export default function DoctorsListScreen() {
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    setError('');
    api
      .get('/doctors')
      .then((res) => setDoctors(res.data))
      .catch(() => setError('Impossible de charger la liste des médecins.'))
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
      <Text style={styles.title}>Médecins</Text>

      {doctors.length === 0 ? (
        <Card><Text style={styles.empty}>Aucun médecin enregistré.</Text></Card>
      ) : (
        doctors.map((d) => (
          <Card key={d.id}>
            <Text style={styles.name}>{d.name}</Text>
            <Text style={styles.specialization}>{d.specialization}</Text>
            <Text style={styles.meta}>{d.experience_years} ans d'expérience</Text>
            <Text style={styles.meta}>Tarif : {d.consultation_fee} FCFA</Text>
            {d.phone ? <Text style={styles.meta}>{d.phone}</Text> : null}
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  name: { fontSize: 16, fontWeight: '700' },
  specialization: { fontSize: 14, fontWeight: '600', color: COLORS.primary, marginBottom: 6 },
  meta: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  empty: { color: COLORS.textLight },
});
