import React from 'react';
import { Image } from 'react-native';

/**
 * LOGO MEDCARE
 *  - variant "mark" : emblème seul (assets/logo-mark.png)  → petits formats
 *  - variant "full" : emblème + mot MedCare (assets/logo-full.png)
 * Les deux fichiers sont générés par scripts/gif-to-frames.py ; on peut aussi les remplacer à la main
 * (PNG transparent). Le texte « Med » est bleu marine : à afficher sur fond CLAIR uniquement.
 */
const SOURCES = {
  mark: { src: require('../../assets/logo-mark.png'), ratio: 749 / 617 },
  full: { src: require('../../assets/logo-full.png'), ratio: 851 / 835 },
};

export default function Logo({ size = 96, variant = 'mark', style }) {
  const { src, ratio } = SOURCES[variant] || SOURCES.mark;
  return <Image source={src} style={[{ width: size, height: size / ratio }, style]} resizeMode="contain" />;
}
