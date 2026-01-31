/**
 * SettingsBackup.js - Backup reminder settings
 * Configure weekly/monthly backup reminders and quick export
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useMoola } from '../context/MoolaContext';
import { CloudIcon, BellIcon, ShieldIcon } from '../components/icons';

export const SettingsBackup = ({ onShowExport }) => {
  const { 
    t,
    backupReminderEnabled, setBackupReminderEnabled,
    backupReminderFreq, setBackupReminderFreq,
    lastExportDate
  } = useMoola();

  const getLastBackupText = () => {
    if (!lastExportDate) return 'Never';
    const lastExport = new Date(lastExportDate);
    const now = new Date();
    const daysDiff = Math.floor((now - lastExport) / (1000 * 60 * 60 * 24));
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Yesterday';
    return `${daysDiff} days ago`;
  };

  const Toggle = ({ active, onToggle }) => (
    <TouchableOpacity 
      onPress={onToggle} 
      style={{ width: 44, height: 24, borderRadius: 12, borderWidth: 1, borderColor: active ? t.soul : t.border, backgroundColor: active ? t.soulDim : 'transparent', justifyContent: 'center', paddingHorizontal: 2 }}
    >
      <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: active ? t.soul : t.muted, alignSelf: active ? 'flex-end' : 'flex-start' }} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: t.soulDim, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
          <CloudIcon color={t.soul} />
        </View>
        <Text style={{ fontSize: 13, color: t.sub, textAlign: 'center', fontStyle: 'italic', lineHeight: 20 }}>
          Keep your data safe with regular backups.
        </Text>
      </View>

      {/* Last Backup Info */}
      <View style={{ backgroundColor: t.card, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: t.border, marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 10, color: t.sub, letterSpacing: 1, marginBottom: 4 }}>LAST BACKUP</Text>
            <Text style={{ fontSize: 18, color: t.text, fontWeight: '300' }}>{getLastBackupText()}</Text>
          </View>
          <TouchableOpacity 
            onPress={onShowExport}
            style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: t.soul, borderRadius: 2 }}
          >
            <Text style={{ color: '#fff', fontSize: 11, letterSpacing: 1 }}>BACKUP NOW</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Enable/Disable Toggle */}
      <TouchableOpacity 
        onPress={() => setBackupReminderEnabled(!backupReminderEnabled)} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <BellIcon color={backupReminderEnabled ? t.soul : t.sub} />
          <View>
            <Text style={{ fontSize: 14, color: t.text }}>Backup Reminder</Text>
            <Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>
              {backupReminderEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>
        <Toggle active={backupReminderEnabled} onToggle={() => setBackupReminderEnabled(!backupReminderEnabled)} />
      </TouchableOpacity>

      {/* Frequency Selection */}
      {backupReminderEnabled && (
        <View style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}>
          <Text style={{ fontSize: 10, color: t.sub, letterSpacing: 1, marginBottom: 12 }}>REMIND ME</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              onPress={() => setBackupReminderFreq('weekly')}
              style={{ 
                flex: 1, paddingVertical: 12, 
                borderWidth: 1, 
                borderColor: backupReminderFreq === 'weekly' ? t.soul : t.border, 
                borderRadius: 2, 
                backgroundColor: backupReminderFreq === 'weekly' ? t.soulDim : 'transparent',
                alignItems: 'center'
              }}
            >
              <Text style={{ color: backupReminderFreq === 'weekly' ? t.soul : t.sub, fontSize: 12, letterSpacing: 1 }}>Weekly</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setBackupReminderFreq('monthly')}
              style={{ 
                flex: 1, paddingVertical: 12, 
                borderWidth: 1, 
                borderColor: backupReminderFreq === 'monthly' ? t.soul : t.border, 
                borderRadius: 2, 
                backgroundColor: backupReminderFreq === 'monthly' ? t.soulDim : 'transparent',
                alignItems: 'center'
              }}
            >
              <Text style={{ color: backupReminderFreq === 'monthly' ? t.soul : t.sub, fontSize: 12, letterSpacing: 1 }}>Monthly</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Info Box */}
      <View style={{ backgroundColor: t.soulDim, padding: 16, borderRadius: 4, marginTop: 32 }}>
        <Text style={{ fontSize: 12, color: t.text, fontWeight: '500', marginBottom: 8 }}>How it works</Text>
        <Text style={{ fontSize: 11, color: t.sub, lineHeight: 18, fontStyle: 'italic' }}>
          When your backup is overdue, you'll see a reminder banner on the main screen. Tap it to quickly export your data.
        </Text>
      </View>

      {/* Privacy Note */}
      <View style={{ backgroundColor: t.card, padding: 16, borderRadius: 4, marginTop: 16, borderWidth: 1, borderColor: t.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <ShieldIcon color={t.soul} />
          <Text style={{ fontSize: 12, color: t.text, fontWeight: '500' }}>Your data stays local</Text>
        </View>
        <Text style={{ fontSize: 11, color: t.sub, lineHeight: 18, fontStyle: 'italic' }}>
          Backups are exported as CSV files that you control. moola never uploads your data anywhere.
        </Text>
      </View>
    </ScrollView>
  );
};
