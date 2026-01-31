/**
 * AddExpenseModal.js - Add/edit expense form
 * Handles amount, note, date, and recurring expense options
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMoola } from '../context/MoolaContext';
import { formatDate, formatDisplayDate, getToday } from '../utils/date';

export const AddExpenseModal = ({ visible, onClose, editingExpense }) => {
  const { 
    t, dark, currency, todayStr,
    expenses, setExpenses,
  } = useMoola();

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFreq, setRecurringFreq] = useState('monthly');
  const [expenseDate, setExpenseDate] = useState(getToday());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successAmount, setSuccessAmount] = useState('');

  // Reset form when modal opens/closes or editingExpense changes
  useEffect(() => {
    if (visible) {
      if (editingExpense) {
        setAmount(editingExpense.amount.toString());
        setNote(editingExpense.note || '');
        setIsRecurring(editingExpense.recurring || false);
        setRecurringFreq(editingExpense.freq || 'monthly');
        setExpenseDate(new Date(editingExpense.date + 'T00:00:00'));
      } else {
        setAmount('');
        setNote('');
        setIsRecurring(false);
        setRecurringFreq('monthly');
        setExpenseDate(getToday());
      }
      setShowSuccess(false);
    }
  }, [visible, editingExpense]);

  const handleClose = () => {
    setShowDatePicker(false);
    onClose();
  };

  const saveExpense = () => {
    if (!amount) return;
    
    const savedAmount = parseFloat(amount).toFixed(2);
    const dateStr = formatDate(expenseDate);
    
    const nextDueDate = new Date(expenseDate);
    if (recurringFreq === 'weekly') nextDueDate.setDate(nextDueDate.getDate() + 7);
    else if (recurringFreq === 'monthly') nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    else if (recurringFreq === 'yearly') nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);

    if (editingExpense) {
      setExpenses(expenses.map(e => e.id === editingExpense.id ? { 
        ...e, 
        amount: parseFloat(amount), 
        note, 
        date: dateStr, 
        recurring: isRecurring, 
        freq: recurringFreq, 
        nextDue: isRecurring ? formatDate(nextDueDate) : null 
      } : e));
      handleClose();
    } else {
      setExpenses([{ 
        id: Date.now(), 
        amount: parseFloat(amount), 
        note, 
        date: dateStr, 
        recurring: isRecurring, 
        freq: isRecurring ? recurringFreq : null, 
        nextDue: isRecurring ? formatDate(nextDueDate) : null 
      }, ...expenses]);
      
      setSuccessAmount(savedAmount);
      setShowSuccess(true);
      setTimeout(() => { 
        setShowSuccess(false); 
        handleClose();
      }, 1600);
    }
  };

  const deleteExpense = () => {
    if (editingExpense) {
      setExpenses(expenses.filter(e => e.id !== editingExpense.id));
      handleClose();
    }
  };

  return (
    <Modal visible={visible} animationType="fade">
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <SafeAreaView style={{ flex: 1 }}>
          {showSuccess ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 }}>
              <Svg width={64} height={64} viewBox="0 0 64 64" style={{ marginBottom: 24 }}>
                <Circle cx={32} cy={32} r={28} stroke={t.soul} strokeWidth={2} fill="none" />
                <Path d="M20 32 L28 40 L44 24" stroke={t.soul} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={{ fontSize: 28, fontWeight: '300', color: t.text }}>{currency.symbol}{successAmount}</Text>
              <Text style={{ fontSize: 13, color: t.sub, marginTop: 8, fontStyle: 'italic' }}>added to your records</Text>
            </View>
          ) : (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 28, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                <Text style={{ fontSize: 13, color: t.text, letterSpacing: 2, fontStyle: 'italic' }}>{editingExpense ? 'edit record' : 'new record'}</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Text style={{ fontSize: 20, color: t.sub }}>×</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 8 }}>AMOUNT</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 32 }}>
                <Text style={{ fontSize: 32, color: t.sub }}>{currency.symbol}</Text>
                <TextInput 
                  value={amount} 
                  onChangeText={setAmount} 
                  placeholder="0.00" 
                  placeholderTextColor={t.muted} 
                  keyboardType="decimal-pad" 
                  autoFocus 
                  style={{ fontSize: 44, fontWeight: '300', color: t.text, flex: 1 }} 
                />
              </View>
              
              <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 8 }}>NOTE <Text style={{ fontStyle: 'italic' }}>(optional)</Text></Text>
              <TextInput 
                value={note} 
                onChangeText={setNote} 
                placeholder="what was this for?" 
                placeholderTextColor={t.muted} 
                style={{ fontSize: 15, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.border, color: t.text, fontStyle: 'italic', marginBottom: 24 }} 
              />
              
              <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 8 }}>DATE</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.border, marginBottom: 24 }}>
                <Text style={{ fontSize: 15, color: t.text }}>{formatDate(expenseDate) === todayStr ? 'Today' : formatDisplayDate(expenseDate)}</Text>
              </TouchableOpacity>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderTopWidth: 1, borderTopColor: t.border }}>
                <View>
                  <Text style={{ fontSize: 14, color: t.text }}>Recurring</Text>
                  <Text style={{ fontSize: 10, color: t.sub, marginTop: 4, fontStyle: 'italic' }}>repeats automatically</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setIsRecurring(!isRecurring)} 
                  style={{ width: 44, height: 24, borderRadius: 12, borderWidth: 1, borderColor: isRecurring ? t.soul : t.border, backgroundColor: isRecurring ? t.soulDim : 'transparent', justifyContent: 'center', paddingHorizontal: 2 }}
                >
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: isRecurring ? t.soul : t.muted, alignSelf: isRecurring ? 'flex-end' : 'flex-start' }} />
                </TouchableOpacity>
              </View>
              
              {isRecurring && (
                <View style={{ paddingVertical: 18, borderTopWidth: 1, borderTopColor: t.border }}>
                  <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 12 }}>FREQUENCY</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {['weekly', 'monthly', 'yearly'].map(f => (
                      <TouchableOpacity 
                        key={f} 
                        onPress={() => setRecurringFreq(f)} 
                        style={{ paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: recurringFreq === f ? t.soul : t.border, borderRadius: 2, backgroundColor: recurringFreq === f ? t.soulDim : 'transparent' }}
                      >
                        <Text style={{ color: recurringFreq === f ? t.soul : t.sub, fontSize: 10, letterSpacing: 1 }}>{f}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              
              <View style={{ paddingTop: 24, flexDirection: 'row', gap: 12 }}>
                {editingExpense && (
                  <TouchableOpacity onPress={deleteExpense} style={{ paddingVertical: 12, paddingHorizontal: 18, borderWidth: 1, borderColor: dark ? '#6b4040' : '#c49090', borderRadius: 2 }}>
                    <Text style={{ color: dark ? '#c08080' : '#906060', fontSize: 11, letterSpacing: 1 }}>DELETE</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  onPress={saveExpense} 
                  disabled={!amount} 
                  style={{ flex: 1, padding: 14, backgroundColor: amount ? t.soul : t.muted, borderRadius: 2, alignItems: 'center' }}
                >
                  <Text style={{ color: amount ? '#fff' : t.sub, fontSize: 11, letterSpacing: 2 }}>{editingExpense ? 'SAVE' : 'ADD'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
        
        <Modal visible={showDatePicker} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <View style={{ backgroundColor: t.card, borderRadius: 12, width: '100%', maxWidth: 320, borderWidth: 1, borderColor: t.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: t.border }}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={{ color: t.sub, fontSize: 14 }}>Cancel</Text>
                </TouchableOpacity>
                <Text style={{ color: t.text, fontSize: 15, fontWeight: '500' }}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={{ color: t.soul, fontSize: 14, fontWeight: '500' }}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker 
                value={expenseDate} 
                mode="date" 
                display="spinner" 
                maximumDate={getToday()} 
                onChange={(event, selectedDate) => { if (selectedDate) setExpenseDate(selectedDate); }} 
                themeVariant={dark ? 'dark' : 'light'} 
                style={{ height: 180 }} 
              />
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};
