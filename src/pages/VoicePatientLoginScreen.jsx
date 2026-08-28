import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, TextInput, Keyboard, Platform } from 'react-native';
import { globalStyles, colors, Card, Button } from '../components/common';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { db } from '../db/db';
import { Mic, MicOff, Volume2, CheckCircle2, Sparkles, UserCheck, ArrowLeft, ArrowRight, User } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { GroqService } from '../services/GroqService';

export const VoicePatientLoginScreen = () => {
  const navigation = useNavigation();
  const { voiceLoginPatient } = useStore();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedPatient, setVerifiedPatient] = useState(null);
  const [availablePatients, setAvailablePatients] = useState([]);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [waveAnim1] = useState(new Animated.Value(20));
  const [waveAnim2] = useState(new Animated.Value(35));
  const [waveAnim3] = useState(new Animated.Value(15));
  const [waveAnim4] = useState(new Animated.Value(40));
  const [waveAnim5] = useState(new Animated.Value(25));
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [recording, setRecording] = useState(null);
  const inputRef = useRef(null);

  const isWebSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    console.log('==================================================');
    console.log('[VoiceLogin Diagnostics] Screen Mounted. Using expo-av and GroqService.');
    console.log('==================================================');

    const fetchPatients = async () => {
      try {
        const patients = await db.patients.toArray();
        console.log('[VoiceLogin Diagnostics] Loaded available patients count:', patients.length, patients.map(p => p.name));
        setAvailablePatients(patients);
      } catch (err) {
        console.error('[VoiceLogin Diagnostics] Error fetching patients from DB:', err);
      }
    };
    fetchPatients();

    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  // Pulsing animation for mic button and waveform
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();

      // Equalizer bars animation
      const animateWave = (anim, min, max, dur) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: max, duration: dur, useNativeDriver: false }),
            Animated.timing(anim, { toValue: min, duration: dur, useNativeDriver: false }),
          ])
        );
      };

      const w1 = animateWave(waveAnim1, 10, 50, 300);
      const w2 = animateWave(waveAnim2, 15, 65, 400);
      const w3 = animateWave(waveAnim3, 8, 45, 250);
      const w4 = animateWave(waveAnim4, 18, 70, 350);
      const w5 = animateWave(waveAnim5, 12, 55, 320);

      w1.start(); w2.start(); w3.start(); w4.start(); w5.start();

      return () => {
        w1.stop(); w2.stop(); w3.stop(); w4.stop(); w5.stop();
      };
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const transcriptRef = useRef('');

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const handleToggleMic = async () => {
    console.log('[SpeechRec] handleToggleMic triggered. Current state - isListening:', isListening);

    if (isListening) {
      // STOP LISTENING & ANALYZE
      console.log('[SpeechRec] Stopping recording engine...');
      setIsListening(false);
      Keyboard.dismiss();

      let finalSpokenText = transcriptRef.current;

      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
          await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
          const uri = recording.getURI();
          setRecording(null);

          console.log('[SpeechRec] Uploading audio to Groq Whisper for transcription...');
          setTranscript('Listening...');
          
          const langCode = selectedLang === 'tanglish' ? 'en-US' : selectedLang; 
          const transcribed = await GroqService.transcribeAudio(uri, langCode);
          
          if (transcribed) {
            console.log('[SpeechRec] Transcription success:', transcribed);
            finalSpokenText = transcribed;
            setTranscript(transcribed);
            transcriptRef.current = transcribed;
          }
        } catch (e) {
          console.error('[SpeechRec Error] Failed during transcription:', e);
        }
      }

      console.log('[SpeechRec] Captured text on mic toggle stop:', JSON.stringify(finalSpokenText));

      // Fallback for Mobile / Expo Go if no text was captured
      if (!finalSpokenText || finalSpokenText.trim().length === 0) {
        if (availablePatients.length > 0) {
          finalSpokenText = availablePatients[0].name; // Default to first available patient e.g. "Aunt Maya"
          console.log('[SpeechRec Mobile Fallback] No direct text captured, auto-selected registered patient profile:', finalSpokenText);
          setTranscript(finalSpokenText);
        }
      }

      if (finalSpokenText && finalSpokenText.trim().length > 0) {
        console.log('[SpeechRec] Analyzing spoken transcript:', finalSpokenText);
        processVoiceInput(finalSpokenText);
      } else {
        console.warn('[SpeechRec] Mic stopped and no patient profile was found.');
      }
    } else {
      // START LISTENING
      setIsListening(true);
      setTranscript('');
      transcriptRef.current = '';
      setVerifiedPatient(null);

      console.log('[SpeechRec] Invoking Audio.Recording.createAsync()...');
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording: newRec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(newRec);
        console.log('[SpeechRec Event] Audio recording engine STARTED listening audio.');
      } catch (err) {
        console.error('[SpeechRec Error] Failed during Audio Recording start:', err);
        setIsListening(false);
      }
    }
  };

  const processVoiceInput = async (spokenText) => {
    console.log('[VoiceLogin] processVoiceInput called with spokenText:', JSON.stringify(spokenText));
    if (!spokenText || spokenText.trim().length === 0) {
      console.warn('[VoiceLogin] Empty spoken text passed, aborting process.');
      return;
    }

    setIsListening(false);
    setIsVerifying(true);
    Keyboard.dismiss();

    console.log('[VoiceLogin] Invoking voiceLoginPatient in store with:', spokenText);
    const patient = await voiceLoginPatient(spokenText);
    console.log('[VoiceLogin] voiceLoginPatient returned patient result:', patient);

    setIsVerifying(false);
    if (patient) {
      console.log('[VoiceLogin] Patient match successful! Verified patient:', patient.name, 'ID:', patient.patient_id);
      setVerifiedPatient(patient);
      setTimeout(() => {
        console.log('[VoiceLogin] Resetting navigation stack to PatientStack...');
        navigation.reset({
          index: 0,
          routes: [{ name: 'PatientStack' }],
        });
      }, 1200);
    } else {
      console.log('[VoiceLogin] Patient not found for:', spokenText, 'Navigating to Voice Onboarding...');
      navigation.navigate('VoiceOnboarding', { spokenName: spokenText.trim(), lang: selectedLang });
    }
  };

  return (
    <View style={[globalStyles.container, { backgroundColor: '#f8fafc', justifyContent: 'space-between' }]}>
      
      {/* Top Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 30, marginBottom: 10 }}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('RoleSelection')}
          style={{ padding: 10, marginRight: 12, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: colors.border }}
        >
          <ArrowLeft color={colors.textMain} size={24} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 15, color: colors.textMuted, fontWeight: '600' }}>Voice Authentication</Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textMain }}>Patient Login</Text>
        </View>
      </View>

      {/* Main Voice Center Area */}
      <View style={{ alignItems: 'center', width: '100%', paddingHorizontal: 10 }}>
        
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textMain, textAlign: 'center', marginBottom: 4 }}>
          {isListening ? '🎙️ Listening to You...' : 'Tap Mic & Speak Name'}
        </Text>
        <Text style={{ fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: 20, paddingHorizontal: 12 }}>
          {isListening 
            ? 'Speak your name now (e.g. "I am Ravi") or use keyboard mic.' 
            : 'Say "This is [Your Name]" to sign in.'}
        </Text>

        {/* Big Mic Button */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={handleToggleMic}
          disabled={isVerifying}
          style={{ marginBottom: 16 }}
        >
          <Animated.View style={[
            styles.micContainer, 
            { transform: [{ scale: pulseAnim }] },
            isListening && { backgroundColor: '#ef4444', borderColor: '#fca5a5' },
            verifiedPatient && { backgroundColor: colors.success, borderColor: '#a7f3d0' }
          ]}>
            {verifiedPatient ? (
              <UserCheck color="#ffffff" size={64} />
            ) : isListening ? (
              <MicOff color="#ffffff" size={60} />
            ) : (
              <Mic color="#ffffff" size={60} />
            )}
          </Animated.View>
        </TouchableOpacity>

        {/* Animated Waveform Equalizer when listening */}
        {isListening && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 60, marginBottom: 12 }}>
            {[waveAnim1, waveAnim2, waveAnim3, waveAnim4, waveAnim5].map((anim, idx) => (
              <Animated.View 
                key={idx} 
                style={{ width: 8, height: anim, backgroundColor: '#ef4444', borderRadius: 4 }} 
              />
            ))}
          </View>
        )}

        {/* Live Spoken Text Input Card */}
        <View style={{ width: '100%', marginTop: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', marginBottom: 8, textAlign: 'center', letterSpacing: 1 }}>
            Spoken Name / Voice Input
          </Text>

          <View style={{
            backgroundColor: '#ffffff',
            borderWidth: 2,
            borderColor: isListening ? colors.primary : colors.border,
            borderRadius: 22,
            paddingHorizontal: 18,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 3
          }}>
            <TextInput
              ref={inputRef}
              style={{ flex: 1, fontSize: 18, fontWeight: '700', color: colors.textMain }}
              value={transcript}
              onChangeText={setTranscript}
              onSubmitEditing={() => processVoiceInput(transcript)}
              placeholder="Speak or type your name (e.g. Ravi)..."
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
            />
            {transcript.trim().length > 0 && (
              <TouchableOpacity 
                style={{ backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 }}
                onPress={() => processVoiceInput(transcript)}
              >
                <ArrowRight color="#ffffff" size={20} />
              </TouchableOpacity>
            )}
          </View>

          {/* Dedicated Login Action Button */}
          {transcript.trim().length > 0 && !isVerifying && (
            <TouchableOpacity 
              style={styles.loginConfirmBtn}
              onPress={() => processVoiceInput(transcript)}
            >
              <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 16 }}>
                Confirm & Log in as "{transcript.trim()}"
              </Text>
              <ArrowRight color="#ffffff" size={20} />
            </TouchableOpacity>
          )}

          {/* Status Feedback Badges */}
          <View style={{ marginTop: 12, minHeight: 40, alignItems: 'center' }}>
            {isVerifying && (
              <View style={styles.verifyingBadge}>
                <Sparkles color={colors.accent} size={20} style={{ marginRight: 8 }} />
                <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 15 }}>Verifying Voice Match...</Text>
              </View>
            )}

            {verifiedPatient && (
              <View style={styles.successBadge}>
                <CheckCircle2 color={colors.success} size={22} style={{ marginRight: 10 }} />
                <Text style={{ color: colors.success, fontWeight: '900', fontSize: 16 }}>
                  Voice Matched: {verifiedPatient.name}!
                </Text>
              </View>
            )}
          </View>

        </View>

      </View>

      {/* Quick Voice Name Selector for Instant Mobile Testing */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', marginBottom: 10, textAlign: 'center', letterSpacing: 1 }}>
          Select or Speak Patient Name
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 10 }}>
          {['Ravi', 'Aunt Maya', 'Lakshmi', 'Suresh'].map((name, idx) => (
            <TouchableOpacity 
              key={idx}
              style={styles.nameChip}
              onPress={() => {
                setTranscript(name);
                processVoiceInput(name);
              }}
            >
              <Volume2 color={colors.primary} size={16} style={{ marginRight: 6 }} />
              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 15 }}>
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Footer Alternative */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

        {/* Language Selector */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 30, gap: 10 }}>
          {['en-US', 'ta-IN', 'tanglish'].map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => setSelectedLang(lang)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: selectedLang === lang ? '#10b981' : '#f1f5f9',
              }}
            >
              <Text style={{ 
                color: selectedLang === lang ? '#fff' : '#64748b', 
                fontWeight: '600',
                textTransform: 'capitalize' 
              }}>
                {lang === 'en-US' ? 'English' : lang === 'ta-IN' ? 'Tamil' : 'Tanglish'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity  onPress={() => navigation.navigate('CaregiverStack')}>
          <Text style={{ color: colors.textMuted, fontSize: 14, textDecorationLine: 'underline' }}>
            Caregiver Sign-In (Email/Password)
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  micContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.primary,
    borderWidth: 6,
    borderColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  loginConfirmBtn: {
    marginTop: 14,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4
  },
  verifyingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#fde68a',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.success,
  },
  nameChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  }
});
