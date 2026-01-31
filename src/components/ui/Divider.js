/**
 * Divider.js - Hand-drawn style horizontal divider
 * Decorative separator used in settings and about pages
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * Hand-drawn style horizontal divider line
 * @param {Object} props
 * @param {string} props.color - Stroke color
 */
export const Divider = ({ color }) => (
  <Svg width="100%" height={8} viewBox="0 0 300 8" preserveAspectRatio="none">
    <Path 
      d="M0,4 Q15,2 30,4 T60,4 T90,4 T120,4 T150,4 T180,4 T210,4 T240,4 T270,4 L300,4" 
      stroke={color} 
      strokeWidth={1} 
      fill="none" 
      opacity={0.4} 
    />
  </Svg>
);
