import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Card, colors } from '../components/common';
import { useTheme } from '../hooks/useTheme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Mic, Brain, Crosshair, Clock, AlertCircle } from 'lucide-react-native';
import { gamesData } from '../data/gamesData';

const MemoryGame = ({ data, onComplete }) => {
  const { colors, globalStyles, settings, speak, t, fontScale } = useTheme();
  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelect = (index) => {
    speak(data.options[index]);
    if (index === data.correctAnswer) {
      setErrorMsg('');
      onComplete();
    } else {
      setErrorMsg(t('tryAgain'));
    }
  };

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      {step === 0 && (
        <>
          <Brain color={colors.primary} size={64} style={{ marginBottom: 24 }} />
          <Text style={[globalStyles.headerText, { textAlign: 'center', fontSize: 34 * fontScale }]}>{t(data.intro) || data.intro}</Text>
          <Text style={[globalStyles.text, { textAlign: 'center', marginTop: 12, marginBottom: 40, fontSize: 18 * fontScale }]}>
            {t('lookCarefully')}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 60 }}>
            {data.objects.map((obj, i) => (
              <Text key={i} style={{ fontSize: 60 }}>{obj}</Text>
            ))}
          </View>
          <Button onPress={() => setStep(1)} style={{ width: '100%', marginTop: 20, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6, paddingVertical: 18, borderRadius: 20 }} variant="primary">
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#ffffff', letterSpacing: 0.5 }}>{t('rememberThem') || 'I remember them'}</Text>
          </Button>
        </>
      )}
      {step === 1 && (
        <>
          <View style={{ backgroundColor: '#eff6ff', padding: 16, borderRadius: 20, marginBottom: 16, width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
            <Mic color={colors.primary} size={28} style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 22 * fontScale, fontWeight: '700', color: colors.primary, textAlign: 'center', flexShrink: 1 }}>"{t(data.question) || data.question}"</Text>
          </View>

          {errorMsg ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <AlertCircle color={colors.danger} size={20} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.danger, fontSize: 18 * fontScale, fontWeight: '600' }}>{errorMsg}</Text>
            </View>
          ) : (
            <View style={{ height: 40 }} />
          )}
          
          <View style={{ width: '100%', gap: 16 }}>
            {data.options.map((opt, i) => (
              <TouchableOpacity 
                key={i} 
                style={[styles.optionBtn, { borderColor: colors.border }]} 
                onPress={() => handleSelect(i)}
                delayPressIn={settings.ignoreAccidentalTaps ? 300 : 0}
              > 
                <Text style={[styles.optionText, { color: colors.textMain, fontSize: 20 * fontScale }]}>{t(opt) || opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const AttentionGame = ({ data, onComplete }) => {
  const { colors, globalStyles, settings, speak, t } = useTheme();
  const [errorMsg, setErrorMsg] = useState('');

  // Generate grid dynamically
  const [grid, setGrid] = useState([]);
  
  useEffect(() => {
    let newGrid = Array(data.gridSize - 1).fill(0).map(() => 
      data.distractors[Math.floor(Math.random() * data.distractors.length)]
    );
    // Insert target at random position
    const targetIdx = Math.floor(Math.random() * data.gridSize);
    newGrid.splice(targetIdx, 0, data.target);
    setGrid(newGrid);
  }, [data]);

  const handleTap = (emoji) => {
    speak(emoji);
    if (emoji === data.target) {
      setErrorMsg('');
      onComplete();
    } else {
      setErrorMsg('Oops, that is not the right one.');
    }
  };

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <Crosshair color={colors.danger} size={64} style={{ marginBottom: 24 }} />
      <Text style={[globalStyles.headerText, { textAlign: 'center' }]}>{t("Attention Tracker") || "Attention Tracker"}</Text>
      <Text style={[globalStyles.text, { textAlign: 'center', marginTop: 12, marginBottom: 20 }]}>
        Tap ONLY the <Text style={{ color: colors.danger, fontWeight: '800' }}>{data.target}</Text> object.
      </Text>

      {errorMsg ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <AlertCircle color={colors.danger} size={20} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.danger, fontSize: 18, fontWeight: '600' }}>{errorMsg}</Text>
        </View>
      ) : (
        <View style={{ height: 40 }} />
      )}
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20, marginBottom: 40 }}>
        {grid.map((emoji, idx) => (
          <TouchableOpacity key={idx} style={styles.gridItem} onPress={() => handleTap(emoji)}>
            <Text style={{ fontSize: 50 }}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const RoutineGame = ({ data, onComplete }) => {
  const { colors, globalStyles, settings, speak, t } = useTheme();
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelect = (index) => {
    speak(data.options[index]);
    if (index === data.correctAnswer) {
      setErrorMsg('');
      onComplete();
    } else {
      setErrorMsg('That doesn\'t seem right. Think again!');
    }
  };

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <Text style={{ fontSize: 64, marginBottom: 24 }}>{data.icon}</Text>
      
      <Card style={{ padding: 24, width: '100%', backgroundColor: '#ecfdf5', borderColor: '#d1fae5', borderWidth: 2, marginBottom: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textMain, textAlign: 'center' }}>
          {data.question}
        </Text>
      </Card>

      {errorMsg ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <AlertCircle color={colors.danger} size={20} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.danger, fontSize: 18, fontWeight: '600' }}>{errorMsg}</Text>
        </View>
      ) : (
        <View style={{ height: 40 }} />
      )}
      
      <View style={{ width: '100%', gap: 16 }}>
        {data.options.map((opt, i) => (
          <TouchableOpacity 
            key={i} 
            style={[styles.optionBtn, { borderColor: colors.success }]} 
            onPress={() => handleSelect(i)}
            delayPressIn={settings.ignoreAccidentalTaps ? 300 : 0}
          >
            <Text style={[styles.optionText, { color: colors.textMain }]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const AdaptiveGame = ({ onComplete }) => {
  const { colors, globalStyles, settings, speak, fontScale } = useTheme();
  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Procedurally generated game state
  const [scenario, setScenario] = useState(null);

  useEffect(() => {
    // Simulate AI generation of a personalized game scenario
    const scenarios = [
      {
        theme: "Your Garden",
        intro: "Let's remember what was in your garden.",
        objects: ['🌱', '🪴', '🌻', '💧'],
        question: "Which of these was NOT in the garden?",
        options: ['🌻', '🪴', '🚗', '💧'],
        correctAnswer: 2
      },
      {
        theme: "Cultural Heritage",
        intro: "Let's remember our Assamese roots.",
        objects: ['🌾', '👒', '🦏', '🍵'], // Bihu, Japi, Rhino, Tea
        question: "Which cultural item did we just see?",
        options: ['👒', '🍎', '📱', '⚽'],
        correctAnswer: 0
      },
      {
        theme: "Shopping Trip",
        intro: "You just went to the local market.",
        objects: ['🍅', '🥔', '🧅', '🌶️'],
        question: "What did you buy at the market?",
        options: ['💻', '🧅', '🚗', '📚'],
        correctAnswer: 1
      }
    ];
    
    setScenario(scenarios[Math.floor(Math.random() * scenarios.length)]);
  }, []);

  const handleSelect = (index) => {
    if (index === scenario.correctAnswer) {
      setErrorMsg('');
      speak("Excellent memory!");
      onComplete();
    } else {
      setErrorMsg("That doesn't seem right. Try again!");
      speak("Try again.");
    }
  };

  if (!scenario) return null;

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      {step === 0 && (
        <>
          <Brain color={colors.primary} size={64} style={{ marginBottom: 24 }} />
          <View style={{ backgroundColor: colors.bgSubtle, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 16 }}>
            <Text style={{ color: colors.primary, fontWeight: '800' }}>AI GENERATED: {scenario.theme}</Text>
          </View>
          <Text style={[globalStyles.headerText, { textAlign: 'center', fontSize: 34 * fontScale }]}>{scenario.intro}</Text>
          <Text style={[globalStyles.text, { textAlign: 'center', marginTop: 12, marginBottom: 40, fontSize: 18 * fontScale }]}>{t("Look carefully for 10 seconds.") || "Look carefully for 10 seconds."}</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 60 }}>
            {scenario.objects.map((obj, i) => (
              <Text key={i} style={{ fontSize: 60 }}>{obj}</Text>
            ))}
          </View>
          
          <Button onPress={() => setStep(1)} style={{ width: '100%', paddingVertical: 20, borderRadius: 30 }} variant="accent">
            <Text style={{ fontSize: 18 * fontScale, fontWeight: '800', color: '#ffffff' }}>{t("I Remember") || "I Remember"}</Text>
          </Button>
        </>
      )}
      {step === 1 && (
        <>
          <View style={{ backgroundColor: '#eff6ff', padding: 16, borderRadius: 20, marginBottom: 16, width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
            <Mic color={colors.primary} size={28} style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 22 * fontScale, fontWeight: '700', color: colors.primary, textAlign: 'center', flexShrink: 1 }}>"{scenario.question}"</Text>
          </View>

          {errorMsg ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <AlertCircle color={colors.danger} size={20} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.danger, fontSize: 18 * fontScale, fontWeight: '600' }}>{errorMsg}</Text>
            </View>
          ) : (
            <View style={{ height: 40 }} />
          )}
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20, width: '100%' }}>
            {scenario.options.map((opt, i) => (
              <TouchableOpacity 
                key={i} 
                style={[styles.gridItem, { width: 140, height: 140, borderColor: colors.border }]} 
                onPress={() => handleSelect(i)}
                delayPressIn={settings.ignoreAccidentalTaps ? 300 : 0}
              > 
                <Text style={{ fontSize: 60 }}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const LanguageGame = ({ data, onComplete }) => {
  const { colors, globalStyles, settings, speak } = useTheme();
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelect = (index) => {
    speak(data.options[index]);
    if (index === data.correctAnswer) {
      setErrorMsg('');
      onComplete();
    } else {
      setErrorMsg('Not quite right. Let\'s try another one!');
    }
  };

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <Text style={{ fontSize: 64, marginBottom: 24 }}>{t("💬") || "💬"}</Text>
      
      <Card style={{ padding: 24, width: '100%', backgroundColor: '#fffbeb', borderColor: '#fef3c7', borderWidth: 2, marginBottom: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textMain, textAlign: 'center' }}>
          {data.question}
        </Text>
      </Card>

      {errorMsg ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <AlertCircle color={colors.danger} size={20} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.danger, fontSize: 18, fontWeight: '600' }}>{errorMsg}</Text>
        </View>
      ) : (
        <View style={{ height: 40 }} />
      )}
      
      <View style={{ width: '100%', gap: 16 }}>
        {data.options.map((opt, i) => (
          <TouchableOpacity 
            key={i} 
            style={[styles.optionBtn, { borderColor: '#f59e0b' }]} 
            onPress={() => handleSelect(i)}
            delayPressIn={settings.ignoreAccidentalTaps ? 300 : 0}
          >
            <Text style={[styles.optionText, { color: colors.textMain }]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const ActivityScreen = () => {
  const { colors: themeColors, globalStyles, settings, t, fontScale } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  
  const [gameConfig, setGameConfig] = useState(null);
  const [gameTitle, setGameTitle] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const levelData = route.params?.levelData;
    if (levelData) {
      setGameTitle(levelData.title);
      setGameConfig(levelData);
    } else {
      // If no specific game is selected, default to the new AI Adaptive Generator
      setGameTitle('AI Personalized Activity');
      setGameConfig({ type: 'adaptive' });
    }
  }, [route.params]);

  const handleComplete = () => {
    setCompleted(true);
  };

  if (!gameConfig) return <View style={globalStyles.container} />;

  return (
    <View style={[globalStyles.container, { backgroundColor: '#ffffff', justifyContent: 'center' }]}>
      
      {!completed ? (
        <>
          <Text style={{ fontSize: 18 * fontScale, fontWeight: '700', color: themeColors.textMuted, textAlign: 'center', marginBottom: 20 }}>{t('playing')} {t(gameTitle) || gameTitle}</Text>
          {gameConfig.type === 'memory' && <MemoryGame data={gameConfig} onComplete={handleComplete} />}
          {gameConfig.type === 'attention' && <AttentionGame data={gameConfig} onComplete={handleComplete} />}
          {gameConfig.type === 'routine' && <RoutineGame data={gameConfig} onComplete={handleComplete} />}
          {gameConfig.type === 'language' && <LanguageGame data={gameConfig} onComplete={handleComplete} />}
          {gameConfig.type === 'adaptive' && <AdaptiveGame onComplete={handleComplete} />}
        </>
      ) : (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 80 * fontScale, marginBottom: 24 }}>{t("🎉") || "🎉"}</Text>
          <Text style={[globalStyles.headerText, { textAlign: 'center', color: themeColors.success }]}>{t('greatJob')}</Text>
          <Text style={[globalStyles.text, { textAlign: 'center', marginTop: 12, marginBottom: 40, fontSize: 18 * fontScale }]}>
            {t('successCompleted')} {t(gameTitle) || gameTitle}.
          </Text>
          <Button onPress={() => navigation.goBack()} style={{ width: '100%', paddingVertical: 20, borderRadius: 30 }}>
            <Text style={{ fontSize: 18 * fontScale, fontWeight: '800', color: '#ffffff' }}>{t('backToDashboard')}</Text>
          </Button>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  optionBtn: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 24,
    alignItems: 'center'
  },
  optionText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMain,
    textAlign: 'center'
  },
  gridItem: {
    width: 100,
    height: 100,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
