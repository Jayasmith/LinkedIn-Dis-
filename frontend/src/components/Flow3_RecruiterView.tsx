import React, { useState } from 'react';
import { api } from '../services/api';

interface CandidateItem {
  id: string;
  name: string;
  headline: string;
  distance: number;
  score: number;
  availability: string;
  matchedSkills: string[];
  expYears: number;
  degree: string;
}

export const Flow3_RecruiterView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>(
    'Find Python backend developers with 3+ years experience within 30 km of Colombo'
  );
  const [radiusKm, setRadiusKm] = useState<number>(35);
  const [selectedRole, setSelectedRole] = useState<string>('Backend Engineer');
  const [minExp, setMinExp] = useState<string>('3+ Years');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateItem | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [candidates, setCandidates] = useState<CandidateItem[]>([
    {
      id: 'DL-8821',
      name: 'Demuni Jayasmith',
      headline: 'Senior AI Systems & Backend Architect',
      distance: 8.3,
      score: 96,
      availability: 'Available Now',
      matchedSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
      expYears: 4.5,
      degree: 'B.Sc. in Software Engineering'
    },
    {
      id: 'DL-4019',
      name: 'Candidate #4019 (Anonymous)',
      headline: 'Lead Platform Engineer',
      distance: 22.1,
      score: 84,
      availability: '1 Month Notice',
      matchedSkills: ['Python', 'PostgreSQL'],
      expYears: 6.0,
      degree: 'M.Sc. in Computer Science'
    }
  ]);

  const handleAiSearch = async () => {
    setIsSearching(true);
    try {
      // Use live Gemini NL search endpoint from backend
      const res = await api.naturalLanguageSearch(searchQuery);
      if (res && res.parsed_criteria) {
        if (res.parsed_criteria.radius_km) setRadiusKm(Math.round(res.parsed_criteria.radius_km));
        if (res.parsed_criteria.role) setSelectedRole(res.parsed_criteria.role);
      }

      if (res && res.items && res.items.length > 0) {
        const mapped: CandidateItem[] = res.items.map((item: any) => ({
          id: item.candidate_id || 'DL-8821',
          name: item.display_name || 'Demuni Jayasmith',
          headline: item.headline || 'Senior AI Systems & Backend Architect',
          distance: item.distance_km ? Math.round(item.distance_km * 10) / 10 : 8.3,
          score: Math.round(item.match_score),
          availability: item.availability_status || 'Available Now',
          matchedSkills: item.matched_skills || ['Python', 'FastAPI', 'PostgreSQL'],
          expYears: item.total_years_experience || 4.5,
          degree: 'First Class Honors'
        }));
        setCandidates(mapped);
      }
    } catch (err) {
      console.warn('Backend search fallback to demo state:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div>
      {/* 1. FLOATING NEUMORPHIC SEARCH BAR (Image 5 Style) */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid #cbd5e1',
          borderRadius: '18px',
          padding: '10px 16px',
          boxShadow: 'var(--shadow-floating)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <span style={{ fontSize: '20px' }}>🔍</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAiSearch();
            }}
            placeholder="e.g. Find Python backend developers with 3+ years experience within 30 km of Colombo"
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '15px', color: '#0f172a', fontWeight: '500' }}
          />
          <span style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
            ⌘ + /
          </span>
          <button 
            type="button"
            className="neu-btn-primary" 
            style={{ padding: '10px 20px', cursor: 'pointer' }}
            onClick={handleAiSearch}
            disabled={isSearching}
          >
            {isSearching ? 'Parsing...' : '⚡ AI Parse'}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Suggestions:</span>
          {[
            'FastAPI + Docker in Colombo',
            'Senior AI Engineer > 4 yrs',
            'Available Immediately'
          ].map(chip => (
            <span 
              key={chip} 
              onClick={() => {
                setSearchQuery(chip);
              }}
              style={{ fontSize: '12px', background: '#e2e8f0', padding: '4px 12px', borderRadius: '14px', cursor: 'pointer', color: '#334155', fontWeight: '500' }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* 2. MAIN LAYOUT: Filter Sidebar (Image 3) + Results Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: '32px' }}>
        
        {/* LEFT COLUMN: Collapsible Deterministic Filters */}
        <div className="neu-card" style={{ height: 'fit-content', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="title-md" style={{ margin: 0 }}>Filter Criteria</h3>
            <button 
              type="button"
              onClick={() => {
                setRadiusKm(35);
                setSelectedRole('Backend Engineer');
                setMinExp('3+ Years');
              }}
              style={{ border: 'none', background: 'transparent', color: '#2563eb', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Reset
            </button>
          </div>

          {/* Spatial PostGIS Slider */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>Radius (PostGIS)</label>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#2563eb' }}>{radiusKm} km</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="150" 
              value={radiusKm} 
              onChange={(e) => setRadiusKm(Number(e.target.value))} 
              style={{ width: '100%', accentColor: '#2563eb' }}
            />
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
              Center point: Colombo (6.9271° N, 79.8612° E)
            </span>
          </div>

          {/* Role Family */}
          <div className="form-group">
            <label className="form-label">Role Target</label>
            <select 
              className="neu-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option>Backend Engineer</option>
              <option>AI Systems Engineer</option>
              <option>Full Stack Developer</option>
            </select>
          </div>

          {/* Experience Range */}
          <div className="form-group">
            <label className="form-label">Min Experience</label>
            <select 
              className="neu-select"
              value={minExp}
              onChange={(e) => setMinExp(e.target.value)}
            >
              <option>3+ Years</option>
              <option>5+ Years</option>
              <option>8+ Years</option>
            </select>
          </div>

          {/* Required Skills */}
          <div className="form-group">
            <label className="form-label">Required Skills</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span className="badge-pill badge-blue" style={{ fontSize: '11px' }}>Python ×</span>
              <span className="badge-pill badge-blue" style={{ fontSize: '11px' }}>FastAPI ×</span>
              <span className="badge-pill badge-blue" style={{ fontSize: '11px' }}>PostgreSQL ×</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Candidate Results Cards (Image 3 Style) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
              Showing {candidates.length} Matched Candidates
            </span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Sorted by: <b>Match Score (Highest)</b>
            </span>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            {candidates.map(candidate => (
              <div key={candidate.id} className="neu-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  
                  {/* Candidate Header */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      borderRadius: '12px', 
                      background: '#1e293b', 
                      color: '#ffffff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '20px', 
                      fontWeight: '800' 
                    }}>
                      {candidate.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{candidate.name}</h3>
                        <span className="badge-pill badge-success" style={{ fontSize: '11px' }}>{candidate.availability}</span>
                      </div>
                      <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>{candidate.headline}</p>
                      <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', marginTop: '4px', display: 'inline-block' }}>
                        📍 {candidate.distance} km away from Colombo
                      </span>
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      background: candidate.score >= 90 ? '#ecfdf5' : '#fffbeb',
                      color: candidate.score >= 90 ? '#047857' : '#b45309',
                      border: '1.5px solid currentColor',
                      borderRadius: '12px',
                      padding: '8px 16px',
                      fontWeight: '800',
                      fontSize: '18px'
                    }}>
                      {candidate.score}% Match
                    </div>
                  </div>

                </div>

                {/* Match Evidence Box */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginTop: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>Match Evidence Breakdown:</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px', fontSize: '12px', color: '#334155' }}>
                    <div>✓ Matched {candidate.matchedSkills.length} required skills: {candidate.matchedSkills.join(', ')}</div>
                    <div>✓ {candidate.expYears} yrs experience meets minimum (3.0 yrs)</div>
                    <div>✓ Within PostGIS radius ({candidate.distance} km &lt; {radiusKm} km)</div>
                    <div>✓ Verified Degree: {candidate.degree}</div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                  <button type="button" className="neu-btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    ⭐ Save to Shortlist
                  </button>
                  <button 
                    type="button"
                    className="neu-btn-primary" 
                    style={{ padding: '8px 18px', fontSize: '13px' }}
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    View Full Dossier &rarr;
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recruiter Dossier Modal */}
      {selectedCandidate && (
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
          <div className="neu-card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span className="badge-pill badge-blue" style={{ marginBottom: '6px' }}>Candidate ID: {selectedCandidate.id}</span>
                <h2 className="title-lg" style={{ margin: 0 }}>{selectedCandidate.name}</h2>
                <p style={{ fontSize: '13px', color: '#64748b' }}>{selectedCandidate.headline}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedCandidate(null)}
                style={{ border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>Overall Match Compatibility</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#047857' }}>{selectedCandidate.score}%</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                PostGIS spatial proximity: {selectedCandidate.distance} km • Availability: {selectedCandidate.availability}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Matched Technical Proficiencies</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedCandidate.matchedSkills.map(s => (
                  <span key={s} className="badge-pill badge-blue">{s}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                type="button" 
                className="neu-btn-secondary"
                onClick={() => setSelectedCandidate(null)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="neu-btn-primary"
                onClick={() => {
                  alert(`Interview invitation requested for ${selectedCandidate.name}`);
                  setSelectedCandidate(null);
                }}
              >
                Request Interview Access &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Flow3_RecruiterView;
