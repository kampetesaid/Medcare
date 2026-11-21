import api from './api';

/**
 * Appelle l'IA d'orientation (côté serveur — la clé d'API ne doit JAMAIS être dans l'application).
 *
 * Entrée  : { symptoms, duration, age, gender }
 * Sortie  : {
 *   triageId, urgency: 'low'|'moderate'|'high'|'emergency',
 *   emergency: boolean, summary: string, advice: string,
 *   specialty: string,
 *   doctors: [{ id, name, specialization, consultation_fee, slots: [{ date, time }] }]
 * }
 */
export async function analyzeSymptoms(payload) {
  const { data } = await api.post('/ai/triage', payload, { timeout: 45000 });
  return data;
}

/** Réserve le créneau choisi parmi ceux proposés par l'IA. */
export async function bookFromTriage({ triageId, doctorId, date, time, mode, summary }) {
  const { data } = await api.post('/appointments', {
    doctorId,
    date,
    time,
    mode,
    triageId,
    reason: summary,
  });
  return data;
}
