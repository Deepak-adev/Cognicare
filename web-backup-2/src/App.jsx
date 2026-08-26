import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PatientDashboard } from './pages/PatientDashboard';
import { CaregiverDashboard } from './pages/CaregiverDashboard';
import { DemoScenario } from './pages/DemoScenario';
import { useStore } from './store/useStore';
import './styles/theme.css';
import './index.css'; // Note: you might want to remove Vite's default index.css or replace it.

function App() {
  const { isOffline, loadPatientData, patient } = useStore();

  useEffect(() => {
    // Attempt to load default patient if exists (from past sessions)
    loadPatientData('patient_001').catch(() => console.log('No patient data yet.'));
  }, [loadPatientData]);

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ 
          backgroundColor: 'var(--color-primary-dark)', 
          color: 'white', 
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>NeuroCare AI</h2>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Patient</Link>
            <Link to="/caregiver" style={{ color: 'white', textDecoration: 'none' }}>Caregiver</Link>
            <Link to="/demo" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 'bold' }}>Admin Demo</Link>
          </nav>
        </header>

        {isOffline && (
          <div style={{ backgroundColor: 'var(--color-danger)', color: 'white', textAlign: 'center', padding: '0.5rem' }}>
            You are offline. Data is being saved locally and will sync later.
          </div>
        )}

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={patient ? <PatientDashboard /> : <div className="container" style={{padding:'2rem'}}><h2>Welcome. Please go to Admin Demo to import a voice profile.</h2></div>} />
            <Route path="/caregiver" element={<CaregiverDashboard />} />
            <Route path="/demo" element={<DemoScenario />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
