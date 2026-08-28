import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Brain, Crosshair, Clock, MessageCircle, Star, Activity } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { colors as defaultColors } from '../components/common';
import { gamesData } from '../data/gamesData';

const GAME_CATEGORIES = [
  {
    title: 'Clinical Assessments',
    icon: Activity,
    color: '#8b5cf6', // violet
    bg: '#f5f3ff',
    type: 'clinical',
    levels: [
      { title: 'Clock Drawing Test', route: 'ClockDrawingTest' },
      { title: 'Verbal Fluency Test', route: 'VerbalFluencyTest' }
    ]
  },
  {
    title: 'Memory Mastery',
    icon: Brain,
    color: '#3b82f6', // blue
    bg: '#eff6ff',
    type: 'memory',
    levels: gamesData.memory
  },
  {
    title: 'Attention Tracker',
    icon: Crosshair,
    color: '#ef4444', // red
    bg: '#fef2f2',
    type: 'attention',
    levels: gamesData.attention
  },
  {
    title: 'Daily Routine',
    icon: Clock,
    color: '#22c55e', // green
    bg: '#f0fdf4',
    type: 'routine',
    levels: gamesData.routine
  },
  {
    title: 'Language & Words',
    icon: MessageCircle,
    color: '#f59e0b', // amber
    bg: '#fffbeb',
    type: 'language',
    levels: gamesData.language
  }
];

export const GamesScreen = () => {
  const navigation = useNavigation();
  const { t, fontScale, colors, globalStyles } = useTheme();

  const handlePlayGame = (category, lvl) => {
    if (category.type === 'clinical') {
      navigation.navigate(lvl.route);
    } else {
      navigation.navigate('Activity', { type: category.type, levelData: lvl });
    }
  };

  return (
    <ScrollView style={[globalStyles.container, { backgroundColor: '#f8fafc' }]} showsVerticalScrollIndicator={false}>
      
      <View style={{ marginBottom: 32, marginTop: 16 }}>
        <Text style={[globalStyles.headerText, { fontSize: 32 * fontScale }]}>{t('activityLibrary') || 'Cognitive Therapy'}</Text>
        <Text style={{ fontSize: 18 * fontScale, color: colors.textMuted, marginTop: 8 }}>
          {t('cognitiveExercises') || 'Leveled exercises tailored for you.'}
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
              <Text style={{ fontSize: 24 * fontScale, fontWeight: '800', color: colors.textMain }}>
                {t(category.title) || category.title}
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 24 }}>
              {category.levels.map((lvl, lIdx) => (
                <TouchableOpacity 
                  key={lIdx} 
                  style={[styles.gameCard, { borderColor: category.color + '40' }]} 
                  onPress={() => handlePlayGame(category, lvl)}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={[styles.badge, { backgroundColor: category.bg }]}>
                      <Text style={[styles.badgeText, { color: category.color }]}>
                        {category.type === 'clinical' ? 'Clinical Test' : `Level ${lvl.level}`}
                      </Text>
                    </View>
                    <Star color={category.color} size={20} fill={category.bg} />
                  </View>
                  <Text style={[styles.gameTitle, { fontSize: 18 * fontScale, color: colors.textMain }]} numberOfLines={2}>
                    {t(lvl.title) || lvl.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );
      })}
      
      <View style={{ height: 60 }} />
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
    height: 180,
    padding: 20,
    borderRadius: 32,
    borderWidth: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 5,
    justifyContent: 'flex-start'
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontWeight: '800',
    fontSize: 14
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: defaultColors.textMain,
    lineHeight: 28,
    marginTop: 8
  }
});
