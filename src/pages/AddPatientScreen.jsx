import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { globalStyles, colors, Button } from '../components/common';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { Save } from 'lucide-react-native';

export const AddPatientScreen = () => {
  const { t } = useTheme();
  const navigation = useNavigation();
  const { createNewPatient } = useStore();

  const [form, setForm] = useState({
    name: '',
    age: '',
    location: '',
    family: '',
    interests: ''
  });

  const handleSave = async () => {
    if (!form.name) return;
    await createNewPatient(form);
    // After creating, it automatically sets this patient in the store.
    navigation.navigate('CaregiverDashboard');
  };

  return (
    <ScrollView style={[globalStyles.container, { backgroundColor: '#ffffff' }]} showsVerticalScrollIndicator={false}>
      <Text style={[globalStyles.headerText, { marginTop: 40, marginBottom: 8 }]}>{t("Add Patient") || "Add Patient"}</Text>
      <Text style={[globalStyles.textMuted, { marginBottom: 32 }]}>{t("Build their Familiar World memory space.") || "Build their Familiar World memory space."}</Text>

      <Text style={styles.label}>{t("Full Name") || "Full Name"}</Text>
      <TextInput 
        style={styles.input} 
        placeholder="e.g. Aunt Maya" 
        value={form.name}
        onChangeText={(t) => setForm({...form, name: t})}
      />

      <Text style={styles.label}>{t("Age") || "Age"}</Text>
      <TextInput 
        style={styles.input} 
        placeholder="e.g. 72" 
        keyboardType="numeric"
        value={form.age}
        onChangeText={(t) => setForm({...form, age: t})}
      />

      <Text style={styles.label}>{t("Location / Home") || "Location / Home"}</Text>
      <TextInput 
        style={styles.input} 
        placeholder="e.g. Guwahati, Assam" 
        value={form.location}
        onChangeText={(t) => setForm({...form, location: t})}
      />

      <Text style={styles.label}>{t("Family Members (comma separated)") || "Family Members (comma separated)"}</Text>
      <TextInput 
        style={styles.input} 
        placeholder="e.g. Priya (Daughter), Rahul (Son)" 
        value={form.family}
        onChangeText={(t) => setForm({...form, family: t})}
      />

      <Text style={styles.label}>{t("Favourite Interests (comma separated)") || "Favourite Interests (comma separated)"}</Text>
      <TextInput 
        style={styles.input} 
        placeholder="e.g. Gardening, Devotional Music" 
        value={form.interests}
        onChangeText={(t) => setForm({...form, interests: t})}
      />

      <Button 
        icon={Save} 
        variant="primary" 
        style={{ marginTop: 20, marginBottom: 60 }}
        onPress={handleSave}
      >
        Save Patient Profile
      </Button>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 8,
    marginLeft: 4
  },
  input: {
    backgroundColor: colors.bgSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    fontSize: 18,
    color: colors.textMain,
    marginBottom: 24,
  }
});
