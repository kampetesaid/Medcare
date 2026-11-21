import React from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';

/**
 * AFFICHAGE ADAPTATIF (navigateur)
 *  - Téléphone / petite fenêtre (< 768 px) : l'application occupe tout l'écran.
 *  - Tablette / ordinateur : l'application est centrée dans une colonne de lecture confortable,
 *    avec un fond neutre de chaque côté (au lieu d'étirer les cartes sur 1900 px).
 * Sur Android / iOS (application native), ce composant ne change rien.
 */
export const DESKTOP_BREAKPOINT = 768;
export const FRAME_MAX_WIDTH = 600;

export default function WebFrame({ children }) {
  const { width } = useWindowDimensions();
  if (Platform.OS !== 'web' || width < DESKTOP_BREAKPOINT) return <View style={{ flex: 1 }}>{children}</View>;
  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#E6EDF7' }}>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: FRAME_MAX_WIDTH,
          backgroundColor: '#F5F8FC',
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: '#D5DFEE',
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
}
