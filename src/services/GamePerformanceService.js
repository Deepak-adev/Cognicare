import { db } from '../db/db';

export class GamePerformanceService {
  /**
   * Log a new game session result
   */
  static async logSession(patientId, sessionData) {
    const session = {
      patient_id: patientId,
      timestamp: new Date().toISOString(),
      ...sessionData
    };
    
    await db.game_sessions.add(session);
    
    await db.sync_queue.add({
      action: 'LOG_GAME_SESSION',
      status: 'pending',
      timestamp: session.timestamp,
      payload: session
    });
    
    return session;
  }

  /**
   * Get recent game sessions for a patient
   */
  static async getRecentSessions(patientId, limit = 10) {
    return await db.game_sessions
      .where('patient_id')
      .equals(patientId)
      .reverse()
      .limit(limit)
      .toArray();
  }
}
