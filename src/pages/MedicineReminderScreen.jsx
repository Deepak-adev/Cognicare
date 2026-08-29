import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { globalStyles, colors, Card, Button } from '../components/common';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { CheckCircle2, Clock, Pill, ChevronLeft, Droplet } from 'lucide-react-native';

export const MedicineReminderScreen = () => {
  const navigation = useNavigation();
  
  // Use global state so Caregiver can monitor in real-time
  const { medications, markMedicationTaken, waterIntake, waterGoal, logWaterIntake } = useStore();
  const { t } = useTheme();

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textMain} size={32} />
        </TouchableOpacity>
        <Text style={[globalStyles.headerText, { flex: 1, textAlign: 'center', marginRight: 48 }]}>
          {t('TODAY ☀️') || 'TODAY ☀️'}
        </Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={{ marginBottom: 30, padding: 24, backgroundColor: '#e0f2fe', borderColor: '#7dd3fc', borderWidth: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#38bdf820', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Droplet color="#0284c7" size={28} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#0369a1' }}>{t('Water Intake') || 'Water Intake'}</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#0ea5e9' }}>{waterIntake} / {waterGoal} {t('glasses today') || 'glasses today'}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#0284c7', shadowColor: '#0284c7' }]}
            onPress={logWaterIntake}
            activeOpacity={0.8}
            disabled={waterIntake >= waterGoal}
          >
            <Droplet color="#ffffff" size={24} style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>
              {waterIntake >= waterGoal ? (t('GOAL MET! 🎉') || 'GOAL MET! 🎉') : (t('I DRANK WATER') || 'I DRANK WATER')}
            </Text>
          </TouchableOpacity>
        </Card>

        {medications.map((med, index) => {
          const isLast = index === medications.length - 1;
          
          return (
            <View key={med.id} style={{ flexDirection: 'row', marginBottom: isLast ? 40 : 30 }}>
              {/* Timeline Line & Dot */}
              <View style={{ alignItems: 'center', marginRight: 20 }}>
                <View style={[styles.dot, med.taken && styles.dotTaken]} />
                {!isLast && <View style={[styles.line, med.taken && styles.lineTaken]} />}
              </View>

              {/* Content Card */}
              <Card style={[styles.medCard, med.taken && styles.medCardTaken]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={styles.timeText}>{med.time}</Text>
                  <View style={styles.badgeWrapper}>
                    {med.taken ? (
                      <View style={[styles.statusBadge, styles.statusTaken]}>
                        <CheckCircle2 color={colors.success} size={18} />
                        <Text style={styles.statusTextTaken}>✓ {t('Taken') || 'Taken'}</Text>
                      </View>
                    ) : (
                      <View style={[styles.statusBadge, styles.statusUpcoming]}>
                        <Clock color={colors.accent} size={18} />
                        <Text style={styles.statusTextUpcoming}>⏳ {t('Upcoming') || 'Upcoming'}</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: med.taken ? 0 : 20 }}>
                  <View style={[styles.iconBox, med.taken && { backgroundColor: colors.success + '20' }]}>
                    <Pill color={med.taken ? colors.success : colors.primary} size={28} />
                  </View>
                  <Text style={[styles.medName, med.taken && styles.medNameTaken]}>{t(med.name) || med.name}</Text>
                </View>
                
                {/* Big Action Button for Upcoming */}
                {!med.taken && (
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => markMedicationTaken(med.id)}
                    activeOpacity={0.8}
                  >
                    <CheckCircle2 color="#ffffff" size={24} style={{ marginRight: 8 }} />
                    <Text style={styles.actionBtnText}>{t('I TOOK IT') || 'I TOOK IT'}</Text>
                  </TouchableOpacity>
                )}
              </Card>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
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
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.bgSubtle,
    borderWidth: 4,
    borderColor: '#cbd5e1',
    zIndex: 2,
    marginTop: 10
  },
  dotTaken: {
    borderColor: colors.success,
    backgroundColor: colors.success
  },
  line: {
    width: 4,
    flex: 1,
    backgroundColor: '#e2e8f0',
    position: 'absolute',
    top: 34,
    bottom: -30,
    zIndex: 1
  },
  lineTaken: {
    backgroundColor: colors.success + '80'
  },
  medCard: {
    flex: 1,
    padding: 24,
    marginBottom: 0,
    backgroundColor: '#ffffff',
    borderColor: colors.primary + '30',
    borderWidth: 2
  },
  medCardTaken: {
    backgroundColor: '#f8fafc',
    borderColor: colors.success + '30',
    opacity: 0.9
  },
  timeText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textMain,
    flex: 1
  },
  badgeWrapper: {
    flexDirection: 'row'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6
  },
  statusTaken: {
    backgroundColor: colors.success + '20',
  },
  statusUpcoming: {
    backgroundColor: colors.accent + '20',
  },
  statusTextTaken: {
    color: colors.success,
    fontWeight: '800',
    fontSize: 16
  },
  statusTextUpcoming: {
    color: colors.accentDark || '#b45309',
    fontWeight: '800',
    fontSize: 16
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  medName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMain,
    flex: 1
  },
  medNameTaken: {
    textDecorationLine: 'line-through',
    color: colors.textMuted
  },
  actionBtn: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 20,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1
  }
});
