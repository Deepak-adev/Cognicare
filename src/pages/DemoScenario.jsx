import React, { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useStore } from '../store/useStore';
import { Card, Button, globalStyles, colors } from '../components/common';
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
    addLog('Database reset. Please restart the app.');
  };

  const step1 = async () => {
    await importMockVoiceProfile('patient_001');
    addLog('Imported profile from Voice AI.');
  };

  const step2 = async () => {
    if (!patient) return addLog('Import profile first.');
    const session = await GamePerformanceService.logSession(patient.patient_id, {
      game_id: 'mem_1', game_type: 'Memory Match', score: 95, accuracy: 90, cognitive_skill_targeted: 'memory'
    });
    addLog(`Played ${session.game_type}. Score: 95.`);
    await CognitiveProfileService.updateFromGameSession(patient.patient_id, session);
    await DailyPlanService.generateDailyPlan(patient.patient_id);
    await loadPatientData(patient.patient_id);
  };

  const step3 = async () => {
    if (!patient) return addLog('Import profile first.');
    const session = await GamePerformanceService.logSession(patient.patient_id, {
      game_id: 'att_1', game_type: 'Attention Tracker', score: 30, accuracy: 25, cognitive_skill_targeted: 'attention'
    });
    addLog(`Played ${session.game_type}. Score: 30.`);
    await CognitiveProfileService.updateFromGameSession(patient.patient_id, session);
    await DailyPlanService.generateDailyPlan(patient.patient_id);
    await loadPatientData(patient.patient_id);
  };

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={[globalStyles.headerText, { marginTop: 10, marginBottom: 24 }]}>Admin Testing</Text>
      
      <Button onPress={step1} style={{marginBottom: 16}}>1. Import Voice Profile</Button>
      <Button onPress={step2} style={{marginBottom: 16}}>2. Play Game (High Score)</Button>
      <Button onPress={step3} variant="accent" style={{marginBottom: 16}}>3. Play Game (Low Score)</Button>
      
      <Button onPress={handleReset} style={{backgroundColor: colors.danger, marginBottom: 32}}>Reset Database</Button>

      <Card>
        <Text style={{fontWeight: '800', marginBottom: 16, fontSize: 20, color: colors.textMain}}>System Logs</Text>
        {logs.map((l, i) => (
          <View key={i} style={{flexDirection: 'row', marginBottom: 8}}>
            <Text style={{color: colors.textMuted, marginRight: 8}}>→</Text>
            <Text style={{fontSize: 16, color: colors.textMain}}>{l}</Text>
          </View>
        ))}
        {logs.length === 0 && <Text style={{color: colors.textMuted}}>No actions taken yet.</Text>}
      </Card>
      
      <View style={{ height: 60 }} />
    </ScrollView>
  );
};
