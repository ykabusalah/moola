/**
 * SettingsAccent.js - Accent color picker
 * Choose from 5 color themes with live preview
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useMoola } from '../context/MoolaContext';

export const SettingsAccent = ({ onBack }) => {
  const { t, dark, currency, accentColor, setAccentColor, ACCENT_COLORS } = useMoola();

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 13, color: t.sub, marginBottom: 32, fontStyle: 'italic' }}>
        Choose an accent color that speaks to you.
      </Text>
      {ACCENT_COLORS.map((a) => {
        const displayColor = dark ? a.darkColor : a.color;
        const isSelected = accentColor.id === a.id;
        return (
          <TouchableOpacity 
            key={a.id}
            onPress={() => { setAccentColor(a); onBack(); }} 
            style={{ 
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
              paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{ 
                width: 32, height: 32, borderRadius: 16, backgroundColor: displayColor,
                borderWidth: isSelected ? 2 : 0, borderColor: t.text
              }} />
              <Text style={{ fontSize: 15, color: isSelected ? displayColor : t.text }}>{a.name}</Text>
            </View>
            {isSelected && (
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path d="M20 6L9 17l-5-5" stroke={displayColor} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            )}
          </TouchableOpacity>
        );
      })}
      
      <View style={{ marginTop: 32, padding: 20, backgroundColor: dark ? accentColor.darkDim : accentColor.dim, borderRadius: 4 }}>
        <Text style={{ fontSize: 11, color: t.sub, marginBottom: 8, letterSpacing: 1 }}>PREVIEW</Text>
        <Text style={{ fontSize: 28, fontWeight: '300', color: t.text }}>
          {currency.symbol}1,234<Text style={{ fontSize: 14, color: t.sub }}>.56</Text>
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
          <View style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: dark ? accentColor.darkColor : accentColor.color, borderRadius: 2 }}>
            <Text style={{ color: '#fff', fontSize: 10, letterSpacing: 1 }}>BUTTON</Text>
          </View>
          <View style={{ paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: dark ? accentColor.darkColor : accentColor.color, borderRadius: 2 }}>
            <Text style={{ color: dark ? accentColor.darkColor : accentColor.color, fontSize: 10, letterSpacing: 1 }}>OUTLINE</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
