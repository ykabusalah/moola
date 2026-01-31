/**
 * SketchCircle.js - Hand-drawn style circle logo
 * Used for app branding throughout splash, onboarding, settings
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * Hand-drawn style circle for decorative purposes
 * @param {Object} props
 * @param {number} props.size - Width and height of the SVG
 * @param {string} props.color - Stroke color
 */
export const SketchCircle = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 60 60">
    <Path 
      d="M30,5 Q50,3 55,25 Q57,50 30,55 Q8,57 5,30 Q3,10 30,5" 
      stroke={color} 
      strokeWidth="1.5" 
      fill="none" 
    />
  </Svg>
);
