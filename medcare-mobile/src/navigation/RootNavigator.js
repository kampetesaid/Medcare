import React, { useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '../screens/splash/SplashScreen';
import { COLORS } from '../constants/theme';

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: COLORS.primary, background: COLORS.bg, card: '#fff', text: COLORS.text, border: COLORS.border },
};

/**
 * Ordre d'affichage : logo animé plein écran (par-dessus) → Auth ou App selon la session.
 * L'application se prépare DERRIÈRE le splash : au fondu de sortie, l'écran suivant est déjà là.
 */
export default function RootNavigator() {
  const { user, loading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {!loading ? (
        <NavigationContainer theme={navTheme}>{user ? <MainNavigator /> : <AuthNavigator />}</NavigationContainer>
      ) : null}
      {!splashDone ? <SplashScreen ready={!loading} onFinish={() => setSplashDone(true)} /> : null}
    </View>
  );
}
