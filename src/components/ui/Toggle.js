/**
 * Toggle.js - Reusable toggle switch component
 * Styled on/off switch used in settings
 */

import React from 'react';
import { View, TouchableOpacity } from 'react-native';

/**
 * Toggle switch component
 * @param {Object} props
 * @param {boolean} props.active - Whether toggle is on
 * @param {function} props.onToggle - Callback when toggled
 * @param {string} props.activeColor - Color when active (e.g., t.soul)
 * @param {string} props.activeBgColor - Background color when active (e.g., t.soulDim)
 * @param {string} props.inactiveColor - Knob color when inactive (e.g., t.muted)
 * @param {string} props.borderColor - Border color when inactive (e.g., t.border)
 */
export const Toggle = ({ 
  active, 
  onToggle, 
  activeColor, 
  activeBgColor, 
  inactiveColor, 
  borderColor 
}) => (
  <TouchableOpacity 
    onPress={onToggle} 
    style={{ 
      width: 44, 
      height: 24, 
      borderRadius: 12, 
      borderWidth: 1, 
      borderColor: active ? activeColor : borderColor, 
      backgroundColor: active ? activeBgColor : 'transparent', 
      justifyContent: 'center', 
      paddingHorizontal: 2 
    }}
  >
    <View 
      style={{ 
        width: 18, 
        height: 18, 
        borderRadius: 9, 
        backgroundColor: active ? activeColor : inactiveColor, 
        alignSelf: active ? 'flex-end' : 'flex-start' 
      }} 
    />
  </TouchableOpacity>
);
