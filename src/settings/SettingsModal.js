/**
 * SettingsModal.js - Settings modal wrapper and page router
 * Manages navigation between different settings pages
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useMoola } from '../context/MoolaContext';

import { SettingsMain } from './SettingsMain';
import { SettingsSecurity } from './SettingsSecurity';
import { SettingsReminders } from './SettingsReminders';
import { SettingsBackup } from './SettingsBackup';
import { SettingsCurrency } from './SettingsCurrency';
import { SettingsAccent } from './SettingsAccent';
import { SettingsName } from './SettingsName';
import { SettingsPrivacy } from './SettingsPrivacy';
import { SettingsAbout } from './SettingsAbout';

export const SettingsModal = ({ visible, onClose, onShowExport, onShowClearConfirm, onShowPinSetup }) => {
  const { t } = useMoola();

  const [settingsPage, setSettingsPage] = useState('main');
  const [showSecuritySetup, setShowSecuritySetup] = useState(false);
  const [editingName, setEditingName] = useState('');

  const handleClose = () => {
    setShowSecuritySetup(false);
    setSettingsPage('main');
    onClose();
  };

  const handleBack = () => {
    setShowSecuritySetup(false);
    setSettingsPage('main');
  };

  const getTitle = () => {
    switch (settingsPage) {
      case 'currency': return 'Currency';
      case 'accent': return 'Accent Color';
      case 'name': return 'Name';
      case 'privacy': return 'Privacy Policy';
      case 'security': return 'App Lock';
      case 'reminders': return 'Daily Reminder';
      case 'backup': return 'Backup Reminder';
      case 'about': return 'About';
      default: return 'Settings';
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: t.border }}>
            {settingsPage !== 'main' ? (
              <TouchableOpacity onPress={handleBack} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Svg width={16} height={16} viewBox="0 0 16 16">
                  <Path d="M10 3L5 8L10 13" stroke={t.sub} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={{ color: t.sub, fontSize: 14 }}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}
            <Text style={{ fontSize: 15, color: t.text, fontWeight: '500', letterSpacing: 1 }}>
              {getTitle()}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={{ fontSize: 20, color: t.sub }}>×</Text>
            </TouchableOpacity>
          </View>
          
          {settingsPage === 'main' && (
            <SettingsMain 
              onNavigate={setSettingsPage}
              onShowExport={onShowExport}
              onShowClearConfirm={onShowClearConfirm}
              setEditingName={setEditingName}
            />
          )}
          {settingsPage === 'currency' && <SettingsCurrency onBack={() => setSettingsPage('main')} />}
          {settingsPage === 'accent' && <SettingsAccent onBack={() => setSettingsPage('main')} />}
          {settingsPage === 'name' && <SettingsName editingName={editingName} setEditingName={setEditingName} onBack={() => setSettingsPage('main')} />}
          {settingsPage === 'privacy' && <SettingsPrivacy />}
          {settingsPage === 'about' && <SettingsAbout />}
          {settingsPage === 'security' && (
            <SettingsSecurity 
              showSecuritySetup={showSecuritySetup}
              setShowSecuritySetup={setShowSecuritySetup}
              onBack={() => setSettingsPage('main')}
              onShowPinSetup={onShowPinSetup}
            />
          )}
          {settingsPage === 'reminders' && <SettingsReminders />}
          {settingsPage === 'backup' && <SettingsBackup onShowExport={onShowExport} />}
        </SafeAreaView>
      </View>
    </Modal>
  );
};
