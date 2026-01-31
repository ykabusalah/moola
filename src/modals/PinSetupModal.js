/**
 * PinSetupModal.js - PIN creation and change flow
 * Handles new PIN setup, confirmation, and PIN change verification
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useMoola } from '../context/MoolaContext';

export const PinSetupModal = ({ visible, onClose, initialMode = 'new', targetMethod = 'pin' }) => {
  const { 
    t, dark,
    savePin, saveLockMethod, verifyPin
  } = useMoola();

  const [pinInput, setPinInput] = useState('');
  const [tempPin, setTempPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSetupMode, setPinSetupMode] = useState(initialMode); // 'new' | 'change' | 'confirm'
  const [pinSetupTarget, setPinSetupTarget] = useState(targetMethod);

  const handleClose = () => {
    setPinInput('');
    setTempPin('');
    setPinError('');
    setPinSetupMode('new');
    setPinSetupTarget('pin');
    onClose();
  };

  const handlePinSubmit = async () => {
    if (pinInput.length < 4) {
      setPinError('PIN must be at least 4 digits');
      return;
    }

    if (pinSetupMode === 'new') {
      setTempPin(pinInput);
      setPinInput('');
      setPinSetupMode('confirm');
      setPinError('');
    } else if (pinSetupMode === 'confirm') {
      if (pinInput === tempPin) {
        const saved = await savePin(pinInput);
        if (saved) {
          await saveLockMethod(pinSetupTarget);
          handleClose();
        }
      } else {
        setPinError('PINs do not match');
        setPinInput('');
        setPinSetupMode('new');
        setTempPin('');
      }
    } else if (pinSetupMode === 'change') {
      const isValid = await verifyPin(pinInput);
      if (isValid) {
        setPinInput('');
        setPinSetupMode('new');
        setPinError('');
      } else {
        setPinError('Incorrect PIN');
        setPinInput('');
      }
    }
  };

  const handleKeyPress = (key) => {
    if (key === 'del') {
      setPinInput(prev => prev.slice(0, -1));
      setPinError('');
    } else if (key !== '' && pinInput.length < 6) {
      setPinInput(prev => prev + key);
      setPinError('');
    }
  };

  return (
    <Modal visible={visible} animationType="fade">
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: t.border }}>
            <View />
            <Text style={{ fontSize: 15, color: t.text, fontWeight: '500', letterSpacing: 1 }}>
              {pinSetupMode === 'change' ? 'Enter Current PIN' : pinSetupMode === 'confirm' ? 'Confirm PIN' : 'Create PIN'}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={{ fontSize: 20, color: t.sub }}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <Text style={{ fontSize: 13, color: t.sub, marginBottom: 32, textAlign: 'center', fontStyle: 'italic' }}>
              {pinSetupMode === 'change' ? 'Enter your current PIN to continue' : pinSetupMode === 'confirm' ? 'Re-enter your PIN to confirm' : 'Enter a 4-6 digit PIN'}
            </Text>

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
              {[[1, 2, 3], [4, 5, 6], [7, 8, 9], ['', 0, 'del']].map((row, rowIndex) => (
                <View key={rowIndex} style={{ flexDirection: 'row' }}>
                  {row.map((key, keyIndex) => (
                    <TouchableOpacity 
                      key={keyIndex}
                      onPress={() => handleKeyPress(key)}
                      disabled={key === ''}
                      style={{ 
                        width: 72, height: 72, borderRadius: 36, 
                        backgroundColor: key === '' ? 'transparent' : t.card, 
                        borderWidth: key === '' ? 0 : 1, borderColor: t.border,
                        justifyContent: 'center', alignItems: 'center', margin: 8 
                      }}
                    >
                      {key === 'del' ? (
                        <Svg width={24} height={24} viewBox="0 0 24 24">
                          <Path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2zM18 9l-6 6M12 9l6 6" stroke={t.sub} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      ) : key !== '' ? (
                        <Text style={{ fontSize: 28, color: t.text, fontWeight: '300' }}>{key}</Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              onPress={handlePinSubmit}
              disabled={pinInput.length < 4}
              style={{ 
                marginTop: 24, paddingVertical: 14, paddingHorizontal: 48,
                backgroundColor: pinInput.length >= 4 ? t.soul : t.muted, 
                borderRadius: 2 
              }}
            >
              <Text style={{ color: pinInput.length >= 4 ? '#fff' : t.sub, fontSize: 12, letterSpacing: 2 }}>
                {pinSetupMode === 'confirm' ? 'CONFIRM' : 'NEXT'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Note */}
          <View style={{ padding: 24 }}>
            <View style={{ backgroundColor: t.soulDim, padding: 16, borderRadius: 4 }}>
              <Text style={{ fontSize: 11, color: t.sub, lineHeight: 18, fontStyle: 'italic', textAlign: 'center' }}>
                Your PIN is encrypted and stored securely on your device.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};
