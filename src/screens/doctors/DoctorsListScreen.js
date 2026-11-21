import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/theme';

export default function DoctorsListScreen() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
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

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function setVerified(id, verified) {
    try {
      await api.put(`/doctors/${id}/verify`, { verified });
      load();
    } catch {
      setError('Impossible de modifier la validation.');
    }
  }

  return (
    <Screen error={error} refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <ScreenHeader title="Médecins" subtitle={isAdmin ? 'Validez les médecins après vérification de leur numéro d’ordre' : undefined} />

      {doctors.length === 0 ? (
        <EmptyState icon="medkit-outline" text="Aucun médecin enregistré." />
      ) : (
        doctors.map((d) => (
          <Card key={d.id}>
            <View style={styles.row}>
              <Avatar name={d.name} size={46} tone="dark" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{d.name}</Text>
                <Text style={styles.specialization}>{d.specialization}</Text>
              </View>
              {isAdmin ? (
                <Badge
                  label={d.verified ? 'Validé' : 'En attente'}
                  color={d.verified ? COLORS.success : COLORS.warning}
                  bg={d.verified ? COLORS.successBg : COLORS.warningBg}
                />
              ) : null}
            </View>
            <Text style={styles.meta}>{d.experience_years} ans d'expérience · {d.consultation_fee} FCFA</Text>
            {d.phone ? <Text style={styles.meta}>{d.phone}</Text> : null}
            {isAdmin ? <Text style={styles.meta}>N° d'ordre : {d.license_number || '—'}</Text> : null}
            {isAdmin ? (
              <Button
                title={d.verified ? 'Retirer la validation' : 'Valider ce médecin'}
                variant={d.verified ? 'outline' : 'primary'}
                small
                style={{ marginTop: 12, alignSelf: 'flex-start' }}
                onPress={() => setVerified(d.id, !d.verified)}
              />
            ) : null}
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  specialization: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  meta: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
});
