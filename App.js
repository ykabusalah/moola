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
  Linking,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// STORAGE KEYS
// using prefixed keys to avoid collisions with other apps
// ============================================
const STORAGE_KEYS = {
  EXPENSES: '@moola/expenses',
  PREFERENCES: '@moola/preferences',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// CONFIGURATION
// change these to customize the app
// ============================================

const SUPPORT_LINK = 'https://ko-fi.com/ykabusalah';

// accent color options - each has light and dark variants
// dim is for backgrounds, regular color is for text/icons
const ACCENT_COLORS = [
  { id: 'sage', name: 'Sage', color: '#5a7c4a', dim: '#e8f0e4', darkColor: '#6b9b54', darkDim: '#1a2e14' },
  { id: 'ocean', name: 'Ocean', color: '#4a7c9b', dim: '#e4f0f4', darkColor: '#4a9eff', darkDim: '#1a3a5c' },
  { id: 'lavender', name: 'Lavender', color: '#7c5a8a', dim: '#f0e4f4', darkColor: '#a87cb8', darkDim: '#2e1a3a' },
  { id: 'ember', name: 'Ember', color: '#9b6a4a', dim: '#f4ece4', darkColor: '#d4956a', darkDim: '#3a2414' },
  { id: 'slate', name: 'Slate', color: '#5a6a7c', dim: '#e8ecf0', darkColor: '#8a9eb4', darkDim: '#1a2430' },
];

// pretty comprehensive currency list
// symbols might look weird in some fonts but ¯\_(ツ)_/¯
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
];

// ============================================
// DATE HELPERS
// these get used all over the place
// ============================================

// formats date for storage/comparison (YYYY-MM-DD)
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// formats date for display (MM-DD-YYYY) - american style
const formatDisplayDate = (date) => {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const y = date.getFullYear();
  return `${m}-${d}-${y}`;
};

