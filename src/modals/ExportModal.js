/**
 * ExportModal.js - Export expense data options
 * Supports share, copy to clipboard, and save as CSV
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { useMoola } from '../context/MoolaContext';
import { ShareIcon, CopyIcon, SaveIcon } from '../components/icons';
import { formatDate, getToday } from '../utils/date';

export const ExportModal = ({ visible, onClose }) => {
  const { 
    t, 
    expenses, 
    currency, 
    useEUFormat,
    updateLastExportDate 
  } = useMoola();

  const generateCSV = () => {
    const header = 'Date,Amount,Currency,Note,Recurring,Frequency\n';
    const rows = expenses.sort((a, b) => b.date.localeCompare(a.date)).map(e => {
      const formattedAmount = useEUFormat ? e.amount.toFixed(2).replace('.', ',') : e.amount.toFixed(2);
      return `${e.date},${formattedAmount},${currency.code},"${e.note || ''}",${e.recurring ? 'Yes' : 'No'},${e.freq || ''}`;
    }).join('\n');
    return header + rows;
  };

  const exportShare = async () => {
    try {
      const csv = generateCSV();
      const filepath = FileSystem.documentDirectory + `moola-export-${formatDate(getToday())}.csv`;
      await FileSystem.writeAsStringAsync(filepath, csv, { encoding: 'utf8' });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filepath, { mimeType: 'text/csv', dialogTitle: 'Export Expenses' });
        await updateLastExportDate();
      }
      onClose();
    } catch (error) { 
      console.log('Export error:', error); 
    }
  };

  const exportCopy = async () => {
    try {
      await Clipboard.setStringAsync(generateCSV());
      await updateLastExportDate();
      onClose();
    } catch (error) { 
      console.log('Copy error:', error); 
    }
  };

  const exportSave = async () => {
    try {
      const csv = generateCSV();
      const filepath = FileSystem.documentDirectory + `moola-export-${formatDate(getToday())}.csv`;
      await FileSystem.writeAsStringAsync(filepath, csv, { encoding: 'utf8' });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filepath, { 
          mimeType: 'text/csv', 
          dialogTitle: 'Save Expenses', 
          UTI: 'public.comma-separated-values-text' 
        });
        await updateLastExportDate();
      }
      onClose();
    } catch (error) { 
      console.log('Save error:', error); 
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity 
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={{ backgroundColor: t.card, borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 24, borderWidth: 1, borderColor: t.border, borderBottomWidth: 0 }}>
          <View style={{ width: 40, height: 4, backgroundColor: t.muted, borderRadius: 2, alignSelf: 'center', marginBottom: 24 }} />
          <Text style={{ fontSize: 15, color: t.text, marginBottom: 8, fontStyle: 'italic' }}>Export your records</Text>
          <Text style={{ fontSize: 11, color: t.sub, marginBottom: 20 }}>{expenses.length} expenses</Text>
          
          <TouchableOpacity onPress={exportShare} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderTopWidth: 1, borderTopColor: t.border }}>
            <ShareIcon color={t.soul} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: t.text }}>Share</Text>
              <Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>Send via email, message, airdrop</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={exportCopy} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderTopWidth: 1, borderTopColor: t.border }}>
            <CopyIcon color={t.soul} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: t.text }}>Copy to Clipboard</Text>
              <Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>Paste into any app</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={exportSave} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderTopWidth: 1, borderTopColor: t.border }}>
            <SaveIcon color={t.soul} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: t.text }}>Save as CSV</Text>
              <Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>Excel, Sheets, Numbers</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onClose} style={{ marginTop: 20, padding: 14, backgroundColor: t.muted, borderRadius: 2, alignItems: 'center' }}>
            <Text style={{ color: t.sub, fontSize: 11, letterSpacing: 1 }}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
