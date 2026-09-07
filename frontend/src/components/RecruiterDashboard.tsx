import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CandidateSearchResult, RecruiterCandidateDetail } from '../types';
import {
  Search,
  Sparkles,
  MapPin,
  Briefcase,
  Award,
  CheckCircle2,
  X,
  User,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

interface RecruiterDashboardProps {
  onOpenAuth: () => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ onOpenAuth }) => {
  // Search Filters
  const [role, setRole] = useState<string>('');
  const [skillsInput, setSkillsInput] = useState<string>('Python, FastAPI');
  const [minExp, setMinExp] = useState<number>(3);
  const [maxExp, setMaxExp] = useState<number | undefined>(undefined);
  const [degreeLevel, setDegreeLevel] = useState<string>('');
  const [city, setCity] = useState<string>('Colombo');
  const [latitude, setLatitude] = useState<number | undefined>(6.9271);
  const [longitude, setLongitude] = useState<number | undefined>(79.8612);
  const [radiusKm, setRadiusKm] = useState<number | undefined>(30);
  const [availability, setAvailability] = useState<string>('');

  // Natural Language Search State
  const [nlQuery, setNlQuery] = useState<string>('');
  const [isNlSearching, setIsNlSearching] = useState<boolean>(false);
  const [parsedNlCriteria, setParsedNlCriteria] = useState<any | null>(null);

  // Results State
  const [results, setResults] = useState<CandidateSearchResult[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Selected Candidate Drawer State
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [candidateDetail, setCandidateDetail] = useState<RecruiterCandidateDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const executeSearch = async (overrideCriteria?: any) => {
    setLoading(true);
    setError(null);
    try {
      const skillsArray = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const criteria = overrideCriteria || {
        required_skills: skillsArray,
        roles: role ? [role] : undefined,
        minimum_experience_years: minExp > 0 ? minExp : undefined,
        maximum_experience_years: maxExp ? maxExp : undefined,
        degree_level: degreeLevel || undefined,
        city: city || undefined,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        radius_km: radiusKm ? Number(radiusKm) : undefined,
        availability_status: availability || undefined,
        page: 1,
        page_size: 20,
      };

      const res = await api.searchCandidates(criteria);
      setResults(res.items);
      setTotal(res.total);
    } catch (err: any) {
      if (err.message && err.message.includes('401')) {
        setError('Please sign in with a recruiter or admin account to discover candidates.');
      } else {
        setError(err.message || 'Search failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNlSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    setIsNlSearching(true);
    setError(null);
    try {
      const res = await api.naturalLanguageSearch(nlQuery.trim());
      setResults(res.items);
      setTotal(res.total);
      setParsedNlCriteria(res.parsed_criteria);
    } catch (err: any) {
      setError(err.message || 'AI natural language search failed');
    } finally {
      setIsNlSearching(false);
    }
  };

  const handleSelectCandidate = async (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setLoadingDetail(true);
    try {
      const detail = await api.getCandidateDetail(candidateId);
      setCandidateDetail(detail);
    } catch (err: any) {
      alert(err.message || 'Failed to load candidate details');
      setSelectedCandidateId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Talent Discovery Engine
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Deterministic PostGIS spatial search + transparent multi-criteria ranking
          </p>
        </div>

        {/* Natural Language Query Bar */}
        <form onSubmit={handleNlSearch} className="w-full md:w-auto flex-1 max-w-xl flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              placeholder="e.g. Find Python backend developers with 3+ years experience in Colombo"
              className="neu-input pl-9 text-xs"
            />
            <Sparkles size={16} className="absolute left-3 top-2.5 text-blue-500" />
          </div>
          <button
            type="submit"
            disabled={isNlSearching}
            className="neu-btn neu-btn-primary !py-2 !px-4 text-xs font-semibold shrink-0"
          >
            {isNlSearching ? 'Parsing...' : 'AI Search'}
          </button>
        </form>
      </div>

      {/* Parsed NL Criteria Pill */}
      {parsedNlCriteria && (
        <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-blue-600 shrink-0" />
            <span className="font-semibold text-blue-900">AI Parsed Filter:</span>
            <span className="font-mono text-blue-700">{JSON.stringify(parsedNlCriteria)}</span>
          </div>
          <button
            onClick={() => setParsedNlCriteria(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Search Grid (Filters + Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar (1/4) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-5 space-y-4 sticky top-24">
            <div className="flex-between">
              <h3 className="text-sm font-bold text-slate-800 font-heading flex items-center gap-1.5">
                <Sliders size={16} className="text-blue-600" />
                <span>Deterministic Filters</span>
              </h3>
              <button
                onClick={() => {
                  setRole('');
                  setSkillsInput('');
                  setMinExp(0);
                  setMaxExp(undefined);
                  setCity('');
                  setLatitude(undefined);
                  setLongitude(undefined);
                  setRadiusKm(undefined);
                  setAvailability('');
                  executeSearch({});
                }}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                Reset
              </button>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Target Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Backend Engineer"
                className="neu-input text-xs"
              />
            </div>

            {/* Skills Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Required Skills (Comma separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Python, FastAPI, Docker"
                className="neu-input text-xs"
              />
            </div>

            {/* Experience Slider / Input */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Min Exp (Yrs)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={minExp}
                  onChange={(e) => setMinExp(Number(e.target.value))}
                  className="neu-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Max Exp (Yrs)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={maxExp ?? ''}
                  onChange={(e) => setMaxExp(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Any"
                  className="neu-input text-xs"
                />
              </div>
            </div>

            {/* Education Degree Level */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Degree Level
              </label>
              <select
                value={degreeLevel}
                onChange={(e) => setDegreeLevel(e.target.value)}
                className="neu-input text-xs"
              >
                <option value="">Any Level</option>
                <option value="bachelor">Bachelor's Degree</option>
                <option value="master">Master's Degree</option>
                <option value="doctorate">Doctorate (PhD)</option>
              </select>
            </div>

            {/* Geographic Filter */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="block text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1">
                <MapPin size={12} className="text-red-500" />
                <span>Geographic Proximity (PostGIS)</span>
              </label>

              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">Reference City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Colombo"
                  className="neu-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Lat</label>
                  <input
                    type="number"
                    step="any"
                    value={latitude ?? ''}
                    onChange={(e) => setLatitude(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="6.9271"
                    className="neu-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Lon</label>
                  <input
                    type="number"
                    step="any"
                    value={longitude ?? ''}
                    onChange={(e) => setLongitude(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="79.8612"
                    className="neu-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">
                  Radius: <strong className="text-slate-800">{radiusKm || 'Off'} km</strong>
                </label>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={radiusKm || 30}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            <button
              onClick={() => executeSearch()}
              disabled={loading}
              className="w-full neu-btn neu-btn-primary !py-2.5 text-xs font-bold"
            >
              <Search size={14} />
              <span>{loading ? 'Filtering...' : 'Apply Filters'}</span>
            </button>
          </div>
        </div>

        {/* Right Candidate Results Area (3/4) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex-between text-xs text-slate-500 px-1">
            <span>
              Found <strong className="text-slate-900 font-bold">{total}</strong> candidate(s) matching requirements
            </span>
            <span className="text-[11px]">Ranked transparently (0–100 match score)</span>
          </div>

          {error ? (
            <div className="glass-card p-8 text-center">
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <button onClick={onOpenAuth} className="neu-btn neu-btn-primary mx-auto text-xs">
                Sign In As Recruiter
              </button>
            </div>
          ) : loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-6 animate-pulse space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-8 bg-slate-100 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <User size={36} className="text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">No Candidates Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No candidates satisfied all hard criteria. Try broadening your skill requirements, adjusting minimum experience, or expanding the radius.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((c) => {
                const isTopScore = c.match_score >= 80;
                return (
                  <div
                    key={c.candidate_id}
                    onClick={() => handleSelectCandidate(c.candidate_id)}
                    className="glass-card p-5 cursor-pointer hover:border-blue-300 transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-sm">
                          {c.display_name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {c.display_name}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {c.availability_status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{c.headline || 'Professional Profile'}</p>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <div
                          className={`px-3 py-1.5 rounded-full text-xs font-extrabold text-white flex items-center gap-1 shadow-sm ${
                            isTopScore ? 'bg-emerald-600' : 'bg-amber-500'
                          }`}
                        >
                          <Award size={14} />
                          <span>{c.match_score}% Match</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Briefcase size={13} className="text-slate-400" />
                        <span>{c.total_years_experience} Years Exp</span>
                      </div>

                      {c.city && (
                        <div className="flex items-center gap-1">
                          <MapPin size={13} className="text-slate-400" />
                          <span>{c.city}, {c.country}</span>
                        </div>
                      )}

                      {c.distance_km !== undefined && (
                        <div className="flex items-center gap-1 font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          <span>{c.distance_km.toFixed(1)} km away</span>
                        </div>
                      )}
                    </div>

                    {/* Top Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {c.top_skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag text-[11px]">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Transparent Match Reasons */}
                    {c.match_reasons && c.match_reasons.length > 0 && (
                      <div className="pt-2.5 border-t border-slate-100/80 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                        <span className="font-bold text-slate-700">Match Evidence:</span>
                        {c.match_reasons.map((reason, idx) => (
                          <span key={idx} className="flex items-center gap-1 text-emerald-700 font-medium">
                            <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recruiter Candidate Detail Modal / Drawer */}
      {selectedCandidateId && (
        <div className="modal-overlay" onClick={() => setSelectedCandidateId(null)}>
          <div
            className="modal-content max-w-2xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {loadingDetail ? (
              <div className="text-center py-12">
                <p className="text-xs text-slate-500">Loading candidate dossier...</p>
              </div>
            ) : candidateDetail ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Recruiter-Safe Dossier
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 font-heading mt-1">
                      {candidateDetail.display_name}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">{candidateDetail.headline}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCandidateId(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Privacy Badge */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>
                    Direct contact credentials (phone/email) are protected by candidate privacy settings until mutual interview unlock.
                  </span>
                </div>

                {/* Persona Summary if available */}
                {candidateDetail.persona && (
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/60">
                    <h4 className="text-xs font-bold text-blue-900 font-heading mb-1 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-blue-600" />
                      Candidate Persona Overview
                    </h4>
                    <p className="text-xs text-slate-700 italic leading-relaxed">
                      "{candidateDetail.persona.summary}"
                    </p>
                  </div>
                )}

                {/* Skills */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Verified Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {candidateDetail.skills.map((sk, idx) => (
                      <span key={idx} className="skill-tag text-xs font-medium">
                        {sk.name} {sk.years ? `(${sk.years}y)` : ''}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Career Experience
                  </h4>
                  <div className="space-y-3">
                    {candidateDetail.experiences.map((exp, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex-between font-bold text-slate-800">
                          <span>{exp.title}</span>
                          <span className="text-[10px] text-blue-600">{exp.role}</span>
                        </div>
                        <p className="text-slate-600 font-medium mt-0.5">{exp.company}</p>
                        {exp.description && (
                          <p className="text-slate-500 mt-2 text-[11px] leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Education & Degrees
                  </h4>
                  <div className="space-y-2">
                    {candidateDetail.education.map((edu, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-bold text-slate-800">{edu.degree}</span>
                        <p className="text-slate-600">{edu.institution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
