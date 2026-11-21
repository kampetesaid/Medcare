import React, { useEffect, useMemo, useRef } from 'react';
import { View, Image, Animated, Easing, StyleSheet, StatusBar, useWindowDimensions } from 'react-native';
import * as ExpoSplash from 'expo-splash-screen';
import { SPLASH_HOLD_MS } from '../../constants/config';
import meta from '../../../assets/splash/meta.json';

/**
 * ANIMATION D'OUVERTURE — logo animé en plein écran.
 *
 * Les images viennent de assets/splash/frame0..N.png (générées depuis votre GIF par
 * scripts/gif-to-frames.py). Elles sont lues UNE fois, avec un fondu entre chaque image,
 * puis la dernière image reste affichée SPLASH_HOLD_MS avant l'entrée dans l'app.
 *
 * `ready`    : true quand la session est lue (voir AuthContext)
 * `onFinish` : appelé quand l'animation est terminée ET `ready` est vrai
 */
const FRAMES = [
  require('../../../assets/splash/frame0.png'),
  require('../../../assets/splash/frame1.png'),
  require('../../../assets/splash/frame2.png'),
  require('../../../assets/splash/frame3.png'),
  require('../../../assets/splash/frame4.png'),
  require('../../../assets/splash/frame5.png'),
  require('../../../assets/splash/frame6.png'),
  require('../../../assets/splash/frame7.png'),
  require('../../../assets/splash/frame8.png'),
];
const LAST = FRAMES.length - 1;

export default function SplashScreen({ ready, onFinish }) {
  const { width, height } = useWindowDimensions();
  const t = useRef(new Animated.Value(0)).current; // 0 → LAST : "curseur" de lecture
  const exit = useRef(new Animated.Value(1)).current;
  const played = useRef(false);
  const finished = useRef(false);
  const readyRef = useRef(ready);
  readyRef.current = ready;

  // Le logo occupe toute la largeur de l'écran (limité par la hauteur sur les écrans très larges)
  const imgW = Math.min(width, height * meta.ratio, 560); // plafonné pour les grands écrans (ordinateur)
  const imgH = imgW / meta.ratio;

  const tryExit = () => {
    if (finished.current || !played.current || !readyRef.current) return;
    finished.current = true;
    Animated.timing(exit, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => onFinish?.());
  };

  useEffect(() => {
    StatusBar.setHidden(true, 'fade'); // vraiment plein écran
    ExpoSplash.hideAsync().catch(() => {}); // le fond natif est blanc comme ce composant : pas de saut visuel

    Animated.timing(t, {
      toValue: LAST + 0.01, // +0.01 : retire proprement l'avant-dernière image
      duration: LAST * meta.frameMs,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        played.current = true;
        tryExit();
      }, SPLASH_HOLD_MS);
    });

    return () => StatusBar.setHidden(false, 'fade');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    tryExit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  /**
   * Chaque image apparaît en fondu pendant 1 pas, reste opaque, puis disparaît quand
   * l'image suivante est totalement visible → pas de « clignotement » entre images quasi identiques.
   */
  const layers = useMemo(
    () =>
      FRAMES.map((src, i) => {
        const opacity =
          i === 0
            ? t.interpolate({ inputRange: [0, 1, 1.001], outputRange: [1, 1, 0], extrapolate: 'clamp' })
            : i === LAST
            ? t.interpolate({ inputRange: [i - 1, i], outputRange: [0, 1], extrapolate: 'clamp' })
            : t.interpolate({ inputRange: [i - 1, i, i + 1, i + 1.001], outputRange: [0, 1, 1, 0], extrapolate: 'clamp' });
        return { src, opacity };
      }),
    [t]
  );

  return (
    <Animated.View style={[styles.root, { opacity: exit }]}>
      <View style={{ width: imgW, height: imgH }}>
        {layers.map((l, i) => (
          <Animated.Image
            key={i}
            source={l.src}
            fadeDuration={0}
            resizeMode="contain"
            style={[StyleSheet.absoluteFill, { opacity: l.opacity }]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
});
