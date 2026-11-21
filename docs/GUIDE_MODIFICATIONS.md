# Medcare — Guide de modification du projet

Application mobile **React Native (Expo SDK 51)** de téléconsultation : patients et médecins, appel vidéo, chat,
et orientation automatique par IA. Identité visuelle : bleu médical.

> **État de livraison.** L'application compile (mobile et web) mais **n'a pas été exécutée sur un téléphone**. Le backend fourni (section 6) est, lui,
> testé de bout en bout (44 vérifications automatiques, sur PostgreSQL). Prévois une session de test réelle sur Android avant toute diffusion.

---

## 1. Parcours de l'application

```
Lancement → Logo animé plein écran ─┬─ session existante → Application (onglets selon le rôle)
                                 └─ pas de session    → Bienvenue → Inscription patient / médecin  ou  Connexion

Patient : Accueil → « Consulter un médecin » → Orientation IA → médecin + créneau + mode (vidéo/chat)
          → Rendez-vous confirmé → Rendez-vous → [Appel vidéo] [Chat]
Médecin : Accueil (consultations du jour + résumé IA du patient) → Rendez-vous → [Appel vidéo] [Chat] → Patients → dossier médical
Admin   : tableau de bord, médecins, patients, rendez-vous, factures
```

## 2. Structure des dossiers

```
medcare-mobile/
├── App.js                    point d'entrée
├── app.json                  nom, icône, splash natif, permissions caméra/micro, identifiants Android/iOS
├── eas.json                  profils de build (APK de test / bundle de production)
├── assets/                   logo animé (splash/), logo-full, logo-mark, icon, adaptive-icon, splash — générés depuis ton GIF
├── scripts/gif-to-frames.py  régénère tous les visuels à partir d'un GIF
└── src/
    ├── components/           briques d'interface réutilisables
    ├── constants/            theme.js (couleurs) · config.js (URL API, réglages)
    ├── context/              AuthContext.js (session)
    ├── navigation/           Root / Auth / Main
    ├── screens/              un dossier par domaine fonctionnel
    ├── services/             appels réseau (api, triage, consultation)
    └── utils/                redFlags.js (détection locale d'urgences)
```

## 3. Logo animé d'ouverture (plein écran) et changement de logo

Ton GIF (`Storyboard_animé_du_logo_MedCare`) est intégré. Il a été converti en **9 images PNG** (`assets/splash/frame0…8.png`) lues une seule fois avec
un fondu entre chaque image, sur fond **blanc**, le logo occupant toute la largeur de l'écran, barre d'état masquée. La dernière image reste affichée
0,7 s (`SPLASH_HOLD_MS` dans `config.js`), puis fondu vers l'application. Pourquoi des images et pas le GIF directement : un GIF tourne en boucle sans
qu'on sache quand il se termine, et son rendu varie selon Android/iOS ; avec des images, la durée et la fin sont exactes.

**Fond blanc obligatoire :** le mot « Med » est bleu marine, il disparaîtrait sur un fond sombre. Le splash natif (`app.json`) est donc blanc aussi,
pour qu'aucun saut de couleur n'apparaisse entre le démarrage du téléphone et l'animation.

**Changer le logo ou l'animation plus tard :**
```bash
pip install pillow
python3 scripts/gif-to-frames.py mon-logo-anime.gif
```
Le script régénère d'un coup les images d'animation, `logo-full.png`, `logo-mark.png`, `icon.png`, `adaptive-icon.png` et `splash.png`.
Si le nombre d'images change, mets à jour la liste `FRAMES` dans `src/screens/splash/SplashScreen.js`
(une ligne `require(...)` par image). Si l'emblème est mal découpé, ajuste `MARK_CUT_RATIO` dans le script.

