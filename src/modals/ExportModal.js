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
    const formatAmount = (amount) => useEUFormat ? amount.toFixed(2).replace('.', ',') : amount.toFixed(2);
    
    // Sort expenses by date descending
    const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
    
    // Individual expenses section (6 columns)
    let csv = 'INDIVIDUAL EXPENSES,,,,,\n';
    csv += 'Date,Amount,Currency,Note,Recurring,Frequency\n';
    csv += sorted.map(e => {
      return `${e.date},${formatAmount(e.amount)},${currency.code},"${e.note || ''}",${e.recurring ? 'Yes' : 'No'},${e.freq || ''}`;
    }).join('\n');
    
    // Calculate daily totals
    const dailyTotals = {};
    expenses.forEach(e => {
      dailyTotals[e.date] = (dailyTotals[e.date] || 0) + e.amount;
    });
    
    // Calculate monthly totals
    const monthlyTotals = {};
    expenses.forEach(e => {
      const month = e.date.substring(0, 7); // YYYY-MM
      monthlyTotals[month] = (monthlyTotals[month] || 0) + e.amount;
    });
    
    // Calculate yearly totals
    const yearlyTotals = {};
    expenses.forEach(e => {
      const year = e.date.substring(0, 4); // YYYY
      yearlyTotals[year] = (yearlyTotals[year] || 0) + e.amount;
    });
    
    // Daily totals section (3 columns, padded to 6)
    csv += '\n\nDAILY TOTALS,,,,,\n';
    csv += 'Date,Total,Currency,,,\n';
    csv += Object.entries(dailyTotals)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, total]) => `${date},${formatAmount(total)},${currency.code},,,`)
      .join('\n');
    
    // Monthly totals section (3 columns, padded to 6)
    csv += '\n\nMONTHLY TOTALS,,,,,\n';
    csv += 'Month,Total,Currency,,,\n';
    csv += Object.entries(monthlyTotals)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([month, total]) => `${month},${formatAmount(total)},${currency.code},,,`)
      .join('\n');
    
    // Yearly totals section (3 columns, padded to 6)
    csv += '\n\nYEARLY TOTALS,,,,,\n';
    csv += 'Year,Total,Currency,,,\n';
    csv += Object.entries(yearlyTotals)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([year, total]) => `${year},${formatAmount(total)},${currency.code},,,`)
      .join('\n');
    
    // Grand total (padded to 6)
    const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    csv += '\n\nGRAND TOTAL,,,,,\n';
    csv += `Total,${formatAmount(grandTotal)},${currency.code},,,`;
    
    return csv;
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