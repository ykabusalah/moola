/**
 * OnboardingScreen.js - First-time user setup flow
 * Collects user name, start date, and introduces privacy features
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Animated, Platform } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMoola } from '../context/MoolaContext';
import { SketchCircle, Divider } from '../components/ui';
import { StarIcon } from '../components/icons';
import { formatDate, formatDisplayDate, getToday } from '../utils/date';

export const OnboardingScreen = ({ fadeAnim, transition, completeOnboarding }) => {
  const { 
    t, dark, 
    name, setName,
    onboardingStep,
  } = useMoola();

  const [onboardingDate, setOnboardingDate] = useState(getToday());
  const [showOnboardingDatePicker, setShowOnboardingDatePicker] = useState(false);

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
          <Text style={{ fontSize: 14, color: t.sub, textAlign: 'center', lineHeight: 28, maxWidth: 260, fontStyle: 'italic' }}>Your path to mindful spending begins in stillness.</Text>
          <TouchableOpacity onPress={() => transition(2)} style={{ marginTop: 48, paddingVertical: 14, paddingHorizontal: 44, borderWidth: 1, borderColor: t.border, borderRadius: 2 }}>
            <Text style={{ color: t.text, fontSize: 12, letterSpacing: 2 }}>BEGIN</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
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
            <DateTimePicker 
              value={onboardingDate} 
              mode="date" 
              display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
              maximumDate={getToday()} 
              onChange={(event, selectedDate) => { 
                setShowOnboardingDatePicker(Platform.OS === 'ios'); 
                if (selectedDate) setOnboardingDate(selectedDate); 
              }} 
              themeVariant={dark ? 'dark' : 'light'} 
            />
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
        <TouchableOpacity onPress={() => completeOnboarding(onboardingDate)} style={{ marginTop: 36, paddingVertical: 16, paddingHorizontal: 52, backgroundColor: t.soul, borderRadius: 2 }}>
          <Text style={{ color: '#fff', fontSize: 12, letterSpacing: 2 }}>ENTER</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Animated.View style={{ flex: 1, backgroundColor: t.bg, opacity: fadeAnim }}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1 }}>{renderStep()}</View>
      <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
        {[0, 1, 2, 3].map(i => (
          <Svg key={i} width={12} height={12} viewBox="0 0 12 12">
            <Path d="M6,1 Q10,1 11,6 Q10,11 6,11 Q2,11 1,6 Q2,1 6,1" stroke={i <= onboardingStep ? t.soul : t.muted} fill={i === onboardingStep ? t.soul : 'none'} strokeWidth={1} />
          </Svg>
        ))}
      </View>
    </Animated.View>
  );
};
