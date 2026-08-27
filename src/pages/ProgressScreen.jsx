import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, colors as defaultColors } from '../components/common';
import { Play } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

export const ProgressScreen = () => {
  const { t, fontScale, colors, globalStyles } = useTheme();

  return (
    <ScrollView style={[globalStyles.container, { backgroundColor: '#eff6ff' }]} showsVerticalScrollIndicator={false}>
      <View style={{ alignItems: 'center', marginVertical: 40 }}>
        <Text style={{ fontSize: 70 * fontScale, marginBottom: 16 }}>🌟</Text>
        <Text style={[globalStyles.headerText, { textAlign: 'center', color: colors.primary }]}>
          {t('doingWell') || "You're doing well!"}
        </Text>
        <Text style={{ fontSize: 22 * fontScale, color: colors.textMain, fontWeight: '600', marginTop: 12 }}>
          {t('activitiesCompleted') || "7 activities completed this week"}
        </Text>
      </View>

      <Card style={{ padding: 24, borderRadius: 30 }}>
        <View style={styles.skillRow}>
          <Text style={[styles.skillName, { fontSize: 24 * fontScale }]}>{t('memory') || 'Memory'}</Text>
          <Text style={{ fontSize: 24 * fontScale }}>⭐⭐⭐⭐☆</Text>
        </View>
        <View style={[styles.skillRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
          <Text style={[styles.skillName, { fontSize: 24 * fontScale }]}>{t('attention') || 'Attention'}</Text>
          <Text style={{ fontSize: 24 * fontScale }}>⭐⭐⭐☆☆</Text>
        </View>
      </Card>

      <View style={styles.messageBox}>
        <Text style={[styles.messageText, { fontSize: 22 * fontScale }]}>
          {t('keepGoing') || "Keep going! You're doing a great job this week."}
        </Text>
      </View>

      <Button icon={Play} variant="primary" style={{ marginTop: 24, borderRadius: 30, paddingVertical: 20 }}>
        <Text style={{ fontSize: 18 * fontScale, fontWeight: '800', color: '#ffffff' }}>{t('hearProgress') || "Hear my progress"}</Text>
      </Button>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  skillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: defaultColors.border
  },
  skillName: {
    fontSize: 24,
    fontWeight: '800',
    color: defaultColors.textMain
  },
  stars: {
    fontSize: 24
  },
  messageBox: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 20,
    marginTop: 24,
    borderWidth: 2,
    borderColor: defaultColors.primaryLight
  },
  messageText: {
    fontSize: 22,
    fontStyle: 'italic',
    color: defaultColors.textMain,
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '600'
  }
});
