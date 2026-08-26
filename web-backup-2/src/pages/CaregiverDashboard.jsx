import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/common';
import { Activity, Brain, Clock, AlertTriangle } from 'lucide-react';

export const CaregiverDashboard = () => {
  const { patient, cognitiveProfile, insights, refreshInsights, isOffline } = useStore();

  useEffect(() => {
    if (patient) {
      refreshInsights(patient.patient_id);
    }
  }, [patient, refreshInsights]);

  if (!patient || !cognitiveProfile) return <div className="container"><h2>Loading...</h2></div>;

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Caregiver Dashboard: {patient.name}</h1>
        {isOffline && <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>⚠️ Offline (Syncing paused)</span>}
      </div>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Cognitive Indicators */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Brain color="var(--color-primary)" />
            <h2>Cognitive Indicators</h2>
          </div>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {Object.entries(cognitiveProfile.skills).map(([skill, data]) => {
              const diff = data.current - data.baseline;
              let trendClass = 'trend-stable';
              let trendIcon = '→';
              if (diff > 5) { trendClass = 'trend-up'; trendIcon = '↑'; }
              else if (diff < -5) { trendClass = 'trend-down'; trendIcon = '↓'; }

              return (
                <div key={skill} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-bg-subtle)' }}>
                  <span style={{ textTransform: 'capitalize', fontSize: '1.25rem' }}>{skill}</span>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Baseline: {data.baseline}</span>
                    <span className={trendClass} style={{ width: '60px', textAlign: 'right' }}>
                      {trendIcon} {data.current}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* What Changed Insights Engine */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Activity color="var(--color-accent-dark)" />
            <h2>What Changed?</h2>
          </div>
          
          {insights.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No significant changes detected recently.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {insights.map((insight, index) => (
                <div key={index} style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ textTransform: 'capitalize' }}>{insight.category}</strong>
                    <span className={`trend-${insight.trend}`}>
                      {insight.trend === 'up' ? '↑ Improved' : insight.trend === 'down' ? '↓ Declined' : '→ Stable'}
                    </span>
                  </div>
                  <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>{insight.text}</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Reason: {insight.reason}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid-2">
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Clock color="var(--color-primary)" />
            <h2>Routine Adherence</h2>
          </div>
          <p>Morning Medications: <strong style={{ color: 'var(--color-success)' }}>Taken</strong></p>
          <p>Breakfast: <strong style={{ color: 'var(--color-success)' }}>Completed</strong></p>
          <p>Afternoon Cognitive Session: <strong style={{ color: 'var(--color-text-muted)' }}>Pending</strong></p>
        </Card>
        
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertTriangle color="var(--color-danger)" />
            <h2>Recent Alerts</h2>
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>No critical alerts.</p>
        </Card>
      </div>
    </div>
  );
};
