import React from 'react';
import { useStore } from '../store/useStore';
import { Card, Button } from '../components/common';
import { Brain, Pill, Droplets, Image as ImageIcon, Mic } from 'lucide-react';

export const PatientDashboard = () => {
  const { patient, dailyPlan } = useStore();

  if (!patient) return <div className="container"><h2>Loading...</h2></div>;

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1>Good Morning, {patient.name.split(' ')[0]}</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Today's Activities</h2>
        {dailyPlan?.activities?.map((activity, index) => (
          <Card key={index} className="activity-card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{activity.name}</h3>
                <span style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>{activity.durationMinutes} min</span>
              </div>
              <button className="btn-start">Start</button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid-2">
        <Button icon={Brain} variant="primary">Brain Games</Button>
        <Button icon={Pill} variant="accent">Medicine</Button>
        <Button icon={Droplets} variant="primary">Drink Water</Button>
        <Button icon={ImageIcon} variant="primary">My Memories</Button>
        <Button icon={Mic} variant="primary" style={{ gridColumn: '1 / -1' }}>Talk to AI</Button>
      </div>
    </div>
  );
};
