import { db } from '../db/db';

export class CognitiveProfileService {
  
  static defaultProfile() {
    return {
      memory: { baseline: 50, current: 50 },
      attention: { baseline: 50, current: 50 },
      recognition: { baseline: 50, current: 50 },
      language: { baseline: 50, current: 50 },
      reaction: { baseline: 50, current: 50 },
      engagement: { baseline: 50, current: 50 }
    };
  }

  /**
   * Get the current cognitive profile
   */
  static async getProfile(patientId) {
    const profile = await db.cognitive_profiles.get(patientId);
    return profile || {
      patient_id: patientId,
      timestamp: new Date().toISOString(),
      skills: this.defaultProfile()
    };
  }

  /**
   * Update the profile based on new game session
   * This is where the baseline adaptation logic happens slowly.
   */
  static async updateFromGameSession(patientId, gameSession) {
    const profile = await this.getProfile(patientId);
    
    const targetSkill = gameSession.cognitive_skill_targeted.toLowerCase();
    
    if (profile.skills[targetSkill]) {
      const oldCurrent = profile.skills[targetSkill].current;
      
      // Calculate new current score based on game score/accuracy
      // In a real scenario, this would be a complex statistical model
      const gameImpact = (gameSession.score / 100) * 10; // Simple mapping
      const newCurrent = Math.min(100, Math.max(0, oldCurrent * 0.7 + gameImpact * 3));
      
      // Baseline evolves very slowly (90% old baseline, 10% new current)
      const oldBaseline = profile.skills[targetSkill].baseline;
      const newBaseline = oldBaseline * 0.9 + newCurrent * 0.1;
      
      profile.skills[targetSkill] = {
        current: Math.round(newCurrent),
        baseline: Math.round(newBaseline)
      };
      
      profile.timestamp = new Date().toISOString();
      await db.cognitive_profiles.put(profile);
      
      await db.sync_queue.add({
        action: 'UPDATE_COGNITIVE_PROFILE',
        status: 'pending',
        timestamp: profile.timestamp,
        payload: profile
      });
    }
    
    return profile;
  }
}
