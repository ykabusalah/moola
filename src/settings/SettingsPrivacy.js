/**
 * SettingsPrivacy.js - Privacy policy display
 * Explains data storage, collection practices, and user rights
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useMoola } from '../context/MoolaContext';
import { ShieldIcon } from '../components/icons';
import { Divider } from '../components/ui';

export const SettingsPrivacy = () => {
  const { t } = useMoola();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <ShieldIcon color={t.soul} />
        <Text style={{ fontSize: 18, color: t.text, marginTop: 16, fontWeight: '400' }}>Your Privacy Matters</Text>
        <Text style={{ fontSize: 12, color: t.sub, marginTop: 8, fontStyle: 'italic', textAlign: 'center' }}>
          Last updated: January 2025
        </Text>
      </View>

      <View style={{ marginBottom: 28 }}>
        <Text style={{ fontSize: 13, color: t.text, fontWeight: '500', marginBottom: 12 }}>The Short Version</Text>
        <Text style={{ fontSize: 13, color: t.sub, lineHeight: 22, fontStyle: 'italic' }}>
          moola is built on a simple principle: your financial data belongs to you, and only you. We don't collect it, we don't store it, and we certainly don't sell it.
        </Text>
      </View>

      <Divider color={t.border} />

      <View style={{ marginTop: 20, marginBottom: 28 }}>
        <Text style={{ fontSize: 13, color: t.text, fontWeight: '500', marginBottom: 12 }}>Data Storage</Text>
        <View style={{ gap: 12 }}>
          {[
            'All your expense data is stored locally on your device',
            'No cloud synchronization or remote servers',
            'No account creation required',
            'Your data never leaves your device unless you export it'
          ].map((text, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Svg width={14} height={14} viewBox="0 0 14 14" style={{ marginTop: 3 }}>
                <Path d="M7,1 Q11,1 13,7 Q11,13 7,13 Q3,13 1,7 Q3,1 7,1" stroke={t.soul} fill="none" strokeWidth={0.8} />
              </Svg>
              <Text style={{ fontSize: 13, color: t.sub, flex: 1, lineHeight: 20 }}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

      <Divider color={t.border} />

      <View style={{ marginTop: 20, marginBottom: 28 }}>
        <Text style={{ fontSize: 13, color: t.text, fontWeight: '500', marginBottom: 12 }}>Data Collection</Text>
        <Text style={{ fontSize: 13, color: t.sub, lineHeight: 22 }}>
          moola does not collect, transmit, or store any personal information whatsoever. This includes:
        </Text>
        <View style={{ marginTop: 12, gap: 8 }}>
          {[
            'No analytics or usage tracking',
            'No crash reporting services',
            'No advertising identifiers',
            'No device fingerprinting',
            'No location data',
            'No third-party SDKs that collect data'
          ].map((text, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ color: t.soul, fontSize: 10 }}>✕</Text>
              <Text style={{ fontSize: 13, color: t.sub }}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

      <Divider color={t.border} />

      <View style={{ marginTop: 20, marginBottom: 28 }}>
        <Text style={{ fontSize: 13, color: t.text, fontWeight: '500', marginBottom: 12 }}>Your Rights</Text>
        <Text style={{ fontSize: 13, color: t.sub, lineHeight: 22 }}>
          Since all data stays on your device, you have complete control:
        </Text>
        <View style={{ marginTop: 12, gap: 8 }}>
          {[
            'Export your data anytime via CSV',
            'Delete all data with one tap in Settings',
            'Uninstalling the app removes all data'
          ].map((text, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Text style={{ color: t.soul, fontSize: 12 }}>✓</Text>
              <Text style={{ fontSize: 13, color: t.sub, flex: 1 }}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

      <Divider color={t.border} />

      <View style={{ marginTop: 20, marginBottom: 28 }}>
        <Text style={{ fontSize: 13, color: t.text, fontWeight: '500', marginBottom: 12 }}>Third Parties</Text>
        <Text style={{ fontSize: 13, color: t.sub, lineHeight: 22 }}>
          moola does not share any information with third parties because we don't have any information to share. We don't use analytics services, advertising networks, or any external services that would have access to your data.
        </Text>
      </View>

      <Divider color={t.border} />

      <View style={{ marginTop: 20, marginBottom: 28 }}>
        <Text style={{ fontSize: 13, color: t.text, fontWeight: '500', marginBottom: 12 }}>Changes to This Policy</Text>
        <Text style={{ fontSize: 13, color: t.sub, lineHeight: 22 }}>
          Our commitment to privacy is fundamental to moola's design. If we ever need to update this policy, changes will be reflected in app updates with clear notification of what has changed.
        </Text>
      </View>

      <View style={{ backgroundColor: t.soulDim, padding: 20, borderRadius: 4, marginTop: 8, marginBottom: 40 }}>
        <Text style={{ fontSize: 12, color: t.soul, fontStyle: 'italic', textAlign: 'center', lineHeight: 20 }}>
          "Your coins remain within this vessel."
        </Text>
      </View>
    </ScrollView>
  );
};
