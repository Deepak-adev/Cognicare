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
  activityStats: null,
  cognitiveFingerprint: null,
  recentSessions: [],
  medications: [
    { id: '1', time: '8:00 AM', name: 'Vitamin / Blood Pressure', taken: true },
    { id: '2', time: '1:00 PM', name: 'Pain Relief Medicine', taken: true },
    { id: '3', time: '8:00 PM', name: 'Evening Medicine', taken: false },
  ],
  timelineTasks: [
    { id: 't1', time: '8:00 AM', title: 'Breakfast', icon: 'Coffee', done: true },
    { id: 't2', time: '9:00 AM', title: 'Medicine', icon: 'Pill', current: true, navigateTo: 'MedicineReminder' },
    { id: 't3', time: '6:00 PM', title: 'Evening Walk', icon: 'Activity', done: false },
    { id: 't4', time: '7:00 PM', title: 'Doctor Appointment', icon: 'Star', done: false },
  ],
  isOffline: false,
  patientSettings: { language: 'English', fontSize: 'Normal', highContrast: false },
  routineAlerts: [],
  
  setOfflineStatus: (status) => set({ isOffline: status }),
  
  updatePatientSettings: (newSettings) => set((state) => ({
    patientSettings: { ...state.patientSettings, ...newSettings }
  })),

  addMedication: (med) => set((state) => ({
    medications: [...state.medications, { ...med, id: Date.now().toString(), taken: false }]
  })),

  markMedicationTaken: (id) => set((state) => ({
    medications: state.medications.map(med => med.id === id ? { ...med, taken: true } : med)
  })),

  addTimelineTask: (task) => set((state) => ({
    timelineTasks: [...state.timelineTasks, { ...task, id: Date.now().toString(), done: false }]
  })),

  evaluateRoutine: () => set((state) => {
    const alerts = [];
    const now = new Date();
    
    // Check pending medications
    state.medications.forEach(med => {
      if (!med.taken) {
        // Very simplistic time check for prototype: if it's PM and the med was for AM, it's very late.
        // Or just if time string contains 'AM' and it is currently past 12 PM.
        if (med.time.includes('AM') && now.getHours() >= 12) {
          alerts.push({ id: med.id, type: 'medication', message: `Morning medication "${med.name}" was missed. Patient is currently inactive.` });
        }
      }
    });

    // Check pending timeline tasks
    state.timelineTasks.forEach(task => {
      if (!task.done) {
        if (task.time.includes('AM') && now.getHours() >= 12) {
          alerts.push({ id: task.id, type: 'schedule', message: `Routine Deviation: "${task.title}" was not acknowledged.` });
        }
      }
    });

    return { routineAlerts: alerts };
  }),

  // Actions
  loadPatientData: async (patientId) => {
    const patient = await PatientProfileService.getPatient(patientId);
    const cognitiveProfile = await CognitiveProfileService.getProfile(patientId);
    
    // Ensure all domains are present in cognitiveProfile
    const fullSkills = { 
      memory: { baseline: 75, current: 75 },
      attention: { baseline: 80, current: 80 },
      recognition: { baseline: 85, current: 85 },
      language: { baseline: 70, current: 72 },
      problem_solving: { baseline: 60, current: 65 },
      visuospatial: { baseline: 78, current: 76 },
      ...cognitiveProfile?.skills 
    };
    if (cognitiveProfile) cognitiveProfile.skills = fullSkills;

    const dailyPlan = await DailyPlanService.getTodayPlan(patientId);
    const insights = await InsightService.getRecentInsights(patientId);
    
    // Mocking Activity Stats, Recent Sessions, and Cognitive Fingerprint for the dashboard
    const activityStats = {
      totalGamesPlayed: 142,
      activeDaysThisWeek: 5,
      currentStreak: 3,
      cognitiveAge: 68
    };
    
    const cognitiveFingerprint = {
      Memory: [
        { trait: 'Visual recall', status: 'Strong' },
        { trait: 'Sequential recall', status: 'Weak' },
        { trait: 'Delayed recall', status: 'Moderate' }
      ],
      Attention: [
        { trait: 'Sustained attention', status: 'Strong' },
        { trait: 'Distraction resistance', status: 'Weak' }
      ]
    };

    const recentSessions = [
      { id: 1, game: 'Memory Match', domain: 'Memory', date: 'Today, 10:30 AM', performance: '+2%', trend: 'up' },
      { id: 2, game: 'Word Connect', domain: 'Language', date: 'Yesterday, 4:15 PM', performance: 'Maintained', trend: 'stable' },
      { id: 3, game: 'Shape Sorter', domain: 'Visuospatial', date: 'Mon, 11:00 AM', performance: '-1%', trend: 'down' },
      { id: 4, game: 'Pattern Recall', domain: 'Attention', date: 'Sun, 9:20 AM', performance: '+4%', trend: 'up' },
    ];

    set({ patient, cognitiveProfile, dailyPlan, insights, activityStats, cognitiveFingerprint, recentSessions });
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

    // 3. Return null if no match, triggering Voice Onboarding
    if (!matched && targetSearch.length > 0) {
      console.log('[Voice NLU Engine] No existing match found for:', targetSearch);
      return null;
    }

    return null;
  },

  saveOnboardedPatient: async (profileData) => {
    console.log('[Store] Saving newly onboarded patient:', profileData);
    const newId = await get().createNewPatient({
      name: profileData.name || 'Unknown',
      age: profileData.age || 70,
      location: profileData.location || 'Unknown',
      interests: profileData.interests || '',
      family: profileData.family || ''
    });
    return newId;
  },

  updatePatientProfile: async (patientId, updates) => {
    const currentPatient = get().patient;
    if (currentPatient && currentPatient.patient_id === patientId) {
      const updatedPatient = { ...currentPatient, ...updates };
      
      // Handle array formatting if strings are passed
      if (typeof updates.interests === 'string') {
        updatedPatient.interests = updates.interests.split(',').map(s => s.trim());
      }
      if (typeof updates.family_members === 'string') {
        updatedPatient.family_members = updates.family_members.split(',').map(s => s.trim());
      }

      await PatientProfileService.savePatient(updatedPatient);
      set({ patient: updatedPatient });
    }
  },

  refreshInsights: async (patientId) => {
    await InsightService.generateInsights(patientId);
    const insights = await InsightService.getRecentInsights(patientId);
    const alerts = []; // Not implemented yet
    set({ insights, alerts });
  }
}));
