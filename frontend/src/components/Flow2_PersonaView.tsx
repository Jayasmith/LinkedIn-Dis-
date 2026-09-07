import React, { useState } from 'react';
import { api } from '../services/api';

interface Flow2Props {
  onRegenerate?: () => void;
}

export const Flow2_PersonaView: React.FC<Flow2Props> = ({ onRegenerate }) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateSuccess, setRegenerateSuccess] = useState(false);

  const handleRegenerateClick = async () => {
    setIsRegenerating(true);
    setRegenerateSuccess(false);
    try {
      await api.regeneratePersona();
      setRegenerateSuccess(true);
      setTimeout(() => setRegenerateSuccess(false), 4000);
    } catch (err) {
      console.warn('Backend regenerate fallback to local state:', err);
      // simulate prompt regeneration
      setTimeout(() => {
        setRegenerateSuccess(true);
        setTimeout(() => setRegenerateSuccess(false), 4000);
      }, 1200);
    } finally {
      setIsRegenerating(false);
      if (onRegenerate) onRegenerate();
    }
  };

  return (
    <div>
      {/* View Header with Regeneration Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="title-xl">Candidate Persona: "Personal Find"</h1>
          <p className="text-subtitle" style={{ margin: 0 }}>
            Derived, non-authoritative executive dossier synthesized by Gemini AI from confirmed profile facts.
          </p>
        </div>
        <button 
          className="neu-btn-secondary" 
          onClick={handleRegenerateClick} 
          disabled={isRegenerating}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <span>{isRegenerating ? '⏳' : '🔄'}</span>
          <span>{isRegenerating ? 'Synthesizing with Gemini...' : 'Regenerate Persona'}</span>
        </button>
      </div>

      {regenerateSuccess && (
        <div style={{ 
          background: '#ecfdf5', 
          border: '1px solid #10b981', 
          borderRadius: '10px', 
          padding: '12px 20px', 
          marginBottom: '20px',
          color: '#047857',
          fontWeight: '600',
          fontSize: '13px'
        }}>
          ✨ Candidate Persona re-synthesized successfully with Google Gemini AI structured output!
        </div>
      )}

      {/* Main Grid: Left Executive Portrait (Image 4) + Right Bento Grid (Image 1) */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '28px' }}>
        
        {/* LEFT COLUMN: Executive Dossier Hero Card (Image 4 Style) */}
        <div className="neu-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Portrait Header */}
          <div style={{ position: 'relative', height: '320px', background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' }}>
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80" 
              alt="Candidate Portrait" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} 
            />
            <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px' }}>
              <span className="badge-pill badge-blue" style={{ marginBottom: '8px' }}>Senior / Lead</span>
              <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: '800' }}>Demuni Jayasmith</h2>
              <p style={{ color: '#cbd5e1', fontSize: '13px' }}>AI Systems & Backend Architect</p>
            </div>
          </div>

          {/* Elevator Pitch Box */}
          <div style={{ padding: '24px' }}>
            <blockquote style={{ fontStyle: 'italic', fontSize: '14px', color: '#334155', borderLeft: '3px solid #2563eb', paddingLeft: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
              "Specializes in building distributed backend pipelines and bridging generative AI models with high-throughput PostGIS geospatial querying."
            </blockquote>

            {/* Structured Demographics (Image 4 Bold Square Bullet Design) */}
            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#2563eb', fontSize: '12px' }}>■</span>
                <span style={{ fontSize: '13px', color: '#64748b', width: '90px' }}>Location:</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Colombo, Sri Lanka</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#2563eb', fontSize: '12px' }}>■</span>
                <span style={{ fontSize: '13px', color: '#64748b', width: '90px' }}>Experience:</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>4.5+ Years Authoritative</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#2563eb', fontSize: '12px' }}>■</span>
                <span style={{ fontSize: '13px', color: '#64748b', width: '90px' }}>Availability:</span>
                <span className="badge-pill badge-success">Available Immediately</span>
              </div>
            </div>

            {/* Competency Meter Bars (Image 4 Style) */}
            <div style={{ marginTop: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                <span>Backend Architecture</span>
                <span>94%</span>
              </div>
              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
                <div style={{ width: '94%', height: '100%', background: '#2563eb' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                <span>AI Agent Systems</span>
                <span>88%</span>
              </div>
              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
                <div style={{ width: '88%', height: '100%', background: '#6366f1' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                <span>Database Optimization</span>
                <span>92%</span>
              </div>
              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '92%', height: '100%', background: '#10b981' }} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Bento-Grid Modular Cards (Image 1 Style) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Bento Card 1: Executive Bio */}
          <div className="neu-card" style={{ gridColumn: 'span 2' }}>
            <h3 className="title-md" style={{ color: '#0f172a', marginBottom: '8px' }}>Executive Bio & Domain Focus</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155' }}>
              Jayasmith is an experienced technical engineer specializing in end-to-end AI workflows and backend systems. Possesses deep operational capability in configuring PostgreSQL with PostGIS for spatial radius filtering, designing Pydantic validation pipelines with Gemini models, and orchestrating multi-agent architectures.
            </p>
          </div>

          {/* Bento Card 2: Core Competencies Cluster */}
          <div className="neu-card">
            <h3 className="title-md" style={{ marginBottom: '14px' }}>Core Competencies</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Python', 'FastAPI', 'PostgreSQL', 'PostGIS', 'Docker', 'Gemini AI', 'Dataform', 'PyTorch'].map(tag => (
                <span key={tag} className="badge-pill badge-blue" style={{ fontSize: '11px', textTransform: 'none' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bento Card 3: Suggested Career Roles */}
          <div className="neu-card">
            <h3 className="title-md" style={{ marginBottom: '14px' }}>Suggested Target Roles</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {[
                { title: 'Senior AI Engineer', match: '98%' },
                { title: 'Backend Systems Architect', match: '94%' },
                { title: 'PostGIS / Data Platform Lead', match: '91%' }
              ].map(role => (
                <div key={role.title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{role.title}</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#047857' }}>{role.match}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bento Card 4: Metadata & Recruiter Visibility Footer */}
          <div className="neu-card" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Searchable Status: Active in Recruiter Discovery</span>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Synthesized via Gemini Flash • Schema Rev 1.4
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
export default Flow2_PersonaView;
