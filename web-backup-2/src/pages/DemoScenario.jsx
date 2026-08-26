import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button } from '../components/common';
import { GamePerformanceService } from '../services/GamePerformanceService';
import { CognitiveProfileService } from '../services/CognitiveProfileService';
import { DailyPlanService } from '../services/DailyPlanService';
import { resetDatabase } from '../db/db';

export const DemoScenario = () => {
  const { patient, loadPatientData, importMockVoiceProfile } = useStore();
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs(prev => [msg, ...prev]);

  const handleReset = async () => {
    await resetDatabase();
    addLog('Database reset. Please reload page.');
    window.location.reload();
  };

  const step1_ImportProfile = async () => {
    await importMockVoiceProfile('patient_001');
    addLog('Simulated Voice AI onboarding complete. Profile imported.');
  };

  const step2_PlayGameGood = async () => {
    if (!patient) return addLog('Please import profile first.');
    const session = await GamePerformanceService.logSession(patient.patient_id, {
      game_id: 'mem_1',
      game_type: 'Memory Match',
      score: 95,
      accuracy: 90,
      cognitive_skill_targeted: 'memory'
    });
    addLog(`Played ${session.game_type}: Scored 95. Logged session.`);
    
    await CognitiveProfileService.updateFromGameSession(patient.patient_id, session);
    addLog('Cognitive Profile (Memory) updated based on performance.');
    
    await DailyPlanService.generateDailyPlan(patient.patient_id);
    await loadPatientData(patient.patient_id);
  };

  const step3_PlayGameBad = async () => {
    if (!patient) return addLog('Please import profile first.');
    const session = await GamePerformanceService.logSession(patient.patient_id, {
      game_id: 'att_1',
      game_type: 'Attention Tracker',
      score: 30,
      accuracy: 25,
      cognitive_skill_targeted: 'attention'
    });
    addLog(`Played ${session.game_type}: Scored 30. Logged session.`);
    
    await CognitiveProfileService.updateFromGameSession(patient.patient_id, session);
    addLog('Cognitive Profile (Attention) updated. Baseline adapting downward.');
    
    await DailyPlanService.generateDailyPlan(patient.patient_id);
    await loadPatientData(patient.patient_id);
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1>Demo Controller (Admin)</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
        Use these controls to simulate the 15-step end-to-end scenario.
      </p>

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <Button onClick={step1_ImportProfile} variant="primary">1. Import Voice Profile</Button>
        <Button onClick={step2_PlayGameGood} variant="primary">2. Play Game (High Score)</Button>
        <Button onClick={step3_PlayGameBad} variant="accent">3. Play Game (Low Score)</Button>
        <Button onClick={handleReset} variant="primary" style={{ backgroundColor: 'var(--color-danger)' }}>Reset Database</Button>
      </div>

      <Card>
        <h2>Event Logs</h2>
        <div style={{ maxHeight: '300px', overflowY: 'auto', backgroundColor: 'var(--color-bg-subtle)', padding: '1rem', borderRadius: '8px' }}>
          {logs.length === 0 ? <p>No events yet.</p> : null}
          {logs.map((log, i) => (
            <div key={i} style={{ borderBottom: '1px solid #e2e8f0', padding: '0.5rem 0' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{new Date().toLocaleTimeString()}</span> - {log}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
