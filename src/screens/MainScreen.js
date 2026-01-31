/**
 * MainScreen.js - Primary dashboard showing expenses
 * Displays totals, time progress, expense list, and period selector
 * Contains FAB for adding expenses and triggers for all modals
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useMoola } from '../context/MoolaContext';
import { Divider } from '../components/ui';
import { ExportIcon, SettingsIcon, CloudIcon } from '../components/icons';
import { formatDate, formatHeaderDate, getToday } from '../utils/date';

import { SettingsModal } from '../settings/SettingsModal';
import { ExportModal } from '../modals/ExportModal';
import { AddExpenseModal } from '../modals/AddExpenseModal';
import { ClearDataModal } from '../modals/ClearDataModal';
import { PinSetupModal } from '../modals/PinSetupModal';

export const MainScreen = () => {
  const { 
    t, dark, currency,
    period, setPeriod,
    expenses,
    formatAmount, formatLargeAmount,
    isBackupOverdue, getBackupOverdueMessage,
    getData, getDaysUntil,
  } = useMoola();

  // Local UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expandedDates, setExpandedDates] = useState({});

  const todayStr = formatDate(getToday());

  // ============================================
  // TIME PROGRESS CALCULATION
  // ============================================
  
  const getTimeProgress = () => {
    const now = new Date();
    if (period === 'today') {
      return (now.getHours() + now.getMinutes() / 60) / 24;
    }
    if (period === 'week') {
      const dayOfWeek = now.getDay();
      return (dayOfWeek + (now.getHours() + now.getMinutes() / 60) / 24) / 7;
    }
    if (period === 'month') {
      const dayOfMonth = now.getDate();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return (dayOfMonth - 1 + (now.getHours() + now.getMinutes() / 60) / 24) / daysInMonth;
    }
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
    const daysInYear = ((now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) || now.getFullYear() % 400 === 0) ? 366 : 365;
    return dayOfYear / daysInYear;
  };

  const timeProgress = getTimeProgress();
  const { items, total } = getData();
  const spendingTotal = items.filter(e => !e.recurring).reduce((s, e) => s + e.amount, 0);

  const groupByDate = (list) => {
    const groups = {};
    list.forEach(item => {
      if (!groups[item.date]) groups[item.date] = { items: [], total: 0 };
      groups[item.date].items.push(item);
      groups[item.date].total += item.amount;
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const toggleDate = (date) => setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));

  const openAdd = () => {
    setEditingExpense(null);
    setShowAdd(true);
  };

  const openEdit = (e) => {
    setEditingExpense(e);
    setShowAdd(true);
  };

  const openSettings = () => {
    setShowSettings(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Header */}
          <View style={{ padding: 24, paddingTop: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontSize: 10, color: t.sub, letterSpacing: 2, fontStyle: 'italic' }}>
                {period === 'today' ? formatHeaderDate(getToday()) : period === 'week' ? 'This Week' : period === 'month' ? `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][getToday().getMonth()]} ${getToday().getFullYear()}` : `Year ${getToday().getFullYear()}`}
              </Text>
              <Text style={{ fontSize: 42, fontWeight: '300', marginTop: 8, color: t.text, letterSpacing: -1 }}>
                {currency.symbol}{formatLargeAmount(total).whole}{!formatLargeAmount(total).decimal ? null : <Text style={{ fontSize: 20, color: t.sub, fontWeight: '300' }}>{formatLargeAmount(total).separator}{formatLargeAmount(total).decimal}</Text>}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowExport(true)} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: t.border, justifyContent: 'center', alignItems: 'center' }}>
                <ExportIcon color={t.sub} />
              </TouchableOpacity>
              <TouchableOpacity onPress={openSettings} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: t.border, justifyContent: 'center', alignItems: 'center' }}>
                <SettingsIcon color={t.sub} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Backup Reminder Banner */}
          {isBackupOverdue() && (
            <TouchableOpacity 
              onPress={() => setShowExport(true)}
              style={{ 
                marginHorizontal: 24, marginBottom: 16, padding: 14, 
                backgroundColor: dark ? '#3a3020' : '#fdf8e8', 
                borderRadius: 8, borderWidth: 1, 
                borderColor: dark ? '#5a4830' : '#e8d8a8',
                flexDirection: 'row', alignItems: 'center', gap: 12
              }}
            >
              <CloudIcon color={dark ? '#d4a840' : '#a08020'} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: dark ? '#e8d090' : '#705810', fontWeight: '500' }}>Backup Reminder</Text>
                <Text style={{ fontSize: 11, color: dark ? '#b0a070' : '#a09060', marginTop: 2, fontStyle: 'italic' }}>{getBackupOverdueMessage()}</Text>
              </View>
              <View style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: dark ? '#5a4830' : '#e8d8a8', borderRadius: 2 }}>
                <Text style={{ color: dark ? '#e8d090' : '#705810', fontSize: 10, letterSpacing: 1 }}>EXPORT</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Time Progress Visualizations */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 20 }}>
            {period === 'today' && (
              <View>
                <Svg width="100%" height={24} viewBox="0 0 300 24" preserveAspectRatio="none">
                  <Path d="M0,12 Q75,8 150,12 T300,12" stroke={t.muted} strokeWidth={2} fill="none" />
                  <Path d={`M0,12 Q${37.5 * Math.min(timeProgress * 4, 1)},${8 + (1 - Math.min(timeProgress * 4, 1)) * 4} ${75 * Math.min(timeProgress * 2, 1)},12 ${timeProgress > 0.5 ? `T${150 * Math.min(timeProgress * 1.33, 1)},12` : ''} ${timeProgress > 0.75 ? `T${timeProgress * 300},12` : ''}`} stroke={t.soul} strokeWidth={3} fill="none" strokeLinecap="round" />
                  <Circle cx={Math.max(8, timeProgress * 292)} cy={12} r={5} fill={t.soul} opacity={0.9} />
                  <Circle cx={Math.max(8, timeProgress * 292)} cy={12} r={8} fill={t.soul} opacity={0.2} />
                </Svg>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 1, fontStyle: 'italic' }}>{Math.round(timeProgress * 24)}h into today</Text>
                  <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 1, fontStyle: 'italic' }}>{formatAmount(spendingTotal, true)} spent</Text>
                </View>
              </View>
            )}

            {period === 'week' && (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 32, marginBottom: 6 }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                    const dayProgress = i < Math.floor(timeProgress * 7) ? 1 : i === Math.floor(timeProgress * 7) ? (timeProgress * 7) % 1 : 0;
                    return (
                      <View key={i} style={{ flex: 1, alignItems: 'center', marginHorizontal: 2 }}>
                        <View style={{ width: '100%', height: 24, backgroundColor: t.muted, borderRadius: 3, overflow: 'hidden', justifyContent: 'flex-end' }}>
                          <View style={{ width: '100%', height: `${dayProgress * 100}%`, backgroundColor: t.soul, borderRadius: 3 }} />
                        </View>
                      </View>
                    );
                  })}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 8, color: i <= Math.floor(timeProgress * 7) ? t.soul : t.sub, fontStyle: 'italic' }}>{day}</Text>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 1, fontStyle: 'italic' }}>day {Math.floor(timeProgress * 7) + 1} of 7</Text>
                  <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 1, fontStyle: 'italic' }}>{currency.symbol}{spendingTotal.toFixed(0)} spent</Text>
                </View>
              </View>
            )}

            {period === 'month' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <Svg width={64} height={64} viewBox="0 0 64 64">
                  <Path d="M32,8 A24,24 0 0,1 56,32 A20,20 0 0,1 36,52 A16,16 0 0,1 20,36 A12,12 0 0,1 32,24 A8,8 0 0,1 40,32" 
                    stroke={t.muted} strokeWidth={3} fill="none" strokeLinecap="round" />
                  <Path d="M32,8 A24,24 0 0,1 56,32 A20,20 0 0,1 36,52 A16,16 0 0,1 20,36 A12,12 0 0,1 32,24 A8,8 0 0,1 40,32" 
                    stroke={t.soul} strokeWidth={3} fill="none" strokeLinecap="round"
                    strokeDasharray={`${timeProgress * 126} 126`} />
                </Svg>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: '300', color: t.text }}>Day {new Date().getDate()}</Text>
                  <Text style={{ fontSize: 10, color: t.sub, marginTop: 4, fontStyle: 'italic' }}>of {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()} days</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 18, fontWeight: '300', color: t.soul }}>{formatAmount(spendingTotal, true)}</Text>
                  <Text style={{ fontSize: 10, color: t.sub, marginTop: 4, fontStyle: 'italic' }}>spent</Text>
                </View>
              </View>
            )}

            {period === 'year' && (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((month, i) => {
                    const currentMonth = new Date().getMonth();
                    const isPast = i < currentMonth;
                    const isCurrent = i === currentMonth;
                    const monthProgress = isCurrent ? new Date().getDate() / new Date(new Date().getFullYear(), i + 1, 0).getDate() : 0;
                    return (
                      <View key={i} style={{ flex: 1, marginHorizontal: 1 }}>
                        <View style={{ height: 16, backgroundColor: t.muted, borderRadius: 2, overflow: 'hidden' }}>
                          {(isPast || isCurrent) && (
                            <View style={{ width: isPast ? '100%' : `${monthProgress * 100}%`, height: '100%', backgroundColor: t.soul, borderRadius: 2 }} />
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((month, i) => (
                    <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 7, color: i <= new Date().getMonth() ? t.soul : t.sub, fontStyle: 'italic' }}>{month}</Text>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 1, fontStyle: 'italic' }}>month {new Date().getMonth() + 1} of 12</Text>
                  <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 1, fontStyle: 'italic' }}>{currency.symbol}{spendingTotal.toFixed(0)} spent</Text>
                </View>
              </View>
            )}
          </View>

          {/* Period selector */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 24, flexDirection: 'row', gap: 10 }}>
            {['today', 'week', 'month', 'year'].map(p => (
              <TouchableOpacity key={p} onPress={() => setPeriod(p)} style={{ paddingVertical: 9, paddingHorizontal: 14, borderWidth: period === p ? 1.5 : 1, borderColor: period === p ? t.soul : t.border, borderRadius: 2 }}>
                <Text style={{ color: period === p ? t.soul : t.sub, fontSize: 10, letterSpacing: 1, fontStyle: 'italic' }}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ paddingHorizontal: 24 }}><Divider color={t.border} /></View>

          {/* Expense list */}
          <View style={{ padding: 24, paddingTop: 16 }}>
            {period === 'today' ? (
              items.length > 0 ? items.map(e => (
                <TouchableOpacity key={e.id} onPress={() => openEdit(e)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {e.recurring && <Text style={{ fontSize: 11, color: t.soul }}>↻</Text>}
                      <Text style={{ fontSize: 14, color: e.note ? t.text : t.sub, fontStyle: e.note ? 'normal' : 'italic' }}>{e.note || 'unmarked'}</Text>
                    </View>
                    {e.recurring && e.nextDue && <Text style={{ marginTop: 4, marginLeft: 19, fontSize: 10, color: t.soul, fontStyle: 'italic' }}>{getDaysUntil(e.nextDue)}</Text>}
                  </View>
                  <Text style={{ fontSize: 15, color: t.text }}>{formatAmount(e.amount)}</Text>
                </TouchableOpacity>
              )) : (
                <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                  <Svg width={40} height={40} viewBox="0 0 40 40" style={{ marginBottom: 16, opacity: 0.3 }}>
                    <Circle cx={20} cy={20} r={15} stroke={t.sub} strokeWidth={1} fill="none" strokeDasharray="3 3" />
                  </Svg>
                  <Text style={{ color: t.sub, fontSize: 13, fontStyle: 'italic' }}>the void awaits your first mark</Text>
                </View>
              )
            ) : (
              groupByDate(items).map(([date, group]) => (
                <View key={date}>
                  <TouchableOpacity onPress={() => toggleDate(date)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.border }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Svg width={10} height={10} viewBox="0 0 10 10" style={{ transform: [{ rotate: expandedDates[date] ? '90deg' : '0deg' }] }}>
                        <Path d="M3,1 L7,5 L3,9" stroke={t.sub} strokeWidth={1.5} fill="none" />
                      </Svg>
                      <Text style={{ fontSize: 12, color: t.text, letterSpacing: 1 }}>{date.split('-')[1]}-{date.split('-')[2]}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: t.sub, fontStyle: 'italic' }}>{formatAmount(group.total)}</Text>
                  </TouchableOpacity>
                  {expandedDates[date] && group.items.map(e => (
                    <TouchableOpacity key={e.id} onPress={() => openEdit(e)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingLeft: 20, borderBottomWidth: 1, borderBottomColor: t.border, borderStyle: 'dashed', backgroundColor: t.card }}>
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          {e.recurring && <Text style={{ fontSize: 10, color: t.soul }}>↻</Text>}
                          <Text style={{ fontSize: 13, color: e.note ? t.text : t.sub, fontStyle: e.note ? 'normal' : 'italic' }}>{e.note || 'unmarked'}</Text>
                        </View>
                        {e.recurring && e.nextDue && <Text style={{ marginTop: 3, marginLeft: 16, fontSize: 9, color: t.soul, fontStyle: 'italic' }}>{getDaysUntil(e.nextDue)}</Text>}
                      </View>
                      <Text style={{ fontSize: 13, color: t.text }}>{formatAmount(e.amount)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))
            )}
          </View>

          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: t.muted, letterSpacing: 4, fontWeight: '300' }}>moola</Text>
          </View>
        </ScrollView>

        {/* FAB */}
        {!showAdd && !showExport && !showSettings && (
          <TouchableOpacity onPress={openAdd} style={{ position: 'absolute', bottom: 40, right: 24, width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: t.border, justifyContent: 'center', alignItems: 'center', backgroundColor: t.bg }}>
            <Text style={{ color: t.soul, fontSize: 22 }}>+</Text>
          </TouchableOpacity>
        )}

        {/* Modals */}
        <SettingsModal 
          visible={showSettings} 
          onClose={() => setShowSettings(false)}
          onShowExport={() => { setShowSettings(false); setTimeout(() => setShowExport(true), 100); }}
          onShowClearConfirm={() => setShowClearConfirm(true)}
          onShowPinSetup={() => { setShowSettings(false); setTimeout(() => setShowPinSetup(true), 100); }}
        />

        <ExportModal 
          visible={showExport} 
          onClose={() => setShowExport(false)} 
        />

        <AddExpenseModal 
          visible={showAdd} 
          onClose={() => { setShowAdd(false); setEditingExpense(null); }}
          editingExpense={editingExpense}
        />

        <ClearDataModal 
          visible={showClearConfirm} 
          onClose={() => setShowClearConfirm(false)}
          onConfirm={() => { setShowClearConfirm(false); setShowSettings(false); }}
        />

        <PinSetupModal 
          visible={showPinSetup} 
          onClose={() => setShowPinSetup(false)}
        />
      </SafeAreaView>
    </View>
  );
};
