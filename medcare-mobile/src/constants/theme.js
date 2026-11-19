/**
 * THÈME MEDCARE — point unique pour modifier l'identité visuelle.
 * Changer une valeur ici met à jour toute l'application.
 */
export const COLORS = {
  // Bleus de marque
  navy: '#0A2A5E',        // fond splash, titres forts
  primaryDark: '#0D47A1',
  primary: '#1565D8',     // couleur principale (boutons, liens, onglet actif)
  primaryLight: '#3B8BEB',
  primarySoft: '#DCEBFF', // fonds d'icônes, puces sélectionnées
  primaryMist: '#F0F6FF', // fonds très clairs

  // Neutres
  bg: '#F5F8FC',
  card: '#FFFFFF',
  text: '#0F1F38',
  textLight: '#5B6B83',
  placeholder: '#9AA8BD',
  border: '#E1E8F2',

  // États
  success: '#0F9D6B',
  warning: '#C77700',
  danger: '#D64545',
  live: '#12B5CB',        // appel en cours

  successBg: '#DDF5EB',
  warningBg: '#FDF0D5',
  dangerBg: '#FBE4E4',
  infoBg: '#DCEBFF',
};

export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };

export const SHADOW = {
  card: {
    shadowColor: '#0A2A5E',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#0A2A5E',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};

export const FONT = {
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, letterSpacing: -0.3 },
  h2: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  body: { fontSize: 15, color: COLORS.text },
  small: { fontSize: 13, color: COLORS.textLight },
};

export const STATUS_LABELS = {
  en_attente: { label: 'En attente', color: COLORS.warning, bg: COLORS.warningBg },
  confirme: { label: 'Confirmé', color: COLORS.primary, bg: COLORS.infoBg },
  termine: { label: 'Terminé', color: COLORS.success, bg: COLORS.successBg },
  annule: { label: 'Annulé', color: COLORS.danger, bg: COLORS.dangerBg },
};

export const INVOICE_STATUS_LABELS = {
  impayee: { label: 'Impayée', color: COLORS.danger, bg: COLORS.dangerBg },
  payee: { label: 'Payée', color: COLORS.success, bg: COLORS.successBg },
  annulee: { label: 'Annulée', color: COLORS.warning, bg: COLORS.warningBg },
};

// Niveaux d'urgence renvoyés par l'IA d'orientation
export const URGENCY_LABELS = {
  low: { label: 'Non urgent', color: COLORS.success, bg: COLORS.successBg },
  moderate: { label: 'Modéré', color: COLORS.primary, bg: COLORS.infoBg },
  high: { label: 'À voir rapidement', color: COLORS.warning, bg: COLORS.warningBg },
  emergency: { label: 'Urgence', color: COLORS.danger, bg: COLORS.dangerBg },
};

export const MODE_LABELS = {
  video: { label: 'Appel vidéo', icon: 'videocam' },
  chat: { label: 'Chat', icon: 'chatbubbles' },
};

export const ROLE_LABELS = {
  admin: 'Administrateur',
  doctor: 'Médecin',
  patient: 'Patient',
};
