/**
 * SettingsMain.js - Main settings menu
 * Lists all settings categories: profile, security, reminders, appearance, data, etc.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useMoola } from '../context/MoolaContext';
import { SketchCircle } from '../components/ui';
import { 
  ChevronIcon, LockIcon, BellIcon, CloudIcon, ExportIcon, 
  TrashIcon, ShieldIcon, InfoIcon, MessageIcon, CoffeeIcon, HeartIcon 
} from '../components/icons';
import { SUPPORT_LINK, FEEDBACK_LINK } from '../constants/config';

export const SettingsMain = ({ onNavigate, onShowExport, onShowClearConfirm, setEditingName }) => {
  const { 
    t, dark,
    name, setDark,
    lockMethod,
    dailyReminderEnabled, dailyReminderTime,
    backupReminderEnabled, backupReminderFreq,
    currency, accentColor,
    useEUFormat, setUseEUFormat,
    hideDecimals, setHideDecimals,
    expenses
  } = useMoola();

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
      {/* Profile Section */}
      <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 16, marginTop: 8 }}>PROFILE</Text>
      
      <TouchableOpacity 
        onPress={() => { setEditingName(name); onNavigate('name'); }} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Text style={{ fontSize: 16, color: t.soul }}>✦</Text>
          <Text style={{ fontSize: 14, color: t.text }}>Name</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 13, color: t.sub, fontStyle: 'italic' }}>{name}</Text>
          <ChevronIcon color={t.sub} />
        </View>
      </TouchableOpacity>

      {/* Security Section */}
      <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 16, marginTop: 32 }}>SECURITY</Text>

      <TouchableOpacity 
        onPress={() => onNavigate('security')} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <LockIcon color={t.soul} />
          <View>
            <Text style={{ fontSize: 14, color: t.text }}>App Lock</Text>
            <Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>
              {lockMethod === 'none' ? 'Disabled' : 'PIN enabled'}
            </Text>
          </View>
        </View>
        <ChevronIcon color={t.sub} />
      </TouchableOpacity>

      {/* Reminders Section */}
      <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 16, marginTop: 32 }}>REMINDERS</Text>

      <TouchableOpacity 
        onPress={() => onNavigate('reminders')} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <BellIcon color={t.soul} />
          <View>
            <Text style={{ fontSize: 14, color: t.text }}>Daily Reminder</Text>
            <Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>
              {dailyReminderEnabled ? `${dailyReminderTime.getHours()}:${String(dailyReminderTime.getMinutes()).padStart(2, '0')}` : 'Disabled'}
            </Text>
          </View>
        </View>
        <ChevronIcon color={t.sub} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => onNavigate('backup')} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <CloudIcon color={t.soul} />
          <View>
            <Text style={{ fontSize: 14, color: t.text }}>Backup Reminder</Text>
            <Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>
              {backupReminderEnabled ? `Every ${backupReminderFreq === 'weekly' ? 'week' : 'month'}` : 'Disabled'}
            </Text>
          </View>
        </View>
        <ChevronIcon color={t.sub} />
      </TouchableOpacity>

      {/* Appearance Section */}
      <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 16, marginTop: 32 }}>APPEARANCE</Text>
      
      <TouchableOpacity 
        onPress={() => setDark(!dark)} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Text style={{ fontSize: 18, color: dark ? '#fff' : t.ink }}>☾</Text>
          <Text style={{ fontSize: 14, color: t.text }}>Dark Mode</Text>
        </View>
        <Toggle active={dark} onToggle={() => setDark(!dark)} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => onNavigate('accent')} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: t.soul }} />
          <Text style={{ fontSize: 14, color: t.text }}>Accent Color</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 13, color: t.sub }}>{accentColor.name}</Text>
          <ChevronIcon color={t.sub} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => onNavigate('currency')} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Text style={{ fontSize: 16, color: t.soul }}>{currency.symbol}</Text>
          <Text style={{ fontSize: 14, color: t.text }}>Currency</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 13, color: t.sub }}>{currency.code}</Text>
          <ChevronIcon color={t.sub} />
        </View>
      </TouchableOpacity>

      {/* Number Format Section */}
      <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 16, marginTop: 32 }}>NUMBER FORMAT</Text>

      <TouchableOpacity 
        onPress={() => setUseEUFormat(!useEUFormat)} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Text style={{ fontSize: 14, color: t.sub, width: 18, textAlign: 'center' }}>#</Text>
          <View>
            <Text style={{ fontSize: 14, color: t.text }}>European Format</Text>
            <Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>{useEUFormat ? '1.234,56' : '1,234.56'}</Text>
          </View>
        </View>
        <Toggle active={useEUFormat} onToggle={() => setUseEUFormat(!useEUFormat)} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => setHideDecimals(!hideDecimals)} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Text style={{ fontSize: 14, color: t.sub, width: 18, textAlign: 'center' }}>.00</Text>
          <View>
            <Text style={{ fontSize: 14, color: t.text }}>Hide Decimals</Text>
            <Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>{hideDecimals ? '$5' : '$5.00'}</Text>
          </View>
        </View>
        <Toggle active={hideDecimals} onToggle={() => setHideDecimals(!hideDecimals)} />
      </TouchableOpacity>

      {/* Data Section */}
      <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 16, marginTop: 32 }}>DATA</Text>

      <TouchableOpacity 
        onPress={onShowExport} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <ExportIcon color={t.soul} />
          <View>
            <Text style={{ fontSize: 14, color: t.text }}>Export Data</Text>
            <Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>{expenses.length} records</Text>
          </View>
        </View>
        <ChevronIcon color={t.sub} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={onShowClearConfirm} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <TrashIcon color={dark ? '#c08080' : '#906060'} />
          <View>
            <Text style={{ fontSize: 14, color: dark ? '#c08080' : '#906060' }}>Clear All Data</Text>
            <Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>This cannot be undone</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Information Section */}
      <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 16, marginTop: 32 }}>INFORMATION</Text>

      <TouchableOpacity 
        onPress={() => onNavigate('privacy')} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <ShieldIcon color={t.soul} />
          <Text style={{ fontSize: 14, color: t.text }}>Privacy Policy</Text>
        </View>
        <ChevronIcon color={t.sub} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => onNavigate('about')} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <InfoIcon color={t.soul} />
          <Text style={{ fontSize: 14, color: t.text }}>About moola</Text>
        </View>
        <ChevronIcon color={t.sub} />
      </TouchableOpacity>

      {/* Support Section */}
      <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 16, marginTop: 32 }}>SUPPORT</Text>

      <TouchableOpacity 
        onPress={() => Linking.openURL(FEEDBACK_LINK)} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <MessageIcon color={t.soul} />
          <View>
            <Text style={{ fontSize: 14, color: t.text }}>Send Feedback</Text>
            <Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>Help us improve moola</Text>
          </View>
        </View>
        <ChevronIcon color={t.sub} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => Linking.openURL(SUPPORT_LINK)} 
        style={{ 
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
          paddingVertical: 16, paddingHorizontal: 16, marginTop: 12,
          backgroundColor: t.soulDim, borderRadius: 4,
          borderWidth: 1, borderColor: t.soul, borderStyle: 'dashed'
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <CoffeeIcon color={t.soul} />
          <View>
            <Text style={{ fontSize: 14, color: t.text }}>Buy me a coffee</Text>
            <Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>Support moola's development</Text>
          </View>
        </View>
        <HeartIcon color={t.soul} />
      </TouchableOpacity>

      <Text style={{ fontSize: 11, color: t.sub, marginTop: 16, textAlign: 'center', fontStyle: 'italic', lineHeight: 18 }}>
        moola is free and always will be.{'\n'}Your support helps keep it that way.
      </Text>

      <View style={{ paddingVertical: 40, alignItems: 'center' }}>
        <SketchCircle size={40} color={t.muted} />
        <Text style={{ fontSize: 11, color: t.muted, marginTop: 12, fontStyle: 'italic' }}>v1.0.0</Text>
      </View>
    </ScrollView>
  );
};
