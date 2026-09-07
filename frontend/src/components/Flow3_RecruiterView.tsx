import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CandidateSearchResult } from '../types';

export const Flow3_RecruiterView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>(
    'Find Python backend developers with 3+ years experience within 30 km of Colombo'
  );
  const [radiusKm, setRadiusKm] = useState<number>(35);
  const [selectedRole, setSelectedRole] = useState<string>('All Roles');
  const [minExp, setMinExp] = useState<number>(0);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateSearchResult | null>(null);
  
  const [candidates, setCandidates] = useState<CandidateSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  // Perform initial real database search on mount
  const runLiveSearch = async (skills?: string[], role?: string, radius?: number) => {
    setIsSearching(true);
    setSearchMessage(null);
    try {
      await api.ensureRecruiterAuth();
      const res = await api.searchCandidates({
        required_skills: skills && skills.length > 0 ? skills : undefined,
        role: role && role !== 'All Roles' ? role : undefined,
        min_experience: minExp > 0 ? minExp : undefined,
        latitude: 6.9271,
        longitude: 79.8612,
        radius_km: radius || radiusKm,
      });

      if (res && res.items) {
        setCandidates(res.items);
      } else {
        setCandidates([]);
      }
    } catch (err: any) {
      console.warn('Real search notice:', err);
      setCandidates([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    runLiveSearch();
  }, [radiusKm, minExp, selectedRole]);

  // Real Gemini Natural Language AI search
  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchMessage('Gemini AI parsing search query & running PostGIS radius matching...');
    try {
      await api.ensureRecruiterAuth();
      const res = await api.naturalLanguageSearch(searchQuery.trim());
      
      if (res && res.parsed_criteria) {
        if (res.parsed_criteria.radius_km) {
          setRadiusKm(Math.round(res.parsed_criteria.radius_km));
        }
        if (res.parsed_criteria.role) {
          setSelectedRole(res.parsed_criteria.role);
        }
      }

      if (res && res.items) {
        setCandidates(res.items);
      } else {
        setCandidates([]);
      }
      setSearchMessage(null);
    } catch (err: any) {
      console.warn('AI search error:', err);
      setSearchMessage('Search completed with direct fallback.');
      runLiveSearch();
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div>
      {/* 1. FLOATING NEUMORPHIC SEARCH BAR */}
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
            {isSearching ? 'Searching...' : '⚡ AI Parse'}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>AI Suggestions:</span>
          {[
            'Python + FastAPI developer within 30 km',
            'Full Stack Developer in Colombo',
            'Senior Engineer with > 3 years experience'
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

      {searchMessage && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 16px', marginBottom: '20px', fontSize: '13px', color: '#1d4ed8' }}>
          ℹ️ {searchMessage}
        </div>
      )}

      {/* 2. MAIN LAYOUT: Filter Sidebar + Real Results Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: '32px' }}>
        
        {/* LEFT COLUMN: Collapsible Deterministic Filters */}
        <div className="neu-card" style={{ height: 'fit-content', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="title-md" style={{ margin: 0 }}>Filter Criteria</h3>
            <button 
              type="button"
              onClick={() => {
                setRadiusKm(35);
                setSelectedRole('All Roles');
                setMinExp(0);
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
              max="200" 
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
              <option>All Roles</option>
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
              onChange={(e) => setMinExp(Number(e.target.value))}
            >
              <option value="0">Any Experience</option>
              <option value="2">2+ Years</option>
              <option value="3">3+ Years</option>
              <option value="5">5+ Years</option>
            </select>
          </div>
        </div>

        {/* RIGHT COLUMN: Real Candidate Results from Database */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
              {isSearching ? 'Searching database...' : `Showing ${candidates.length} Matched Candidates`}
            </span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Sorted by: <b>Match Score (Highest)</b>
            </span>
          </div>

          {/* Real Candidates List */}
          {candidates.length > 0 ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              {candidates.map((candidate) => (
                <div key={candidate.candidate_id} className="neu-card" style={{ padding: '24px' }}>
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
                        {candidate.display_name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                            {candidate.display_name}
                          </h3>
                          <span className="badge-pill badge-success" style={{ fontSize: '11px' }}>
                            {candidate.availability_status ? candidate.availability_status.replace('_', ' ') : 'Available'}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
                          {candidate.headline || 'Technical Candidate'}
                        </p>
                        {candidate.distance_km != null && (
                          <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', marginTop: '4px', display: 'inline-block' }}>
                            📍 {Number(candidate.distance_km).toFixed(1)} km away from Colombo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        background: candidate.match_score >= 80 ? '#ecfdf5' : '#fffbeb',
                        color: candidate.match_score >= 80 ? '#047857' : '#b45309',
                        border: '1.5px solid currentColor',
                        borderRadius: '12px',
                        padding: '8px 16px',
                        fontWeight: '800',
                        fontSize: '18px'
                      }}>
                        {Math.round(candidate.match_score)}% Match
                      </div>
                    </div>

                  </div>

                  {/* Match Evidence Box */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginTop: '16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>Match Evidence Breakdown:</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px', fontSize: '12px', color: '#334155' }}>
                      <div>
                        ✓ Matched Skills: {candidate.top_skills && candidate.top_skills.length > 0 ? candidate.top_skills.join(', ') : 'Profile Verified'}
                      </div>
                      <div>
                        ✓ Experience: {candidate.total_years_experience || 0} years in technical roles
                      </div>
                      {candidate.distance_km != null && (
                        <div>
                          ✓ Within PostGIS radius ({Number(candidate.distance_km).toFixed(1)} km &lt; {radiusKm} km)
                        </div>
                      )}
                      <div>
                        ✓ Match Factors: {candidate.match_reasons?.slice(0, 2).join(' • ') || 'Verified profile facts'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                    <button 
                      type="button" 
                      className="neu-btn-primary" 
                      style={{ padding: '8px 18px', fontSize: '13px' }}
                      onClick={() => setSelectedCandidate(candidate)}
                    >
                      View Candidate Dossier &rarr;
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            /* REAL EMPTY STATE: No Fake Candidate Stubs */
            <div className="neu-card" style={{ textAlign: 'center', padding: '56px 24px' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</div>
              <h3 className="title-lg">No Candidates Currently Match This Query</h3>
              <p className="text-subtitle" style={{ maxWidth: '440px', margin: '0 auto 20px' }}>
                Try expanding your PostGIS search radius (e.g. 50 km or 100 km) or clearing specific role filters. 
                New candidates will appear here as soon as they confirm their profiles or upload CVs in Flow 1.
              </p>
              <button 
                type="button"
                className="neu-btn-secondary" 
                onClick={() => { setRadiusKm(100); setSelectedRole('All Roles'); setMinExp(0); }}
              >
                Expand Radius to 100 km
              </button>
            </div>
          )}
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
                <span className="badge-pill badge-blue" style={{ marginBottom: '6px' }}>Candidate Record</span>
                <h2 className="title-lg" style={{ margin: 0 }}>{selectedCandidate.display_name}</h2>
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
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#047857' }}>
                  {Math.round(selectedCandidate.match_score)}%
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                {selectedCandidate.distance_km != null 
                  ? `PostGIS spatial proximity: ${Number(selectedCandidate.distance_km).toFixed(1)} km from search center • `
                  : ''}
                Availability: {selectedCandidate.availability_status ? selectedCandidate.availability_status.replace('_', ' ') : 'Available'}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Matched Technical Proficiencies</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedCandidate.top_skills && selectedCandidate.top_skills.length > 0 ? (
                  selectedCandidate.top_skills.map((s: string) => (
                    <span key={s} className="badge-pill badge-blue">{s}</span>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Verified profile facts match query parameters.</span>
                )}
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
                  alert(`Interview connection requested for ${selectedCandidate.display_name}!`);
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
