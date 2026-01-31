/**
 * icons/index.js - SVG icon components
 * All 18 icons used throughout the app (Export, Settings, Lock, etc.)
 */

import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// ============================================
// ICON COMPONENTS
// ============================================

export const ExportIcon = ({ color }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 10l5 5 5-5" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 15V3" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

export const SettingsIcon = ({ color }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth="1.5" fill="none" />
    <Path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

export const ShareIcon = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 6l-4-4-4 4" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 2v13" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

export const CopyIcon = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Rect x="9" y="9" width="13" height="13" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
    <Path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

export const SaveIcon = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17 21v-8H7v8" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 3v5h8" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ChevronIcon = ({ color, direction = 'right' }) => (
  <Svg width={16} height={16} viewBox="0 0 16 16" style={{ transform: [{ rotate: direction === 'down' ? '90deg' : '0deg' }] }}>
    <Path d="M6 3L11 8L6 13" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ShieldIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const TrashIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const InfoIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth="1.5" fill="none" />
    <Path d="M12 16v-4M12 8h.01" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

export const HeartIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CoffeeIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M18 8h1a4 4 0 0 1 0 8h-1" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 1v3M10 1v3M14 1v3" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

export const LockIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth="1.5" fill="none" />
    <Path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const FaceIdIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M7 3H5a2 2 0 00-2 2v2M17 3h2a2 2 0 012 2v2M7 21H5a2 2 0 01-2-2v-2M17 21h2a2 2 0 002-2v-2" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="9" cy="9" r="1" fill={color} />
    <Circle cx="15" cy="9" r="1" fill={color} />
    <Path d="M9 15c.83.67 2 1 3 1s2.17-.33 3-1" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const BellIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CloudIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const MessageIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ClockIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth="1.5" fill="none" />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const StarIcon = ({ color, filled }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M12,2 L14,10 L22,12 L14,14 L12,22 L10,14 L2,12 L10,10 Z" stroke={color} fill={filled ? color : 'none'} strokeWidth="0.5" opacity={filled ? 0.8 : 1} />
  </Svg>
);
