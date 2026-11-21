import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

function StatCard({ label, value, icon }) {
  return (
    <Card style={styles.statCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <View style={styles.statIcon}><Ionicons name={icon} size={22} color={COLORS.primary} /></View>
      </View>
    </Card>
  );
}

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    setError('');
    api
      .get('/dashboard/stats')
      .then((res) => setStats(res.data))
      .catch(() => setError('Impossible de charger les statistiques.'))
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
      <Text style={styles.title}>Tableau de bord</Text>
      <Text style={styles.subtitle}>Vue d'ensemble de l'hôpital</Text>

      {stats && (
        <>
          <StatCard label="Patients" value={stats.totalPatients} icon="people-outline" />
          <StatCard label="Médecins" value={stats.totalDoctors} icon="medkit-outline" />
          <StatCard label="Rendez-vous (total)" value={stats.totalAppointments} icon="calendar-outline" />
          <StatCard label="Rendez-vous aujourd'hui" value={stats.todayAppointments} icon="time-outline" />
          <StatCard label="Revenus encaissés" value={`${stats.totalRevenue} FCFA`} icon="cash-outline" />
          <StatCard label="Factures impayées" value={stats.pendingInvoices} icon="receipt-outline" />

          <Card>
            <Text style={styles.cardTitle}>Rendez-vous par statut</Text>
            {stats.appointmentsByStatus.length === 0 ? (
              <Text style={styles.empty}>Aucune donnée.</Text>
            ) : (
              stats.appointmentsByStatus.map((s) => (
                <View key={s.status} style={styles.row}>
                  <Text style={styles.rowLabel}>{s.status.replace('_', ' ')}</Text>
                  <Text style={styles.rowValue}>{s.count}</Text>
                </View>
              ))
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textLight, marginBottom: 16 },
  statCard: { marginBottom: 12 },
  statLabel: { fontSize: 13, color: COLORS.textLight, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  statIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLabel: { textTransform: 'capitalize', fontSize: 14 },
  rowValue: { fontWeight: '700', fontSize: 14 },
  empty: { color: COLORS.textLight },
});
