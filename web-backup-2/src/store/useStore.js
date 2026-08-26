import { create } from 'zustand';
import { PatientProfileService } from '../services/PatientProfileService';
import { CognitiveProfileService } from '../services/CognitiveProfileService';
import { DailyPlanService } from '../services/DailyPlanService';
import { InsightService } from '../services/InsightService';

export const useStore = create((set, get) => ({
  patient: null,
  cognitiveProfile: null,
  dailyPlan: null,
  insights: [],
  isOffline: !navigator.onLine,
  
  setOfflineStatus: (status) => set({ isOffline: status }),

  // Actions
  loadPatientData: async (patientId) => {
    const patient = await PatientProfileService.getPatient(patientId);
    const cognitiveProfile = await CognitiveProfileService.getProfile(patientId);
    const dailyPlan = await DailyPlanService.getTodayPlan(patientId);
    const insights = await InsightService.getRecentInsights(patientId);
    
    set({ patient, cognitiveProfile, dailyPlan, insights });
  },

  importMockVoiceProfile: async (patientId) => {
    const mockData = {
      name: 'Anjali Sharma',
      age: 72,
      language: 'Assamese',
      location: 'Guwahati, Assam',
      interests: ['Family', 'Devotional Music', 'Gardening'],
      memories: ['Grandson Rahul\'s birthday']
    };
    await PatientProfileService.importVoiceProfile(patientId, mockData);
    await get().loadPatientData(patientId);
  },
  
  refreshInsights: async (patientId) => {
    await InsightService.generateInsights(patientId);
    const insights = await InsightService.getRecentInsights(patientId);
    set({ insights });
  }
}));

// Listen for network changes
window.addEventListener('online', () => useStore.getState().setOfflineStatus(false));
window.addEventListener('offline', () => useStore.getState().setOfflineStatus(true));
