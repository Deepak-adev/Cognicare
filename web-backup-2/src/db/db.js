import Dexie from 'dexie';

export const db = new Dexie('DementiaCarePlatformDB');

db.version(1).stores({
  patients: 'patient_id, name, age, preferred_language, location', // onboarding metadata etc.
  cognitive_profiles: 'patient_id, timestamp', // Baseline and dynamic tracking
  game_sessions: '++id, patient_id, game_id, game_type, timestamp, cognitive_skill_targeted', // Historical games
  daily_plans: '++id, patient_id, date', // Generated plans
  insights: '++id, patient_id, timestamp, category', // "What Changed?"
  sync_queue: '++id, action, status, timestamp' // For offline-first sync
});

// Helper for resetting database in Demo scenario
export async function resetDatabase() {
  await db.delete();
  await db.open();
}