| Fichier | Usage |
|---|---|
| `assets/splash/frame*.png` + `meta.json` | Animation d'ouverture |
| `assets/logo-full.png` | Logo complet (bienvenue, connexion) |
| `assets/logo-mark.png` | Emblème seul |
| `assets/icon.png`, `adaptive-icon.png` | Icône de l'application (emblème sur fond blanc) |
| `assets/splash.png` | Fond blanc du splash natif |

> **Qualité :** ton GIF est un export « 0,5x » (444×407 px). Je l'ai agrandi à ~900 px, mais cela n'ajoute aucun détail : en plein écran sur un téléphone
> récent, et surtout pour l'**icône du Play Store (512 px minimum)**, le rendu sera légèrement flou. Pour un résultat net, exporte le GIF en 2x/3x,
> et fournis aussi le logo en **SVG ou PNG ≥ 1024 px**, puis relance le script.

## 4. Fichiers et classes : rôle et modifications possibles

### 4.1 Configuration

| Fichier | Rôle | Tu peux y modifier |
|---|---|---|
| `src/constants/theme.js` | **Source unique de l'identité visuelle** : `COLORS`, `SPACING`, `RADIUS`, `SHADOW`, `FONT`, libellés de statuts (`STATUS_LABELS`, `URGENCY_LABELS`, `MODE_LABELS`, `ROLE_LABELS`) | Teintes de bleu, arrondis, ombres, textes des statuts. Un changement ici se propage partout |
| `src/constants/config.js` | `API_URL` (lit `EXPO_PUBLIC_API_URL`), nom et slogan de l'app, `EMERGENCY_NUMBER`, fréquence du chat, `SPLASH_HOLD_MS` (pause sur la dernière image du logo) | **L'URL du backend** (obligatoire), le numéro d'urgence **à vérifier pour ton pays** |
| `app.json` | Nom « Medcare », identifiant `com.fahniente.medcare`, permissions, couleurs du splash natif | Identifiant du package (à fixer avant la 1re publication : il ne change plus ensuite), version |
| `eas.json` | Profils de build EAS | Rarement |
| `package.json` | Dépendances | Ajout de bibliothèques |

### 4.2 Composants réutilisables (`src/components/`)

| Composant | Fonction | Props principales |
|---|---|---|
| `Logo.js` | Affiche `logo-mark.png` (emblème) ou `logo-full.png` (avec le mot MedCare) | `size`, `variant` (`mark` / `full`) |
| `Button.js` | Bouton : variantes `primary`, `soft`, `outline`, `ghost`, `danger`, `success`, `light` ; icône ; état de chargement | `title`, `variant`, `icon`, `small`, `loading` |
| `Input.js` | Champ texte avec icône, bordure active, œil sur mot de passe | `label`, `icon`, `secureTextEntry`, `multiline` |
| `Select.js` | Liste déroulante native stylée | `items`, `placeholder` |
| `Card.js` | Carte blanche avec ombre douce | `style` |
| `Badge.js` | Pastille de statut colorée | `label`, `color`, `bg` |
| `Chip.js` | Puce sélectionnable (symptômes, créneaux, durées) | `label`, `selected`, `onPress` |
| `Avatar.js` | Initiales dans un cercle | `name`, `size`, `tone` |
| `EmptyState.js` | Message de liste vide avec icône | `icon`, `text` |
| `ScreenHeader.js` | Titre + sous-titre d'écran | `title`, `subtitle`, `right` |
| `Screen.js` | Conteneur défilant : fond, bandeaux erreur/succès, rafraîchissement par tirage | `error`, `success`, `onRefresh` |

### 4.3 Navigation (`src/navigation/`)

| Fichier | Rôle | Modifier pour… |
|---|---|---|
| `RootNavigator.js` | Affiche le **Splash**, puis `AuthNavigator` ou `MainNavigator` selon la session | Changer le thème de navigation |
| `AuthNavigator.js` | Pile Bienvenue → Connexion → Inscription | Ajouter « mot de passe oublié » |
| `MainNavigator.js` | Onglets par rôle (`PatientTabs`, `DoctorTabs`, `AdminTabs`) + écrans plein écran (`Triage`, `BookAppointment`, `Chat`, `VideoCall`) | Ajouter/retirer un onglet ou un écran, changer les icônes (`TAB_ICONS`) |

