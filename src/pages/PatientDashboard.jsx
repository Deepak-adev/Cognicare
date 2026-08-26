import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';
import { Card, Button, globalStyles, colors } from '../components/common';
import { useNavigation } from '@react-navigation/native';
import { Play, Coffee, Pill, Activity, Utensils, Star, Globe, LogOut } from 'lucide-react-native';

export const PatientDashboard = () => {
  const { patient, loadPatientData } = useStore();
  const navigation = useNavigation();

  if (!patient) return <View style={globalStyles.container}><Text style={globalStyles.text}>Loading...</Text></View>;

  const handleExit = () => {
    // Navigate back to RoleSelection to change users
    navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
  };

  const journey = [
    { time: '8:00 AM', title: 'Breakfast', icon: Coffee, done: true },
    { time: '9:00 AM', title: 'Morning Medicine', icon: Pill, done: true },
    { time: '10:00 AM', title: 'Cognitive Activity', icon: Activity, current: true },
    { time: '1:00 PM', title: 'Lunch', icon: Utensils, done: false },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgSubtle }}>
      <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View>
            <Text style={{ fontSize: 22, color: colors.textMuted, fontWeight: '700' }}>Good morning,</Text>
            <Text style={[globalStyles.headerText, { fontSize: 40 }]}>{patient.name.split(' ')[0]} 👋</Text>
          </View>
        </View>

        {/* Massive Hero Action */}
        <View style={{ marginBottom: 40 }}>
          <Text style={{ fontSize: 20, color: colors.textMain, fontWeight: '600', marginBottom: 16 }}>
            You have one activity today.
          </Text>
          <Button 
            onPress={() => navigation.navigate('Activity')} 
            icon={Play}
            style={{ shadowColor: colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}
          >
            START TODAY'S ACTIVITY
          </Button>
        </View>

        {/* New Navigation: World and Progress */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 }}>
          <TouchableOpacity 
            style={[styles.navCard, { backgroundColor: '#fff0f2' }]} 
            onPress={() => navigation.navigate('FamiliarWorld')}
          >
            <Globe color="#f43f5e" size={36} style={{ marginBottom: 12 }} />
            <Text style={styles.navCardText}>My World</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navCard, { backgroundColor: '#eff6ff' }]} 
            onPress={() => navigation.navigate('Progress')}
          >
            <Star color="#3b82f6" size={36} style={{ marginBottom: 12 }} />
            <Text style={styles.navCardText}>My Progress</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Journey */}
        <Text style={[globalStyles.subHeaderText, { marginBottom: 20 }]}>Today's Journey</Text>
        <Card style={{ padding: 24 }}>
          {journey.map((item, index) => {
            const isLast = index === journey.length - 1;
            const Icon = item.icon;
            
            return (
              <View key={index} style={{ flexDirection: 'row', marginBottom: isLast ? 0 : 24 }}>
                {/* Timeline Line & Dot */}
                <View style={{ alignItems: 'center', marginRight: 16 }}>
                  <View style={[styles.dot, item.done && styles.dotDone, item.current && styles.dotCurrent]} />
                  {!isLast && <View style={[styles.line, item.done && styles.lineDone]} />}
                </View>

                {/* Content */}
                <View style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontSize: 16, color: colors.textMuted, fontWeight: '700', width: 80 }}>{item.time}</Text>
                    <Icon color={item.current ? colors.primary : colors.textMuted} size={20} style={{ marginRight: 8 }} />
                    <Text style={[styles.journeyTitle, item.done && styles.journeyTitleDone, item.current && styles.journeyTitleCurrent]}>
                      {item.title}
                    </Text>
                  </View>
                  {item.current && (
                    <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600', marginLeft: 80 }}>
                      Next up!
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </Card>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 40,
    marginTop: 20,
  },
  heroButton: {
    backgroundColor: colors.primary,
    paddingVertical: 28,
    borderRadius: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center'
  },
  heroButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  navCard: {
    width: '48%',
    padding: 24,
    borderRadius: 24,
    alignItems: 'flex-start'
  },
  navCardText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textMain
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#cbd5e1',
    borderWidth: 4,
    borderColor: '#ffffff',
    zIndex: 2
  },
  dotDone: {
    backgroundColor: colors.success
  },
  dotCurrent: {
    backgroundColor: colors.primary,
    borderColor: '#dbeafe',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  line: {
    width: 3,
    flex: 1,
    backgroundColor: '#e2e8f0',
    position: 'absolute',
    top: 20,
    bottom: -24,
    zIndex: 1
  },
  lineDone: {
    backgroundColor: colors.success
  },
  journeyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textMuted
  },
  journeyTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94a3b8'
  },
  journeyTitleCurrent: {
    color: colors.primary,
    fontWeight: '800'
  }
});
