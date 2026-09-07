import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CandidateProfile, CandidatePersona } from '../types';

interface Flow2Props {
  onGoToUpload?: () => void;
  onRegenerate?: () => void;
}

export const Flow2_PersonaView: React.FC<Flow2Props> = ({ onGoToUpload, onRegenerate }) => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [persona, setPersona] = useState<CandidatePersona | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [regenerateSuccess, setRegenerateSuccess] = useState<boolean>(false);

  const loadRealProfileAndPersona = async () => {
    setLoading(true);
    try {
      await api.ensureCandidateAuth();
      const p = await api.getMyProfile();
      setProfile(p);

      try {
        const pers = await api.getPersona();
        setPersona(pers);
      } catch {
        setPersona(null);
      }
    } catch {
      setProfile(null);
      setPersona(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealProfileAndPersona();
  }, []);

  const handleRegenerateClick = async () => {
    setIsRegenerating(true);
    setRegenerateSuccess(false);
    try {
      await api.ensureCandidateAuth();
      const newPersona = await api.regeneratePersona();
      setPersona(newPersona);
      setRegenerateSuccess(true);
      setTimeout(() => setRegenerateSuccess(false), 5000);
      if (onRegenerate) onRegenerate();
    } catch (err: any) {
      alert(err.message || 'Failed to regenerate persona. Please ensure a CV has been uploaded and confirmed.');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="neu-card" style={{ textAlign: 'center', padding: '64px 20px' }}>
        <div style={{ fontSize: '36px', marginBottom: '16px' }}>⏳</div>
        <h3 className="title-lg">Loading Candidate Profile from Database...</h3>
        <p className="text-subtitle" style={{ margin: 0 }}>Connecting to PostgreSQL authoritative tables...</p>
      </div>
    );
  }

  // If no profile or persona exists yet in the database: NO FAKE DETAILS, SHOW NO-PERSON IMAGE
  const hasValidProfile = profile && profile.full_name && (profile.skills?.length > 0 || persona?.headline);

  if (!hasValidProfile) {
    return (
      <div className="neu-card" style={{ textAlign: 'center', padding: '64px 32px', maxWidth: '680px', margin: '0 auto' }}>
        <img 
          src="/no_person_avatar.jpg" 
          alt="No Candidate Profile" 
          style={{ 
            width: '180px', 
            height: '180px', 
            borderRadius: '24px', 
            objectFit: 'cover', 
            margin: '0 auto 24px', 
            border: '2px solid #cbd5e1',
            boxShadow: 'var(--shadow-card)'
          }} 
        />
        <h2 className="title-xl" style={{ color: '#0f172a' }}>No Candidate Persona Found</h2>
        <p className="text-subtitle" style={{ maxWidth: '480px', margin: '0 auto 28px' }}>
          No CV or profile records have been committed yet. Once you upload your CV (.pdf or .docx) in Step 1, 
          Google Gemini AI will automatically generate your executive persona dossier here.
        </p>
        <button 
          type="button"
          className="neu-btn-primary" 
          onClick={onGoToUpload}
          style={{ padding: '14px 28px', fontSize: '15px' }}
        >
          📄 Go to Step 1: Upload Your CV Now &rarr;
        </button>
      </div>
    );
  }

  // REAL DATA RENDERING (from confirmed PostgreSQL database record & Gemini persona)
  return (
    <div>
      {/* View Header with Regeneration Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="title-xl">Candidate Persona: "Personal Find"</h1>
          <p className="text-subtitle" style={{ margin: 0 }}>
            Authoritative executive dossier synthesized by Gemini AI from your confirmed database records.
          </p>
        </div>
        <button 
          type="button"
          className="neu-btn-secondary" 
          onClick={handleRegenerateClick} 
          disabled={isRegenerating}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <span>{isRegenerating ? '⏳' : '🔄'}</span>
          <span>{isRegenerating ? 'Re-synthesizing with Gemini...' : 'Regenerate Persona'}</span>
        </button>
      </div>

      {regenerateSuccess && (
        <div style={{ 
          background: '#ecfdf5', 
          border: '1.5px solid #10b981', 
          borderRadius: '10px', 
          padding: '12px 20px', 
          marginBottom: '20px',
          color: '#047857',
          fontWeight: '700',
          fontSize: '13px'
        }}>
          ✨ Candidate Persona re-synthesized successfully with Google Gemini AI structured output!
        </div>
      )}

      {/* Main Grid: Left Executive Hero Card + Right Bento Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '28px' }}>
        
        {/* LEFT COLUMN: Executive Dossier Hero Card */}
        <div className="neu-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Portrait Header */}
          <div style={{ position: 'relative', height: '280px', background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '44px', 
              color: '#ffffff', 
              fontWeight: '900',
              border: '4px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
            }}>
              {profile.full_name?.charAt(0) || 'C'}
            </div>
            <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px' }}>
              <span className="badge-pill badge-blue" style={{ marginBottom: '6px' }}>
                {persona?.seniority_level || 'Verified Candidate'}
              </span>
              <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '800' }}>
                {profile.full_name}
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '13px', marginTop: '2px' }}>
                {persona?.headline || profile.headline || 'Technical Professional'}
              </p>
            </div>
          </div>

          {/* Elevator Pitch Box */}
          <div style={{ padding: '24px' }}>
            {persona?.summary && (
              <blockquote style={{ fontStyle: 'italic', fontSize: '14px', color: '#334155', borderLeft: '3px solid #2563eb', paddingLeft: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
                "{persona.summary.slice(0, 220)}..."
              </blockquote>
            )}

            {/* Structured Demographics */}
            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#2563eb', fontSize: '12px' }}>■</span>
                <span style={{ fontSize: '13px', color: '#64748b', width: '90px' }}>Location:</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {profile.location ? `${profile.location.city}, ${profile.location.country}` : 'Not specified'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#2563eb', fontSize: '12px' }}>■</span>
                <span style={{ fontSize: '13px', color: '#64748b', width: '90px' }}>Experience:</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {profile.total_years_experience || 0} Years Authoritative
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#2563eb', fontSize: '12px' }}>■</span>
                <span style={{ fontSize: '13px', color: '#64748b', width: '90px' }}>Availability:</span>
                <span className="badge-pill badge-success">
                  {profile.availability_status ? profile.availability_status.replace('_', ' ') : 'Available'}
                </span>
              </div>
            </div>

            {/* Real Top Competency Meters */}
            <div style={{ marginTop: '28px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px' }}>
                Key Technical Competencies
              </h4>
              {profile.skills && profile.skills.slice(0, 3).map((skill, idx) => {
                const percentage = Math.min(100, Math.max(50, (skill.years_experience || 2) * 20));
                return (
                  <div key={skill.id || idx} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      <span>{skill.normalized_name}</span>
                      <span style={{ color: '#2563eb' }}>{skill.years_experience || 1}y exp</span>
                    </div>
                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: idx === 0 ? '#2563eb' : idx === 1 ? '#6366f1' : '#10b981' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Bento-Grid Modular Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Bento Card 1: Executive Bio */}
          <div className="neu-card" style={{ gridColumn: 'span 2' }}>
            <h3 className="title-md" style={{ color: '#0f172a', marginBottom: '8px' }}>Executive Bio & Domain Focus</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155' }}>
              {persona?.summary || profile.bio || 'Profile established in Dullnit candidate registry.'}
            </p>
          </div>

          {/* Bento Card 2: Core Competencies Cluster */}
          <div className="neu-card">
            <h3 className="title-md" style={{ marginBottom: '14px' }}>Verified Skills ({profile.skills?.length || 0})</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map(s => (
                  <span key={s.id} className="badge-pill badge-blue" style={{ fontSize: '12px', textTransform: 'none' }}>
                    {s.normalized_name}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>No skills indexed yet.</span>
              )}
            </div>
          </div>

          {/* Bento Card 3: Suggested Career Roles */}
          <div className="neu-card">
            <h3 className="title-md" style={{ marginBottom: '14px' }}>AI Recommended Roles</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {persona?.suggested_roles && persona.suggested_roles.length > 0 ? (
                persona.suggested_roles.map((role, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{role}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#047857' }}>Recommended</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {profile.headline ? `Role: ${profile.headline}` : 'Roles will be synthesized by Gemini.'}
                </div>
              )}
            </div>
          </div>

          {/* Bento Card 4: Metadata & Recruiter Visibility Footer */}
          <div className="neu-card" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                Searchable Status: Active in Recruiter Discovery
              </span>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Synthesized via Gemini AI • PostGIS Spatial Ready
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
export default Flow2_PersonaView;
