import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { globalStyles, colors, Button } from '../components/common';
import { Home, Calendar, Clock, User, HeartHandshake, CheckCircle } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';

export const ConfusionRescueScreen = () => {
  const navigation = useNavigation();
  const { patient, timelineTasks } = useStore();
  const { fontScale } = useTheme();
  
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [nextTask, setNextTask] = useState(null);
  
  useEffect(() => {
    // 1. Setup Time & Date
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setCurrentDate(now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
    
    // 2. Find Next Activity
    const pendingTasks = timelineTasks.filter(t => !t.done);
    const upcoming = pendingTasks.length > 0 ? pendingTasks[0].title : 'Rest and Relax';
    setNextTask(upcoming);
    
    // 3. Trigger Voice Assistance
    const speakMessage = () => {
      const caregiverName = patient?.family_members?.[0] || 'your family';
      const text = `You are safe. You are at home. Today is ${now.toLocaleDateString([], { weekday: 'long' })}. It is currently ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Your next scheduled activity is ${upcoming}. ${caregiverName} is available if you need them. Take a deep breath.`;
      
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1,
        rate: 0.8, // Slightly slower for comprehension
      });
    };
    
    speakMessage();
    
    return () => {
      Speech.stop();
    };
  }, [patient, timelineTasks]);

  const caregiverName = patient?.family_members?.[0] || 'Your caregiver';

  return (
    <View style={[globalStyles.container, styles.container]}>
      
      <View style={styles.header}>
        <HeartHandshake color={colors.success} size={64} style={{ marginBottom: 16 }} />
        <Text style={[styles.title, { fontSize: 32 * fontScale }]}>You are safe.</Text>
        <Text style={[styles.subtitle, { fontSize: 20 * fontScale }]}>Let's look at today's plan together.</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.row}>
          <Home color={colors.primary} size={32} style={styles.icon} />
          <View>
            <Text style={styles.label}>You are at</Text>
            <Text style={styles.value}>HOME</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Calendar color={colors.primary} size={32} style={styles.icon} />
          <View>
            <Text style={styles.label}>Today is</Text>
            <Text style={styles.value}>{currentDate}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Clock color={colors.primary} size={32} style={styles.icon} />
          <View>
            <Text style={styles.label}>Current time</Text>
            <Text style={styles.value}>{currentTime}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <CheckCircle color={colors.success} size={32} style={styles.icon} />
          <View>
            <Text style={styles.label}>Your next activity</Text>
            <Text style={styles.value}>{nextTask}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <User color={colors.primary} size={32} style={styles.icon} />
          <View>
            <Text style={styles.label}>Your caregiver</Text>
            <Text style={styles.value}>{caregiverName}</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <Button 
        onPress={() => {
          Speech.stop();
          navigation.goBack();
        }}
        style={styles.btn}
      >
        <Text style={styles.btnText}>I'M OKAY NOW</Text>
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
    marginBottom: 40,
  },
  title: {
    fontWeight: '900',
    color: colors.success,
    textAlign: 'center',
  },
  subtitle: {
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  icon: {
    marginRight: 20,
    backgroundColor: colors.bgSubtle,
    padding: 8,
    borderRadius: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textMain,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 24,
    borderRadius: 24,
    marginBottom: 40,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center'
  }
});
