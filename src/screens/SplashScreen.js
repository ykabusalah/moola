/**
 * SplashScreen.js - Initial loading screen with app logo
 * Shows animated moola branding before transitioning to main app
 */

import React from 'react';
import { View, Text, StatusBar, Animated } from 'react-native';
import { useMoola } from '../context/MoolaContext';
import { SketchCircle } from '../components/ui';

export const SplashScreen = ({ fadeAnim }) => {
  const { t, dark } = useMoola();

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
};
