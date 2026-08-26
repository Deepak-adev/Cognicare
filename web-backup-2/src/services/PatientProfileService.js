import { db } from '../db/db';

export class PatientProfileService {
  /**
   * Retrieves a patient profile by ID
   */
  static async getPatient(patientId) {
    return await db.patients.get(patientId);
  }

  /**
   * Creates or updates a patient profile from voice onboarding
   */
  static async savePatient(patientData) {
    const existing = await this.getPatient(patientData.patient_id);
    if (existing) {
      await db.patients.put({ ...existing, ...patientData });
    } else {
      await db.patients.add(patientData);
    }
    
    // Add to sync queue for offline support
    await db.sync_queue.add({
      action: 'SAVE_PATIENT',
      status: 'pending',
      timestamp: new Date().toISOString(),
      payload: patientData
    });
  }

  /**
   * Mock Voice Profile import (for demo scenario)
   */
  static async importVoiceProfile(patientId, voiceData) {
    const profile = {
      patient_id: patientId,
      name: voiceData.name || 'Unknown',
      age: voiceData.age || 70,
      preferred_language: voiceData.language || 'English',
      location: voiceData.location || 'Assam, India',
      interests: voiceData.interests || ['Gardening', 'Music'],
      family_members: voiceData.family_members || ['Rahul (Son)'],
      important_memories: voiceData.memories || [],
      medical_info: 'Pending formal entry',
      onboarding_metadata: { source: 'voice_ai', confidence: 0.95 }
    };
    
    await this.savePatient(profile);
    return profile;
  }
}
