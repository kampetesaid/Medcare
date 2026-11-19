import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) {
      setError('Merci de renseigner votre email et votre mot de passe.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      // La navigation bascule automatiquement grâce au AuthContext (voir RootNavigator)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.request ? 'Serveur injoignable. Vérifiez votre connexion.' : 'Erreur de connexion.')
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.canGoBack() && navigation.goBack()} hitSlop={12} style={{ alignSelf: 'flex-start', marginBottom: 12 }}>
            <Text style={styles.back}>‹ Retour</Text>
          </TouchableOpacity>

          <Logo variant="full" size={120} style={{ marginLeft: -4 }} />
          <Text style={styles.title}>Bon retour sur Medcare</Text>
          <Text style={styles.subtitle}>Connectez-vous pour accéder à vos consultations.</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <Input
            label="Mot de passe"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <Button title="Se connecter" onPress={handleLogin} loading={loading} style={{ marginTop: 4 }} />

          <TouchableOpacity onPress={() => navigation.navigate('Welcome')} style={{ marginTop: 24 }}>
            <Text style={styles.link}>
              Pas encore de compte ? <Text style={styles.linkBold}>Créer un compte</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  back: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginTop: 18, letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 6, marginBottom: 28 },
  errorBox: { backgroundColor: COLORS.dangerBg, padding: 12, borderRadius: 12, marginBottom: 16 },
  errorText: { color: COLORS.danger, fontSize: 14 },
  link: { textAlign: 'center', fontSize: 14, color: COLORS.textLight },
  linkBold: { color: COLORS.primary, fontWeight: '700' },
});
