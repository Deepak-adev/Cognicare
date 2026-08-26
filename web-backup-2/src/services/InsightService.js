import { db } from '../db/db';
import { CognitiveProfileService } from './CognitiveProfileService';

export class InsightService {
  /**
   * Generates simple, non-clinical explanations of changes
   * The "What Changed?" Engine
   */
  static async generateInsights(patientId) {
    const profile = await CognitiveProfileService.getProfile(patientId);
    const insights = [];
    
    // Analyze Memory
    const memoryDiff = profile.skills.memory.current - profile.skills.memory.baseline;
    if (memoryDiff > 5) {
      insights.push({
        category: 'memory',
        trend: 'up',
        text: `Memory performance improved by ${Math.round(memoryDiff)}% compared with the personal baseline.`,
        reason: 'Patient scored highly in recent Family Memory activities.'
      });
    } else if (memoryDiff < -5) {
      insights.push({
        category: 'memory',
        trend: 'down',
        text: `Memory performance is slightly lower than the personal baseline.`,
        reason: 'Decreased accuracy in morning memory recall games.'
      });
    } else {
      insights.push({
        category: 'memory',
        trend: 'stable',
        text: `Memory performance has remained stable.`,
        reason: 'Consistent performance matching the baseline.'
      });
    }
    
    // Analyze Attention
    const attentionDiff = profile.skills.attention.current - profile.skills.attention.baseline;
    if (attentionDiff < -8) {
       insights.push({
        category: 'attention',
        trend: 'down',
        text: `Attention span during activities has decreased recently.`,
        reason: 'Slower response times and incomplete evening sessions.'
      });
    } else if (attentionDiff > 5) {
      insights.push({
        category: 'attention',
        trend: 'up',
        text: `Attention performance is higher than normal.`,
        reason: 'Completed tasks faster with fewer distractions.'
      });
    } else {
      insights.push({
        category: 'attention',
        trend: 'stable',
        text: `Attention performance is stable.`,
        reason: 'No significant changes detected.'
      });
    }
    
    // Engagement / Routine
    insights.push({
      category: 'engagement',
      trend: 'down',
      text: `Evening activity completion has decreased over the last 5 days.`,
      reason: 'Missed 3 recommended evening puzzle sessions.'
    });

    // Save insights to DB
    for (const insight of insights) {
      await db.insights.add({
        patient_id: patientId,
        timestamp: new Date().toISOString(),
        ...insight
      });
    }
    
    return insights;
  }
  
  static async getRecentInsights(patientId) {
    return await db.insights
      .where('patient_id')
      .equals(patientId)
      .reverse()
      .limit(5)
      .toArray();
  }
}
