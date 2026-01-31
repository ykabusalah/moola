/**
 * App.js - Root component for moola expense tracker
 * Handles screen navigation, animations, and wraps app in MoolaProvider
 */

import React, { useEffect, useRef } from 'react';
import { View, StatusBar, Animated, SafeAreaView } from 'react-native';
import { MoolaProvider, useMoola } from './context/MoolaContext';
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LockScreen } from './screens/LockScreen';
import { MainScreen } from './screens/MainScreen';
import { SketchCircle } from './components/ui';
import { themes } from './constants/theme';
import { formatDate } from './utils/date';

const AppContent = () => {
  const { 
    isLoading, 
    isLocked, 
    screen, setScreen,
    onboardingComplete,
    setOnboardingStep,
    setStartDate,
    setOnboardingComplete,
    dark, t
  } = useMoola();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const splashTimerRef = useRef(false);

  const transition = (next) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      if (typeof next === 'number') setOnboardingStep(next);
      else setScreen(next);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  const completeOnboarding = (onboardingDate) => {
    setStartDate(formatDate(onboardingDate));
    setOnboardingComplete(true);
    transition('main');
  };

  useEffect(() => {
    if (screen === 'splash' && !isLoading && !splashTimerRef.current) {
      splashTimerRef.current = true;
      setTimeout(() => transition(onboardingComplete ? 'main' : 'onboarding'), 2200);
    }
  }, [screen, isLoading, onboardingComplete]);

  // Loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: dark ? themes.dark.bg : themes.light.bg, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <SketchCircle size={60} color={dark ? themes.dark.soul : themes.light.ink} />
      </View>
    );
  }

  // Lock screen
  if (isLocked && screen === 'main') {
    return <LockScreen />;
  }

  // Splash screen
  if (screen === 'splash') {
    return <SplashScreen fadeAnim={fadeAnim} />;
  }

  // Onboarding
  if (screen === 'onboarding') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
        <OnboardingScreen 
          fadeAnim={fadeAnim} 
          transition={transition}
          completeOnboarding={completeOnboarding}
        />
      </SafeAreaView>
    );
  }

  // Main app
  return <MainScreen />;
};

export default function App() {
  return (
    <MoolaProvider>
      <AppContent />
    </MoolaProvider>
  );
}
