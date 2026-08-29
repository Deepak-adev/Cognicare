import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TTSService from '../services/TTSService';
import { globalStyles, colors, Button } from '../components/common';
import { Home, Calendar, Clock, PhoneCall, HeartHandshake } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';

export const ConfusionRescueScreen = () => {
  const { t } = useTheme();
  const navigation = useNavigation();
  const { patient, timelineTasks, triggerRescueProtocol } = useStore();
  const { fontScale } = useTheme();
  
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  
  const breathAnim = useRef(new Animated.Value(0.7)).current;
  const [breathText, setBreathText] = useState('Breathe In');

  useEffect(() => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setCurrentDate(now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
    
    // Voice Assistance - specifically paced for breathing
    const speakMessage = () => {
      const text = `You are safe. You are at home. Take a slow, deep breath in...... and out....... Today is ${now.toLocaleDateString([], { weekday: 'long' })}. I am here to help you.`;
      
      TTSService.speak(text, {
        language: 'en-US',
        pitch: 1,
        rate: 0.7, // Slower, soothing pace
      });
    };
    speakMessage();
    
    // Breathing Animation Loop
    const breatheIn = Animated.timing(breathAnim, {
      toValue: 1.3,
      duration: 4000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });
    
    const breatheOut = Animated.timing(breathAnim, {
      toValue: 0.7,
      duration: 4000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });

    // We toggle the text right as the animation switches
    let isMounted = true;
    const runAnimation = () => {
      if (!isMounted) return;
      setBreathText('Breathe In...');
      breatheIn.start(() => {
        if (!isMounted) return;
        setBreathText('Breathe Out...');
        breatheOut.start(() => runAnimation());
      });
    };
    
    runAnimation();
    
    return () => {
      isMounted = false;
      TTSService.stop();
    };
  }, [patient, timelineTasks]);

  const caregiverName = patient?.family_members?.[0] || 'your family';

  const handleCallCaregiver = () => {
    // In a real app, this would be the actual caregiver's phone number from the DB.
    // We use a dummy number for the prototype.
    const phoneNumber = 'tel:+1234567890';
    Linking.canOpenURL(phoneNumber).then(supported => {
      if (supported) {
        Linking.openURL(phoneNumber);
      } else {
        console.warn('Cannot open dialer');
      }
    });
  };

  return (
    <View style={[globalStyles.container, styles.container]}>
      
      {/* 1. Reassurance Header */}
      <View style={styles.header}>
        <HeartHandshake color={colors.success} size={48} style={{ marginBottom: 12 }} />
        <Text style={[styles.title, { fontSize: 32 * fontScale }]}>{t("You are safe.") || "You are safe."}</Text>
        <Text style={[styles.subtitle, { fontSize: 20 * fontScale }]}>{t("You are at home.") || "You are at home."}</Text>
      </View>

      {/* 2. Visual Breathing Exercise */}
      <View style={styles.breathingContainer}>
        <Animated.View style={[styles.breathingCircle, { transform: [{ scale: breathAnim }] }]} />
        <Text style={[styles.breathingText, { fontSize: 24 * fontScale }]}>{breathText}</Text>
      </View>

      {/* 3. Orientation Facts (Simplified) */}
      <View style={styles.infoRow}>
        <View style={styles.infoPill}>
          <Calendar color={colors.primary} size={20} style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 16 * fontScale, fontWeight: '700', color: colors.textMain }}>{currentDate}</Text>
        </View>
        <View style={styles.infoPill}>
          <Clock color={colors.primary} size={20} style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 16 * fontScale, fontWeight: '700', color: colors.textMain }}>{currentTime}</Text>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      {/* 4. SOS Call Button */}
      <TouchableOpacity 
        style={styles.sosButton}
        onPress={handleCallCaregiver}
        activeOpacity={0.8}
      >
        <PhoneCall color="#ffffff" size={32} style={{ marginRight: 16 }} />
        <Text style={[styles.sosText, { fontSize: 24 * fontScale }]}>Call {caregiverName}</Text>
      </TouchableOpacity>

      {/* 5. Return Button */}
      <Button 
        onPress={() => {
          TTSService.stop();
          triggerRescueProtocol(false);
          navigation.goBack();
        }}
        style={styles.okBtn}
      >
        <Text style={styles.okBtnText}>{t("I'M OKAY NOW") || "I'M OKAY NOW"}</Text>
      </Button>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontWeight: '900',
    color: colors.success,
    textAlign: 'center',
  },
  subtitle: {
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    marginBottom: 30,
  },
  breathingCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#e0e7ff', // Soft indigo for calmness
    borderWidth: 4,
    borderColor: '#c7d2fe',
  },
  breathingText: {
    fontWeight: '800',
    color: colors.primary,
    zIndex: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sosButton: {
    backgroundColor: '#ef4444', // Red for urgency/alert
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  sosText: {
    color: '#ffffff',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  okBtn: {
    backgroundColor: '#94a3b8', // Subtle grey so it doesn't distract from the red button
    paddingVertical: 20,
    borderRadius: 24,
    marginBottom: 40,
  },
  okBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center'
  }
});
