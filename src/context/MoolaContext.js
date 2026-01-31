/**
 * MoolaContext.js - Central state management for the app
 * Handles all shared state, persistence (AsyncStorage/SecureStore),
 * security (PIN/biometrics), notifications, and computed values
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';

import { STORAGE_KEYS, SECURE_KEYS } from '../constants/config';
import { themes, ACCENT_COLORS } from '../constants/theme';
import { CURRENCIES } from '../constants/currencies';
import { getToday, formatDate } from '../utils/date';
import { formatAmount as formatAmountUtil, formatLargeAmount as formatLargeAmountUtil } from '../utils/format';

// ============================================
// CONTEXT CREATION
// ============================================

const MoolaContext = createContext(null);

export const useMoola = () => {
  const context = useContext(MoolaContext);
  if (!context) {
    throw new Error('useMoola must be used within MoolaProvider');
  }
  return context;
};

// ============================================
// NOTIFICATION HANDLER (called once at module level)
// ============================================

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ============================================
// PROVIDER COMPONENT
// ============================================

export const MoolaProvider = ({ children }) => {
  // === Loading & Navigation ===
  const [isLoading, setIsLoading] = useState(true);
  const [screen, setScreen] = useState('splash');
  const [onboardingStep, setOnboardingStep] = useState(0);

  // === Theme & Preferences ===
  const [dark, setDark] = useState(false);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
  const [useEUFormat, setUseEUFormat] = useState(false);
  const [hideDecimals, setHideDecimals] = useState(false);

  // === Security ===
  const [isLocked, setIsLocked] = useState(false);
  const [lockMethod, setLockMethod] = useState('none'); // 'none' | 'pin' | 'biometric' | 'both'
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');

  // === Reminders ===
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [dailyReminderTime, setDailyReminderTime] = useState(new Date(new Date().setHours(20, 0, 0, 0)));
  const [backupReminderEnabled, setBackupReminderEnabled] = useState(false);
  const [backupReminderFreq, setBackupReminderFreq] = useState('weekly');
  const [lastExportDate, setLastExportDate] = useState(null);

  // === Data ===
  const [expenses, setExpenses] = useState([]);
  const [period, setPeriod] = useState('today');

  // === Refs ===
  const appState = useRef(AppState.currentState);

  // ============================================
  // COMPUTED: Theme with accent color
  // ============================================

  const t = dark ? { ...themes.dark } : { ...themes.light };
  t.soul = dark ? accentColor.darkColor : accentColor.color;
  t.soulDim = dark ? accentColor.darkDim : accentColor.dim;

  const todayStr = formatDate(getToday());

  // ============================================
  // FORMAT HELPERS (use utils with current preferences)
  // ============================================

  const formatAmount = useCallback((amount, showSymbol = true) => {
    return formatAmountUtil(amount, { currency, useEUFormat, hideDecimals, showSymbol });
  }, [currency, useEUFormat, hideDecimals]);

  const formatLargeAmount = useCallback((amount) => {
    return formatLargeAmountUtil(amount, { useEUFormat, hideDecimals });
  }, [useEUFormat, hideDecimals]);

  // ============================================
  // NOTIFICATION FUNCTIONS
  // ============================================

  const requestNotificationPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.log('Notification permission error:', error);
      return false;
    }
  };

  const scheduleDailyReminder = useCallback(async (time) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!dailyReminderEnabled) return;

      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        setDailyReminderEnabled(false);
        return;
      }

      const hours = time.getHours();
      const minutes = time.getMinutes();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'moola',
          body: 'Time to log your expenses ✦',
          sound: true,
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      console.log(`Daily reminder scheduled for ${hours}:${minutes}`);
    } catch (error) {
      console.log('Error scheduling notification:', error);
    }
  }, [dailyReminderEnabled]);

  const toggleDailyReminder = async (enabled) => {
    if (enabled) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        return;
      }
    }
    setDailyReminderEnabled(enabled);
  };

  // ============================================
  // BACKUP REMINDER HELPERS
  // ============================================

  const isBackupOverdue = useCallback(() => {
    if (!backupReminderEnabled || !lastExportDate) return false;

    const lastExport = new Date(lastExportDate);
    const now = new Date();
    const daysDiff = Math.floor((now - lastExport) / (1000 * 60 * 60 * 24));

    if (backupReminderFreq === 'weekly') {
      return daysDiff >= 7;
    } else {
      return daysDiff >= 30;
    }
  }, [backupReminderEnabled, lastExportDate, backupReminderFreq]);

  const getBackupOverdueMessage = useCallback(() => {
    if (!lastExportDate) return "You haven't backed up your data yet";

    const lastExport = new Date(lastExportDate);
    const now = new Date();
    const daysDiff = Math.floor((now - lastExport) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) return 'Last backup was yesterday';
    return `Last backup was ${daysDiff} days ago`;
  }, [lastExportDate]);

  const updateLastExportDate = async () => {
    const now = formatDate(new Date());
    setLastExportDate(now);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_EXPORT, now);
    } catch (error) {
      console.log('Error saving last export date:', error);
    }
  };

  // ============================================
  // SECURITY FUNCTIONS
  // ============================================

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);

      if (compatible) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Touch ID');
        }
      }
    } catch (error) {
      console.log('Biometric check error:', error);
    }
  };

  const loadSecuritySettings = async () => {
    try {
      const method = await SecureStore.getItemAsync(SECURE_KEYS.LOCK_METHOD);
      const pin = await SecureStore.getItemAsync(SECURE_KEYS.PIN);

      if (!method || method === 'none') {
        setLockMethod('none');
        setIsLocked(false);
        return;
      }

      if (method === 'pin') {
        if (pin && pin.length >= 4) {
          setLockMethod(method);
          setIsLocked(true);
        } else {
          console.log('Invalid state: lock method requires PIN but none found. Resetting.');
          await SecureStore.deleteItemAsync(SECURE_KEYS.LOCK_METHOD);
          await SecureStore.deleteItemAsync(SECURE_KEYS.PIN);
          setLockMethod('none');
          setIsLocked(false);
        }
        return;
      }

      await SecureStore.deleteItemAsync(SECURE_KEYS.LOCK_METHOD);
      setLockMethod('none');
      setIsLocked(false);
    } catch (error) {
      console.log('Error loading security settings:', error);
      setLockMethod('none');
      setIsLocked(false);
    }
  };

  const saveLockMethod = async (method) => {
    try {
      await SecureStore.setItemAsync(SECURE_KEYS.LOCK_METHOD, method);
      setLockMethod(method);
    } catch (error) {
      console.log('Error saving lock method:', error);
    }
  };

  const savePin = async (pin) => {
    try {
      await SecureStore.setItemAsync(SECURE_KEYS.PIN, pin);
      return true;
    } catch (error) {
      console.log('Error saving PIN:', error);
      return false;
    }
  };

  const verifyPin = async (pin) => {
    try {
      const storedPin = await SecureStore.getItemAsync(SECURE_KEYS.PIN);
      return storedPin === pin;
    } catch (error) {
      console.log('Error verifying PIN:', error);
      return false;
    }
  };

  const authenticateWithBiometrics = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock moola',
        cancelLabel: 'Use PIN',
        disableDeviceFallback: true,
      });
      return result.success;
    } catch (error) {
      console.log('Biometric auth error:', error);
      return false;
    }
  };

  const handleUnlock = useCallback(async () => {
    if (lockMethod === 'biometric' || lockMethod === 'both') {
      const success = await authenticateWithBiometrics();
      if (success) {
        setIsLocked(false);
      }
    }
  }, [lockMethod]);

  const disableAppLock = async () => {
    try {
      await SecureStore.deleteItemAsync(SECURE_KEYS.PIN);
      await SecureStore.deleteItemAsync(SECURE_KEYS.LOCK_METHOD);
      setLockMethod('none');
      setIsLocked(false);
    } catch (error) {
      console.log('Error disabling app lock:', error);
    }
  };

  const enableLockMethod = async (method) => {
    if (method === 'none') {
      await disableAppLock();
      return { needsPinSetup: false };
    }

    const existingPin = await SecureStore.getItemAsync(SECURE_KEYS.PIN);

    if (method === 'pin' || method === 'both') {
      if (!existingPin) {
        return { needsPinSetup: true };
      }
      await saveLockMethod(method);
    } else if (method === 'biometric') {
      if (biometricAvailable) {
        await saveLockMethod(method);
      }
    }
    return { needsPinSetup: false };
  };

  // ============================================
  // DATA PERSISTENCE
  // ============================================

  const loadData = async () => {
    try {
      const [expensesData, prefsData, lastExportData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.EXPENSES),
        AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_EXPORT),
      ]);

      if (expensesData) setExpenses(JSON.parse(expensesData));
      if (lastExportData) setLastExportDate(lastExportData);

      if (prefsData) {
        const prefs = JSON.parse(prefsData);
        setName(prefs.name || '');
        setDark(prefs.dark || false);
        setStartDate(prefs.startDate || '');
        setOnboardingComplete(prefs.onboardingComplete || false);

        if (prefs.currency) {
          const savedCurrency = CURRENCIES.find((c) => c.code === prefs.currency);
          if (savedCurrency) setCurrency(savedCurrency);
        }

        if (prefs.accentColor) {
          const savedAccent = ACCENT_COLORS.find((a) => a.id === prefs.accentColor);
          if (savedAccent) setAccentColor(savedAccent);
        }

        if (prefs.useEUFormat !== undefined) setUseEUFormat(prefs.useEUFormat);
        if (prefs.hideDecimals !== undefined) setHideDecimals(prefs.hideDecimals);

        if (prefs.dailyReminderEnabled !== undefined) setDailyReminderEnabled(prefs.dailyReminderEnabled);
        if (prefs.dailyReminderTime) setDailyReminderTime(new Date(prefs.dailyReminderTime));
        if (prefs.backupReminderEnabled !== undefined) setBackupReminderEnabled(prefs.backupReminderEnabled);
        if (prefs.backupReminderFreq) setBackupReminderFreq(prefs.backupReminderFreq);

        if (prefs.onboardingComplete) setScreen('main');
      }
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveExpenses = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (error) {
      console.log('Error saving expenses:', error);
    }
  }, [expenses]);

  const savePreferences = useCallback(async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify({
          name,
          dark,
          startDate,
          onboardingComplete,
          currency: currency.code,
          accentColor: accentColor.id,
          useEUFormat,
          hideDecimals,
          dailyReminderEnabled,
          dailyReminderTime: dailyReminderTime.toISOString(),
          backupReminderEnabled,
          backupReminderFreq,
        })
      );
    } catch (error) {
      console.log('Error saving preferences:', error);
    }
  }, [
    name,
    dark,
    startDate,
    onboardingComplete,
    currency,
    accentColor,
    useEUFormat,
    hideDecimals,
    dailyReminderEnabled,
    dailyReminderTime,
    backupReminderEnabled,
    backupReminderFreq,
  ]);

  const clearAllData = async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.EXPENSES, STORAGE_KEYS.PREFERENCES]);
      setExpenses([]);
    } catch (error) {
      console.log('Error clearing data:', error);
    }
  };

  // ============================================
  // EXPENSE FILTERING BY PERIOD
  // ============================================

  const today = getToday();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const yearStart = new Date(today.getFullYear(), 0, 1);

  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const weekExpenses = expenses.filter((e) => e.date >= formatDate(weekAgo) && e.date <= todayStr);
  const monthExpenses = expenses.filter((e) => e.date >= formatDate(monthStart) && e.date <= todayStr);
  const yearExpenses = expenses.filter((e) => e.date >= formatDate(yearStart) && e.date <= todayStr);

  const getData = useCallback(() => {
    if (period === 'today') return { items: todayExpenses, total: todayExpenses.reduce((s, e) => s + e.amount, 0) };
    if (period === 'week') return { items: weekExpenses, total: weekExpenses.reduce((s, e) => s + e.amount, 0) };
    if (period === 'month') return { items: monthExpenses, total: monthExpenses.reduce((s, e) => s + e.amount, 0) };
    return { items: yearExpenses, total: yearExpenses.reduce((s, e) => s + e.amount, 0) };
  }, [period, todayExpenses, weekExpenses, monthExpenses, yearExpenses]);

  // ============================================
  // RECURRING EXPENSE HELPERS
  // ============================================

  const getDaysUntil = useCallback((dateStr) => {
    const todayDate = getToday();
    const due = new Date(dateStr);
    const diff = Math.ceil((due - todayDate) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'due today';
    if (diff === 1) return 'tomorrow';
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    return `in ${diff}d`;
  }, []);

  // ============================================
  // EFFECTS
  // ============================================

  // Initial load
  useEffect(() => {
    loadData();
    loadSecuritySettings();
    checkBiometricAvailability();
  }, []);

  // Save expenses when changed
  useEffect(() => {
    if (!isLoading && expenses.length >= 0) {
      saveExpenses();
    }
  }, [expenses, isLoading, saveExpenses]);

  // Save preferences when changed
  useEffect(() => {
    if (!isLoading && onboardingComplete) {
      savePreferences();
    }
  }, [
    dark,
    name,
    onboardingComplete,
    currency,
    accentColor,
    useEUFormat,
    hideDecimals,
    dailyReminderEnabled,
    dailyReminderTime,
    backupReminderEnabled,
    backupReminderFreq,
    isLoading,
    savePreferences,
  ]);

  // Schedule daily reminder when settings change
  useEffect(() => {
    if (!isLoading && onboardingComplete) {
      scheduleDailyReminder(dailyReminderTime);
    }
  }, [dailyReminderEnabled, dailyReminderTime, isLoading, onboardingComplete, scheduleDailyReminder]);

  // App state listener for auto-lock
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        if (lockMethod !== 'none') {
          setIsLocked(true);
        }
      } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (lockMethod !== 'none') {
          handleUnlock();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [lockMethod, handleUnlock]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value = {
    // === Loading & Navigation ===
    isLoading,
    screen,
    setScreen,
    onboardingStep,
    setOnboardingStep,

    // === Theme & Preferences ===
    dark,
    setDark,
    name,
    setName,
    startDate,
    setStartDate,
    onboardingComplete,
    setOnboardingComplete,
    currency,
    setCurrency,
    accentColor,
    setAccentColor,
    useEUFormat,
    setUseEUFormat,
    hideDecimals,
    setHideDecimals,

    // === Computed Theme ===
    t,
    todayStr,

    // === Security ===
    isLocked,
    setIsLocked,
    lockMethod,
    setLockMethod,
    biometricAvailable,
    biometricType,
    saveLockMethod,
    savePin,
    verifyPin,
    authenticateWithBiometrics,
    handleUnlock,
    disableAppLock,
    enableLockMethod,

    // === Reminders ===
    dailyReminderEnabled,
    setDailyReminderEnabled,
    dailyReminderTime,
    setDailyReminderTime,
    toggleDailyReminder,
    backupReminderEnabled,
    setBackupReminderEnabled,
    backupReminderFreq,
    setBackupReminderFreq,
    lastExportDate,
    setLastExportDate,
    isBackupOverdue,
    getBackupOverdueMessage,
    updateLastExportDate,

    // === Data ===
    expenses,
    setExpenses,
    period,
    setPeriod,
    clearAllData,

    // === Computed Data ===
    getData,
    todayExpenses,
    weekExpenses,
    monthExpenses,
    yearExpenses,

    // === Helpers ===
    formatAmount,
    formatLargeAmount,
    getDaysUntil,

    // === Constants (convenient access) ===
    CURRENCIES,
    ACCENT_COLORS,
  };

  return <MoolaContext.Provider value={value}>{children}</MoolaContext.Provider>;
};
