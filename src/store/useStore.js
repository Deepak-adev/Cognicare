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
  
  voiceLoginPatient: async (spokenText) => {
    console.log('[Voice NLU Engine] Received raw spoken text:', JSON.stringify(spokenText));
    const allPatients = await db.patients.toArray();
    console.log('[Voice NLU Engine] Registered patients in database:', allPatients.map(p => ({ id: p.patient_id, name: p.name })));
    
    if (!spokenText || spokenText.trim().length === 0) {
      console.warn('[Voice NLU Engine] Aborted: spokenText was empty.');
      return null;
    }

    // 1. Natural Language Understanding (NLU) Name Extraction
    // Remove filler phrases like "hello", "this is", "my name is", "i am", "call me", "login as", etc.
    let cleaned = spokenText.toLowerCase();
    const prefixPatterns = [
      /\bthis is\b/gi,
      /\bi am\b/gi,
      /\bi'm\b/gi,
      /\bim\b/gi,
      /\bmy name is\b/gi,
      /\bname is\b/gi,
      /\bhello\b/gi,
      /\bhi\b/gi,
      /\bhey\b/gi,
      /\bit's\b/gi,
      /\bits\b/gi,
      /\bcall me\b/gi,
      /\blogin as\b/gi,
      /\bsigning in as\b/gi,
      /\bspeaking\b/gi,
      /\bplease\b/gi
    ];

    prefixPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    cleaned = cleaned.trim().replace(/[^\w\s]/gi, ''); // Remove punctuation
    const targetSearch = cleaned.length > 0 ? cleaned : spokenText.trim();
    console.log('[Voice NLU Engine] Extracted name key phrase:', JSON.stringify(targetSearch));

    // 2. Intelligent Fuzzy / Substring Matching against existing database patients
    let matched = allPatients.find(p => {
      const pNameLower = p.name.toLowerCase();
      // Match exact full name, partial name, or token word match
      return (
        pNameLower === targetSearch ||
        pNameLower.includes(targetSearch) ||
        targetSearch.includes(pNameLower) ||
        pNameLower.split(' ').some(token => token.length > 2 && targetSearch.includes(token)) ||
        targetSearch.split(' ').some(token => token.length > 2 && pNameLower.includes(token))
      );
    });

    if (matched) {
      console.log('[Voice NLU Engine] ✅ Successfully matched existing patient profile:', matched.name, `(ID: ${matched.patient_id})`);
      await get().loadPatientData(matched.patient_id);
      return matched;
    }

    // 3. Dynamic Patient Creation for novel names spoken
    if (!matched && targetSearch.length > 0) {
      // Capitalize each word in extracted name
      const formattedName = targetSearch
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      console.log('[Voice NLU Engine] 🆕 No existing match found. Automatically provisioning new voice profile for:', formattedName);
      
      const newId = await get().createNewPatient({
        name: formattedName,
        age: 70,
        location: 'Assam, India',
        interests: 'Cognitive Games, Music, Reminiscence',
        family: 'Caregiver'
      });
      
      matched = await db.patients.get(newId);
      console.log('[Voice NLU Engine] ✅ Created and loaded new patient session:', matched);
      if (matched) {
        await get().loadPatientData(matched.patient_id);
        return matched;
      }
    }

    return null;
  },

  refreshInsights: async (patientId) => {
    await InsightService.generateInsights(patientId);
    const insights = await InsightService.getRecentInsights(patientId);
    const alerts = await InsightService.checkAndGenerateAlerts(patientId);
    set({ insights, alerts });
  }
}));
