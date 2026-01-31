/**
 * SettingsReminders.js - Daily reminder settings
 * Toggle and configure daily expense logging notifications
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMoola } from '../context/MoolaContext';
import { BellIcon, ClockIcon, ChevronIcon } from '../components/icons';

export const SettingsReminders = () => {
  const { 
    t, dark,
    dailyReminderEnabled, 
    dailyReminderTime, setDailyReminderTime,
    toggleDailyReminder
  } = useMoola();

  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
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
          <BellIcon color={t.soul} />
        </View>
        <Text style={{ fontSize: 13, color: t.sub, textAlign: 'center', fontStyle: 'italic', lineHeight: 20 }}>
          Get a gentle nudge to log your daily expenses.
        </Text>
      </View>

      {/* Enable/Disable Toggle */}
      <TouchableOpacity 
        onPress={() => toggleDailyReminder(!dailyReminderEnabled)} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <BellIcon color={dailyReminderEnabled ? t.soul : t.sub} />
          <View>
            <Text style={{ fontSize: 14, color: t.text }}>Daily Reminder</Text>
            <Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>
              {dailyReminderEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>
        <Toggle active={dailyReminderEnabled} onToggle={() => toggleDailyReminder(!dailyReminderEnabled)} />
      </TouchableOpacity>

      {/* Time Picker */}
      {dailyReminderEnabled && (
        <>
          <TouchableOpacity 
            onPress={() => setShowReminderTimePicker(true)} 
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <ClockIcon color={t.soul} />
              <View>
                <Text style={{ fontSize: 14, color: t.text }}>Reminder Time</Text>
                <Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>
                  When to remind you
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 14, color: t.soul, fontWeight: '500' }}>{formatTime(dailyReminderTime)}</Text>
              <ChevronIcon color={t.sub} />
            </View>
          </TouchableOpacity>

          {/* Time Picker Modal */}
          <Modal visible={showReminderTimePicker} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
              <View style={{ backgroundColor: t.card, borderRadius: 12, width: '100%', maxWidth: 320, borderWidth: 1, borderColor: t.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: t.border }}>
                  <TouchableOpacity onPress={() => setShowReminderTimePicker(false)}>
                    <Text style={{ color: t.sub, fontSize: 14 }}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={{ color: t.text, fontSize: 15, fontWeight: '500' }}>Set Time</Text>
                  <TouchableOpacity onPress={() => setShowReminderTimePicker(false)}>
                    <Text style={{ color: t.soul, fontSize: 14, fontWeight: '500' }}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker 
                  value={dailyReminderTime} 
                  mode="time" 
                  display="spinner" 
                  onChange={(event, selectedDate) => { if (selectedDate) setDailyReminderTime(selectedDate); }} 
                  themeVariant={dark ? 'dark' : 'light'} 
                  style={{ height: 180 }} 
                />
              </View>
            </View>
          </Modal>
        </>
      )}

      {/* Info Box */}
      <View style={{ backgroundColor: t.soulDim, padding: 16, borderRadius: 4, marginTop: 32 }}>
        <Text style={{ fontSize: 12, color: t.text, fontWeight: '500', marginBottom: 8 }}>How it works</Text>
        <Text style={{ fontSize: 11, color: t.sub, lineHeight: 18, fontStyle: 'italic' }}>
          You'll receive a notification at your chosen time each day reminding you to log your expenses. Perfect for building a daily habit.
        </Text>
      </View>

      {/* Preview */}
      {dailyReminderEnabled && (
        <View style={{ marginTop: 24, backgroundColor: t.card, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: t.border }}>
          <Text style={{ fontSize: 10, color: t.sub, letterSpacing: 1, marginBottom: 8 }}>NOTIFICATION PREVIEW</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: t.soulDim, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 16 }}>✦</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: t.text, fontWeight: '500' }}>moola</Text>
              <Text style={{ fontSize: 12, color: t.sub, marginTop: 2 }}>Time to log your expenses ✦</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};
