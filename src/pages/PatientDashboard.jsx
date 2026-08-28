import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';
import { Card, Button, colors } from '../components/common';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { Play, Coffee, Pill, Activity, Utensils, Star, Globe, LogOut, HeartHandshake } from 'lucide-react-native';

export const PatientDashboard = () => {
  const { patient, loadPatientData, timelineTasks } = useStore();
  const navigation = useNavigation();
  const { colors, globalStyles, settings, t, fontScale } = useTheme();

  if (!patient) return <View style={globalStyles.container}><Text style={globalStyles.text}>{t('loading')}</Text></View>;

  const handleExit = () => {
    // Navigate back to RoleSelection to change users
    navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
  };

  const journey = timelineTasks;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgSubtle }}>
      <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View>
            <Text style={{ fontSize: 22 * fontScale, color: colors.textMuted, fontWeight: '700' }}>{t('greeting')}</Text>
            <Text style={[globalStyles.headerText, { fontSize: 40 * fontScale }]}>{patient.name.split(' ')[0]} 👋</Text>
          </View>
        </View>

        {/* I Need Help Rescue Button */}
        <TouchableOpacity 
          style={{ 
            backgroundColor: '#f59e0b', // Calming amber instead of aggressive red
            paddingVertical: 18, 
            borderRadius: 24, 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: 32,
            shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 
          }}
          onPress={() => navigation.navigate('ConfusionRescue')}
          activeOpacity={0.8}
        >
          <HeartHandshake color="#ffffff" size={28} style={{ marginRight: 12 }} />
          <Text style={{ color: '#ffffff', fontSize: 22 * fontScale, fontWeight: '800', letterSpacing: 0.5 }}>I Need Help</Text>
        </TouchableOpacity>

        {/* Massive Hero Action */}
        <View style={{ marginBottom: 40 }}>
          <Text style={{ fontSize: 20 * fontScale, color: colors.textMain, fontWeight: '600', marginBottom: 16 }}>
            {t('oneActivity')}
          </Text>
          <Button 
            onPress={() => navigation.navigate('Activity')} 
            icon={Play}
            style={{ shadowColor: colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}
          >
            <Text style={{ fontSize: 18 * fontScale, fontWeight: '800', color: '#ffffff', textTransform: 'uppercase' }}>
              {t('startActivity')}
            </Text>
          </Button>
        </View>

        {/* New Navigation: World and Progress - Hidden if Simplified UI is enabled */}
        {!settings.simplifiedUI && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 }}>
            <TouchableOpacity 
              style={[styles.navCard, { backgroundColor: '#fff0f2' }]} 
              onPress={() => navigation.navigate('FamiliarWorld')}
            >
              <Globe color="#f43f5e" size={36} style={{ marginBottom: 12 }} />
              <Text style={[styles.navCardText, { fontSize: 20 * fontScale }]}>{t('myWorld')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.navCard, { backgroundColor: '#eff6ff' }]} 
              onPress={() => navigation.navigate('MedicineReminder')}
            >
              <Pill color="#3b82f6" size={36} style={{ marginBottom: 12 }} />
              <Text style={[styles.navCardText, { fontSize: 20 * fontScale }]}>Reminders</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Today's Journey */}
        <Text style={[globalStyles.subHeaderText, { marginBottom: 20 }]}>{t('todaysJourney')}</Text>
        <Card style={{ padding: 24 }}>
          {journey.map((item, index) => {
            const isLast = index === journey.length - 1;
            
            // Map string icon names to Lucide icons dynamically or fallback to a default
            const IconComponent = {
              'Coffee': Coffee,
              'Pill': Pill,
              'Activity': Activity,
              'Star': Star,
              'Utensils': Utensils
            }[item.icon] || Star;
            
            const Wrapper = item.navigateTo ? TouchableOpacity : View;
            
            return (
              <Wrapper 
                key={index} 
                style={{ flexDirection: 'row', marginBottom: isLast ? 0 : 24 }}
                onPress={item.navigateTo ? () => navigation.navigate(item.navigateTo) : undefined}
                activeOpacity={item.navigateTo ? 0.7 : 1}
              >
                {/* Timeline Line & Dot */}
                <View style={{ alignItems: 'center', marginRight: 16 }}>
                  <View style={[styles.dot, item.done && styles.dotDone, item.current && styles.dotCurrent]} />
                  {!isLast && <View style={[styles.line, item.done && styles.lineDone]} />}
                </View>

                {/* Content */}
                <View style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontSize: 16 * fontScale, color: colors.textMuted, fontWeight: '700', minWidth: 85, flexShrink: 0 }}>{item.time}</Text>
                    <IconComponent color={item.current ? colors.primary : colors.textMuted} size={20} style={{ marginRight: 8, flexShrink: 0 }} />
                    <Text style={[styles.journeyTitle, item.done && styles.journeyTitleDone, item.current && styles.journeyTitleCurrent, { fontSize: 22 * fontScale, flexShrink: 1 }]} numberOfLines={2}>
                      {item.title}
                    </Text>
                  </View>
                  {item.current && (
                    <Text style={{ fontSize: 13 * fontScale, color: '#3b82f6', fontWeight: '700', marginTop: 4, marginLeft: 108 }}>
                      {t('nextUp') || 'Next up!'}
                    </Text>
                  )}
                </View>
              </Wrapper>
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
