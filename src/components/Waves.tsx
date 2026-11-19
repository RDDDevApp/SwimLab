import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { C } from '../config/tokens';

interface Props {
  /** Hauteur de la bande de vagues ; la largeur suit le conteneur. */
  height?: number;
  /** Couleurs du fond vers l'avant : de la plus froide à la plus chaude. */
  colors?: string[];
  style?: StyleProp<ViewStyle>;
}

// Bords supérieurs ondulés, dessinés pour un cadre de 400 × 100 étiré en largeur.
const PATHS = [
  'M0 38 C60 14 110 54 180 30 S300 0 400 22 V100 H0Z',
  'M90 100 C140 52 210 74 270 46 S360 30 400 40 V100Z',
  'M210 100 C250 68 300 82 340 62 S390 54 400 56 V100Z',
  'M300 100 C330 82 365 90 400 76 V100Z',
];

/**
 * Vagues pleines de la DA « La vague » : formes de couleur unie superposées,
 * jamais de dégradé. À poser en bas d'une carte vedette ou d'un écran d'accueil,
 * jamais derrière du texte.
 */
export default function Waves({
  height = 64,
  colors = [C.ocean, C.lagon, C.soleil, C.rose],
  style,
}: Props) {
  return (
    <Svg
      width="100%"
      height={height}
      viewBox="0 0 400 100"
      preserveAspectRatio="none"
      style={style}
      accessible={false}
      pointerEvents="none"
    >
      {colors.slice(0, PATHS.length).map((color, i) => (
        <Path key={i} d={PATHS[i]} fill={color} />
      ))}
    </Svg>
  );
}
