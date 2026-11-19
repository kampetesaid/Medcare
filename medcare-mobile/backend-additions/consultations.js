/**
 * CHAT + SALLE VIDÉO — routes à ajouter (Express). Toutes protégées par ton middleware JWT.
 * Règle d'accès commune : seul le patient OU le médecin du rendez-vous peut lire/écrire,
 * et uniquement si le rendez-vous est "confirme".
 */
const crypto = require('crypto');
const express = require('express');

module.exports = function buildConsultationRoutes({ db }) {
  const router = express.Router();

  async function guard(req, res, next) {
    const appt = await db.getAppointment(req.params.id); // { id, patient_user_id, doctor_user_id, status, appointment_date, appointment_time }
    const uid = req.user.id;
    if (!appt || (appt.patient_user_id !== uid && appt.doctor_user_id !== uid)) return res.status(403).json({ message: 'Accès refusé.' });
    if (appt.status !== 'confirme') return res.status(409).json({ message: "La consultation n'est pas confirmée." });
    req.appt = appt;
    next();
  }

  router.get('/:id/messages', guard, async (req, res) => {
    res.json(await db.listMessages(req.appt.id, Number(req.query.after) || 0)); // [{id, sender_id, text, created_at}]
  });

  router.post('/:id/messages', guard, async (req, res) => {
    const text = String(req.body.text || '').trim().slice(0, 2000);
    if (!text) return res.status(400).json({ message: 'Message vide.' });
    res.status(201).json(await db.addMessage({ appointmentId: req.appt.id, senderId: req.user.id, text }));
  });

  // Salle vidéo : nom impossible à deviner (HMAC du rendez-vous avec un secret serveur).
  // Avec Jitsi auto-hébergé : https://TON_JITSI/<room>. Avec Daily/Whereby/Agora : crée la salle via leur API ici.
  router.get('/:id/room', guard, (req, res) => {
    const room = 'medcare-' + crypto.createHmac('sha256', process.env.ROOM_SECRET).update(String(req.appt.id)).digest('hex').slice(0, 20);
    res.json({ url: `${process.env.VIDEO_BASE_URL}/${room}` });
  });

  return router;
};

/*  Montage dans server.js :
    app.post('/api/ai/triage', auth, requireRole('patient'), require('./aiTriage')({ db }));
    app.use('/api/consultations', auth, require('./consultations')({ db }));
*/
