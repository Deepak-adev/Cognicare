import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { globalStyles, colors, Button } from '../components/common';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../db/db';
import { useStore } from '../store/useStore';
import { Plus, User } from 'lucide-react-native';

export const CaregiverPatientListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { loadPatientData } = useStore();
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const allPatients = await db.patients.toArray(); // Fetch all
      setPatients(allPatients);
    };
    fetchPatients();
  }, []);

  const handleSelectPatient = async (id) => {
    await loadPatientData(id);
    if (route.name === 'PatientLogin') {
      navigation.navigate('PatientStack');
    } else {
      navigation.navigate('CaregiverDashboard');
    }
  };

  return (
    <View style={[globalStyles.container, { backgroundColor: '#f8fafc' }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 8 }}>
        <Text style={[globalStyles.headerText, { marginTop: 0 }]}>My Patients</Text>
        <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] })}>
          <Text style={{ fontSize: 16, color: colors.danger, fontWeight: '700' }}>Exit</Text>
        </TouchableOpacity>
      </View>
      <Text style={[globalStyles.textMuted, { marginBottom: 24 }]}>Select a patient to manage their care journey.</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {patients.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 18, color: colors.textMuted, textAlign: 'center', marginBottom: 24 }}>
              You haven't added any patients yet.
            </Text>
          </View>
        ) : (
          patients.map((p, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.patientCard}
              onPress={() => handleSelectPatient(p.patient_id)}
            >
              <View style={styles.avatar}><User color={colors.primary} size={32} /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textMain }}>{p.name}</Text>
                <Text style={{ fontSize: 16, color: colors.textMuted }}>{p.location} • Age {p.age}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {route.name !== 'PatientLogin' && (
        <Button 
          icon={Plus} 
          variant="primary" 
          style={{ marginBottom: 40 }}
          onPress={() => navigation.navigate('AddPatient')}
        >
          Add New Patient
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  patientCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginTop: 20
  }
});
