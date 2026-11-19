import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

import AdminDashboardScreen from '../screens/dashboard/AdminDashboardScreen';
import DoctorDashboardScreen from '../screens/dashboard/DoctorDashboardScreen';
import PatientDashboardScreen from '../screens/dashboard/PatientDashboardScreen';
import DoctorsListScreen from '../screens/doctors/DoctorsListScreen';
import PatientsListScreen from '../screens/patients/PatientsListScreen';
import AppointmentsListScreen from '../screens/appointments/AppointmentsListScreen';
import BookAppointmentScreen from '../screens/appointments/BookAppointmentScreen';
import MyMedicalRecordScreen from '../screens/medical/MyMedicalRecordScreen';
import PatientMedicalRecordScreen from '../screens/medical/PatientMedicalRecordScreen';
import InvoicesScreen from '../screens/invoices/InvoicesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import TriageScreen from '../screens/triage/TriageScreen';
import ChatScreen from '../screens/consultation/ChatScreen';
import VideoCallScreen from '../screens/consultation/VideoCallScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Icône (actif / inactif) de chaque onglet
const TAB_ICONS = {
  Dashboard: ['home', 'home-outline'],
  Doctors: ['medkit', 'medkit-outline'],
  Patients: ['people', 'people-outline'],
  AppointmentsTab: ['calendar', 'calendar-outline'],
  MedicalRecords: ['document-text', 'document-text-outline'],
  Invoices: ['receipt', 'receipt-outline'],
  Profile: ['person-circle', 'person-circle-outline'],
};

const tabOptions = ({ route }) => ({
  headerShadowVisible: false,
  headerStyle: { backgroundColor: COLORS.bg },
  headerTitleStyle: { color: COLORS.text, fontWeight: '700' },
  tabBarActiveTintColor: COLORS.primary,
  tabBarInactiveTintColor: COLORS.placeholder,
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
  tabBarStyle: { borderTopColor: COLORS.border, backgroundColor: '#fff' },
  tabBarIcon: ({ focused, color, size }) => {
    const [on, off] = TAB_ICONS[route.name] || ['ellipse', 'ellipse-outline'];
    return <Ionicons name={focused ? on : off} size={size} color={color} />;
  },
});

/** Liste des patients -> dossier médical d'un patient, dans un même onglet. */
function PatientsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShadowVisible: false, headerStyle: { backgroundColor: COLORS.bg } }}>
      <Stack.Screen name="PatientsList" component={PatientsListScreen} options={{ title: 'Patients' }} />
      <Stack.Screen
        name="PatientMedicalRecord"
        component={PatientMedicalRecordScreen}
        options={({ route }) => ({ title: route.params?.patientName || 'Dossier médical' })}
      />
    </Stack.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Doctors" component={DoctorsListScreen} options={{ title: 'Médecins' }} />
      <Tab.Screen name="Patients" component={PatientsStack} options={{ title: 'Patients', headerShown: false }} />
      <Tab.Screen name="AppointmentsTab" component={AppointmentsListScreen} options={{ title: 'Rendez-vous' }} />
      <Tab.Screen name="Invoices" component={InvoicesScreen} options={{ title: 'Factures' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

function DoctorTabs() {
  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="Dashboard" component={DoctorDashboardScreen} options={{ title: 'Accueil', headerShown: false }} />
      <Tab.Screen name="AppointmentsTab" component={AppointmentsListScreen} options={{ title: 'Rendez-vous', headerShown: false }} />
      <Tab.Screen name="Patients" component={PatientsStack} options={{ title: 'Patients', headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

function PatientTabs() {
  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="Dashboard" component={PatientDashboardScreen} options={{ title: 'Accueil', headerShown: false }} />
      <Tab.Screen name="AppointmentsTab" component={AppointmentsListScreen} options={{ title: 'Rendez-vous', headerShown: false }} />
      <Tab.Screen name="MedicalRecords" component={MyMedicalRecordScreen} options={{ title: 'Mon dossier' }} />
      <Tab.Screen name="Invoices" component={InvoicesScreen} options={{ title: 'Factures' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

function Tabs() {
  const { user } = useAuth();
  if (user.role === 'admin') return <AdminTabs />;
  if (user.role === 'doctor') return <DoctorTabs />;
  return <PatientTabs />;
}

/**
 * Pile principale : les onglets + les écrans plein écran (orientation IA, réservation, chat, vidéo).
 * Ces écrans sont accessibles depuis n'importe quel onglet via navigation.navigate('Chat', {...}).
 */
export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShadowVisible: false, headerStyle: { backgroundColor: COLORS.bg }, headerTitleStyle: { fontWeight: '700' } }}>
      <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="Triage" component={TriageScreen} options={{ title: 'Orientation', headerBackTitle: 'Retour' }} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} options={{ title: 'Rendez-vous', headerBackTitle: 'Retour' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerBackTitle: 'Retour' }} />
      <Stack.Screen name="VideoCall" component={VideoCallScreen} options={{ headerShown: false, presentation: 'fullScreenModal' }} />
    </Stack.Navigator>
  );
}
