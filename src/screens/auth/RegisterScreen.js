import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/theme';

// Liste des spécialités proposées à l'inscription d'un médecin.
// IMPORTANT : l'IA d'orientation se base sur ces libellés. Gardez-les cohérents avec le backend.
export const SPECIALTIES = [
  'Médecine générale',
  'Pédiatrie',
  'Gynécologie',
  'Cardiologie',
  'Dermatologie',
  'Gastro-entérologie',
  'Neurologie',
  'ORL',
  'Ophtalmologie',
  'Pneumologie',
  'Psychiatrie',
  'Traumatologie / Orthopédie',
  'Urologie',
  'Endocrinologie',
];

export default function RegisterScreen({ route, navigation }) {
  const role = route.params?.role === 'doctor' ? 'doctor' : 'patient';
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    experienceYears: '',
    consultationFee: '',
    age: '',
    gender: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit() {
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Merci de remplir les champs obligatoires.');
      return;
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (role === 'doctor' && (!form.specialization || !form.licenseNumber.trim())) {
      setError("La spécialité et le numéro d'ordre sont requis pour un médecin.");
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, email: form.email.trim().toLowerCase(), role });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen error={error}>
      <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={{ alignSelf: 'flex-start', marginBottom: 12 }}>
        <Text style={styles.back}>‹ Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{role === 'doctor' ? 'Inscription médecin' : 'Inscription patient'}</Text>
      <Text style={styles.subtitle}>
        {role === 'doctor'
          ? "Votre profil sera vérifié avant d'apparaître dans les orientations."
          : 'Quelques informations pour préparer vos consultations.'}
      </Text>

      <Text style={styles.section}>Compte</Text>
      <Input label="Nom complet" icon="person-outline" value={form.name} onChangeText={(v) => update('name', v)} />
      <Input label="Téléphone" icon="call-outline" value={form.phone} onChangeText={(v) => update('phone', v)} keyboardType="phone-pad" />
      <Input label="Email" icon="mail-outline" value={form.email} onChangeText={(v) => update('email', v)} autoCapitalize="none" keyboardType="email-address" />
      <Input label="Mot de passe (8 caractères min.)" icon="lock-closed-outline" value={form.password} onChangeText={(v) => update('password', v)} secureTextEntry />

      {role === 'doctor' ? (
        <>
          <Text style={styles.section}>Profil professionnel</Text>
          <Select label="Spécialité" placeholder="Choisir une spécialité" selectedValue={form.specialization} onValueChange={(v) => update('specialization', v)} items={SPECIALTIES.map((s) => ({ label: s, value: s }))} />
          <Input label="Numéro d'ordre des médecins" icon="id-card-outline" value={form.licenseNumber} onChangeText={(v) => update('licenseNumber', v)} autoCapitalize="characters" />
          <Input label="Années d'expérience" value={form.experienceYears} onChangeText={(v) => update('experienceYears', v)} keyboardType="numeric" />
          <Input label="Tarif de consultation (FCFA)" value={form.consultationFee} onChangeText={(v) => update('consultationFee', v)} keyboardType="numeric" />
        </>
      ) : (
        <>
          <Text style={styles.section}>Informations de santé</Text>
          <Input label="Âge" value={form.age} onChangeText={(v) => update('age', v)} keyboardType="numeric" />
          <Select label="Sexe" placeholder="Choisir" selectedValue={form.gender} onValueChange={(v) => update('gender', v)} items={[{ label: 'Homme', value: 'Homme' }, { label: 'Femme', value: 'Femme' }, { label: 'Autre', value: 'Autre' }]} />
          <Input label="Adresse / Ville" icon="location-outline" value={form.address} onChangeText={(v) => update('address', v)} />
        </>
      )}

      <Button title="Créer mon compte" onPress={handleSubmit} loading={loading} style={{ marginTop: 8 }} />

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 22 }}>
        <Text style={styles.link}>
          Déjà inscrit ? <Text style={styles.linkBold}>Se connecter</Text>
        </Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 6, marginBottom: 24 },
  section: { fontSize: 12, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 4 },
  link: { textAlign: 'center', fontSize: 14, color: COLORS.textLight },
  linkBold: { color: COLORS.primary, fontWeight: '700' },
});
