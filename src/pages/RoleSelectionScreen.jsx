import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { globalStyles, colors, Button } from '../components/common';
import { useNavigation } from '@react-navigation/native';
import { HeartPulse, LayoutDashboard } from 'lucide-react-native';
import { useStore } from '../store/useStore';

export const RoleSelectionScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={[globalStyles.container, { justifyContent: 'center', backgroundColor: '#f8fafc' }]}>
      <View style={{ alignItems: 'center', marginBottom: 60 }}>
        <Text style={{ fontSize: 60, marginBottom: 16 }}>🏡</Text>
        <Text style={[globalStyles.headerText, { textAlign: 'center', color: colors.textMain }]}>Cognitive Care</Text>
        <Text style={{ fontSize: 18, color: colors.textMuted, textAlign: 'center', marginTop: 8 }}>
          Who is using the app right now?
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.roleCard, { borderColor: colors.primaryLight }]}
        onPress={() => navigation.navigate('PatientLogin')}
        activeOpacity={0.8}
      >
        <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
          <LayoutDashboard color={colors.primary} size={32} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.roleTitle}>I am a Patient</Text>
          <Text style={styles.roleDesc}>Access my daily journey and activities.</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.roleCard, { borderColor: colors.success }]}
        onPress={() => navigation.navigate('CaregiverStack')}
        activeOpacity={0.8}
      >
        <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
          <HeartPulse color={colors.success} size={32} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.roleTitle}>I am a Caregiver</Text>
          <Text style={styles.roleDesc}>Manage patients and view insights.</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ marginTop: 20 }}
        onPress={() => {
          useStore.getState().devClearDatabase();
          alert('Database reset. Please reload the app.');
        }}
      >
        <Text style={{ color: colors.danger, textDecorationLine: 'underline', fontWeight: 'bold' }}>DEV: Reset All Data</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 4
  },
  roleDesc: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 22
  }
});
