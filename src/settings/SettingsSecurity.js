/**
 * SettingsSecurity.js - App lock settings page
 * Enable/disable PIN, change PIN, manage security options
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useMoola } from '../context/MoolaContext';
import { LockIcon, ShieldIcon, TrashIcon, ChevronIcon } from '../components/icons';

export const SettingsSecurity = ({ showSecuritySetup, setShowSecuritySetup, onBack, onShowPinSetup }) => {
  const { t, dark, lockMethod, disableAppLock } = useMoola();

  const handleEnablePinOnly = () => {
    onShowPinSetup();
  };

  const handleDisable = async () => {
    await disableAppLock();
    setShowSecuritySetup(false);
    onBack();
  };

  const handleChangePin = () => {
    onShowPinSetup();
  };

  // Show setup prompt if no lock is configured
  if (showSecuritySetup || lockMethod === 'none') {
    return (
      <View style={{ flex: 1, padding: 24 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ marginBottom: 32, alignItems: 'center' }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: t.soulDim, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
              <LockIcon color={t.soul} />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '400', color: t.text, textAlign: 'center', marginBottom: 12 }}>Protect Your Data</Text>
            <Text style={{ fontSize: 13, color: t.sub, textAlign: 'center', lineHeight: 22, fontStyle: 'italic', maxWidth: 280 }}>
              Add a layer of security to keep your financial records private.
            </Text>
          </View>

          <View style={{ width: '100%', gap: 12 }}>
            {/* PIN Option */}
            <TouchableOpacity 
              onPress={handleEnablePinOnly}
              style={{ 
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                padding: 16, backgroundColor: t.card, borderRadius: 8, 
                borderWidth: 1, borderColor: t.border 
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.soulDim, justifyContent: 'center', alignItems: 'center' }}>
                  <LockIcon color={t.soul} />
                </View>
                <View>
                  <Text style={{ fontSize: 15, color: t.text, fontWeight: '500' }}>PIN Code</Text>
                  <Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>4-6 digit code</Text>
                </View>
              </View>
              <ChevronIcon color={t.sub} />
            </TouchableOpacity>
          </View>

          {/* Skip Option */}
          <TouchableOpacity 
            onPress={() => {
              setShowSecuritySetup(false);
              if (lockMethod === 'none') {
                onBack();
              }
            }}
            style={{ marginTop: 32, padding: 12 }}
          >
            <Text style={{ fontSize: 13, color: t.sub, fontStyle: 'italic' }}>
              {lockMethod === 'none' ? 'Maybe later' : 'Cancel'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Note */}
        <View style={{ backgroundColor: t.soulDim, padding: 16, borderRadius: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <ShieldIcon color={t.soul} />
            <Text style={{ fontSize: 12, color: t.text, fontWeight: '500' }}>Secure Storage</Text>
          </View>
          <Text style={{ fontSize: 11, color: t.sub, lineHeight: 18, fontStyle: 'italic' }}>
            Your PIN is encrypted using {Platform.OS === 'ios' ? 'iOS Keychain' : 'Android Keystore'}. It never leaves your device.
          </Text>
        </View>
      </View>
    );
  }

  // Show management view if lock is already configured
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
      {/* Current Status */}
      <View style={{ backgroundColor: t.soulDim, padding: 20, borderRadius: 8, marginBottom: 24, alignItems: 'center' }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: t.soul, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
          <LockIcon color="#fff" />
        </View>
        <Text style={{ fontSize: 16, color: t.text, fontWeight: '500', marginBottom: 4 }}>App Lock Enabled</Text>
        <Text style={{ fontSize: 12, color: t.sub, fontStyle: 'italic' }}>PIN Code</Text>
      </View>

      {/* Options */}
      <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 16 }}>OPTIONS</Text>

      {/* Change PIN */}
      <TouchableOpacity 
        onPress={handleChangePin}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Text style={{ fontSize: 16, color: t.soul }}>••••</Text>
          <Text style={{ fontSize: 14, color: t.text }}>Change PIN</Text>
        </View>
        <ChevronIcon color={t.sub} />
      </TouchableOpacity>

      {/* Disable Lock */}
      <TouchableOpacity 
        onPress={handleDisable} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <TrashIcon color={dark ? '#c08080' : '#906060'} />
          <Text style={{ fontSize: 14, color: dark ? '#c08080' : '#906060' }}>Disable App Lock</Text>
        </View>
      </TouchableOpacity>

      {/* Privacy Note */}
      <View style={{ backgroundColor: t.soulDim, padding: 16, borderRadius: 4, marginTop: 32 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <ShieldIcon color={t.soul} />
          <Text style={{ fontSize: 12, color: t.text, fontWeight: '500' }}>Your PIN is secure</Text>
        </View>
        <Text style={{ fontSize: 11, color: t.sub, lineHeight: 18, fontStyle: 'italic' }}>
          Your PIN is encrypted and stored securely on your device using {Platform.OS === 'ios' ? 'iOS Keychain' : 'Android Keystore'}. It never leaves your device and cannot be recovered if forgotten.
        </Text>
      </View>
    </ScrollView>
  );
};
