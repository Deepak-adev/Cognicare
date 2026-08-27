import React from 'react';
import { ScrollView, View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useStore } from '../store/useStore';
import { Card } from '../components/common';
import { Heart, Home, Star, Sparkles } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

export const FamiliarWorldScreen = () => {
  const { patient } = useStore();
  const { t, fontScale, colors, globalStyles } = useTheme();

  return (
    <ScrollView style={[globalStyles.container, { backgroundColor: '#fdf8f5' }]} showsVerticalScrollIndicator={false}>
      <View style={{ alignItems: 'center', marginVertical: 32 }}>
        <Text style={{ fontSize: 60 * fontScale, marginBottom: 16 }}>🌍</Text>
        <Text style={[globalStyles.headerText, { color: colors.accent, textAlign: 'center' }]}>{t('myWorld')}</Text>
        <Text style={[globalStyles.textMuted, { textAlign: 'center', fontSize: 18 * fontScale, marginTop: 8 }]}>
          {t('familiarWorldSubtitle') || 'A space filled with the people and places you love.'}
        </Text>
      </View>

      <Card style={{ backgroundColor: '#fff0f2', borderColor: '#ffe4e6', borderWidth: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Heart color="#f43f5e" size={32} />
          <Text style={{ fontSize: 24 * fontScale, fontWeight: '800', color: colors.textMain, marginLeft: 12 }}>{t('myFamily') || 'My Family'}</Text>
        </View>
        <View style={styles.personCard}>
          <Text style={{ fontSize: 40 * fontScale, marginRight: 16 }}>👩🏽</Text>
          <View>
            <Text style={{ fontSize: 22 * fontScale, fontWeight: '700', color: colors.textMain }}>Priya</Text>
            <Text style={{ fontSize: 18 * fontScale, color: colors.textMuted }}>{t('daughter') || 'Daughter'}</Text>
          </View>
        </View>
        <View style={[styles.personCard, { borderBottomWidth: 0, paddingBottom: 0 }]}>
          <Text style={{ fontSize: 40 * fontScale, marginRight: 16 }}>👧🏽</Text>
          <View>
            <Text style={{ fontSize: 22 * fontScale, fontWeight: '700', color: colors.textMain }}>Ananya</Text>
            <Text style={{ fontSize: 18 * fontScale, color: colors.textMuted }}>{t('granddaughter') || 'Granddaughter'}</Text>
          </View>
        </View>
      </Card>

      <Card style={{ backgroundColor: '#f0fdf4', borderColor: '#dcfce7', borderWidth: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Home color="#22c55e" size={32} />
          <Text style={{ fontSize: 24 * fontScale, fontWeight: '800', color: colors.textMain, marginLeft: 12 }}>{t('myHome') || 'My Home'}</Text>
        </View>
        <Text style={{ fontSize: 20 * fontScale, color: colors.textMain, fontWeight: '600' }}>
          {patient?.location || 'Guwahati, Assam'}
        </Text>
      </Card>

      <Card style={{ backgroundColor: '#fffbeb', borderColor: '#fef3c7', borderWidth: 2, marginBottom: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Star color="#f59e0b" size={32} />
          <Text style={{ fontSize: 24 * fontScale, fontWeight: '800', color: colors.textMain, marginLeft: 12 }}>{t('myFavourites') || 'My Favourites'}</Text>
        </View>
        {patient?.interests?.map((interest, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Sparkles color="#f59e0b" size={20} style={{ marginRight: 10 }} />
            <Text style={{ fontSize: 20 * fontScale, color: colors.textMain, fontWeight: '600' }}>{interest}</Text>
          </View>
        ))}
      </Card>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  }
});
