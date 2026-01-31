/**
 * SettingsRow.js - Reusable settings row components
 * SettingsRow: Generic row with icon, title, subtitle, chevron
 * SettingsToggleRow: Row with integrated toggle switch
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronIcon } from '../icons';

/**
 * Settings row with icon, title, subtitle, and optional right content
 * @param {Object} props
 * @param {function} [props.onPress] - Callback when pressed (if not provided, row is not touchable)
 * @param {React.ReactNode} props.icon - Left icon component
 * @param {string} props.title - Main title text
 * @param {string} [props.subtitle] - Subtitle text (italic)
 * @param {React.ReactNode} [props.right] - Custom right content (overrides chevron)
 * @param {boolean} [props.showChevron=true] - Show chevron on right (ignored if right is provided)
 * @param {Object} props.theme - Theme object with colors (t)
 * @param {boolean} [props.isFirst=false] - If true, don't show top border
 */
export const SettingsRow = ({ 
  onPress, 
  icon, 
  title, 
  subtitle, 
  right, 
  showChevron = true,
  theme: t,
  isFirst = false
}) => {
  const content = (
    <View 
      style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 14, 
        paddingVertical: 16, 
        borderTopWidth: isFirst ? 0 : 1, 
        borderTopColor: t.border 
      }}
    >
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: t.text }}>{title}</Text>
        {subtitle && (
          <Text style={{ fontSize: 10, color: t.sub, marginTop: 4, fontStyle: 'italic' }}>
            {subtitle}
          </Text>
        )}
      </View>
      {right || (showChevron && <ChevronIcon color={t.sub} />)}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

/**
 * Settings row specifically for toggle switches
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Left icon component
 * @param {string} props.title - Main title text
 * @param {string} [props.subtitle] - Subtitle text (italic)
 * @param {boolean} props.active - Toggle state
 * @param {function} props.onToggle - Toggle callback
 * @param {Object} props.theme - Theme object with colors (t)
 * @param {boolean} [props.isFirst=false] - If true, don't show top border
 */
export const SettingsToggleRow = ({ 
  icon, 
  title, 
  subtitle, 
  active, 
  onToggle,
  theme: t,
  isFirst = false
}) => {
  const Toggle = (
    <TouchableOpacity 
      onPress={onToggle} 
      style={{ 
        width: 44, 
        height: 24, 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: active ? t.soul : t.border, 
        backgroundColor: active ? t.soulDim : 'transparent', 
        justifyContent: 'center', 
        paddingHorizontal: 2 
      }}
    >
      <View 
        style={{ 
          width: 18, 
          height: 18, 
          borderRadius: 9, 
          backgroundColor: active ? t.soul : t.muted, 
          alignSelf: active ? 'flex-end' : 'flex-start' 
        }} 
      />
    </TouchableOpacity>
  );

  return (
    <View 
      style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 14, 
        paddingVertical: 16, 
        borderTopWidth: isFirst ? 0 : 1, 
        borderTopColor: t.border 
      }}
    >
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: t.text }}>{title}</Text>
        {subtitle && (
          <Text style={{ fontSize: 10, color: t.sub, marginTop: 4, fontStyle: 'italic' }}>
            {subtitle}
          </Text>
        )}
      </View>
      {Toggle}
    </View>
  );
};
