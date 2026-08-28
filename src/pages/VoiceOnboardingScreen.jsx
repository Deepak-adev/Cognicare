import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, TextInput, Keyboard } from 'react-native';
import { globalStyles, colors } from '../components/common';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { Mic, MicOff, CheckCircle2, Sparkles, BrainCircuit, ArrowRight } from 'lucide-react-native';
import TTSService from '../services/TTSService';
import { Audio } from 'expo-av';
import { GroqService } from '../services/GroqService';

export const VoiceOnboardingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { saveOnboardedPatient, loadPatientData } = useStore();
  
  const initialName = route.params?.spokenName || 'Friend';
  const initialLangCode = route.params?.lang || 'en-US';
  
  const [turnCount, setTurnCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [detectedLangCode, setDetectedLangCode] = useState(initialLangCode);
  const [recording, setRecording] = useState(null);
  
  // Stores the conversation to pass to the LLM
  const [chatHistory, setChatHistory] = useState([]);
  
  const [pulseAnim] = useState(new Animated.Value(1));
  const MAX_TURNS = 4;

  useEffect(() => {
    let greeting = `Hello ${initialName}! I'm so glad to meet you. I would love to learn a little bit about your life journey.`;
    let speechLang = 'en-US';

    if (detectedLangCode === 'ta-IN') {
      greeting = `வணக்கம் ${initialName}! உங்களைச் சந்திப்பதில் எனக்கு மிகவும் மகிழ்ச்சி. உங்களின் வாழ்க்கை பயணத்தைப் பற்றி நான் கொஞ்சம் தெரிந்து கொள்ள விரும்புகிறேன்.`;
      speechLang = 'ta-IN';
    } else if (detectedLangCode === 'tanglish') {
      greeting = `Vanakam ${initialName}! Ungala paathathu romba santhosham. Unga life pathi konjam therinjukka aasa padren.`;
      speechLang = 'en-IN'; // Indian English accent for Tanglish TTS
    }
    
    setChatHistory([{ role: 'ai', text: greeting }]);
    
    TTSService.speak(greeting, {
      language: speechLang,
      rate: 0.9,
      pitch: 1,
      onDone: () => {
        setIsSpeaking(false);
        startListening(detectedLangCode);
      }
    });
    setIsSpeaking(true);

    return () => {
      TTSService.stop();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (recording) recording.stopAndUnloadAsync().catch(() => {});
    };
  }, [recording]);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const startListening = async (langCode = detectedLangCode) => {
    if (recording) {
      console.log('Recording already in progress. Skipping...');
      return;
    }
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY );
      setRecording(recording);
      setIsListening(true);
      setTranscript('');
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsListening(false);
    }
  };

  const stopListeningManual = async () => {
    setIsListening(false);
    if (!recording) return;

    try {
      console.log('Stopping recording..');
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      setRecording(null);

      // Show temporary text while transcribing
      setTranscript('Translating audio...');

      const transcribedText = await GroqService.transcribeAudio(uri, detectedLangCode);
      if (transcribedText) {
        setTranscript(transcribedText);
        handlePatientResponse(transcribedText);
      } else {
        setTranscript('Could not understand. Please try again or type.');
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const handlePatientResponse = async (patientText) => {
    if (!patientText || patientText.trim() === '') return;
    
    setInputText('');
    Keyboard.dismiss();
    console.log(`[STT Response] Turn ${turnCount}:`, patientText);
    
    const newTurn = turnCount + 1;
    setTurnCount(newTurn);
    
    const updatedHistory = [...chatHistory, { role: 'user', text: patientText }];
    setChatHistory(updatedHistory);

    if (newTurn >= MAX_TURNS) {
      // Conversation finished, extract data
      finishOnboarding(updatedHistory);
    } else {
      // Get AI response
      setIsSpeaking(true);
      const aiReply = await GroqService.chatTurn(updatedHistory, patientText, initialName, detectedLangCode);
      
      setChatHistory([...updatedHistory, { role: 'ai', text: aiReply }]);
      
      // Auto-detect language of AI's reply based on script
      let newLangCode = 'en-US';
      if (/[\u0B80-\u0BFF]/.test(aiReply)) newLangCode = 'ta-IN'; // Tamil
      else if (/[\u0980-\u09FF]/.test(aiReply)) newLangCode = 'as-IN'; // Assamese/Bengali script
      
      setDetectedLangCode(newLangCode);
      
      TTSService.speak(aiReply, {
        language: newLangCode,
        rate: 0.9,
        pitch: 1,
        onDone: () => {
          setIsSpeaking(false);
          startListening(newLangCode);
        }
      });
    }
  };

  const finishOnboarding = async (finalHistory) => {
    setIsSpeaking(true);
    let closingText = `Thank you so much for sharing your wonderful stories, ${initialName}. I've set up your personal space now!`;
    if (detectedLangCode === 'ta-IN') closingText = `உங்களது அழகான கதைகளைப் பகிர்ந்து கொண்டதற்கு மிக்க நன்றி, ${initialName}. உங்கள் கணக்கு தயாராகிவிட்டது!`;
    if (detectedLangCode === 'as-IN') closingText = `আপোনাৰ ধুনীয়া কাহিনীবোৰ শ্বেয়াৰ কৰাৰ বাবে বহুত ধন্যবাদ, ${initialName}। আপোনাৰ একাউণ্ট সাজু হৈছে!`;
    
    TTSService.speak(closingText, { language: detectedLangCode, rate: 0.9 });
    
    // Extract profile quietly in the background
    const extractedProfile = await GroqService.extractProfile(finalHistory, initialName);
    
    const newPatientId = await saveOnboardedPatient(extractedProfile);
    await loadPatientData(newPatientId);
    
    setIsSpeaking(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'PatientStack' }],
    });
  };

  // Get the last AI message to display
  const latestAiMessage = [...chatHistory].reverse().find(m => m.role === 'ai')?.text || '...';

  return (
    <View style={[globalStyles.container, { backgroundColor: '#fdf4ff', justifyContent: 'space-between' }]}>
      
      {/* Header */}
      <View style={{ alignItems: 'center', marginTop: 60, marginBottom: 20 }}>
        <BrainCircuit color="#d946ef" size={44} style={{ marginBottom: 12 }} />
        <Text style={{ fontSize: 26, fontWeight: '900', color: colors.textMain, textAlign: 'center' }}>
          Let's talk, {initialName}
        </Text>
        <Text style={{ fontSize: 16, color: colors.textMuted, marginTop: 8, textAlign: 'center', paddingHorizontal: 20 }}>
          Just speak naturally. I am here to listen to your life journey.
        </Text>
      </View>

      {/* Language Selector */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 10 }}>
        {['en-US', 'ta-IN', 'tanglish'].map((lang) => (
          <TouchableOpacity
            key={lang}
            onPress={() => setDetectedLangCode(lang)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: detectedLangCode === lang ? '#d946ef' : '#f1f5f9',
            }}
          >
            <Text style={{ 
              color: detectedLangCode === lang ? '#fff' : '#64748b', 
              fontWeight: '600',
              textTransform: 'capitalize' 
            }}>
              {lang === 'en-US' ? 'English' : lang === 'ta-IN' ? 'Tamil' : 'Tanglish'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Interaction Area */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
        
        <View style={{ backgroundColor: '#ffffff', padding: 32, borderRadius: 32, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, alignItems: 'center' }}>
          
          {isSpeaking ? (
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#d946ef', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
              🤖 AI Companion is speaking...
            </Text>
          ) : isListening ? (
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#ef4444', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
              🎙️ Listening to your story...
            </Text>
          ) : (
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
              Thinking...
            </Text>
          )}

          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textMain, textAlign: 'center', lineHeight: 32, marginBottom: 30 }}>
            "{latestAiMessage}"
          </Text>

          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={isListening ? stopListeningManual : () => startListening(detectedLangCode)}
          >
            <Animated.View style={[
              styles.micContainer, 
              { transform: [{ scale: pulseAnim }] },
              isListening ? { backgroundColor: '#ef4444', borderColor: '#fca5a5' } : { backgroundColor: '#e2e8f0', borderColor: '#f1f5f9' },
              turnCount >= MAX_TURNS && { backgroundColor: colors.success, borderColor: '#a7f3d0' }
            ]}>
              {turnCount >= MAX_TURNS ? (
                <CheckCircle2 color="#ffffff" size={50} />
              ) : isListening ? (
                <Mic color="#ffffff" size={50} />
              ) : (
                <MicOff color="#94a3b8" size={50} />
              )}
            </Animated.View>
          </TouchableOpacity>
          
          {transcript ? (
            <Text style={{ fontSize: 18, color: colors.textMuted, textAlign: 'center', marginTop: 24, fontStyle: 'italic' }}>
              "{transcript}"
            </Text>
          ) : null}

          {/* Typing Fallback */}
          <View style={{ width: '100%', marginTop: 24, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 16 }}>
            <TextInput 
              style={{ flex: 1, height: 50, fontSize: 16, color: colors.textMain }}
              placeholder="Or type your reply here..."
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => {
                if(isListening) stopListeningManual();
                handlePatientResponse(inputText);
              }}
            />
            {inputText.trim().length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  if(isListening) stopListeningManual();
                  handlePatientResponse(inputText);
                }}
                style={{ backgroundColor: '#d946ef', padding: 10, borderRadius: 14 }}
              >
                <ArrowRight color="#ffffff" size={20} />
              </TouchableOpacity>
            )}
          </View>

        </View>

      </View>

      {/* Progress Indicators */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 40, gap: 12 }}>
        {[...Array(MAX_TURNS)].map((_, idx) => (
          <View key={idx} style={{ 
            width: turnCount === idx ? 30 : 12, 
            height: 12, 
            borderRadius: 6, 
            backgroundColor: turnCount >= idx ? '#d946ef' : '#e2e8f0' 
          }} />
        ))}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  micContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  }
});
