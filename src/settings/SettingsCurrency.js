/**
 * SettingsCurrency.js - Currency selection page
 * Lists all 24 supported currencies for user selection
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useMoola } from '../context/MoolaContext';

export const SettingsCurrency = ({ onBack }) => {
  const { t, currency, setCurrency, CURRENCIES } = useMoola();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 13, color: t.sub, marginBottom: 24, fontStyle: 'italic' }}>
        Select your preferred currency for displaying amounts.
      </Text>
      {CURRENCIES.map((c) => (
        <TouchableOpacity 
          key={c.code}
          onPress={() => { setCurrency(c); onBack(); }} 
          style={{ 
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
            paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.border,
            backgroundColor: currency.code === c.code ? t.soulDim : 'transparent',
            marginHorizontal: -24, paddingHorizontal: 24
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Text style={{ fontSize: 18, color: currency.code === c.code ? t.soul : t.sub, width: 32 }}>{c.symbol}</Text>
            <View>
              <Text style={{ fontSize: 14, color: t.text }}>{c.name}</Text>
              <Text style={{ fontSize: 11, color: t.sub, marginTop: 2 }}>{c.code}</Text>
            </View>
          </View>
          {currency.code === c.code && (
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path d="M20 6L9 17l-5-5" stroke={t.soul} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