### 4.4 Session (`src/context/AuthContext.js`)

`AuthProvider` / `useAuth()` : `user`, `loading`, `login()`, `register()`, `logout()`. Token JWT et profil stockés dans `AsyncStorage`.
Déconnexion automatique si le serveur répond **401** (via `setUnauthorizedHandler` dans `api.js`).
> Amélioration recommandée pour la production : stocker le token dans `expo-secure-store` plutôt que `AsyncStorage` (non chiffré).

### 4.5 Écrans (`src/screens/`)

| Fichier | Fonction | Modifier pour… |
|---|---|---|
| `splash/SplashScreen.js` | **Logo animé plein écran** : lit les images `assets/splash/frame*.png` une fois, fondu entre images, pause sur la dernière, fondu de sortie. Attend que la session soit lue (`ready`) | La liste `FRAMES`, la pause (`SPLASH_HOLD_MS`), la durée par image (`meta.json`) |
| `onboarding/WelcomeScreen.js` | Logo complet sur fond blanc, choix « Je suis patient / Je suis médecin » ou connexion | Textes, présentation |
| `auth/LoginScreen.js` | Connexion (email + mot de passe) | Champs, messages d'erreur |
| `auth/RegisterScreen.js` | Inscription **patient** (âge, sexe, adresse) ou **médecin** (spécialité, n° d'ordre, expérience, tarif). Exporte `SPECIALTIES` | **La liste `SPECIALTIES`** — elle doit rester identique à celle de la base, l'IA s'y réfère |
| `triage/TriageScreen.js` | **Orientation IA** : symptômes + durée → urgence, spécialité, médecins et créneaux proposés → choix du mode → réservation. Alerte d'urgence locale | Symptômes rapides (`QUICK_SYMPTOMS`), durées, nombre de créneaux affichés, textes d'avertissement |
| `appointments/BookAppointmentScreen.js` | Réservation manuelle (médecin, sélecteurs de date/heure, mode) | Règles de créneaux |
| `appointments/AppointmentsListScreen.js` | Liste des rendez-vous ; boutons **Appel vidéo / Chat** sur les rendez-vous confirmés ; changement de statut (médecin/admin) | Conditions d'accès (ex. fenêtre horaire) via `canJoin` |
| `consultation/ChatScreen.js` | Chat patient ↔ médecin, envoi optimiste, rafraîchissement toutes les 3 s, bouton vidéo dans l'en-tête | Passage aux WebSockets, pièces jointes |
| `consultation/VideoCallScreen.js` | Demande caméra/micro, récupère l'URL de salle auprès du serveur, l'affiche en WebView, bouton raccrocher | Changer de fournisseur vidéo (se fait côté serveur) |
| `dashboard/PatientDashboardScreen.js` | Accueil patient : carte « Consulter un médecin » + prochains rendez-vous | Mise en avant, raccourcis |
| `dashboard/DoctorDashboardScreen.js` | Consultations du jour + **résumé d'orientation IA** (champ `reason`) | Informations affichées |
| `dashboard/AdminDashboardScreen.js` | Statistiques globales | Indicateurs |
| `doctors/DoctorsListScreen.js` | Annuaire ; **l'administrateur y valide les médecins** (n° d'ordre) | Filtres, recherche |
| `patients/PatientsListScreen.js` | Annuaire des patients (un médecin ne voit que les siens) | Filtres, recherche |
| `medical/MyMedicalRecordScreen.js` / `PatientMedicalRecordScreen.js` | Dossier médical (lecture patient) / diagnostics et ordonnances (écriture médecin) | Champs d'ordonnance |
| `invoices/InvoicesScreen.js` | Facturation : création, consultation, « payée » | Moyens de paiement (Mobile Money à prévoir) |
| `profile/ProfileScreen.js` | Profil et **déconnexion** | Modification du profil, suppression de compte |

