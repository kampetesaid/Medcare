import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { fetchMessages, sendMessage } from '../../services/consultationService';
import { COLORS, RADIUS } from '../../constants/theme';
import { CHAT_POLL_INTERVAL } from '../../constants/config';

function timeOf(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Chat de consultation. Rafraîchissement par interrogation régulière (simple et fiable).
 * Pour du temps réel, remplacer le setInterval par un WebSocket (socket.io) — seule cette
 * page et services/consultationService.js sont concernées.
 */
export default function ChatScreen({ route, navigation }) {
  const { appointment } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const lastId = useRef(0);
  const listRef = useRef(null);

  const peerName = user.role === 'patient' ? appointment.doctor_name : appointment.patient_name;

  const poll = useCallback(async () => {
    try {
      const fresh = await fetchMessages(appointment.id, lastId.current);
      if (fresh.length) {
        lastId.current = fresh[fresh.length - 1].id;
        setMessages((prev) => {
          const known = new Set(prev.map((m) => m.id));
          return [...prev.filter((m) => !m.pending), ...fresh.filter((m) => !known.has(m.id))];
        });
      }
      setError('');
    } catch {
      setError('Connexion instable…');
    } finally {
      setLoading(false);
    }
  }, [appointment.id]);

  useEffect(() => {
    poll();
    const t = setInterval(poll, CHAT_POLL_INTERVAL);
    return () => clearInterval(t);
  }, [poll]);

  useEffect(() => {
    navigation.setOptions({
      title: peerName,
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('VideoCall', { appointment })} hitSlop={10} style={{ marginRight: 4 }}>
          <Ionicons name="videocam" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, peerName, appointment]);

  async function handleSend() {
    const content = text.trim();
    if (!content || sending) return;
    setText('');
    setSending(true);
    const temp = { id: `tmp-${Date.now()}`, sender_id: user.id, text: content, created_at: new Date().toISOString(), pending: true };
    setMessages((m) => [...m, temp]);
    try {
      await sendMessage(appointment.id, content);
      await poll();
    } catch {
      setMessages((m) => m.filter((x) => x.id !== temp.id));
      setText(content);
      setError("Message non envoyé. Réessayez.");
    } finally {
      setSending(false);
    }
  }

  const renderItem = ({ item }) => {
    const mine = item.sender_id === user.id;
    return (
      <View style={[styles.bubbleWrap, mine ? styles.right : styles.left]}>
        <View style={[styles.bubble, mine ? styles.mine : styles.theirs, item.pending && { opacity: 0.6 }]}>
          <Text style={[styles.msg, mine && { color: '#fff' }]}>{item.text}</Text>
          <Text style={[styles.time, mine && { color: 'rgba(255,255,255,0.75)' }]}>{timeOf(item.created_at)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        {error ? <Text style={styles.banner}>{error}</Text> : null}
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => String(m.id)}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={<Text style={styles.empty}>Démarrez la conversation avec {peerName}.</Text>}
          />
        )}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Écrire un message…"
            placeholderTextColor={COLORS.placeholder}
            multiline
          />
          <TouchableOpacity style={[styles.send, !text.trim() && { opacity: 0.4 }]} onPress={handleSend} disabled={!text.trim()}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  banner: { backgroundColor: COLORS.warningBg, color: COLORS.warning, textAlign: 'center', paddingVertical: 6, fontSize: 12, fontWeight: '600' },
  bubbleWrap: { marginBottom: 8, flexDirection: 'row' },
  right: { justifyContent: 'flex-end' },
  left: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', paddingVertical: 9, paddingHorizontal: 13, borderRadius: 18 },
  mine: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  theirs: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  msg: { fontSize: 15, color: COLORS.text },
  time: { fontSize: 10, color: COLORS.placeholder, marginTop: 3, alignSelf: 'flex-end' },
  empty: { textAlign: 'center', color: COLORS.textLight, marginTop: 60, fontSize: 14 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, maxHeight: 110, backgroundColor: COLORS.bg, borderRadius: RADIUS.xl, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, fontSize: 15, color: COLORS.text },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});
