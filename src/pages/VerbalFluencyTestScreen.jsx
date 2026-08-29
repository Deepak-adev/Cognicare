import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { globalStyles, colors, Button } from '../components/common';
import { useStore } from '../store/useStore';
import { ChevronLeft, Mic, CheckCircle } from 'lucide-react-native';

export const VerbalFluencyTestScreen = () => {
  const { t } = useTheme();
  const navigation = useNavigation();
  const { patient, saveClinicalTest } = useStore();
  
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [transcribedWords, setTranscribedWords] = useState([]);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTest = () => {
    setIsTestActive(true);
    setTimeLeft(60);
    setTranscribedWords([]);
    
    // Pulse Animation for Mic
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();

    // Start Timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // In a native app, we would start @react-native-voice/voice here.
    // For this Expo web/simulator demo, we will simulate word transcription over time.
    simulateVoiceInput();
  };

  const simulateVoiceInput = () => {
    // Array of words simulating a patient naming animals
    const demoWords = ['dog', 'cat', 'elephant', 'tiger', 'um', 'lion', 'bear', 'wolf', 'cat', 'fox', 'deer'];
    let idx = 0;
    
    const wordInterval = setInterval(() => {
      if (idx < demoWords.length && isTestActive) {
        const word = demoWords[idx];
        setTranscribedWords(prev => [...prev, word]);
        idx++;
      } else {
        clearInterval(wordInterval);
      }
    }, 4500); // add a word roughly every 4.5 seconds
  };

  const finishTest = () => {
    setIsTestActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    pulseAnim.stopAnimation();
    
    // Analyze results (filter fillers and duplicates for a raw clinical score)
    const fillers = ['um', 'uh', 'ah', 'like'];
    const validWords = transcribedWords.filter(w => !fillers.includes(w.toLowerCase()));
    const uniqueWords = [...new Set(validWords)];
    
    const score = uniqueWords.length;
    
    saveClinicalTest(patient?.patient_id, 'Verbal Fluency', {
      score: score,
      words: transcribedWords, // we save raw so caregiver sees repetitions (like 'cat' twice)
      category: 'Animals',
      duration: 60 - timeLeft
    });

    setIsTestComplete(true);
  };

  // Demo shortcut button
  const handleFastForward = () => {
    setTranscribedWords(['dog', 'cat', 'elephant', 'tiger', 'um', 'lion', 'bear', 'wolf', 'cat', 'fox', 'deer', 'rabbit', 'mouse', 'rat']);
    setTimeLeft(1);
  };

  if (isTestComplete) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <CheckCircle color={colors.success} size={80} style={{ marginBottom: 20 }} />
        <Text style={[globalStyles.headerText, { textAlign: 'center', marginBottom: 12 }]}>{t("Test Completed") || "Test Completed"}</Text>
        <Text style={{ fontSize: 18, color: colors.textMuted, textAlign: 'center', marginBottom: 40, paddingHorizontal: 20 }}>{t("Your fluency score and transcript have been securely saved for clinical review.") || "Your fluency score and transcript have been securely saved for clinical review."}</Text>
        <Button onPress={() => navigation.goBack()} style={{ width: '100%' }}>
          <Text style={styles.btnText}>{t("Return to Activities") || "Return to Activities"}</Text>
        </Button>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textMain} size={32} />
        </TouchableOpacity>
        <Text style={[globalStyles.headerText, { flex: 1, textAlign: 'center', marginRight: 48 }]}>{t("Fluency Test") || "Fluency Test"}</Text>
      </View>

      <Text style={styles.instruction}>
        {t("Name as many ") || "Name as many "}<Text style={{ color: colors.primary, fontWeight: '900' }}>{t("ANIMALS") || "ANIMALS"}</Text>{t(" as you can in 60 seconds.") || " as you can in 60 seconds."}
      </Text>

      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, timeLeft <= 10 && { color: colors.danger }]}>
          00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
        </Text>
      </View>

      <View style={styles.micContainer}>
        {isTestActive ? (
          <Animated.View style={[styles.micPulse, { transform: [{ scale: pulseAnim }] }]}>
            <Mic color="#ffffff" size={60} />
          </Animated.View>
        ) : (
          <TouchableOpacity onPress={startTest} style={styles.startBtn} activeOpacity={0.8}>
            <Mic color="#ffffff" size={60} />
          </TouchableOpacity>
        )}
      </View>

      {!isTestActive && timeLeft === 60 && (
        <Text style={{ textAlign: 'center', fontSize: 18, color: colors.textMuted, marginTop: 20 }}>{t("Tap the microphone to begin.") || "Tap the microphone to begin."}</Text>
      )}

      {isTestActive && (
        <View style={styles.transcriptContainer}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textMain, marginBottom: 12 }}>{t("Recognized words:") || "Recognized words:"}</Text>
          <ScrollView style={styles.transcriptBox}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {transcribedWords.map((word, idx) => (
                <View key={idx} style={styles.wordChip}>
                  <Text style={styles.wordText}>{word}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity onPress={handleFastForward} style={{ marginTop: 20, padding: 12, backgroundColor: colors.bgSubtle, borderRadius: 12 }}>
             <Text style={{ textAlign: 'center', color: colors.textMuted, fontWeight: '700' }}>{t("Demo: Fast Forward 60s") || "Demo: Fast Forward 60s"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20
  },
  backBtn: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  instruction: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
    lineHeight: 36
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40
  },
  timerText: {
    fontSize: 64,
    fontWeight: '900',
    color: colors.textMain,
    fontVariant: ['tabular-nums']
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 160
  },
  startBtn: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10
  },
  micPulse: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.danger, // Red when recording
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10
  },
  transcriptContainer: {
    flex: 1,
    marginTop: 30,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  transcriptBox: {
    flex: 1
  },
  wordChip: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  wordText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark || '#1e3a8a'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase'
  }
});