### 4.6 Services et utilitaires

| Fichier | Rôle |
|---|---|
| `services/api.js` | Instance Axios, ajoute le token, gère le 401 |
| `services/triageService.js` | `analyzeSymptoms()` → `POST /ai/triage` ; `bookFromTriage()` → `POST /appointments` |
| `services/consultationService.js` | `fetchMessages()`, `sendMessage()`, `fetchVideoRoom()` |
| `utils/redFlags.js` | Expressions régulières de signes d'alerte, testées **avant** l'appel IA. **À faire relire par un médecin** |

## 5. Comment fonctionne l'IA d'orientation

1. Le patient décrit ses symptômes. `redFlags.js` détecte localement les urgences (douleur thoracique, détresse respiratoire…) et affiche
   immédiatement un encadré d'alerte avec le bouton d'appel, **même si le serveur est hors ligne**.
2. L'app envoie le texte à `POST /ai/triage`. Le serveur interroge le modèle, qui **classe seulement** : urgence + spécialité (choisie parmi celles de la base).
3. **Le code serveur choisit les médecins et créneaux** (spécialité, disponibilité, charge du jour). L'IA ne peut ni inventer un médecin ni un horaire.
4. Si l'IA échoue, des règles de mots-clés prennent le relais (`aiTriage.js`).
5. Le résumé est enregistré dans le rendez-vous : le médecin le voit sur son tableau de bord.

Limites à assumer : l'orientation n'est **pas un diagnostic**. Les textes d'avertissement de l'écran doivent rester visibles. Avant le lancement,
fais valider les règles et le prompt (`SYSTEM` dans `aiTriage.js`) par un professionnel de santé, et vérifie les obligations légales de ton pays
sur les données de santé et la télémédecine.

## 6. Le backend (projet séparé : `medcare-backend`)

Le serveur est fourni dans l'archive `medcare-backend.zip` (Node.js + Express + PostgreSQL). Il implémente toutes les routes utilisées par l'application :
comptes patient/médecin, rendez-vous, orientation IA, chat, salle vidéo, dossiers médicaux, factures, statistiques admin.
Mise en route locale et mise en ligne : `README.md` et `GUIDE_HEBERGEMENT.md` du backend.

**Adresse du serveur dans l'app :** variable `EXPO_PUBLIC_API_URL` (fichier `.env`, voir `.env.example`, ou variable Vercel). Plus besoin de modifier `config.js`.

**Règles implémentées côté serveur (à connaître)**
- Un patient réserve un créneau libre → le rendez-vous est **confirmé automatiquement** (`AUTO_CONFIRM`). Deux patients ne peuvent jamais avoir le même créneau.
- Les médecins s'inscrivent **non vérifiés** : invisibles des patients jusqu'à validation par l'administrateur (onglet Médecins).
- Un médecin ne voit que **ses** patients et leurs dossiers. Un patient ne voit que son dossier. Le chat et la salle vidéo sont limités au patient et au médecin du rendez-vous, tant qu'il est confirmé.
- L'orientation : l'IA classe (urgence + spécialité), le **code** choisit médecin et créneaux (charge du jour la plus faible, créneau le plus proche). Sans clé `ANTHROPIC_API_KEY`, des règles de mots-clés prennent le relais.
- Le total d'une facture est calculé par le serveur. Le rôle administrateur ne peut pas être créé depuis l'application.

**Vidéo :** `meet.jit.si` (public) convient aux tests, pas à la production. Pour un vrai déploiement : Jitsi auto-hébergé ou un service dédié, via `VIDEO_BASE_URL` côté serveur.

**Réseau :** en Afrique centrale, la vidéo est sensible à la bande passante ; le chat reste le mode de repli (proposé à la réservation).

