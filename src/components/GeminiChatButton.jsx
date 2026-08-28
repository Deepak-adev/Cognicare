import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Mic, Square } from 'lucide-react-native';
import { sendMessageToGemini } from '../services/geminiService';
import { GroqService } from '../services/GroqService';
import { moodService } from '../services/moodService';
import { navigateTo } from '../utils/navigationRef';
import { useStore } from '../store/useStore';
import { db } from '../db/db';

const FAB_SIZE = 64;

export const GeminiChatButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fabGlow = useRef(new Animated.Value(0)).current;

  // Store actions and state
  const {
    updatePatientSettings,
    markMedicationTaken,
    addMedication,
    addTimelineTask,
    logInteraction,
    medications,
    patientSettings,
    patient,
  } = useStore();

  // Pulsing glow animation on FAB when idle
  useEffect(() => {
    if (!isRecording && !isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fabGlow, { toValue: 1, duration: 1600, useNativeDriver: true }),
          Animated.timing(fabGlow, { toValue: 0, duration: 1600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      fabGlow.setValue(0);
    }
  }, [isRecording, isLoading]);

  // Aggressive pulse animation when recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Handle Hot Reloading / cleanup
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [recording]);

  const startRecording = async () => {
    if (recording) return;
    
    // Stop any ongoing speech when the user starts speaking
    Speech.stop();

    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: newRec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(newRec);
      setIsRecording(true);
    } catch (err) {
      console.error('[AGUI] Failed to start recording', err);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recording.getURI();
      setRecording(null);

      setIsLoading(true);
      const transcribed = await GroqService.transcribeAudio(uri, 'en-US');
      if (transcribed && transcribed.trim().length > 0) {
        processCommand(transcribed);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error('[AGUI] Failed to stop recording', err);
      setIsLoading(false);
    }
  };

  const handleToggleMic = () => {
    if (isLoading) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  /**
   * Execute Agentic UI Action on the live application
   */
  const executeAgenticAction = useCallback((action) => {
    if (!action || action.type === 'none') return;

    try {
      switch (action.type) {
        case 'navigate': {
          if (action.screen) {
            console.log('[AGUI] 🧭 Navigating to screen:', action.screen);
            navigateTo(action.screen);
          }
          break;
        }

        case 'setting': {
          if (action.key !== undefined) {
            console.log('[AGUI] ⚙️ Applying setting:', action.key, '=', action.value);
            updatePatientSettings({ [action.key]: action.value });
          }
          break;
        }

        case 'markMedTaken': {
          const untaken = medications.find((m) => !m.taken);
          if (action.id) {
            markMedicationTaken(action.id);
          } else if (untaken) {
            markMedicationTaken(untaken.id);
          }
          console.log('[AGUI] 💊 Medication marked as taken');
          break;
        }

        case 'addMedication': {
          if (action.name) {
            addMedication({
              name: action.name,
              time: action.time || '8:00 AM',
            });
            console.log('[AGUI] 💊 Added medication:', action.name);
          }
          break;
        }

        case 'addTimelineTask': {
          if (action.title) {
            addTimelineTask({
              title: action.title,
              time: action.time || '10:00 AM',
              icon: 'Activity',
            });
            console.log('[AGUI] 📅 Added timeline task:', action.title);
          }
          break;
        }

        default:
          console.log('[AGUI] Unhandled action type:', action.type);
      }
    } catch (err) {
      console.warn('[AGUI] Action execution error:', err);
    }
  }, [medications, updatePatientSettings, markMedicationTaken, addMedication, addTimelineTask]);

  const processCommand = useCallback(async (query) => {
    if (!query) return;

    try {
      // Gather live DB & state context for Gemini
      const allPatients = await db.patients.toArray().catch(() => []);
      const appContext = {
        allPatients: allPatients.map((p) => ({
          name: p.name,
          age: p.age,
          location: p.location,
          interests: p.interests,
          family: p.family || p.family_members,
        })),
        activePatient: patient
          ? {
              name: patient.name,
              age: patient.age,
              location: patient.location,
              safety: patient.safety,
            }
          : null,
        medications: medications.map((m) => ({ name: m.name, time: m.time, taken: m.taken })),
        patientSettings,
      };

      const startTime = Date.now();
      const response = await sendMessageToGemini([], query, appContext);
      const responseTimeMs = Date.now() - startTime;

      const aiText = response.message || 'Action executed.';
      
      // Execute live AGUI changes immediately
      if (response.action && response.action.type !== 'none') {
        executeAgenticAction(response.action);
      }

      // Mood tagging and logging
      if (patient?.patient_id) {
        moodService.classifyMood(query).then(({ mood, confidence }) => {
          logInteraction(patient.patient_id, {
            timestamp: new Date().toISOString(),
            mood,
            confidence,
            response_time_ms: responseTimeMs,
            accuracy: 1.0 
          });
        });
      }

      // Voice output
      Speech.speak(aiText);

    } catch (err) {
      console.error('[AGUI] Error processing command:', err);
      Speech.speak("I'm sorry, I couldn't process that right now.");
    } finally {
      setIsLoading(false);
    }
  }, [executeAgenticAction, patientSettings, patient, medications, logInteraction]);

  const fabGlowOpacity = fabGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.7],
  });

  // Determine button styles based on state
  let buttonBackgroundColor = '#4f46e5'; // Default indigo
  if (isRecording) buttonBackgroundColor = '#ef4444'; // Red when recording
  if (isLoading) buttonBackgroundColor = '#f59e0b'; // Amber when loading

  return (
    <View style={styles.fabContainer} pointerEvents="box-none">
      {!isRecording && !isLoading && (
        <Animated.View style={[styles.fabGlow, { opacity: fabGlowOpacity }]} />
      )}
      
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: buttonBackgroundColor }]}
          onPress={handleToggleMic}
          activeOpacity={0.85}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#ffffff" />
          ) : isRecording ? (
            <Square color="#ffffff" size={28} fill="#ffffff" />
          ) : (
            <Mic color="#ffffff" size={32} />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 95, // Above the bottom tab bar
    right: 18,  // Right aligned
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 25,
  },
  fabGlow: {
    position: 'absolute',
    width: FAB_SIZE + 24,
    height: FAB_SIZE + 24,
    borderRadius: (FAB_SIZE + 24) / 2,
    backgroundColor: '#818cf8',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
});
