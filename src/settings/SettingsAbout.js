/**
 * SettingsAbout.js - About page
 * Shows app version, platform info, and branding
 */

import React from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import { useMoola } from '../context/MoolaContext';
import { SketchCircle, Divider } from '../components/ui';
import { StarIcon } from '../components/icons';

export const SettingsAbout = () => {
  const { t } = useMoola();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
      <View style={{ marginVertical: 32, alignItems: 'center' }}>
        <SketchCircle size={80} color={t.soul} />
        <Text style={{ fontSize: 28, fontWeight: '300', color: t.text, marginTop: 20, letterSpacing: 4 }}>moola</Text>
        <Text style={{ fontSize: 11, color: t.sub, marginTop: 8, fontStyle: 'italic', letterSpacing: 2 }}>quiet your coins</Text>
      </View>

      <Divider color={t.border} />

      <View style={{ width: '100%', marginTop: 24 }}>
        <Text style={{ fontSize: 13, color: t.sub, lineHeight: 24, textAlign: 'center', fontStyle: 'italic' }}>
          A minimalist expense tracker built for those who believe their financial data should remain theirs alone.
        </Text>
      </View>

      <View style={{ width: '100%', marginTop: 32, gap: 16 }}>
        {[
          { label: 'Version', value: '1.0.0' },
          { label: 'Platform', value: Platform.OS === 'ios' ? 'iOS' : 'Android' },
          { label: 'Storage', value: 'Local only' },
        ].map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: t.border }}>
            <Text style={{ fontSize: 13, color: t.sub }}>{item.label}</Text>
            <Text style={{ fontSize: 13, color: t.text }}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 40, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
          <StarIcon color={t.border} />
          <StarIcon color={t.soul} filled />
          <StarIcon color={t.border} />
        </View>
        <Text style={{ fontSize: 11, color: t.muted, fontStyle: 'italic' }}>
          Made with intention
        </Text>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
};
