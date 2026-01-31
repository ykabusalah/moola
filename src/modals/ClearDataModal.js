/**
 * ClearDataModal.js - Confirmation dialog for deleting all data
 * Warns user and requires confirmation before clearing expenses
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useMoola } from '../context/MoolaContext';
import { TrashIcon } from '../components/icons';

export const ClearDataModal = ({ visible, onClose, onConfirm }) => {
  const { t, dark, expenses, clearAllData } = useMoola();

  const handleClear = async () => {
    await clearAllData();
    onConfirm();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={{ backgroundColor: t.card, borderRadius: 8, width: '100%', maxWidth: 300, padding: 24, borderWidth: 1, borderColor: t.border }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <TrashIcon color={dark ? '#c08080' : '#906060'} />
            <Text style={{ fontSize: 16, color: t.text, marginTop: 16, fontWeight: '500' }}>Clear All Data?</Text>
            <Text style={{ fontSize: 13, color: t.sub, marginTop: 8, textAlign: 'center', lineHeight: 20, fontStyle: 'italic' }}>
              This will permanently delete all {expenses.length} expense records. This action cannot be undone.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              onPress={onClose} 
              style={{ flex: 1, padding: 12, borderWidth: 1, borderColor: t.border, borderRadius: 2, alignItems: 'center' }}
            >
              <Text style={{ color: t.sub, fontSize: 12, letterSpacing: 1 }}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleClear} 
              style={{ flex: 1, padding: 12, backgroundColor: dark ? '#6b4040' : '#c49090', borderRadius: 2, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: 12, letterSpacing: 1 }}>DELETE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
