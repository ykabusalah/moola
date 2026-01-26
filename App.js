import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Theme colors
const themes = {
  light: {
    bg: '#faf9f6', card: '#ffffff', text: '#2a251c', sub: '#8a8070', muted: '#e8e4dc',
    accent: '#2a251c', border: '#d4cfc4', soul: '#5a7c4a', soulDim: '#e8f0e4', void: '#2a251c', ink: '#3a3428',
  },
  dark: {
    bg: '#0f1114', card: '#181b20', text: '#e8e4dc', sub: '#6b7280', muted: '#2a2f38',
    accent: '#e8e4dc', border: '#3a3f4a', soul: '#4a9eff', soulDim: '#1a3a5c', void: '#050608', ink: '#e8e4dc',
  },
};

// SVG Components
const SketchCircle = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 60 60">
    <Path d="M30,5 Q50,3 55,25 Q57,50 30,55 Q8,57 5,30 Q3,10 30,5" stroke={color} strokeWidth="1.5" fill="none" />
  </Svg>
);

const Divider = ({ color }) => (
  <Svg width="100%" height={8} viewBox="0 0 300 8" preserveAspectRatio="none">
    <Path d="M0,4 Q15,2 30,4 T60,4 T90,4 T120,4 T150,4 T180,4 T210,4 T240,4 T270,4 L300,4" stroke={color} strokeWidth={1} fill="none" opacity={0.4} />
  </Svg>
);

const StarIcon = ({ color, filled }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M12,2 L14,10 L22,12 L14,14 L12,22 L10,14 L2,12 L10,10 Z" stroke={color} fill={filled ? color : 'none'} strokeWidth="0.5" opacity={filled ? 0.8 : 1} />
  </Svg>
);

