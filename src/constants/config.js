/**
 * ADRESSE DU SERVEUR (backend)
 * Se règle SANS modifier le code, via la variable EXPO_PUBLIC_API_URL :
 *  - fichier .env à la racine du projet (voir .env.example) pour le mobile
 *  - Vercel → Settings → Environment Variables pour la version web
 * Exemples :  https://medcare-api.onrender.com/api   |   http://192.168.1.42:5000/api (test local, même Wi-Fi)
 *             Émulateur Android : http://10.0.2.2:5000/api
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.42:5000/api';

export const APP_NAME = 'Medcare';
export const APP_TAGLINE = 'Consultez un médecin, où que vous soyez';

// Numéro d'urgence affiché par l'écran d'orientation. À VÉRIFIER pour ton pays.
export const EMERGENCY_NUMBER = '112';

// Fréquence de rafraîchissement du chat (ms). Remplaçable par des WebSockets.
export const CHAT_POLL_INTERVAL = 3000;

// Pause sur la dernière image du logo animé avant d'entrer dans l'app (ms)
export const SPLASH_HOLD_MS = 700;
