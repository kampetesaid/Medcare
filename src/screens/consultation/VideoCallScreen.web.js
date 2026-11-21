import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { fetchVideoRoom } from '../../services/consultationService';
import { COLORS } from '../../constants/theme';

/**
 * Version NAVIGATEUR de l'appel vidéo (chargée automatiquement à la place de VideoCallScreen.js sur le web).
 * La WebView n'existe pas dans un navigateur : on utilise une <iframe> avec autorisation caméra/micro.
 */
export default function VideoCallScreen({ route, navigation }) {
  const { appointment } = route.params;
  const [url, setUrl] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVideoRoom(appointment.id)
      .then((r) => setUrl(r.url))
      .catch((err) => setError(err.response?.data?.message || "Impossible d'ouvrir la salle de consultation."));
  }, [appointment.id]);

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={40} color={COLORS.danger} />
        <Text style={styles.msg}>{error}</Text>
        <Button title="Retour" variant="outline" onPress={() => navigation.goBack()} />
      </View>
    );
  }
  if (!url) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.msg}>Connexion à la salle…</Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {React.createElement('iframe', {
        src: url,
        allow: 'camera; microphone; fullscreen; display-capture; autoplay',
        style: { border: 0, width: '100%', height: '100%' },
        title: 'Consultation vidéo',
      })}
      <TouchableOpacity style={styles.hangup} onPress={() => navigation.goBack()} activeOpacity={0.85}>
        <Ionicons name="call" size={26} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg, padding: 32 },
  msg: { textAlign: 'center', color: COLORS.textLight, marginVertical: 16, fontSize: 14, lineHeight: 20 },
  hangup: { position: 'absolute', bottom: 36, alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.danger, alignItems: 'center', justifyContent: 'center' },
});
