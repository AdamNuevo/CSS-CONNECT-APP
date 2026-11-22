// SVG paths are geometric approximations — the original uses a 3-D tilt not reproduced here.
import React from 'react';
import Svg, { Polygon, Path, Line, Circle } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function GradCapIcon({ size = 36, color = '#1A2E5A' }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Mortarboard flat top (diamond / rhombus shape) */}
      <Polygon points="18,2 34,11 18,20 2,11" fill={color} />

      {/* Front face of the cap body below the board */}
      <Path d="M8,12 L8,22 Q18,28 28,22 L28,12" fill={color} opacity={0.75} />

      {/* Tassel rope hanging from the right corner of the board */}
      <Line x1="34" y1="11" x2="34" y2="23" stroke={color} strokeWidth="1.5" />
      <Line x1="30" y1="23" x2="34" y2="23" stroke={color} strokeWidth="1.5" />

      {/* Tassel bob at the end of the rope */}
      <Circle cx="30" cy="25" r="2" fill={color} />
    </Svg>
  );
}
