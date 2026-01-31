/**
 * SettingsName.js - User name editor
 * Simple form to update the displayed user name
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useMoola } from '../context/MoolaContext';

export const SettingsName = ({ editingName, setEditingName, onBack }) => {
  const { t, setName } = useMoola();

  const handleSave = () => {
    if (editingName.trim()) {
      setName(editingName.trim());
      onBack();
    }
  };

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 13, color: t.sub, marginBottom: 24, fontStyle: 'italic' }}>
        What shall we call you?
      </Text>
      <TextInput 
        value={editingName} 
        onChangeText={setEditingName} 
        placeholder="your name" 
        placeholderTextColor={t.sub} 
        autoFocus
        style={{ 
          fontSize: 22, padding: 16, borderBottomWidth: 1, borderBottomColor: t.border, 
          color: t.text, textAlign: 'center', fontStyle: 'italic' 
        }} 
      />
      <TouchableOpacity 
        onPress={handleSave} 
        disabled={!editingName.trim()}
        style={{ 
          marginTop: 40, paddingVertical: 14, backgroundColor: editingName.trim() ? t.soul : t.muted, 
          borderRadius: 2, alignItems: 'center' 
        }}
      >
        <Text style={{ color: editingName.trim() ? '#fff' : t.sub, fontSize: 12, letterSpacing: 2 }}>SAVE</Text>
      </TouchableOpacity>
    </View>
  );
};
