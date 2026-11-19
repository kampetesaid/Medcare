/**
 * CONFIGURATION MEDCARE
 *
 * API_URL :
 *  - Émulateur Android : http://10.0.2.2:5000/api
 *  - Téléphone + Expo Go : http://IP_DE_TON_PC:5000/api
 *  - Production : https://ton-backend.exemple.com/api (HTTPS obligatoire)
 */
export const API_URL = 'http://192.168.1.42:5000/api';

export const APP_NAME = 'Medcare';
export const APP_TAGLINE = 'Consultez un médecin, où que vous soyez';

// Numéro d'urgence affiché par l'écran d'orientation. À VÉRIFIER pour ton pays.
export const EMERGENCY_NUMBER = '112';

// Fréquence de rafraîchissement du chat (ms). Remplaçable par des WebSockets.
export const CHAT_POLL_INTERVAL = 3000;

// Pause sur la dernière image du logo animé avant d'entrer dans l'app (ms)
export const SPLASH_HOLD_MS = 700;
