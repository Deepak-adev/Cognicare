import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { globalStyles, colors } from '../components/common';
import { useNavigation } from '@react-navigation/native';
import { Brain, Crosshair, Clock, MessageCircle } from 'lucide-react-native';

const GAME_CATEGORIES = [
  {
    title: 'Memory Mastery',
    icon: Brain,
    color: '#3b82f6', // blue
    bg: '#eff6ff',
    type: 'memory',
    games: [
      { name: 'Where are my keys?', difficulty: 'Easy' },
      { name: 'Family Face Match', difficulty: 'Medium' },
      { name: 'Remember the Sequence', difficulty: 'Medium' },
      { name: 'Grocery List Recall', difficulty: 'Hard' },
      { name: 'Photo Storyteller', difficulty: 'Medium' },
      { name: 'Name that Tune', difficulty: 'Easy' }
    ]
  },
  {
    title: 'Attention Tracker',
    icon: Crosshair,
    color: '#ef4444', // red
    bg: '#fef2f2',
    type: 'attention',
    games: [
      { name: 'Find the Red Apple', difficulty: 'Easy' },
      { name: 'Sort the Shapes', difficulty: 'Medium' },
      { name: 'Catch the Balloon', difficulty: 'Hard' },
      { name: 'Color Matching', difficulty: 'Easy' },
      { name: 'Spot the Difference', difficulty: 'Medium' },
      { name: 'Track the Moving Dot', difficulty: 'Hard' }
    ]
  },
  {
    title: 'Daily Routine',
    icon: Clock,
    color: '#22c55e', // green
    bg: '#f0fdf4',
    type: 'routine',
    games: [
      { name: 'Morning Routine Check', difficulty: 'Easy' },
      { name: 'What Time is it?', difficulty: 'Medium' },
      { name: 'Next Meal Guesser', difficulty: 'Easy' },
      { name: 'Medication Organizer', difficulty: 'Medium' },
      { name: 'Bedtime Steps', difficulty: 'Medium' },
      { name: 'Event Sequencer', difficulty: 'Hard' }
    ]
  },
  {
    title: 'Language & Words',
    icon: MessageCircle,
    color: '#f59e0b', // amber
    bg: '#fffbeb',
    type: 'language', // Reusing the memory engine or another simple one for now
    games: [
      { name: 'Name the Object', difficulty: 'Easy' },
      { name: 'Word Association', difficulty: 'Medium' },
      { name: 'Complete the Sentence', difficulty: 'Medium' },
      { name: 'Rhyme Time', difficulty: 'Easy' },
      { name: 'Spell your Name', difficulty: 'Easy' },
      { name: 'Story Completion', difficulty: 'Hard' }
    ]
  }
];

export const GamesScreen = () => {
  const navigation = useNavigation();

  const handlePlayGame = (type, gameName) => {
    // We map 'language' back to 'routine' for the hackathon prototype engine
    const engineType = type === 'language' ? 'routine' : type;
    navigation.navigate('Activity', { type: engineType, title: gameName });
  };

  return (
    <ScrollView style={[globalStyles.container, { backgroundColor: '#f8fafc' }]} showsVerticalScrollIndicator={false}>
      
      <View style={{ marginBottom: 32, marginTop: 16 }}>
        <Text style={[globalStyles.headerText, { fontSize: 32 }]}>Activity Library</Text>
        <Text style={{ fontSize: 18, color: colors.textMuted, marginTop: 8 }}>
          24 personalized cognitive exercises.
        </Text>
      </View>

      {GAME_CATEGORIES.map((category, catIdx) => {
        const Icon = category.icon;
        return (
          <View key={catIdx} style={{ marginBottom: 40 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={[styles.iconBox, { backgroundColor: category.bg }]}>
                <Icon color={category.color} size={28} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textMain }}>
                {category.title}
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ overflow: 'visible' }}>
              <View style={{ flexDirection: 'row', gap: 16, paddingRight: 20 }}>
                {category.games.map((game, gameIdx) => (
                  <TouchableOpacity 
                    key={gameIdx} 
                    style={[styles.gameCard, { borderColor: category.bg }]}
                    onPress={() => handlePlayGame(category.type, game.name)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gameTitle} numberOfLines={2}>{game.name}</Text>
                      <View style={{ backgroundColor: category.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginTop: 12 }}>
                        <Text style={{ color: category.color, fontWeight: '700', fontSize: 13 }}>{game.difficulty}</Text>
                      </View>
                    </View>
                    <View style={[styles.playBtn, { backgroundColor: category.bg }]}>
                      <Text style={{ color: category.color, fontWeight: '800', fontSize: 16 }}>PLAY NOW</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        );
      })}
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  iconBox: {
    padding: 12,
    borderRadius: 16,
    marginRight: 12
  },
  gameCard: {
    backgroundColor: '#ffffff',
    width: 220,
    height: 200,
    padding: 24,
    borderRadius: 32,
    borderWidth: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 5,
    justifyContent: 'space-between'
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textMain,
    lineHeight: 28
  },
  playBtn: {
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  }
});
