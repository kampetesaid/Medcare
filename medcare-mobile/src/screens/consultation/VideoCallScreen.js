import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { fetchVideoRoom } from '../../services/consultationService';
import { COLORS } from '../../constants/theme';

/**
 * Appel vidéo : affiche la salle fournie par le serveur dans une WebView.
 * Le fournisseur vidéo (Jitsi auto-hébergé, Daily, Whereby, Agora…) se choisit côté
 * backend dans GET /consultations/:id/room. Aucune modification de cet écran n'est
 * nécessaire tant que le serveur renvoie { url }.
 */
export default function VideoCallScreen({ route, navigation }) {
  const { appointment } = route.params;
  const [camPerm, requestCam] = useCameraPermissions();
  const [micPerm, requestMic] = useMicrophonePermissions();
  const [url, setUrl] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      if (!camPerm?.granted) await requestCam();
      if (!micPerm?.granted) await requestMic();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchVideoRoom(appointment.id)
      .then((r) => setUrl(r.url))
      .catch((err) => setError(err.response?.data?.message || "Impossible d'ouvrir la salle de consultation."));
  }, [appointment.id]);

  const granted = camPerm?.granted && micPerm?.granted;

  if (camPerm && micPerm && !granted && (!camPerm.canAskAgain || !micPerm.canAskAgain)) {
    return (
      <View style={styles.center}>
        <Ionicons name="videocam-off-outline" size={40} color={COLORS.danger} />
        <Text style={styles.msg}>Autorisez la caméra et le micro dans les réglages du téléphone pour passer l'appel.</Text>
        <Button title="Retour" variant="outline" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={40} color={COLORS.danger} />
        <Text style={styles.msg}>{error}</Text>
        <Button title="Retour" variant="outline" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  if (!url || !granted) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.msg}>Connexion à la salle…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <WebView
        source={{ uri: url }}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        mediaCapturePermissionGrantType="grant"
        startInLoadingState
        renderLoading={() => (
          <View style={[styles.center, StyleSheet.absoluteFill]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
        onError={() => setError('La connexion vidéo a échoué.')}
      />
      <TouchableOpacity style={styles.hangup} onPress={() => navigation.goBack()} activeOpacity={0.85}>
        <Ionicons name="call" size={26} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg, padding: 32 },
  msg: { textAlign: 'center', color: COLORS.textLight, marginVertical: 16, fontSize: 14, lineHeight: 20 },
  hangup: {
    position: 'absolute', bottom: 36, alignSelf: 'center', width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.danger, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
});
