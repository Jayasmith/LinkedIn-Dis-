import { useState } from 'react';
import './assets/design-system.css';
import Flow1_ProfileForm from './components/Flow1_ProfileForm';
import Flow2_PersonaView from './components/Flow2_PersonaView';
import Flow3_RecruiterView from './components/Flow3_RecruiterView';

export function App() {
  const [currentFlow, setCurrentFlow] = useState<'flow1' | 'flow2' | 'flow3'>('flow1');
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);

  return (
    <div className="dullnit-app">
      {/* Platform Header */}
      <header className="platform-navbar">
        <div className="platform-logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentFlow('flow1')}>
          <span>⚡ DULLNIT</span>
          <span className="platform-logo-badge">TALENT PLATFORM</span>
        </div>

        {/* 3 Core Flow Switcher */}
        <div className="nav-flow-tabs">
          <button 
            type="button"
            className={`nav-tab-btn ${currentFlow === 'flow1' ? 'active' : ''}`}
            onClick={() => setCurrentFlow('flow1')}
          >
            1. Profile & CV Form
          </button>
          <button 
            type="button"
            className={`nav-tab-btn ${currentFlow === 'flow2' ? 'active' : ''}`}
            onClick={() => setCurrentFlow('flow2')}
          >
            2. Candidate Persona ("Personal Find")
          </button>
          <button 
            type="button"
            className={`nav-tab-btn ${currentFlow === 'flow3' ? 'active' : ''}`}
            onClick={() => setCurrentFlow('flow3')}
          >
            3. Recruiter Search & View
          </button>
        </div>

        {/* Right Admin / Diagnostic Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="neu-btn-secondary"
            style={{ padding: '8px 14px', fontSize: '12px' }}
            onClick={() => setShowStatusModal(true)}
          >
            🛡️ System Status
          </button>
        </div>
      </header>

      {/* Flow Views */}
      <main>
        {currentFlow === 'flow1' && (
          <Flow1_ProfileForm onConfirmProfile={() => setCurrentFlow('flow2')} />
        )}
        {currentFlow === 'flow2' && (
          <Flow2_PersonaView 
            onGoToUpload={() => setCurrentFlow('flow1')} 
            onRegenerate={() => {}} 
          />
        )}
        {currentFlow === 'flow3' && (
          <Flow3_RecruiterView />
        )}
      </main>

      {/* System Status Modal */}
      {showStatusModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="neu-card" style={{ maxWidth: '520px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="title-md" style={{ margin: 0 }}>Dullnit Platform Architecture</h3>
              <button 
                type="button" 
                onClick={() => setShowStatusModal(false)}
                style={{ border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>
            <div style={{ display: 'grid', gap: '12px', fontSize: '13px', color: '#334155', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span>Backend Engine</span>
                <span style={{ fontWeight: '700', color: '#047857' }}>FastAPI (Port 8000) ✓</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span>Database & Spatial</span>
                <span style={{ fontWeight: '700', color: '#047857' }}>PostgreSQL + PostGIS ✓</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span>AI Ingestion & NLP</span>
                <span style={{ fontWeight: '700', color: '#047857' }}>Google Gemini Structured Output ✓</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span>Design System</span>
                <span style={{ fontWeight: '700', color: '#047857' }}>High-Contrast Neumorphic System ✓</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="neu-btn-primary" 
                onClick={() => setShowStatusModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
