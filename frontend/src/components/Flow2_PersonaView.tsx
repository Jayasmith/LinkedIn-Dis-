import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CandidateProfile, CandidatePersona } from '../types';
import { Share2, FileText, ArrowRight, RefreshCw } from 'lucide-react';

interface Flow2Props {
  onGoToUpload?: () => void;
  onRegenerate?: () => void;
}

export const Flow2_PersonaView: React.FC<Flow2Props> = ({ onGoToUpload, onRegenerate }) => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [persona, setPersona] = useState<CandidatePersona | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      await api.ensureCandidateAuth();
      const p = await api.getMyProfile();
      setProfile(p);
      try { setPersona(await api.getPersona()); } catch { setPersona(null); }
    } catch { setProfile(null); setPersona(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await api.ensureCandidateAuth();
      const np = await api.regeneratePersona();
      setPersona(np);
      if (onRegenerate) onRegenerate();
    } catch (e: any) {
      alert(e.message || 'Failed to regenerate. Please upload a CV first.');
    } finally { setIsRegenerating(false); }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#ececf0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600 font-medium">Loading profile from PostgreSQL…</p>
        </div>
      </div>
    );
  }

  const hasValidProfile = profile && profile.full_name && (profile.skills?.length > 0 || persona?.headline);

  // ── Empty State ──
  if (!hasValidProfile) {
    return (
      <div className="min-h-screen bg-[#ececf0] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <img
            src="/no_person_avatar.jpg"
            alt="No Candidate Profile Found"
            className="w-40 h-40 rounded-2xl object-cover mx-auto mb-6 border-2 border-slate-300 shadow-md"
          />
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">No Candidate Persona Found</h2>
          <p className="text-sm text-gray-600 mt-2 mb-8 leading-relaxed">
            No CV or profile records have been committed to the database yet.
            Upload your CV (Word or PDF) in Step 1 to trigger Google Gemini AI and generate your executive persona dossier here.
          </p>
          <button type="button" onClick={onGoToUpload}
            className="inline-flex items-center gap-2 bg-[#2d0e44] hover:bg-[#1e0a2f] text-white px-7 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer">
            <FileText className="w-4 h-4" />
            <span>Go to Step 1: Upload Your CV Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Map real data ──
  const candidateName = profile!.full_name || 'Anonymous Candidate';
  const roleTagline = persona?.headline || profile!.headline || 'Professional candidate profile';
  const occupation = persona?.primary_profession || profile!.headline || 'Professional';
  const locationStr = profile!.location ? `${profile!.location.city}, ${profile!.location.country}` : 'Colombo, Sri Lanka';
  const income = 'Negotiable';
  const bioText = persona?.summary || profile!.bio || '';
  const skills = profile!.skills?.map((s: any) => s.normalized_name || s.original_name) || [];

  // Bio highlight — first 3–4 words of the bio (simulating the mark highlight style)
  const bioWords = bioText.split(' ');
  const bioHighlight = bioWords.slice(0, 4).join(' ');
  const bioRest = bioWords.slice(4).join(' ');

  // Bubble chart — top 3 skills mapped to percentages
  const skill1 = skills[0] || 'Core Skills';
  const skill2 = skills[1] || 'Backend';
  const skill3 = skills[2] || 'Systems';

  // Needs — from persona or from skills
  const needs: string[] = [
    `To leverage ${skill1} expertise in a high-impact role.`,
    `To find opportunities matching ${skill2} and ${skill3} experience.`
  ];

  // Pain Points — from persona or generic based on seniority
  const painPoints: string[] = [
    `Ensuring skills like ${skill1} are validated and visible to recruiters.`,
    `Standing out among candidates with similar experience levels.`,
    `Finding roles that match both technical depth and seniority level.`
  ];

  // Ideal Experience
  const idealExp: string[] = [
    `Work in a team environment focused on ${skill1} and ${skill2}.`,
    `Opportunities for career growth and skill development.`,
    `A role that values expertise and offers competitive compensation.`
  ];

  // Quotes — derived from bio
  const quotes = [
    { text: `"${bioText.substring(0, 80)}${bioText.length > 80 ? '…' : ''}"`, highlight: skill1 },
    { text: `"Looking to contribute ${skill1} and ${skill2} expertise to a forward-thinking organisation."` },
    { text: `"The ideal role combines technical depth with real-world impact."`, hasPointer: true },
  ];

  return (
    <div className="min-h-screen bg-[#ececf0] text-slate-800 font-sans pb-16 antialiased">

      {/* ── TOP NAVIGATION BAR ── */}
      <header className="w-full bg-transparent px-8 py-5 flex items-center justify-between border-b border-gray-200/60">
        <div className="w-24" />

        <h1 className="font-serif text-2xl font-bold text-gray-900 tracking-tight">Persona</h1>

        <div className="flex items-center gap-3">
          {/* Overlapping team avatar chips */}
          <div className="flex -space-x-2 mr-2">
            {[
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
              'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&q=80',
            ].map((src, i) => (
              <img key={i} src={src} alt="Reviewer" className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-sm" />
            ))}
          </div>

          <button type="button" onClick={handleRegenerate} disabled={isRegenerating}
            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-medium px-3 py-1.5 rounded-md transition shadow-sm disabled:opacity-60">
            <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Regenerating…' : 'Regenerate'}</span>
          </button>

          <button type="button"
            className="flex items-center gap-1.5 bg-[#2d2838] hover:bg-[#1f1b27] text-white text-xs font-medium px-3 py-1.5 rounded-md transition shadow-sm">
            <Share2 className="w-3 h-3" /><span>Share</span>
          </button>

          <button type="button"
            className="text-xs text-gray-500 hover:text-gray-800 font-medium px-2 py-1.5 transition">
            Export
          </button>
        </div>
      </header>

      {/* ── BENTO GRID CONTAINER ── */}
      <main className="max-w-[1360px] mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">

          {/* ══ COLUMN 1: PROFILE CARD (Span 3) ══ */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70 overflow-hidden">
            {/* Photo */}
            <div className="w-full aspect-[4/4.5] overflow-hidden bg-gray-100">
              <img
                src="/no_person_avatar.jpg"
                alt={candidateName}
                className="w-full h-full object-cover object-center"
              />
            </div>
            {/* Info */}
            <div className="p-6">
              <h2 className="font-serif text-xl font-bold text-gray-900 tracking-tight">{candidateName}</h2>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed font-normal">{roleTagline}</p>
              <div className="mt-6 pt-5 border-t border-gray-100 space-y-2 text-xs text-gray-700">
                <p><strong className="font-semibold text-gray-900">Experience:</strong> {profile!.total_years_experience || 0}+ years</p>
                <p><strong className="font-semibold text-gray-900">Occupation:</strong> {occupation}</p>
                <p><strong className="font-semibold text-gray-900">Location:</strong> {locationStr}</p>
                <p><strong className="font-semibold text-gray-900">Availability:</strong> {profile!.availability_status || 'Open to Offers'}</p>
                <p><strong className="font-semibold text-gray-900">Income:</strong> {income}</p>
              </div>
            </div>
          </div>

          {/* ══ COLUMN 2: BIO, NEEDS & BRAND BADGES (Span 3) ══ */}
          <div className="lg:col-span-3 space-y-6">
            {/* Bio Card */}
            <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70">
              <h3 className="font-serif text-base font-bold text-gray-900 mb-3">Bio</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                <mark className="bg-[#ff4081]/25 text-gray-900 px-1 py-0.5 rounded font-medium">{bioHighlight}</mark>
                {bioRest ? ` ${bioRest}` : ''}
              </p>
            </div>

            {/* Needs Card */}
            <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70">
              <h3 className="font-serif text-base font-bold text-gray-900 mb-3">Career Needs</h3>
              <ul className="list-disc list-outside pl-4 space-y-2 text-xs text-gray-600 leading-relaxed">
                {needs.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>

            {/* Top Skill Brand Cards */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-14 bg-[#2d0e44] rounded-lg flex items-center justify-center text-white shadow-sm px-3">
                <span className="text-xs font-bold tracking-widest uppercase truncate">{skill1}</span>
              </div>
              <div className="flex-1 h-14 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-white shadow-sm px-3">
                <span className="text-xs font-bold tracking-widest uppercase truncate">{skill2}</span>
              </div>
            </div>
          </div>

          {/* ══ COLUMN 3: BUBBLE CHART, PAIN POINTS, IDEAL EXP (Span 3) ══ */}
          <div className="lg:col-span-3 space-y-6">
            {/* Bubble Chart */}
            <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70 text-center">
              <div className="relative w-48 h-40 mx-auto">
                {/* 65% Primary Purple Bubble */}
                <div className="absolute right-1 top-2 w-28 h-28 rounded-full bg-[#7568be] text-white flex flex-col items-center justify-center shadow-md z-20">
                  <span className="text-xl font-bold leading-tight">65%</span>
                  <span className="text-[10px] font-normal px-1 text-center">{skill1}</span>
                </div>
                {/* 22% Secondary Blue Bubble */}
                <div className="absolute left-3 bottom-0 w-20 h-20 rounded-full bg-[#38bdf8] text-white flex flex-col items-center justify-center shadow-sm z-10">
                  <span className="text-sm font-bold leading-tight">22%</span>
                  <span className="text-[9px] font-normal px-1 text-center">{skill2}</span>
                </div>
                {/* 13% Tertiary Coral Bubble */}
                <div className="absolute left-6 top-0 w-14 h-14 rounded-full bg-[#fb7185] text-white flex flex-col items-center justify-center shadow-sm z-0">
                  <span className="text-xs font-bold leading-tight">13%</span>
                  <span className="text-[8px] font-normal leading-tight px-1 text-center">{skill3}</span>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-gray-500 font-normal">Top 3 skill focus areas</p>
            </div>

            {/* Pain Points Card */}
            <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70">
              <h3 className="font-serif text-base font-bold text-gray-900 mb-3">Pain points</h3>
              <ul className="list-disc list-outside pl-4 space-y-2.5 text-xs text-gray-600 leading-relaxed">
                {painPoints.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>

            {/* Ideal Experience Card */}
            <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70">
              <h3 className="font-serif text-base font-bold text-gray-900 mb-3">Ideal experience</h3>
              <ul className="list-disc list-outside pl-4 space-y-2.5 text-xs text-gray-600 leading-relaxed">
                {idealExp.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>

          {/* ══ COLUMN 4: RESEARCH, QUOTES & CHART (Span 3) ══ */}
          <div className="lg:col-span-3 space-y-6">
            {/* Research Title */}
            <div className="text-center pt-1 pb-1">
              <h3 className="font-serif text-base font-bold text-gray-900">Research</h3>
              <p className="text-[11px] text-gray-400">{skills.length} skills, {profile!.experiences?.length || 0} roles</p>
            </div>

            {/* Quotes Card */}
            <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70 relative">
              <h4 className="font-serif text-sm font-bold text-gray-900 mb-4">Profile Insights</h4>
              <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
                {/* Quote 1 with cyan highlight */}
                <p>
                  {'"It\'s important that I can '}
                  <mark className="bg-[#38bdf8]/35 text-gray-900 px-1 py-0.5 rounded font-medium">{skill1}</mark>
                  {' expertise at the highest level."'}
                </p>
                <p>
                  {`"I really just need a role that values both ${skill2} and ${skill3} skills in a collaborative team."`}
                </p>
                <div className="relative">
                  <p className="text-gray-700 font-medium">
                    {quotes[2]?.text || '"The ideal opportunity combines technical challenge with real-world impact."'}
                  </p>
                  <div className="hidden xl:flex items-center gap-1 text-[#64b5a0] absolute -right-6 top-1/2 -translate-y-1/2">
                    <span className="w-5 h-[1px] bg-[#64b5a0]" />
                    <span className="text-[10px]">◀</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Survey Document Row Card */}
            <div className="bg-white rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70 flex items-center gap-3">
              <div className="w-10 h-11 rounded bg-[#ff8a80]/20 border border-[#ff8a80]/30 flex flex-col items-center justify-center text-[#d32f2f]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-semibold text-gray-900">Extracted CV Data</h5>
                <p className="text-[10px] text-gray-400">{skills.length} skills extracted</p>
              </div>
            </div>

            {/* Skills Growth Line Chart */}
            <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70">
              <h5 className="text-[11px] font-semibold text-gray-700 mb-3">Experience Trajectory</h5>
              <div className="w-full">
                <svg viewBox="0 0 240 140" className="w-full h-auto text-gray-400 text-[8px]">
                  <line x1="30" y1="15" x2="230" y2="15" stroke="#f1f1f4" strokeWidth="1" />
                  <text x="5" y="18" fill="#9ca3af">Senior</text>
                  <line x1="30" y1="55" x2="230" y2="55" stroke="#f1f1f4" strokeWidth="1" />
                  <text x="5" y="58" fill="#9ca3af">Mid</text>
                  <line x1="30" y1="95" x2="230" y2="95" stroke="#f1f1f4" strokeWidth="1" />
                  <text x="5" y="98" fill="#9ca3af">Junior</text>
                  <line x1="30" y1="120" x2="230" y2="120" stroke="#d1d5db" strokeWidth="1" />
                  <path
                    d="M 32,110 C 55,108 80,105 105,98 C 115,95 125,100 135,92 C 150,80 170,68 190,50 C 205,35 220,25 230,18"
                    fill="none" stroke="#7568be" strokeWidth="2.5" strokeLinecap="round"
                  />
                  <g fill="#9ca3af" fontSize="6.5">
                    {['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8', 'Y9', 'Y10'].map((y, i) => (
                      <text key={y} x={32 + i * 20} y="130" transform={`rotate(-90 ${32 + i * 20},130)`}>{y}</text>
                    ))}
                  </g>
                </svg>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
