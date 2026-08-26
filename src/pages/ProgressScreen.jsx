import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { globalStyles, colors, Card, Button } from '../components/common';
import { Play } from 'lucide-react-native';

export const ProgressScreen = () => {
  return (
    <ScrollView style={[globalStyles.container, { backgroundColor: '#eff6ff' }]} showsVerticalScrollIndicator={false}>
      <View style={{ alignItems: 'center', marginVertical: 40 }}>
        <Text style={{ fontSize: 70, marginBottom: 16 }}>🌟</Text>
        <Text style={[globalStyles.headerText, { textAlign: 'center', color: colors.primary }]}>
          You're doing well!
        </Text>
        <Text style={{ fontSize: 22, color: colors.textMain, fontWeight: '600', marginTop: 12 }}>
          7 activities completed this week
        </Text>
      </View>

      <Card style={{ padding: 24, borderRadius: 30 }}>
        <View style={styles.skillRow}>
          <Text style={styles.skillName}>Memory</Text>
          <Text style={styles.stars}>⭐⭐⭐⭐☆</Text>
        </View>
        <View style={[styles.skillRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
          <Text style={styles.skillName}>Attention</Text>
          <Text style={styles.stars}>⭐⭐⭐☆☆</Text>
        </View>
      </Card>

      <View style={styles.messageBox}>
        <Text style={styles.messageText}>
          "Keep going! You're doing a great job this week."
        </Text>
      </View>

      <Button icon={Play} variant="primary" style={{ marginTop: 24, borderRadius: 30, paddingVertical: 20 }}>
        Hear my progress
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
    borderBottomColor: colors.border
  },
  skillName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textMain
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
    borderColor: colors.primaryLight
  },
  messageText: {
    fontSize: 22,
    fontStyle: 'italic',
    color: colors.textMain,
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '600'
  }
});
