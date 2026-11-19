import api from './api';

/** Messages du chat d'une consultation. `afterId` = ne récupérer que les nouveaux. */
export async function fetchMessages(appointmentId, afterId = 0) {
  const { data } = await api.get(`/consultations/${appointmentId}/messages`, { params: { after: afterId } });
  return data;
}

export async function sendMessage(appointmentId, text) {
  const { data } = await api.post(`/consultations/${appointmentId}/messages`, { text });
  return data;
}

/** Salle vidéo : le serveur renvoie { url } (salle non devinable, liée au rendez-vous). */
export async function fetchVideoRoom(appointmentId) {
  const { data } = await api.get(`/consultations/${appointmentId}/room`);
  return data;
}