## 7. Points de sécurité corrigés ou à traiter

- **Corrigé :** l'inscription publique proposait le rôle « Administrateur ». Retiré de l'application — **à bloquer aussi côté serveur**.
- **Corrigé :** `app.json` référençait `assets/icon.png` absent de l'archive (le build aurait échoué).
- **Corrigé :** saisie manuelle de la date en texte → sélecteurs natifs ; déconnexion automatique sur token expiré.
- **À faire :** HTTPS obligatoire en production (`API_URL`), `expo-secure-store` pour le token, vérification des diplômes des médecins avant `verified = 1`,
  limitation de débit sur `/ai/triage`, politique de confidentialité et consentement.

## 8. Démarrer

```bash
npm install
# 1. éditer src/constants/config.js  (API_URL)
# 2. déposer ton logo dans assets/
npx expo start          # test avec Expo Go
```
Remarque : `expo-camera` et `react-native-webview` fonctionnent dans Expo Go pour les tests, mais pour la production lance un build EAS
(`eas build --platform android --profile preview`).


## 9. Version web : téléphone et ordinateur (Vercel)

Le même projet produit le site : `npm run build:web` crée le dossier `dist/` ; `npm run web` le lance en local.

**Affichage adaptatif** (`src/components/WebFrame.js`)
- **Téléphone ou fenêtre étroite (< 768 px) :** l'application occupe tout l'écran, comme l'application native.
- **Tablette / ordinateur :** l'application est centrée dans une colonne de 600 px avec un fond neutre de chaque côté. Les cartes ne s'étirent pas sur toute la largeur.
- Le logo animé d'ouverture reste en plein écran dans les deux cas (taille plafonnée à 560 px sur grand écran).
- Pour changer la largeur de la colonne : `FRAME_MAX_WIDTH` ; le seuil : `DESKTOP_BREAKPOINT`.

**Installation depuis le navigateur (PWA)**
- Android (Chrome) : menu ⋮ → « Installer l'application » ou « Ajouter à l'écran d'accueil ».
- iPhone (Safari) : bouton Partager → « Sur l'écran d'accueil ».
- Ordinateur (Chrome/Edge) : icône d'installation dans la barre d'adresse.
L'application s'ouvre alors sans barre de navigateur, avec l'icône Medcare. Fichiers : `public/manifest.json` et `public/*.png` (icônes, à régénérer avec le script du logo quand tu auras une version haute définition). Il n'y a pas de mode hors ligne : une connexion est nécessaire.

**Déploiement :** pousse le projet sur Git et importe-le dans Vercel (framework « Other »). `vercel.json` fournit la commande de build, le dossier de sortie et la redirection vers `index.html`. `scripts/fix-vercel-assets.js` corrige deux points après l'export : le dossier `node_modules` ignoré par Vercel (icônes invisibles) et l'ajout des balises d'installation.

**Adaptations web déjà faites :** appel vidéo en `<iframe>` (`VideoCallScreen.web.js`, chargé automatiquement), champs date/heure HTML dans la réservation.

**Prérequis :** définir `EXPO_PUBLIC_API_URL` dans Vercel (backend en **HTTPS**, `CORS_ORIGINS` du backend = ton domaine Vercel), puis redéployer.

**Limites à connaître**
- Le rendu web a été compilé mais **pas vérifié visuellement** dans un navigateur (aucun navigateur n'était disponible pour mes tests). Ouvre-le sur un téléphone et sur un ordinateur avant de le montrer.
- C'est une mise en page « application mobile centrée » sur ordinateur, pas un tableau de bord de bureau. Une vraie version bureau (menu latéral, plusieurs colonnes, tableaux pour l'administrateur) demande un travail de conception dédié.
- Caméra et micro exigent HTTPS et l'autorisation du navigateur. Sur iPhone, l'appel vidéo dans une page installée peut être limité par Safari : prévoir le chat comme repli.
