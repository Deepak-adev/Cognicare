import { db } from '../db/db';
import { CognitiveProfileService } from './CognitiveProfileService';
import { PatientProfileService } from './PatientProfileService';

export class DailyPlanService {
  /**
   * Generates a daily cognitive plan based on the Personalization Engine rules.
   */
  static async generateDailyPlan(patientId) {
    const profile = await CognitiveProfileService.getProfile(patientId);
    const patientInfo = await PatientProfileService.getPatient(patientId);
    
    const activities = [];
    
    // Rule 1: Memory
    const memoryDiff = profile.skills.memory.current - profile.skills.memory.baseline;
    if (memoryDiff < 0 && patientInfo?.interests?.includes('Family')) {
      activities.push({ name: 'Family Memory', durationMinutes: 8, type: 'Memory', difficulty: 'easy' });
    } else {
      activities.push({ name: 'Memory Recall', durationMinutes: 5, type: 'Memory', difficulty: memoryDiff > 5 ? 'hard' : 'medium' });
    }
    
    // Rule 2: Attention
    const attentionDiff = profile.skills.attention.current - profile.skills.attention.baseline;
    if (attentionDiff < 0) {
      activities.push({ name: 'Short Attention Focus', durationMinutes: 3, type: 'Attention', difficulty: 'easy' });
    } else {
      activities.push({ name: 'Attention Tracker', durationMinutes: 5, type: 'Attention', difficulty: 'medium' });
    }
    
    // Rule 3: Pattern / Engagement
    activities.push({ name: 'Pattern Recognition', durationMinutes: 5, type: 'Pattern', difficulty: 'medium' });
    
    const plan = {
      patient_id: patientId,
      date: new Date().toISOString().split('T')[0],
      activities
    };
    
    await db.daily_plans.add(plan);
    
    await db.sync_queue.add({
      action: 'GENERATE_DAILY_PLAN',
      status: 'pending',
      timestamp: new Date().toISOString(),
      payload: plan
    });
    
    return plan;
  }
  
  static async getTodayPlan(patientId) {
    const today = new Date().toISOString().split('T')[0];
    const plans = await db.daily_plans
      .where('patient_id')
      .equals(patientId)
      .toArray();
      
    // Filter by today
    const todayPlan = plans.find(p => p.date === today);
    return todayPlan || await this.generateDailyPlan(patientId);
  }
}
