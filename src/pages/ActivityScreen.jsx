import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { globalStyles, colors, Button, Card } from '../components/common';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Mic, Brain, Crosshair, Clock, AlertCircle } from 'lucide-react-native';
import { gamesData } from '../data/gamesData';

const MemoryGame = ({ data, onComplete }) => {
  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelect = (index) => {
    if (index === data.correctAnswer) {
      setErrorMsg('');
      onComplete();
    } else {
      setErrorMsg('Not quite right. Try again!');
    }
  };

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      {step === 0 && (
        <>
          <Brain color={colors.primary} size={64} style={{ marginBottom: 24 }} />
          <Text style={[globalStyles.headerText, { textAlign: 'center' }]}>{data.intro}</Text>
          <Text style={[globalStyles.text, { textAlign: 'center', marginTop: 12, marginBottom: 40 }]}>
            Look carefully at these objects.
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 60 }}>
            {data.objects.map((obj, i) => (
              <Text key={i} style={{ fontSize: 60 }}>{obj}</Text>
            ))}
          </View>
          <Button onPress={() => setStep(1)} style={{ width: '100%', paddingVertical: 20, borderRadius: 30 }} variant="accent">
            I remember them
          </Button>
        </>
      )}
      {step === 1 && (
        <>
          <View style={{ backgroundColor: '#eff6ff', padding: 16, borderRadius: 20, marginBottom: 16, width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
            <Mic color={colors.primary} size={28} style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.primary, textAlign: 'center' }}>"{data.question}"</Text>
          </View>

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
              <TouchableOpacity key={i} style={styles.optionBtn} onPress={() => handleSelect(i)}>
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const AttentionGame = ({ data, onComplete }) => {
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
      <Text style={[globalStyles.headerText, { textAlign: 'center' }]}>Attention Tracker</Text>
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
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelect = (index) => {
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
          <TouchableOpacity key={i} style={[styles.optionBtn, { borderColor: colors.success }]} onPress={() => handleSelect(i)}>
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const ActivityScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const [gameConfig, setGameConfig] = useState(null);
  const [gameTitle, setGameTitle] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Lookup the exact game config by title
    const title = route.params?.title;
    if (title && gamesData[title]) {
      setGameTitle(title);
      setGameConfig(gamesData[title]);
    } else {
      // Fallback if no specific title was provided (e.g. from Dashboard "START TODAY'S ACTIVITY")
      const allKeys = Object.keys(gamesData);
      const randomKey = allKeys[Math.floor(Math.random() * allKeys.length)];
      setGameTitle(randomKey);
      setGameConfig(gamesData[randomKey]);
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
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textMuted, textAlign: 'center', marginBottom: 20 }}>Playing: {gameTitle}</Text>
          {gameConfig.type === 'memory' && <MemoryGame data={gameConfig} onComplete={handleComplete} />}
          {gameConfig.type === 'attention' && <AttentionGame data={gameConfig} onComplete={handleComplete} />}
          {gameConfig.type === 'routine' && <RoutineGame data={gameConfig} onComplete={handleComplete} />}
        </>
      ) : (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 80, marginBottom: 24 }}>🎉</Text>
          <Text style={[globalStyles.headerText, { textAlign: 'center', color: colors.success }]}>Great Job!</Text>
          <Text style={[globalStyles.text, { textAlign: 'center', marginTop: 12, marginBottom: 40 }]}>
            You successfully completed {gameTitle}.
          </Text>
          <Button onPress={() => navigation.goBack()} style={{ width: '100%', paddingVertical: 20, borderRadius: 30 }}>
            Back to Dashboard
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