// fancy header format like "Mon · January 25"
const formatHeaderDate = (date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[date.getDay()]} · ${months[date.getMonth()]} ${date.getDate()}`;
};

// returns today at midnight (for consistent comparisons)
const getToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

// ============================================
// THEME COLORS
// hollow knight inspired aesthetic
// warm browns for light, cool blues for dark
// ============================================
const themes = {
  light: {
    bg: '#faf9f6',      // warm off-white
    card: '#ffffff',
    text: '#2a251c',    // dark brown
    sub: '#8a8070',     // muted brown
    muted: '#e8e4dc',
    accent: '#2a251c',
    border: '#d4cfc4',
    soul: '#5a7c4a',    // the green "soul" color - main accent
    soulDim: '#e8f0e4', // light tint of soul
    void: '#2a251c',
    ink: '#3a3428',
  },
  dark: {
    bg: '#0f1114',      // near black
    card: '#181b20',
    text: '#e8e4dc',
    sub: '#6b7280',
    muted: '#2a2f38',
    accent: '#e8e4dc',
    border: '#3a3f4a',
    soul: '#4a9eff',    // blue in dark mode
    soulDim: '#1a3a5c',
    void: '#050608',
    ink: '#e8e4dc',
  },
};

// ============================================
// SVG COMPONENTS
// hand-drawn wobbly aesthetic
// these use quadratic beziers to look organic
// ============================================

// the main logo circle - intentionally imperfect
const SketchCircle = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 60 60">
    <Path d="M30,5 Q50,3 55,25 Q57,50 30,55 Q8,57 5,30 Q3,10 30,5" stroke={color} strokeWidth="1.5" fill="none" />
  </Svg>
);

// wavy horizontal line divider
const Divider = ({ color }) => (
  <Svg width="100%" height={8} viewBox="0 0 300 8" preserveAspectRatio="none">
    <Path d="M0,4 Q15,2 30,4 T60,4 T90,4 T120,4 T150,4 T180,4 T210,4 T240,4 T270,4 L300,4" stroke={color} strokeWidth={1} fill="none" opacity={0.4} />
  </Svg>
);

// 4-point star for decorative purposes
const StarIcon = ({ color, filled }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M12,2 L14,10 L22,12 L14,14 L12,22 L10,14 L2,12 L10,10 Z" stroke={color} fill={filled ? color : 'none'} strokeWidth="0.5" opacity={filled ? 0.8 : 1} />
  </Svg>
);

// ============================================
// ICON COMPONENTS
// all icons are custom SVGs to match the aesthetic
// keeping them simple and thin stroked
// ============================================

const ExportIcon = ({ color }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 10l5 5 5-5" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 15V3" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

const SettingsIcon = ({ color }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth="1.5" fill="none" />
    <Path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

const ShareIcon = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 6l-4-4-4 4" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 2v13" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

const CopyIcon = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Rect x="9" y="9" width="13" height="13" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
    <Path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

const SaveIcon = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17 21v-8H7v8" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 3v5h8" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronIcon = ({ color, direction = 'right' }) => (
  <Svg width={16} height={16} viewBox="0 0 16 16" style={{ transform: [{ rotate: direction === 'down' ? '90deg' : '0deg' }] }}>
    <Path d="M6 3L11 8L6 13" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ShieldIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrashIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const InfoIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth="1.5" fill="none" />
    <Path d="M12 16v-4M12 8h.01" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

const HeartIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CoffeeIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M18 8h1a4 4 0 0 1 0 8h-1" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 1v3M10 1v3M14 1v3" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function App() {
  // loading state - wait for asyncstorage before rendering
  const [isLoading, setIsLoading] = useState(true);
  
  // theme and navigation
  const [dark, setDark] = useState(false);
  const [screen, setScreen] = useState('splash'); // splash -> onboarding -> main
  
  // user info from onboarding
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  // main screen state
  const [period, setPeriod] = useState('today'); // today/week/month/year filter
  const [showAdd, setShowAdd] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successAmount, setSuccessAmount] = useState('');
  const [showExport, setShowExport] = useState(false);
  
  // settings modal state
  const [showSettings, setShowSettings] = useState(false);
  const [settingsPage, setSettingsPage] = useState('main'); // nested navigation in settings
  const [editingName, setEditingName] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // user preferences
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
  const [useEUFormat, setUseEUFormat] = useState(false); // 1.234,56 vs 1,234.56
  const [hideDecimals, setHideDecimals] = useState(false);
  
  // expense form state
  const [editingExpense, setEditingExpense] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFreq, setRecurringFreq] = useState('monthly');
  const [expandedDates, setExpandedDates] = useState({}); // tracks which date groups are expanded
  const [expenseDate, setExpenseDate] = useState(getToday());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // onboarding date picker
  const [onboardingDate, setOnboardingDate] = useState(getToday());
  const [showOnboardingDatePicker, setShowOnboardingDatePicker] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  
  // the actual expense data
  const [expenses, setExpenses] = useState([]);

  // animation ref for screen transitions
  const fadeAnim = useRef(new Animated.Value(1)).current;
  // prevent splash timer from firing twice in strict mode
  const splashTimerRef = useRef(false);
  
  // shorthand for current theme colors
  const t = dark ? themes.dark : themes.light;
  
  // override soul colors with user's accent preference
  const currentAccent = dark ? accentColor.darkColor : accentColor.color;
  const currentAccentDim = dark ? accentColor.darkDim : accentColor.dim;
  t.soul = currentAccent;
  t.soulDim = currentAccentDim;
  
  const todayStr = formatDate(getToday());

  // ============================================
  // NUMBER FORMATTING
  // handles EU format (1.234,56) and hiding decimals
  // ============================================
  
  const formatAmount = (amount, showSymbol = true) => {
    let formatted;
    if (hideDecimals) {
      const rounded = Math.round(amount);
      const parts = rounded.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, useEUFormat ? '.' : ',');
      formatted = parts[0];
    } else {
      const fixed = amount.toFixed(2);
      const parts = fixed.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, useEUFormat ? '.' : ',');
      formatted = useEUFormat ? `${parts[0]},${parts[1]}` : `${parts[0]}.${parts[1]}`;
    }
    return showSymbol ? `${currency.symbol}${formatted}` : formatted;
  };

  // splits amount into whole and decimal parts for the big display
  const formatLargeAmount = (amount) => {
    const rounded = Math.round(amount);
    const fixed = amount.toFixed(2);
    const parts = fixed.split('.');
    let whole = hideDecimals ? rounded.toString() : parts[0];
    whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, useEUFormat ? '.' : ',');
    
    if (hideDecimals) {
      return { whole, decimal: null, separator: null };
    }
    return { whole, decimal: parts[1], separator: useEUFormat ? ',' : '.' };
  };

  // ============================================
  // DATA PERSISTENCE
  // load on mount, save on change
  // ============================================

  useEffect(() => {
    loadData();
  }, []);

  // save expenses whenever they change (but not on initial load)
  useEffect(() => {
    if (!isLoading && expenses.length >= 0) {
      saveExpenses();
    }
  }, [expenses]);

  // save preferences when they change
  useEffect(() => {
    if (!isLoading && onboardingComplete) {
      savePreferences();
    }
  }, [dark, name, onboardingComplete, currency, accentColor, useEUFormat, hideDecimals]);

  const loadData = async () => {
    try {
      const [expensesData, prefsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.EXPENSES),
        AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES),
      ]);
      
      if (expensesData) setExpenses(JSON.parse(expensesData));
      
      if (prefsData) {
        const prefs = JSON.parse(prefsData);
        setName(prefs.name || '');
        setDark(prefs.dark || false);
        setStartDate(prefs.startDate || '');
        setOnboardingComplete(prefs.onboardingComplete || false);
        
        // restore currency preference
        if (prefs.currency) {
          const savedCurrency = CURRENCIES.find(c => c.code === prefs.currency);
          if (savedCurrency) setCurrency(savedCurrency);
        }
        
        // restore accent color preference
        if (prefs.accentColor) {
          const savedAccent = ACCENT_COLORS.find(a => a.id === prefs.accentColor);
          if (savedAccent) setAccentColor(savedAccent);
        }
        
        if (prefs.useEUFormat !== undefined) setUseEUFormat(prefs.useEUFormat);
        if (prefs.hideDecimals !== undefined) setHideDecimals(prefs.hideDecimals);
        
        // skip to main if already onboarded
        if (prefs.onboardingComplete) setScreen('main');
      }
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveExpenses = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (error) {
      console.log('Error saving expenses:', error);
    }
  };

  const savePreferences = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify({ 
        name, 
        dark, 
        startDate, 
        onboardingComplete, 
        currency: currency.code,
        accentColor: accentColor.id, 
        useEUFormat, 
        hideDecimals
      }));
    } catch (error) {
      console.log('Error saving preferences:', error);
    }
  };

  // ============================================
  // NAVIGATION & TRANSITIONS
  // ============================================

  const completeOnboarding = () => {
    setStartDate(formatDate(onboardingDate));
    setOnboardingComplete(true);
    transition('main');
  };

  // fade out, change screen, fade in
  const transition = (next) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      if (typeof next === 'number') setOnboardingStep(next);
      else setScreen(next);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  // auto-advance from splash after 2.2 seconds
  useEffect(() => {
    if (screen === 'splash' && !isLoading && !splashTimerRef.current) {
      splashTimerRef.current = true;
      setTimeout(() => transition(onboardingComplete ? 'main' : 'onboarding'), 2200);
    }
  }, [screen, isLoading, onboardingComplete]);

  // ============================================
  // RECURRING EXPENSE HELPERS
  // ============================================

  // returns human readable string like "in 3d" or "due today"
  const getDaysUntil = (dateStr) => {
    const today = getToday();
    const due = new Date(dateStr);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'due today';
    if (diff === 1) return 'tomorrow';
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    return `in ${diff}d`;
  };

  // ============================================
  // DATA MANAGEMENT
  // ============================================

  const clearAllData = async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.EXPENSES, STORAGE_KEYS.PREFERENCES]);
      setExpenses([]);
      setShowClearConfirm(false);
      setShowSettings(false);
    } catch (error) {
      console.log('Error clearing data:', error);
    }
  };

  // ============================================
  // EXPENSE FILTERING BY PERIOD
  // ============================================

  const today = getToday();
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 6);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const yearStart = new Date(today.getFullYear(), 0, 1);

  // filter expenses by current period
  const todayExpenses = expenses.filter(e => e.date === todayStr);
  const weekExpenses = expenses.filter(e => e.date >= formatDate(weekAgo) && e.date <= todayStr);
  const monthExpenses = expenses.filter(e => e.date >= formatDate(monthStart) && e.date <= todayStr);
  const yearExpenses = expenses.filter(e => e.date >= formatDate(yearStart) && e.date <= todayStr);

  // get filtered data based on selected period
  const getData = () => {
    if (period === 'today') return { items: todayExpenses, total: todayExpenses.reduce((s, e) => s + e.amount, 0) };
    if (period === 'week') return { items: weekExpenses, total: weekExpenses.reduce((s, e) => s + e.amount, 0) };
    if (period === 'month') return { items: monthExpenses, total: monthExpenses.reduce((s, e) => s + e.amount, 0) };
    return { items: yearExpenses, total: yearExpenses.reduce((s, e) => s + e.amount, 0) };
  };

  // ============================================
  // TIME PROGRESS CALCULATION
  // used for the progress visualizations
  // returns 0-1 representing how far through the period we are
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
    // year
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
    const daysInYear = ((now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) || now.getFullYear() % 400 === 0) ? 366 : 365;
    return dayOfYear / daysInYear;
  };

  const timeProgress = getTimeProgress();
  const { items, total } = getData();
  const recurringTotal = items.filter(e => e.recurring).reduce((s, e) => s + e.amount, 0);
  const spendingTotal = items.filter(e => !e.recurring).reduce((s, e) => s + e.amount, 0);

  // group expenses by date for non-today views
  const groupByDate = (list) => {
    const groups = {};
    list.forEach(item => {
      if (!groups[item.date]) groups[item.date] = { items: [], total: 0 };
      groups[item.date].items.push(item);
      groups[item.date].total += item.amount;
    });
    // sort newest first
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const toggleDate = (date) => setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));

  // ============================================
  // EXPENSE CRUD
  // ============================================

  const openAdd = () => {
    setEditingExpense(null);
    setAmount('');
    setNote('');
    setIsRecurring(false);
    setExpenseDate(getToday());
    setShowSuccess(false);
    setShowAdd(true);
  };

  const openEdit = (e) => {
    setEditingExpense(e);
    setAmount(e.amount.toString());
    setNote(e.note);
    setIsRecurring(e.recurring);
    setRecurringFreq(e.freq || 'monthly');
    setExpenseDate(new Date(e.date + 'T00:00:00')); // add time to avoid timezone issues
    setShowAdd(true);
  };

  const openSettings = () => {
    setSettingsPage('main');
    setShowSettings(true);
  };

  const saveExpense = () => {
    if (!amount) return;
    
    const savedAmount = parseFloat(amount).toFixed(2);
    const dateStr = formatDate(expenseDate);
    
    // calculate next due date for recurring expenses
    const nextDueDate = new Date(expenseDate);
    if (recurringFreq === 'weekly') nextDueDate.setDate(nextDueDate.getDate() + 7);
    else if (recurringFreq === 'monthly') nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    else if (recurringFreq === 'yearly') nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);

    if (editingExpense) {
      // update existing
      setExpenses(expenses.map(e => e.id === editingExpense.id ? { 
        ...e, 
        amount: parseFloat(amount), 
        note, 
        date: dateStr, 
        recurring: isRecurring, 
        freq: recurringFreq, 
        nextDue: isRecurring ? formatDate(nextDueDate) : null 
      } : e));
      setShowAdd(false);
      setEditingExpense(null);
    } else {
      // create new
      setExpenses([{ 
        id: Date.now(), 
        amount: parseFloat(amount), 
        note, 
        date: dateStr, 
        recurring: isRecurring, 
        freq: isRecurring ? recurringFreq : null, 
        nextDue: isRecurring ? formatDate(nextDueDate) : null 
      }, ...expenses]);
      
      // show success animation then close
      setSuccessAmount(savedAmount);
      setShowSuccess(true);
      setTimeout(() => { 
        setShowSuccess(false); 
        setShowAdd(false); 
        setAmount(''); 
        setNote(''); 
        setIsRecurring(false); 
      }, 1600);
    }
  };

  const deleteExpense = () => {
    setExpenses(expenses.filter(e => e.id !== editingExpense.id));
    setShowAdd(false);
    setEditingExpense(null);
  };

  // ============================================
  // EXPORT FUNCTIONS
  // ============================================

  const generateCSV = () => {
    const header = 'Date,Amount,Currency,Note,Recurring,Frequency\n';
    const rows = expenses.sort((a, b) => b.date.localeCompare(a.date)).map(e => {
      // respect EU format in exports too
      const formattedAmount = useEUFormat ? e.amount.toFixed(2).replace('.', ',') : e.amount.toFixed(2);
      return `${e.date},${formattedAmount},${currency.code},"${e.note || ''}",${e.recurring ? 'Yes' : 'No'},${e.freq || ''}`;
    }).join('\n');
    return header + rows;
  };

  // share via system share sheet
  const exportShare = async () => {
    try {
      const csv = generateCSV();
      const filepath = FileSystem.documentDirectory + `moola-export-${formatDate(getToday())}.csv`;
      await FileSystem.writeAsStringAsync(filepath, csv, { encoding: 'utf8' });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filepath, { mimeType: 'text/csv', dialogTitle: 'Export Expenses' });
      }
      setShowExport(false);
    } catch (error) { 
      console.log('Export error:', error); 
    }
  };

  // copy to clipboard
  const exportCopy = async () => {
    try {
      await Clipboard.setStringAsync(generateCSV());
      setShowExport(false);
    } catch (error) { 
      console.log('Copy error:', error); 
    }
  };

  // save as file
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
      }
      setShowExport(false);
    } catch (error) { 
      console.log('Save error:', error); 
    }
  };

  // ============================================
  // SETTINGS SUB-PAGES
  // breaking these out as separate components for readability
  // ============================================

  const SettingsMain = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
      {/* Profile Section */}
      <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 16, marginTop: 8 }}>PROFILE</Text>
      
      <TouchableOpacity 
        onPress={() => { setEditingName(name); setSettingsPage('name'); }} 
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

      {/* Appearance Section */}
      <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 16, marginTop: 32 }}>APPEARANCE</Text>
      
      {/* Dark Mode Toggle */}
      <TouchableOpacity 
        onPress={() => setDark(!dark)} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Text style={{ fontSize: 18, color: dark ? '#fff' : t.ink }}>☾</Text>
          <Text style={{ fontSize: 14, color: t.text }}>Dark Mode</Text>
        </View>
        <View style={{ width: 44, height: 24, borderRadius: 12, borderWidth: 1, borderColor: dark ? t.soul : t.border, backgroundColor: dark ? t.soulDim : 'transparent', justifyContent: 'center', paddingHorizontal: 2 }}>
          <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: dark ? t.soul : t.muted, alignSelf: dark ? 'flex-end' : 'flex-start' }} />
        </View>
      </TouchableOpacity>

      {/* Accent Color */}
      <TouchableOpacity 
        onPress={() => setSettingsPage('accent')} 
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

      {/* Currency */}
      <TouchableOpacity 
        onPress={() => setSettingsPage('currency')} 
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

      {/* EU Format Toggle */}
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
        <View style={{ width: 44, height: 24, borderRadius: 12, borderWidth: 1, borderColor: useEUFormat ? t.soul : t.border, backgroundColor: useEUFormat ? t.soulDim : 'transparent', justifyContent: 'center', paddingHorizontal: 2 }}>
          <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: useEUFormat ? t.soul : t.muted, alignSelf: useEUFormat ? 'flex-end' : 'flex-start' }} />
        </View>
      </TouchableOpacity>

      {/* Hide Decimals Toggle */}
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
        <View style={{ width: 44, height: 24, borderRadius: 12, borderWidth: 1, borderColor: hideDecimals ? t.soul : t.border, backgroundColor: hideDecimals ? t.soulDim : 'transparent', justifyContent: 'center', paddingHorizontal: 2 }}>
          <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: hideDecimals ? t.soul : t.muted, alignSelf: hideDecimals ? 'flex-end' : 'flex-start' }} />
        </View>
      </TouchableOpacity>

      {/* Data Section */}
      <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 16, marginTop: 32 }}>DATA</Text>

      {/* Export */}
      <TouchableOpacity 
        onPress={() => setShowExport(true)} 
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

      {/* Clear Data - scary red */}
      <TouchableOpacity 
        onPress={() => setShowClearConfirm(true)} 
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
        onPress={() => setSettingsPage('privacy')} 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <ShieldIcon color={t.soul} />
          <Text style={{ fontSize: 14, color: t.text }}>Privacy Policy</Text>
        </View>
        <ChevronIcon color={t.sub} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => setSettingsPage('about')} 
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
        onPress={() => Linking.openURL(SUPPORT_LINK)} 
        style={{ 
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
          paddingVertical: 16, paddingHorizontal: 16,
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

      {/* Footer */}
      <View style={{ paddingVertical: 40, alignItems: 'center' }}>
        <SketchCircle size={40} color={t.muted} />
        <Text style={{ fontSize: 11, color: t.muted, marginTop: 12, fontStyle: 'italic' }}>v1.0.0</Text>
      </View>
    </ScrollView>
  );

  // Currency picker list
  const SettingsCurrency = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 13, color: t.sub, marginBottom: 24, fontStyle: 'italic' }}>
        Select your preferred currency for displaying amounts.
      </Text>
      {CURRENCIES.map((c) => (
        <TouchableOpacity 
          key={c.code}
          onPress={() => { setCurrency(c); setSettingsPage('main'); }} 
          style={{ 
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
            paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.border,
            backgroundColor: currency.code === c.code ? t.soulDim : 'transparent',
            marginHorizontal: -24, paddingHorizontal: 24
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Text style={{ fontSize: 18, color: currency.code === c.code ? t.soul : t.sub, width: 32 }}>{c.symbol}</Text>
            <View>
              <Text style={{ fontSize: 14, color: t.text }}>{c.name}</Text>
              <Text style={{ fontSize: 11, color: t.sub, marginTop: 2 }}>{c.code}</Text>
            </View>
          </View>
          {currency.code === c.code && (
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path d="M20 6L9 17l-5-5" stroke={t.soul} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Name editor
  const SettingsName = () => (
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
        onPress={() => { 
          if (editingName.trim()) {
            setName(editingName.trim()); 
            setSettingsPage('main'); 
          }
        }} 
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

  // Accent color picker with preview
  const SettingsAccent = () => (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 13, color: t.sub, marginBottom: 32, fontStyle: 'italic' }}>
        Choose an accent color that speaks to you.
      </Text>
      {ACCENT_COLORS.map((a) => {
        const displayColor = dark ? a.darkColor : a.color;
        const isSelected = accentColor.id === a.id;
        return (
          <TouchableOpacity 
            key={a.id}
            onPress={() => { setAccentColor(a); setSettingsPage('main'); }} 
            style={{ 
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
              paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{ 
                width: 32, height: 32, borderRadius: 16, backgroundColor: displayColor,
                borderWidth: isSelected ? 2 : 0, borderColor: t.text
              }} />
              <Text style={{ fontSize: 15, color: isSelected ? displayColor : t.text }}>{a.name}</Text>
            </View>
            {isSelected && (
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path d="M20 6L9 17l-5-5" stroke={displayColor} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            )}
          </TouchableOpacity>
        );
      })}
      
      {/* live preview of the selected color */}
      <View style={{ marginTop: 32, padding: 20, backgroundColor: dark ? accentColor.darkDim : accentColor.dim, borderRadius: 4 }}>
        <Text style={{ fontSize: 11, color: t.sub, marginBottom: 8, letterSpacing: 1 }}>PREVIEW</Text>
        <Text style={{ fontSize: 28, fontWeight: '300', color: t.text }}>
          {currency.symbol}1,234<Text style={{ fontSize: 14, color: t.sub }}>.56</Text>
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
          <View style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: dark ? accentColor.darkColor : accentColor.color, borderRadius: 2 }}>
            <Text style={{ color: '#fff', fontSize: 10, letterSpacing: 1 }}>BUTTON</Text>
          </View>
          <View style={{ paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: dark ? accentColor.darkColor : accentColor.color, borderRadius: 2 }}>
            <Text style={{ color: dark ? accentColor.darkColor : accentColor.color, fontSize: 10, letterSpacing: 1 }}>OUTLINE</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Privacy policy 
  const SettingsPrivacy = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <ShieldIcon color={t.soul} />
        <Text style={{ fontSize: 18, color: t.text, marginTop: 16, fontWeight: '400' }}>Your Privacy Matters</Text>
        <Text style={{ fontSize: 12, color: t.sub, marginTop: 8, fontStyle: 'italic', textAlign: 'center' }}>
          Last updated: January 2025
        </Text>
      </View>

      <View style={{ marginBottom: 28 }}>
        <Text style={{ fontSize: 13, color: t.text, fontWeight: '500', marginBottom: 12 }}>The Short Version</Text>
        <Text style={{ fontSize: 13, color: t.sub, lineHeight: 22, fontStyle: 'italic' }}>
          moola is built on a simple principle: your financial data belongs to you, and only you. We don't collect it, we don't store it, and we certainly don't sell it.
        </Text>
      </View>

      <Divider color={t.border} />

      <View style={{ marginTop: 20, marginBottom: 28 }}>
        <Text style={{ fontSize: 13, color: t.text, fontWeight: '500', marginBottom: 12 }}>Data Storage</Text>
        <View style={{ gap: 12 }}>
          {[
            'All your expense data is stored locally on your device',
            'No cloud synchronization or remote servers',
            'No account creation required',
            'Your data never leaves your device unless you export it'
          ].map((text, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Svg width={14} height={14} viewBox="0 0 14 14" style={{ marginTop: 3 }}>
                <Path d="M7,1 Q11,1 13,7 Q11,13 7,13 Q3,13 1,7 Q3,1 7,1" stroke={t.soul} fill="none" strokeWidth={0.8} />
              </Svg>
              <Text style={{ fontSize: 13, color: t.sub, flex: 1, lineHeight: 20 }}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

      <Divider color={t.border} />

      <View style={{ marginTop: 20, marginBottom: 28 }}>
        <Text style={{ fontSize: 13, color: t.text, fontWeight: '500', marginBottom: 12 }}>Data Collection</Text>
        <Text style={{ fontSize: 13, color: t.sub, lineHeight: 22 }}>
          moola does not collect, transmit, or store any personal information whatsoever. This includes:
        </Text>
        <View style={{ marginTop: 12, gap: 8 }}>
          {[
            'No analytics or usage tracking',
            'No crash reporting services',
            'No advertising identifiers',
            'No device fingerprinting',
            'No location data',
            'No third-party SDKs that collect data'
          ].map((text, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ color: t.soul, fontSize: 10 }}>✕</Text>
              <Text style={{ fontSize: 13, color: t.sub }}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

      <Divider color={t.border} />

      <View style={{ marginTop: 20, marginBottom: 28 }}>
        <Text style={{ fontSize: 13, color: t.text, fontWeight: '500', marginBottom: 12 }}>Your Rights</Text>
        <Text style={{ fontSize: 13, color: t.sub, lineHeight: 22 }}>
          Since all data stays on your device, you have complete control:
        </Text>
        <View style={{ marginTop: 12, gap: 8 }}>
          {[
            'Export your data anytime via CSV',
            'Delete all data with one tap in Settings',
            'Uninstalling the app removes all data'
          ].map((text, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Text style={{ color: t.soul, fontSize: 12 }}>✔</Text>
              <Text style={{ fontSize: 13, color: t.sub, flex: 1 }}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

      <Divider color={t.border} />

      <View style={{ marginTop: 20, marginBottom: 28 }}>
        <Text style={{ fontSize: 13, color: t.text, fontWeight: '500', marginBottom: 12 }}>Third Parties</Text>
        <Text style={{ fontSize: 13, color: t.sub, lineHeight: 22 }}>
          moola does not share any information with third parties because we don't have any information to share. We don't use analytics services, advertising networks, or any external services that would have access to your data.
        </Text>
      </View>

      <Divider color={t.border} />

      <View style={{ marginTop: 20, marginBottom: 28 }}>
        <Text style={{ fontSize: 13, color: t.text, fontWeight: '500', marginBottom: 12 }}>Changes to This Policy</Text>
        <Text style={{ fontSize: 13, color: t.sub, lineHeight: 22 }}>
          Our commitment to privacy is fundamental to moola's design. If we ever need to update this policy, changes will be reflected in app updates with clear notification of what has changed.
        </Text>
      </View>

      <View style={{ backgroundColor: t.soulDim, padding: 20, borderRadius: 4, marginTop: 8, marginBottom: 40 }}>
        <Text style={{ fontSize: 12, color: t.soul, fontStyle: 'italic', textAlign: 'center', lineHeight: 20 }}>
          "Your coins remain within this vessel."
        </Text>
      </View>
    </ScrollView>
  );

  // About page - credits and stuff
  const SettingsAbout = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
      <View style={{ marginVertical: 32, alignItems: 'center' }}>
        <SketchCircle size={80} color={t.soul} />
        <Text style={{ fontSize: 28, fontWeight: '300', color: t.text, marginTop: 20, letterSpacing: 4 }}>moola</Text>
        <Text style={{ fontSize: 11, color: t.sub, marginTop: 8, fontStyle: 'italic', letterSpacing: 2 }}>quiet your coins</Text>
      </View>

      <Divider color={t.border} />

      <View style={{ width: '100%', marginTop: 24 }}>
        <Text style={{ fontSize: 13, color: t.sub, lineHeight: 24, textAlign: 'center', fontStyle: 'italic' }}>
          A minimalist expense tracker built for those who believe their financial data should remain theirs alone.
        </Text>
      </View>

      <View style={{ width: '100%', marginTop: 32, gap: 16 }}>
        {[
          { label: 'Version', value: '1.0.0' },
          { label: 'Platform', value: Platform.OS === 'ios' ? 'iOS' : 'Android' },
          { label: 'Storage', value: 'Local only' },
        ].map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: t.border }}>
            <Text style={{ fontSize: 13, color: t.sub }}>{item.label}</Text>
            <Text style={{ fontSize: 13, color: t.text }}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 40, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
          <StarIcon color={t.border} />
          <StarIcon color={t.soul} filled />
          <StarIcon color={t.border} />
        </View>
        <Text style={{ fontSize: 11, color: t.muted, fontStyle: 'italic' }}>
          Made with intention
        </Text>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );

  // ============================================
  // RENDER: LOADING STATE
  // ============================================

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: dark ? themes.dark.bg : themes.light.bg, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <SketchCircle size={60} color={dark ? themes.dark.soul : themes.light.ink} />
      </View>
    );
  }

  // ============================================
  // RENDER: SPLASH SCREEN
  // ============================================

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

  // ============================================
  // RENDER: ONBOARDING FLOW
  // 4 steps: name -> greeting -> date -> privacy
  // ============================================

  if (screen === 'onboarding') {
    const renderStep = () => {
      // Step 0: Name input
      if (onboardingStep === 0) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <Svg width={120} height={20} viewBox="0 0 120 20" style={{ marginBottom: 32 }}>
              <Path d="M10,10 Q30,5 60,10 T110,10" stroke={t.border} strokeWidth={1} fill="none" />
            </Svg>
            <Text style={{ fontSize: 12, color: t.sub, marginBottom: 12, letterSpacing: 3, fontStyle: 'italic' }}>welcome, traveler</Text>
            <Text style={{ fontSize: 26, fontWeight: '400', color: t.text, marginBottom: 48, textAlign: 'center' }}>What shall we call you?</Text>
            <TextInput value={name} onChangeText={setName} placeholder="your name" placeholderTextColor={t.sub} style={{ fontSize: 22, padding: 16, borderBottomWidth: 1, borderBottomColor: t.border, color: t.text, width: '100%', maxWidth: 260, textAlign: 'center', fontStyle: 'italic' }} />
            <TouchableOpacity onPress={() => name && transition(1)} disabled={!name} style={{ marginTop: 56, paddingVertical: 14, paddingHorizontal: 44, borderWidth: 1, borderColor: name ? t.text : t.muted, borderRadius: 2 }}>
              <Text style={{ color: name ? t.text : t.muted, fontSize: 12, letterSpacing: 2 }}>CONTINUE</Text>
            </TouchableOpacity>
          </View>
        );
      }
      
      // Step 1: Greeting
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
            <Text style={{ fontSize: 14, color: t.sub, textAlign: 'center', lineHeight: 28, maxWidth: 260, fontStyle: 'italic' }}>Your path to mindful spending begins in stillness.</Text>
            <TouchableOpacity onPress={() => transition(2)} style={{ marginTop: 48, paddingVertical: 14, paddingHorizontal: 44, borderWidth: 1, borderColor: t.border, borderRadius: 2 }}>
              <Text style={{ color: t.text, fontSize: 12, letterSpacing: 2 }}>BEGIN</Text>
            </TouchableOpacity>
          </View>
        );
      }
      
      // Step 2: Start date picker
      if (onboardingStep === 2) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <View style={{ marginBottom: 32, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={60} height={60} viewBox="0 0 60 60">
                <Circle cx={30} cy={30} r={25} stroke={t.border} strokeWidth={1} fill="none" strokeDasharray="4 3" />
              </Svg>
              <Text style={{ position: 'absolute', fontSize: 14, color: t.sub }}>{onboardingDate.getDate()}</Text>
            </View>
            <Text style={{ fontSize: 12, color: t.sub, marginBottom: 12, letterSpacing: 3 }}>FIRST MARK</Text>
            <Text style={{ fontSize: 22, fontWeight: '400', color: t.text, marginBottom: 12, textAlign: 'center' }}>When shall we begin?</Text>
            <Text style={{ fontSize: 13, color: t.sub, marginBottom: 40, textAlign: 'center', fontStyle: 'italic' }}>We'll mark your spending from this day.</Text>
            <TouchableOpacity onPress={() => setShowOnboardingDatePicker(true)} style={{ borderWidth: 1, borderColor: t.border, borderRadius: 2, padding: 12 }}>
              <Text style={{ fontSize: 16, color: t.text }}>{formatDisplayDate(onboardingDate)}</Text>
            </TouchableOpacity>
            {showOnboardingDatePicker && (
              <DateTimePicker value={onboardingDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} maximumDate={getToday()} onChange={(event, selectedDate) => { setShowOnboardingDatePicker(Platform.OS === 'ios'); if (selectedDate) setOnboardingDate(selectedDate); }} themeVariant={dark ? 'dark' : 'light'} />
            )}
            {showOnboardingDatePicker && Platform.OS === 'ios' && (
              <TouchableOpacity onPress={() => setShowOnboardingDatePicker(false)} style={{ marginTop: 12 }}>
                <Text style={{ color: t.soul, fontSize: 13, letterSpacing: 1 }}>Done</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => transition(3)} style={{ marginTop: 48, paddingVertical: 14, paddingHorizontal: 44, backgroundColor: t.text, borderRadius: 2 }}>
              <Text style={{ color: t.bg, fontSize: 12, letterSpacing: 2 }}>CONTINUE</Text>
            </TouchableOpacity>
          </View>
        );
      }
      
      // Step 3: Privacy info and enter app
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 40 }}>
            <StarIcon color={t.border} /><StarIcon color={t.soul} filled /><StarIcon color={t.border} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '400', color: t.text, textAlign: 'center', lineHeight: 36, fontStyle: 'italic', marginBottom: 40 }}>Your coins remain{'\n'}within this vessel.</Text>
          {['No accounts required', 'No clouds, no servers', 'No tracking or selling', 'Just you and your record'].map((txt, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Svg width={16} height={16} viewBox="0 0 16 16"><Path d="M8,1 Q12,1 15,8 Q12,15 8,15 Q4,15 1,8 Q4,1 8,1" stroke={t.soul} fill="none" strokeWidth={0.8} /></Svg>
              <Text style={{ marginLeft: 14, fontSize: 13, color: t.sub, fontStyle: 'italic' }}>{txt}</Text>
            </View>
          ))}
          <TouchableOpacity onPress={completeOnboarding} style={{ marginTop: 36, paddingVertical: 16, paddingHorizontal: 52, backgroundColor: t.soul, borderRadius: 2 }}>
            <Text style={{ color: '#fff', fontSize: 12, letterSpacing: 2 }}>ENTER</Text>
          </TouchableOpacity>
        </View>
      );
    };

    return (
      <Animated.View style={{ flex: 1, backgroundColor: t.bg, opacity: fadeAnim }}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <SafeAreaView style={{ flex: 1 }}>{renderStep()}</SafeAreaView>
        {/* Step indicator dots */}
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

  // ============================================
  // RENDER: MAIN DASHBOARD
  // ============================================

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Header with total and action buttons */}
          <View style={{ padding: 24, paddingTop: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              {/* Dynamic header text based on period */}
              <Text style={{ fontSize: 10, color: t.sub, letterSpacing: 2, fontStyle: 'italic' }}>
                {period === 'today' ? formatHeaderDate(getToday()) : period === 'week' ? 'This Week' : period === 'month' ? `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][getToday().getMonth()]} ${getToday().getFullYear()}` : `Year ${getToday().getFullYear()}`}
              </Text>
              {/* Big total display - splits whole and decimal parts */}
              <Text style={{ fontSize: 42, fontWeight: '300', marginTop: 8, color: t.text, letterSpacing: -1 }}>
                {currency.symbol}{formatLargeAmount(total).whole}{!hideDecimals && <Text style={{ fontSize: 20, color: t.sub, fontWeight: '300' }}>{formatLargeAmount(total).separator}{formatLargeAmount(total).decimal}</Text>}
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

          {/* ============================================
              TIME PROGRESS VISUALIZATIONS
              each period has a different style
              ============================================ */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 20 }}>
            
            {/* TODAY: Flowing wave with dot indicator */}
            {period === 'today' && (
              <View>
                <Svg width="100%" height={24} viewBox="0 0 300 24" preserveAspectRatio="none">
                  {/* Background wave */}
                  <Path d="M0,12 Q75,8 150,12 T300,12" stroke={t.muted} strokeWidth={2} fill="none" />
                  {/* Progress wave - uses bezier math to animate along the path */}
                  <Path d={`M0,12 Q${37.5 * Math.min(timeProgress * 4, 1)},${8 + (1 - Math.min(timeProgress * 4, 1)) * 4} ${75 * Math.min(timeProgress * 2, 1)},12 ${timeProgress > 0.5 ? `T${150 * Math.min(timeProgress * 1.33, 1)},12` : ''} ${timeProgress > 0.75 ? `T${timeProgress * 300},12` : ''}`} stroke={t.soul} strokeWidth={3} fill="none" strokeLinecap="round" />
                  {/* Position indicator dot */}
                  <Circle cx={Math.max(8, timeProgress * 292)} cy={12} r={5} fill={t.soul} opacity={0.9} />
                  <Circle cx={Math.max(8, timeProgress * 292)} cy={12} r={8} fill={t.soul} opacity={0.2} />
                </Svg>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 1, fontStyle: 'italic' }}>{Math.round(timeProgress * 24)}h into today</Text>
                  <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 1, fontStyle: 'italic' }}>{formatAmount(spendingTotal, true)} spent</Text>
                </View>
              </View>
            )}

            {/* WEEK: 7 vertical bars for each day */}
            {period === 'week' && (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 32, marginBottom: 6 }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                    // calculate how filled each day bar should be
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

            {/* MONTH: Cool spiral visualization */}
            {period === 'month' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <Svg width={64} height={64} viewBox="0 0 64 64">
                  {/* Background spiral */}
                  <Path d="M32,8 A24,24 0 0,1 56,32 A20,20 0 0,1 36,52 A16,16 0 0,1 20,36 A12,12 0 0,1 32,24 A8,8 0 0,1 40,32" 
                    stroke={t.muted} strokeWidth={3} fill="none" strokeLinecap="round" />
                  {/* Progress spiral - dasharray creates the partial fill effect */}
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

            {/* YEAR: 12 mini month boxes */}
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

          {/* Period selector tabs */}
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
              // Today view: flat list
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
                // empty state
                <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                  <Svg width={40} height={40} viewBox="0 0 40 40" style={{ marginBottom: 16, opacity: 0.3 }}>
                    <Circle cx={20} cy={20} r={15} stroke={t.sub} strokeWidth={1} fill="none" strokeDasharray="3 3" />
                  </Svg>
                  <Text style={{ color: t.sub, fontSize: 13, fontStyle: 'italic' }}>the void awaits your first mark</Text>
                </View>
              )
            ) : (
              // Other periods: grouped by date with expand/collapse
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
                  {/* Expanded items with dashed border */}
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

          {/* Footer branding */}
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: t.muted, letterSpacing: 4, fontWeight: '300' }}>moola</Text>
          </View>
        </ScrollView>

        {/* Floating add button - hidden when modals are open */}
        {!showAdd && !showExport && !showSettings && (
          <TouchableOpacity onPress={openAdd} style={{ position: 'absolute', bottom: 40, right: 24, width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: t.border, justifyContent: 'center', alignItems: 'center', backgroundColor: t.bg }}>
            <Text style={{ color: t.soul, fontSize: 22 }}>+</Text>
          </TouchableOpacity>
        )}

        {/* ============================================
            SETTINGS MODAL
            ============================================ */}
        <Modal visible={showSettings} animationType="slide">
          <View style={{ flex: 1, backgroundColor: t.bg }}>
            <SafeAreaView style={{ flex: 1 }}>
              {/* Header with back button for sub-pages */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: t.border }}>
                {settingsPage !== 'main' ? (
                  <TouchableOpacity onPress={() => setSettingsPage('main')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Svg width={16} height={16} viewBox="0 0 16 16">
                      <Path d="M10 3L5 8L10 13" stroke={t.sub} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text style={{ color: t.sub, fontSize: 14 }}>Back</Text>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}
                <Text style={{ fontSize: 15, color: t.text, fontWeight: '500', letterSpacing: 1 }}>
                  {settingsPage === 'main' ? 'Settings' : settingsPage === 'currency' ? 'Currency' : settingsPage === 'accent' ? 'Accent Color' : settingsPage === 'name' ? 'Name' : settingsPage === 'privacy' ? 'Privacy Policy' : 'About'}
                </Text>
                <TouchableOpacity onPress={() => setShowSettings(false)}>
                  <Text style={{ fontSize: 20, color: t.sub }}>×</Text>
                </TouchableOpacity>
              </View>
              
              {/* Render the active settings page */}
              {settingsPage === 'main' && <SettingsMain />}
              {settingsPage === 'currency' && <SettingsCurrency />}
              {settingsPage === 'accent' && <SettingsAccent />}
              {settingsPage === 'name' && <SettingsName />}
              {settingsPage === 'privacy' && <SettingsPrivacy />}
              {settingsPage === 'about' && <SettingsAbout />}
            </SafeAreaView>
          </View>
        </Modal>

        {/* ============================================
            CLEAR DATA CONFIRMATION MODAL
            ============================================ */}
        <Modal visible={showClearConfirm} transparent animationType="fade">
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
                  onPress={() => setShowClearConfirm(false)} 
                  style={{ flex: 1, padding: 12, borderWidth: 1, borderColor: t.border, borderRadius: 2, alignItems: 'center' }}
                >
                  <Text style={{ color: t.sub, fontSize: 12, letterSpacing: 1 }}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={clearAllData} 
                  style={{ flex: 1, padding: 12, backgroundColor: dark ? '#6b4040' : '#c49090', borderRadius: 2, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontSize: 12, letterSpacing: 1 }}>DELETE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ============================================
            EXPORT MODAL (bottom sheet style)
            ============================================ */}
        <Modal visible={showExport} transparent animationType="slide">
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={() => setShowExport(false)}>
            <View style={{ backgroundColor: t.card, borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 24, borderWidth: 1, borderColor: t.border, borderBottomWidth: 0 }}>
              {/* Drag handle */}
              <View style={{ width: 40, height: 4, backgroundColor: t.muted, borderRadius: 2, alignSelf: 'center', marginBottom: 24 }} />
              <Text style={{ fontSize: 15, color: t.text, marginBottom: 8, fontStyle: 'italic' }}>Export your records</Text>
              <Text style={{ fontSize: 11, color: t.sub, marginBottom: 20 }}>{expenses.length} expenses</Text>
              
              {/* Share option */}
              <TouchableOpacity onPress={exportShare} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderTopWidth: 1, borderTopColor: t.border }}>
                <ShareIcon color={t.soul} />
                <View style={{ flex: 1 }}><Text style={{ fontSize: 14, color: t.text }}>Share</Text><Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>Send via email, message, airdrop</Text></View>
              </TouchableOpacity>
              
              {/* Copy option */}
              <TouchableOpacity onPress={exportCopy} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderTopWidth: 1, borderTopColor: t.border }}>
                <CopyIcon color={t.soul} />
                <View style={{ flex: 1 }}><Text style={{ fontSize: 14, color: t.text }}>Copy to Clipboard</Text><Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>Paste into any app</Text></View>
              </TouchableOpacity>
              
              {/* Save option */}
              <TouchableOpacity onPress={exportSave} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderTopWidth: 1, borderTopColor: t.border }}>
                <SaveIcon color={t.soul} />
                <View style={{ flex: 1 }}><Text style={{ fontSize: 14, color: t.text }}>Save as CSV</Text><Text style={{ fontSize: 11, color: t.sub, marginTop: 2, fontStyle: 'italic' }}>Excel, Sheets, Numbers</Text></View>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setShowExport(false)} style={{ marginTop: 20, padding: 14, backgroundColor: t.muted, borderRadius: 2, alignItems: 'center' }}>
                <Text style={{ color: t.sub, fontSize: 11, letterSpacing: 1 }}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ============================================
            ADD/EDIT EXPENSE MODAL
            ============================================ */}
        <Modal visible={showAdd} animationType="fade">
          <View style={{ flex: 1, backgroundColor: t.bg }}>
            <SafeAreaView style={{ flex: 1 }}>
              {showSuccess ? (
                // Success animation after adding
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 }}>
                  <Svg width={64} height={64} viewBox="0 0 64 64" style={{ marginBottom: 24 }}>
                    <Circle cx={32} cy={32} r={28} stroke={t.soul} strokeWidth={2} fill="none" />
                    <Path d="M20 32 L28 40 L44 24" stroke={t.soul} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={{ fontSize: 28, fontWeight: '300', color: t.text }}>{currency.symbol}{successAmount}</Text>
                  <Text style={{ fontSize: 13, color: t.sub, marginTop: 8, fontStyle: 'italic' }}>added to your records</Text>
                </View>
              ) : (
                // The actual form
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 28, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
                  {/* Header */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                    <Text style={{ fontSize: 13, color: t.text, letterSpacing: 2, fontStyle: 'italic' }}>{editingExpense ? 'edit record' : 'new record'}</Text>
                    <TouchableOpacity onPress={() => { setShowAdd(false); setEditingExpense(null); setShowDatePicker(false); }}>
                      <Text style={{ fontSize: 20, color: t.sub }}>×</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Amount input */}
                  <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 8 }}>AMOUNT</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 32 }}>
                    <Text style={{ fontSize: 32, color: t.sub }}>{currency.symbol}</Text>
                    <TextInput value={amount} onChangeText={setAmount} placeholder="0.00" placeholderTextColor={t.muted} keyboardType="decimal-pad" autoFocus style={{ fontSize: 44, fontWeight: '300', color: t.text, flex: 1 }} />
                  </View>
                  
                  {/* Note input */}
                  <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 8 }}>NOTE <Text style={{ fontStyle: 'italic' }}>(optional)</Text></Text>
                  <TextInput value={note} onChangeText={setNote} placeholder="what was this for?" placeholderTextColor={t.muted} style={{ fontSize: 15, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.border, color: t.text, fontStyle: 'italic', marginBottom: 24 }} />
                  
                  {/* Date picker trigger */}
                  <Text style={{ fontSize: 9, color: t.sub, letterSpacing: 2, marginBottom: 8 }}>DATE</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.border, marginBottom: 24 }}>
                    <Text style={{ fontSize: 15, color: t.text }}>{formatDate(expenseDate) === todayStr ? 'Today' : formatDisplayDate(expenseDate)}</Text>
                  </TouchableOpacity>
                  
                  {/* Recurring toggle */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderTopWidth: 1, borderTopColor: t.border }}>
                    <View><Text style={{ fontSize: 14, color: t.text }}>Recurring</Text><Text style={{ fontSize: 10, color: t.sub, marginTop: 4, fontStyle: 'italic' }}>repeats automatically</Text></View>
                    <TouchableOpacity onPress={() => setIsRecurring(!isRecurring)} style={{ width: 44, height: 24, borderRadius: 12, borderWidth: 1, borderColor: isRecurring ? t.soul : t.border, backgroundColor: isRecurring ? t.soulDim : 'transparent', justifyContent: 'center', paddingHorizontal: 2 }}>
                      <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: isRecurring ? t.soul : t.muted, alignSelf: isRecurring ? 'flex-end' : 'flex-start' }} />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Frequency options (only shown if recurring) */}
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
                  
                  {/* Action buttons */}
                  <View style={{ paddingTop: 24, flexDirection: 'row', gap: 12 }}>
                    {editingExpense && (
                      <TouchableOpacity onPress={deleteExpense} style={{ paddingVertical: 12, paddingHorizontal: 18, borderWidth: 1, borderColor: dark ? '#6b4040' : '#c49090', borderRadius: 2 }}>
                        <Text style={{ color: dark ? '#c08080' : '#906060', fontSize: 11, letterSpacing: 1 }}>DELETE</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={saveExpense} disabled={!amount} style={{ flex: 1, padding: 14, backgroundColor: amount ? t.soul : t.muted, borderRadius: 2, alignItems: 'center' }}>
                      <Text style={{ color: amount ? '#fff' : t.sub, fontSize: 11, letterSpacing: 2 }}>{editingExpense ? 'SAVE' : 'ADD'}</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </SafeAreaView>
            
            {/* Date picker modal (nested inside add modal) */}
            <Modal visible={showDatePicker} transparent animationType="fade">
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <View style={{ backgroundColor: t.card, borderRadius: 12, width: '100%', maxWidth: 320, borderWidth: 1, borderColor: t.border }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: t.border }}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}><Text style={{ color: t.sub, fontSize: 14 }}>Cancel</Text></TouchableOpacity>
                    <Text style={{ color: t.text, fontSize: 15, fontWeight: '500' }}>Select Date</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}><Text style={{ color: t.soul, fontSize: 14, fontWeight: '500' }}>Done</Text></TouchableOpacity>
                  </View>
                  <DateTimePicker value={expenseDate} mode="date" display="spinner" maximumDate={getToday()} onChange={(event, selectedDate) => { if (selectedDate) setExpenseDate(selectedDate); }} themeVariant={dark ? 'dark' : 'light'} style={{ height: 180 }} />
                </View>
              </View>
            </Modal>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}