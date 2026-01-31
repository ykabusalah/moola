/**
 * LockScreen.js - PIN entry screen for app security
 * Displays when app is locked, handles PIN verification
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as SecureStore from 'expo-secure-store';
import { useMoola } from '../context/MoolaContext';
import { SketchCircle } from '../components/ui';
import { SECURE_KEYS } from '../constants/config';

export const LockScreen = () => {
  const { 
    t, dark,
    setIsLocked, setLockMethod,
    lockMethod, verifyPin
  } = useMoola();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Safety check: verify PIN actually exists on mount
  useEffect(() => {
    const verifyPinExists = async () => {
      try {
        const storedPin = await SecureStore.getItemAsync(SECURE_KEYS.PIN);
        if (lockMethod === 'pin' && (!storedPin || storedPin.length < 4)) {
          console.log('No valid PIN found, unlocking app');
          await SecureStore.deleteItemAsync(SECURE_KEYS.LOCK_METHOD);
          await SecureStore.deleteItemAsync(SECURE_KEYS.PIN);
          setLockMethod('none');
          setIsLocked(false);
        }
      } catch (error) {
        console.log('Error verifying PIN:', error);
        setIsLocked(false);
      }
    };
    verifyPinExists();
  }, []);

  const handleKeyPress = (key) => {
    if (key === 'delete') {
      setPinInput(prev => prev.slice(0, -1));
      setPinError('');
    } else if (pinInput.length < 6) {
      setPinInput(prev => prev + key);
      setPinError('');
    }
  };

  const handleLockScreenPinSubmit = async () => {
    const isValid = await verifyPin(pinInput);
    if (isValid) {
      setIsLocked(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Incorrect PIN');
      setPinInput('');
    }
  };

  const handleEmergencyReset = async () => {
    try {
      await SecureStore.deleteItemAsync(SECURE_KEYS.PIN);
      await SecureStore.deleteItemAsync(SECURE_KEYS.LOCK_METHOD);
      setLockMethod('none');
      setIsLocked(false);
      setPinInput('');
    } catch (e) {
      console.log('Reset error:', e);
    }
  };

  const NumKey = ({ value, onPress }) => (
    <TouchableOpacity 
      onPress={() => onPress(value)}
      style={{ 
        width: 72, height: 72, borderRadius: 36, 
        backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
        justifyContent: 'center', alignItems: 'center', margin: 8 
      }}
    >
      {value === 'delete' ? (
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2zM18 9l-6 6M12 9l6 6" stroke={t.sub} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ) : (
        <Text style={{ fontSize: 28, color: t.text, fontWeight: '300' }}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        
        <View style={{ marginBottom: 40, alignItems: 'center' }}>
          <SketchCircle size={60} color={t.soul} />
          <Text style={{ fontSize: 20, fontWeight: '300', color: t.text, marginTop: 16, letterSpacing: 4 }}>moola</Text>
          <Text style={{ fontSize: 11, color: t.sub, marginTop: 4, fontStyle: 'italic' }}>enter PIN to unlock</Text>
        </View>

        {/* PIN Dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <View 
              key={i} 
              style={{ 
                width: 14, height: 14, borderRadius: 7, 
                backgroundColor: i < pinInput.length ? t.soul : 'transparent',
                borderWidth: 1.5, borderColor: i < pinInput.length ? t.soul : t.border
              }} 
            />
          ))}
        </View>

        {pinError ? (
          <Text style={{ fontSize: 12, color: dark ? '#c08080' : '#906060', marginBottom: 16 }}>{pinError}</Text>
        ) : (
          <View style={{ height: 28 }} />
        )}

        {/* Numeric Keypad */}
        <View style={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row' }}>
            <NumKey value="1" onPress={handleKeyPress} />
            <NumKey value="2" onPress={handleKeyPress} />
            <NumKey value="3" onPress={handleKeyPress} />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <NumKey value="4" onPress={handleKeyPress} />
            <NumKey value="5" onPress={handleKeyPress} />
            <NumKey value="6" onPress={handleKeyPress} />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <NumKey value="7" onPress={handleKeyPress} />
            <NumKey value="8" onPress={handleKeyPress} />
            <NumKey value="9" onPress={handleKeyPress} />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: 72, height: 72, margin: 8 }} />
            <NumKey value="0" onPress={handleKeyPress} />
            <NumKey value="delete" onPress={handleKeyPress} />
          </View>
        </View>

        {/* Unlock Button */}
        <TouchableOpacity 
          onPress={handleLockScreenPinSubmit}
          disabled={pinInput.length < 4}
          style={{ 
            marginTop: 24, paddingVertical: 14, paddingHorizontal: 48,
            backgroundColor: pinInput.length >= 4 ? t.soul : t.muted, 
            borderRadius: 2 
          }}
        >
          <Text style={{ color: pinInput.length >= 4 ? '#fff' : t.sub, fontSize: 12, letterSpacing: 2 }}>UNLOCK</Text>
        </TouchableOpacity>

        {/* Emergency Reset */}
        <TouchableOpacity 
          onPress={handleEmergencyReset}
          style={{ marginTop: 40, padding: 12 }}
        >
          <Text style={{ fontSize: 12, color: t.sub, textDecorationLine: 'underline' }}>
            Reset Lock (Emergency)
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};
