import { create } from 'zustand';
import { db } from '../db/db';
import { PatientProfileService } from '../services/PatientProfileService';
import { CognitiveProfileService } from '../services/CognitiveProfileService';
import { DailyPlanService } from '../services/DailyPlanService';
import { InsightService } from '../services/InsightService';

export const useStore = create((set, get) => ({
  patient: null,
  cognitiveProfile: null,
  dailyPlan: null,
  insights: [],
  isOffline: false,
  
  setOfflineStatus: (status) => set({ isOffline: status }),

  // Actions
  loadPatientData: async (patientId) => {
    const patient = await PatientProfileService.getPatient(patientId);
    const cognitiveProfile = await CognitiveProfileService.getProfile(patientId);
    const dailyPlan = await DailyPlanService.getTodayPlan(patientId);
    const insights = await InsightService.getRecentInsights(patientId);
    
    set({ patient, cognitiveProfile, dailyPlan, insights });
  },

  createNewPatient: async (patientData) => {
    const newId = 'patient_' + Date.now();
    const profile = {
      patient_id: newId,
      name: patientData.name || 'Unknown',
      age: patientData.age || 70,
      location: patientData.location || 'Assam, India',
      interests: patientData.interests ? patientData.interests.split(',').map(s => s.trim()) : [],
      family_members: patientData.family ? patientData.family.split(',').map(s => s.trim()) : [],
      appointments: [],
      safety: { status: 'Safe', location: 'At Home', lastUpdated: 'Just now' },
      skills: {
        memory: { baseline: 75, current: 75 },
        attention: { baseline: 80, current: 80 },
        recognition: { baseline: 85, current: 85 }
      }
    };
    
    await PatientProfileService.savePatient(profile);
    
    // Also init cognitive profile
    await db.cognitive_profiles.add({
      patient_id: newId,
      last_assessed: new Date().toISOString(),
      skills: profile.skills
    });
    
    await get().loadPatientData(newId);
    return newId;
  },

  seedMockDataIfEmpty: async () => {
    const allPatients = await db.patients.toArray();
    if (allPatients.length === 0) {
      console.log('Seeding mock data for demo...');
      await get().createNewPatient({
        name: 'Aunt Maya',
        age: 72,
        location: 'Guwahati, Assam',
        interests: 'Gardening, Old Hindi Songs, Knitting',
        family: 'Priya (Daughter), Rahul (Grandson)'
      });
    }
  },
  
  refreshInsights: async (patientId) => {
    await InsightService.generateInsights(patientId);
    const insights = await InsightService.getRecentInsights(patientId);
    set({ insights });
  }
}));
