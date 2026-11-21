import React from 'react';
import { StatusBar } from 'expo-status-bar';
import * as ExpoSplash from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

// Garde le splash natif visible jusqu'à ce que l'animation Medcare prenne le relais
ExpoSplash.preventAutoHideAsync().catch(() => {});

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