export default function App() {
  const [dark, setDark] = useState(false);
  const [screen, setScreen] = useState('splash');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('2025-01-25');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [period, setPeriod] = useState('today');
  const [showAdd, setShowAdd] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successAmount, setSuccessAmount] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFreq, setRecurringFreq] = useState('monthly');
  const [expandedDates, setExpandedDates] = useState({});

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const t = dark ? themes.dark : themes.light;

  const [expenses, setExpenses] = useState([
    { id: 1, amount: 5.50, note: 'Coffee', date: '2025-01-25', recurring: false },
    { id: 2, amount: 12.00, note: '', date: '2025-01-25', recurring: false },
    { id: 3, amount: 67.32, note: 'Groceries', date: '2025-01-24', recurring: false },
    { id: 4, amount: 45.00, note: 'Gas', date: '2025-01-23', recurring: false },
    { id: 5, amount: 1500, note: 'Rent', date: '2025-01-01', nextDue: '2025-02-01', recurring: true, freq: 'monthly' },
    { id: 6, amount: 15.99, note: 'Netflix', date: '2025-01-15', nextDue: '2025-02-15', recurring: true, freq: 'monthly' },
    { id: 7, amount: 89.00, note: 'Electric', date: '2025-01-10', nextDue: '2025-02-10', recurring: true, freq: 'monthly' },
  ]);

  const transition = (next) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      if (typeof next === 'number') setOnboardingStep(next);
      else setScreen(next);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  useEffect(() => {
    if (screen === 'splash') {
      setTimeout(() => transition('onboarding'), 2200);
    }
  }, []);

  const getDaysUntil = (dateStr) => {
    const today = new Date('2025-01-25');
    const due = new Date(dateStr);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'due today';
    if (diff === 1) return 'tomorrow';
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    return `in ${diff}d`;
  };

  const today = expenses.filter(e => e.date === '2025-01-25');
  const week = expenses.filter(e => e.date >= '2025-01-19' && e.date <= '2025-01-25');
  const month = expenses.filter(e => e.date.startsWith('2025-01'));

  const getData = () => {
    if (period === 'today') return { items: today, total: today.reduce((s, e) => s + e.amount, 0) };
    if (period === 'week') return { items: week, total: week.reduce((s, e) => s + e.amount, 0) };
    if (period === 'month') return { items: month, total: month.reduce((s, e) => s + e.amount, 0) };
    return { items: expenses, total: expenses.reduce((s, e) => s + e.amount, 0) };
  };

  const { items, total } = getData();
  const recurringTotal = items.filter(e => e.recurring).reduce((s, e) => s + e.amount, 0);
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
    setEditingExpense(null); setAmount(''); setNote(''); setIsRecurring(false);
    setShowSuccess(false); setShowAdd(true);
  };

  const openEdit = (e) => {
    setEditingExpense(e); setAmount(e.amount.toString()); setNote(e.note);
    setIsRecurring(e.recurring); setRecurringFreq(e.freq || 'monthly'); setShowAdd(true);
  };

  const saveExpense = () => {
    if (!amount) return;
    const savedAmount = parseFloat(amount).toFixed(2);
    if (editingExpense) {
      setExpenses(expenses.map(e => e.id === editingExpense.id ? { ...e, amount: parseFloat(amount), note, recurring: isRecurring, freq: recurringFreq } : e));
      setShowAdd(false); setEditingExpense(null);
    } else {
      setExpenses([{ id: Date.now(), amount: parseFloat(amount), note, date: '2025-01-25', recurring: isRecurring, freq: isRecurring ? recurringFreq : null, nextDue: isRecurring ? '2025-02-25' : null }, ...expenses]);
      setSuccessAmount(savedAmount); setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); setShowAdd(false); setAmount(''); setNote(''); setIsRecurring(false); }, 1600);
    }
  };

  const deleteExpense = () => {
    setExpenses(expenses.filter(e => e.id !== editingExpense.id));
    setShowAdd(false); setEditingExpense(null);
  };

  // Splash Screen
  if (screen === 'splash') {
    return (
      <Animated.View style={{ flex: 1, backgroundColor: t.bg, justifyContent: 'center', alignItems: 'center', opacity: fadeAnim }}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <View style={{ marginBottom: 32, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
          <SketchCircle size={80} color={dark ? t.soul : t.ink} />
          <View style={{ position: 'absolute', width: 8, height: 8, backgroundColor: dark ? t.soul : t.ink, borderRadius: 4 }} />
        </View>
        <Text style={{ fontSize: 32, fontWeight: '300', color: dark ? t.text : t.ink, letterSpacing: 6 }}>moola</Text>
        <Text style={{ fontSize: 11, color: t.sub, marginTop: 8, letterSpacing: 2, fontStyle: 'italic' }}>quiet your coins</Text>
      </Animated.View>
    );
  }

  // Onboarding
  if (screen === 'onboarding') {
    const renderStep = () => {
      if (onboardingStep === 0) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <Svg width={120} height={20} viewBox="0 0 120 20" style={{ marginBottom: 32 }}>
              <Path d="M10,10 Q30,5 60,10 T110,10" stroke={t.border} strokeWidth={1} fill="none" />
            </Svg>
            <Text style={{ fontSize: 12, color: t.sub, marginBottom: 12, letterSpacing: 3, fontStyle: 'italic' }}>welcome, traveler</Text>
            <Text style={{ fontSize: 26, fontWeight: '400', color: t.text, marginBottom: 48, textAlign: 'center' }}>What shall we call you?</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="your name"
              placeholderTextColor={t.sub}
              style={{ fontSize: 22, padding: 16, borderBottomWidth: 1, borderBottomColor: t.border, color: t.text, width: '100%', maxWidth: 260, textAlign: 'center', fontStyle: 'italic' }}
            />
            <TouchableOpacity
              onPress={() => name && transition(1)}
              disabled={!name}
              style={{ marginTop: 56, paddingVertical: 14, paddingHorizontal: 44, borderWidth: 1, borderColor: name ? t.text : t.muted, borderRadius: 2 }}
            >
              <Text style={{ color: name ? t.text : t.muted, fontSize: 12, letterSpacing: 2 }}>CONTINUE</Text>
            </TouchableOpacity>
          </View>
        );
      }
      if (onboardingStep === 1) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <View style={{ marginBottom: 40, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
              <SketchCircle size={100} color={t.border} />
              <Text style={{ position: 'absolute', fontSize: 28, color: t.soul }}>✦</Text>
            </View>
            <Text style={{ fontSize: 11, color: t.sub, marginBottom: 8, letterSpacing: 3 }}>GREETINGS</Text>
            <Text style={{ fontSize: 32, fontWeight: '400', color: t.text, fontStyle: 'italic' }}>Hello, {name}</Text>
            <View style={{ marginVertical: 24, width: '60%' }}><Divider color={t.border} /></View>
            <Text style={{ fontSize: 14, color: t.sub, textAlign: 'center', lineHeight: 28, maxWidth: 260, fontStyle: 'italic' }}>
              Your path to mindful spending begins in stillness.
            </Text>
            <TouchableOpacity onPress={() => transition(2)} style={{ marginTop: 48, paddingVertical: 14, paddingHorizontal: 44, borderWidth: 1, borderColor: t.border, borderRadius: 2 }}>
              <Text style={{ color: t.text, fontSize: 12, letterSpacing: 2 }}>BEGIN</Text>
            </TouchableOpacity>
          </View>
        );
      }
      if (onboardingStep === 2) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <Svg width={60} height={60} viewBox="0 0 60 60" style={{ marginBottom: 32 }}>
              <Circle cx={30} cy={30} r={25} stroke={t.border} strokeWidth={1} fill="none" strokeDasharray="4 3" />
              <Svg x={18} y={22}><Text style={{ fontSize: 14, fill: t.sub }}>25</Text></Svg>
            </Svg>
            <Text style={{ fontSize: 12, color: t.sub, marginBottom: 12, letterSpacing: 3 }}>FIRST MARK</Text>
            <Text style={{ fontSize: 22, fontWeight: '400', color: t.text, marginBottom: 12, textAlign: 'center' }}>When shall we begin?</Text>
            <Text style={{ fontSize: 13, color: t.sub, marginBottom: 40, textAlign: 'center', fontStyle: 'italic' }}>We'll mark your spending from this day.</Text>
            <View style={{ borderWidth: 1, borderColor: t.border, borderRadius: 2, padding: 12 }}>
              <Text style={{ fontSize: 16, color: t.text }}>{startDate}</Text>
            </View>
            <TouchableOpacity onPress={() => transition(3)} style={{ marginTop: 48, paddingVertical: 14, paddingHorizontal: 44, backgroundColor: t.text, borderRadius: 2 }}>
              <Text style={{ color: t.bg, fontSize: 12, letterSpacing: 2 }}>CONTINUE</Text>
            </TouchableOpacity>
          </View>
        );
      }
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 40 }}>
            <StarIcon color={t.border} /><StarIcon color={t.soul} filled /><StarIcon color={t.border} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '400', color: t.text, textAlign: 'center', lineHeight: 36, fontStyle: 'italic', marginBottom: 40 }}>
            Your coins remain{'\n'}within this vessel.
          </Text>
          {['No accounts required', 'No clouds, no servers', 'No tracking or selling', 'Just you and your record'].map((txt, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Svg width={16} height={16} viewBox="0 0 16 16"><Path d="M8,1 Q12,1 15,8 Q12,15 8,15 Q4,15 1,8 Q4,1 8,1" stroke={t.soul} fill="none" strokeWidth={0.8} /></Svg>
              <Text style={{ marginLeft: 14, fontSize: 13, color: t.sub, fontStyle: 'italic' }}>{txt}</Text>
            </View>
          ))}
          <TouchableOpacity onPress={() => transition('main')} style={{ marginTop: 36, paddingVertical: 16, paddingHorizontal: 52, backgroundColor: t.soul, borderRadius: 2 }}>
            <Text style={{ color: '#fff', fontSize: 12, letterSpacing: 2 }}>ENTER</Text>
          </TouchableOpacity>
        </View>
      );
    };

    return (
      <Animated.View style={{ flex: 1, backgroundColor: t.bg, opacity: fadeAnim }}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <SafeAreaView style={{ flex: 1 }}>{renderStep()}</SafeAreaView>
        <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
          {[0, 1, 2, 3].map(i => (
            <Svg key={i} width={12} height={12} viewBox="0 0 12 12">
              <Path d="M6,1 Q10,1 11,6 Q10,11 6,11 Q2,11 1,6 Q2,1 6,1" stroke={i <= onboardingStep ? t.soul : t.muted} fill={i === onboardingStep ? t.soul : 'none'} strokeWidth={1} />
            </Svg>
          ))}
        </View>
      </Animated.View>
    );
  }

  // Main Screen
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Header */}
          <View style={{ padding: 24, paddingTop: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontSize: 10, color: t.sub, letterSpacing: 2, fontStyle: 'italic' }}>
                {period === 'today' ? 'Sat · January 25' : period === 'week' ? 'This Week' : period === 'month' ? 'January 2025' : 'Year 2025'}
              </Text>
              <Text style={{ fontSize: 42, fontWeight: '300', marginTop: 8, color: t.text, letterSpacing: -1 }}>
                ${total.toFixed(2).split('.')[0]}
                <Text style={{ fontSize: 20, color: t.sub, fontWeight: '300' }}>.{total.toFixed(2).split('.')[1]}</Text>
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowExport(true)} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: t.border, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: t.sub, fontSize: 13 }}>↓</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDark(!dark)} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: t.border, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: dark ? '#fff' : t.ink }}>☾</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Soul Bar */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 20 }}>
            <Svg width="100%" height={12} viewBox="0 0 300 12" preserveAspectRatio="none">
              <Path d="M4,6 Q6,3 12,6 L288,6 Q294,3 296,6 Q294,9 288,6 L12,6 Q6,9 4,6" stroke={t.border} strokeWidth={1} fill={t.muted} />
              <Path d={`M4,6 Q6,3 12,6 L${12 + (spendingTotal / (total || 1)) * 276},6`} stroke={t.soul} strokeWidth={3} fill="none" strokeLinecap="round" />
            </Svg>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 1, fontStyle: 'italic' }}>spent ${spendingTotal.toFixed(0)}</Text>
              <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 1, fontStyle: 'italic' }}>recurring ${recurringTotal.toFixed(0)}</Text>
            </View>
          </View>

          {/* Period Toggle */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 24, flexDirection: 'row', gap: 10 }}>
            {['today', 'week', 'month', 'year'].map(p => (
              <TouchableOpacity key={p} onPress={() => setPeriod(p)} style={{ paddingVertical: 9, paddingHorizontal: 14, borderWidth: period === p ? 1.5 : 1, borderColor: period === p ? t.soul : t.border, borderRadius: 2 }}>
                <Text style={{ color: period === p ? t.soul : t.sub, fontSize: 10, letterSpacing: 1, fontStyle: 'italic' }}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ paddingHorizontal: 24 }}><Divider color={t.border} /></View>

          {/* Expense List */}
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
                  <Text style={{ fontSize: 15, color: t.text }}>${e.amount.toFixed(2)}</Text>
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
                      <Text style={{ fontSize: 12, color: t.text, letterSpacing: 1 }}>{date.split('-')[1]}/{date.split('-')[2]}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: t.sub, fontStyle: 'italic' }}>${group.total.toFixed(2)}</Text>
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
                      <Text style={{ fontSize: 13, color: t.text }}>${e.amount.toFixed(2)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))
            )}
          </View>

          {/* Footer */}
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: t.muted, letterSpacing: 4, fontWeight: '300' }}>moola</Text>
          </View>
        </ScrollView>

        {/* Add Button */}
        {!showAdd && !showExport && (
          <TouchableOpacity onPress={openAdd} style={{ position: 'absolute', bottom: 40, right: 24, width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: t.border, justifyContent: 'center', alignItems: 'center', backgroundColor: t.bg }}>
            <Text style={{ color: t.soul, fontSize: 22 }}>+</Text>
          </TouchableOpacity>
        )}

        {/* Export Modal */}
        <Modal visible={showExport} transparent animationType="slide">
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={() => setShowExport(false)}>
            <View style={{ backgroundColor: t.card, borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 24, borderWidth: 1, borderColor: t.border, borderBottomWidth: 0 }}>
              <View style={{ width: 40, height: 4, backgroundColor: t.muted, borderRadius: 2, alignSelf: 'center', marginBottom: 24 }} />
              <Text style={{ fontSize: 15, color: t.text, marginBottom: 20, fontStyle: 'italic' }}>Export your records</Text>
              {[{ title: 'Download CSV', desc: 'Excel, Sheets, Numbers', active: true }, { title: 'Send via Email', desc: 'To your inbox', active: false }, { title: 'Save to Cloud', desc: 'Drive, iCloud, Dropbox', active: false }].map((opt, i) => (
                <TouchableOpacity key={i} disabled={!opt.active} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderTopWidth: 1, borderTopColor: t.border, opacity: opt.active ? 1 : 0.4 }}>
                  <Text style={{ color: t.soul, fontSize: 14 }}>◇</Text>
                  <View>
                    <Text style={{ fontSize: 13, color: t.text }}>{opt.title}</Text>
                    <Text style={{ fontSize: 10, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>{opt.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setShowExport(false)} style={{ marginTop: 16, padding: 12, backgroundColor: t.muted, borderRadius: 2, alignItems: 'center' }}>
                <Text style={{ color: t.sub, fontSize: 11, letterSpacing: 1 }}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Add/Edit Modal */}
        <Modal visible={showAdd} animationType="fade">
          <View style={{ flex: 1, backgroundColor: t.bg, padding: 28 }}>
            <SafeAreaView style={{ flex: 1 }}>
              {showSuccess ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Svg width={64} height={64} viewBox="0 0 64 64" style={{ marginBottom: 24 }}>
                    <Circle cx={32} cy={32} r={28} stroke={t.soul} strokeWidth={2} fill="none" />
                    <Path d="M20 32 L28 40 L44 24" stroke={t.soul} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={{ fontSize: 28, fontWeight: '300', color: t.text }}>${successAmount}</Text>
                  <Text style={{ fontSize: 13, color: t.sub, marginTop: 8, fontStyle: 'italic' }}>added to your records</Text>
                </View>
              ) : (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                    <Text style={{ fontSize: 13, color: t.text, letterSpacing: 2, fontStyle: 'italic' }}>{editingExpense ? 'edit record' : 'new record'}</Text>
                    <TouchableOpacity onPress={() => { setShowAdd(false); setEditingExpense(null); }}>
                      <Text style={{ fontSize: 20, color: t.sub }}>×</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 8 }}>AMOUNT</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 32 }}>
                    <Text style={{ fontSize: 32, color: t.sub }}>$</Text>
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

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderTopWidth: 1, borderTopColor: t.border }}>
                    <View>
                      <Text style={{ fontSize: 14, color: t.text }}>Recurring</Text>
                      <Text style={{ fontSize: 10, color: t.sub, marginTop: 4, fontStyle: 'italic' }}>repeats automatically</Text>
                    </View>
                    <TouchableOpacity onPress={() => setIsRecurring(!isRecurring)} style={{ width: 44, height: 24, borderRadius: 12, borderWidth: 1, borderColor: isRecurring ? t.soul : t.border, backgroundColor: isRecurring ? t.soulDim : 'transparent', justifyContent: 'center', paddingHorizontal: 2 }}>
                      <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: isRecurring ? t.soul : t.muted, alignSelf: isRecurring ? 'flex-end' : 'flex-start' }} />
                    </TouchableOpacity>
                  </View>

                  {isRecurring && (
                    <View style={{ paddingVertical: 18, borderTopWidth: 1, borderTopColor: t.border }}>
                      <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 12 }}>FREQUENCY</Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {['weekly', 'monthly', 'yearly'].map(f => (
                          <TouchableOpacity key={f} onPress={() => setRecurringFreq(f)} style={{ paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: recurringFreq === f ? t.soul : t.border, borderRadius: 2, backgroundColor: recurringFreq === f ? t.soulDim : 'transparent' }}>
                            <Text style={{ color: recurringFreq === f ? t.soul : t.sub, fontSize: 10, letterSpacing: 1 }}>{f}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={{ marginTop: 'auto', paddingTop: 24, flexDirection: 'row', gap: 12 }}>
                    {editingExpense && (
                      <TouchableOpacity onPress={deleteExpense} style={{ paddingVertical: 12, paddingHorizontal: 18, borderWidth: 1, borderColor: dark ? '#6b4040' : '#c49090', borderRadius: 2 }}>
                        <Text style={{ color: dark ? '#c08080' : '#906060', fontSize: 11, letterSpacing: 1 }}>DELETE</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={saveExpense} disabled={!amount} style={{ flex: 1, padding: 14, backgroundColor: amount ? t.soul : t.muted, borderRadius: 2, alignItems: 'center' }}>
                      <Text style={{ color: amount ? '#fff' : t.sub, fontSize: 11, letterSpacing: 2 }}>{editingExpense ? 'SAVE' : 'ADD'}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </SafeAreaView>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}