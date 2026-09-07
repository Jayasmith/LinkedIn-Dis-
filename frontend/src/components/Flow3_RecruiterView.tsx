import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import type { CandidateSearchResult } from '../types';
import {
  Search, Bookmark, Briefcase, DollarSign, Calendar, MessageSquare,
  Users, MapPin, ShieldCheck, ChevronDown, ChevronUp, MoreHorizontal,
  Plus, EyeOff, FileText, Sparkles, X, CheckCircle2
} from 'lucide-react';

const FILTER_CATEGORIES = [
  { id: 'lists', label: "Candidate Lists", icon: Bookmark },
  { id: 'topics', label: 'Skills & Roles', icon: Briefcase },
  { id: 'budget', label: 'Salary Range', icon: DollarSign },
  { id: 'date', label: 'Availability Date', icon: Calendar },
  { id: 'comments', label: 'Notes', icon: MessageSquare },
  { id: 'audience', label: 'Team Size Fit', icon: Users },
  { id: 'location', label: 'Traveling From', icon: MapPin },
  { id: 'exclusive', label: 'Dullnit Verified', icon: ShieldCheck },
];

const SAVED_LISTS = [
  { title: 'All saved candidates', count: 14 },
  { title: 'Colombo AI Engineers Q3', count: 3 },
  { title: 'Executive Candidates (Confidential)', count: '-', isPrivate: true },
  { title: 'Global Remote Prospects', count: 15 },
  { title: 'Python Specialists', count: 8 },
];

export const Flow3_RecruiterView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('Find Python backend developers with 3+ years experience within 30 km of Colombo');
  const [radiusKm, setRadiusKm] = useState(35);
  const [selectedRole] = useState('All Roles');
  const [minExp, setMinExp] = useState(0);
  const [candidates, setCandidates] = useState<CandidateSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateSearchResult | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({ topics: true, location: true });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleFilter = (key: string) => setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }));

  const runLiveSearch = async () => {
    setIsSearching(true);
    setSearchMessage(null);
    try {
      const result = await api.searchCandidates({
        natural_language_query: searchQuery,
        radius_km: radiusKm,
        role: selectedRole !== 'All Roles' ? selectedRole : undefined,
        min_experience: minExp > 0 ? minExp : undefined,
      });
      const items: CandidateSearchResult[] = result?.items || result || [];
      setCandidates(items);
      if (!items || items.length === 0) {
        setSearchMessage('No candidates found matching these criteria. Try broadening the search radius or removing filters.');
      }
    } catch (err: any) {
      setSearchMessage(err?.message || 'Search failed. Please check that the backend is running on port 8000.');
      setCandidates([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => { runLiveSearch(); }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 font-sans antialiased">

      {/* ── TOP SEARCH HEADER ── */}
      <div className="w-full bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1380px] mx-auto pl-64">
          <div className="flex items-center gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runLiveSearch()}
                placeholder="e.g. Find Python developers near Colombo with 3 years experience"
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#7f56d9] focus:ring-1 focus:ring-[#7f56d9]/30 transition shadow-sm"
              />
            </div>
            <button
              type="button"
              onClick={runLiveSearch}
              disabled={isSearching}
              className="flex items-center gap-2 bg-[#2d0e44] hover:bg-[#1e0a2f] disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSearching ? 'Searching…' : 'AI Search'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN VIEW ── */}
      <div className="max-w-[1380px] mx-auto flex items-start">

        {/* ── LEFT FILTER SIDEBAR ── */}
        <aside className="w-64 flex-shrink-0 bg-white min-h-screen border-r border-gray-200 p-5">
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-900 tracking-tight">Filters</h2>
            <span className="text-[11px] text-gray-400 font-medium">0 selected</span>
          </div>

          {/* Radius Slider */}
          <div className="py-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                <MapPin className="w-4 h-4 text-[#4338ca]" />
                <span>Search Radius</span>
              </div>
              <span className="text-xs font-semibold text-[#2d0e44]">{radiusKm} km</span>
            </div>
            <input
              type="range" min="5" max="150" step="5"
              value={radiusKm} onChange={e => setRadiusKm(parseInt(e.target.value))}
              className="w-full accent-[#7f56d9]"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>5 km</span><span>150 km</span>
            </div>
          </div>

          {/* Min Experience */}
          <div className="py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-700 font-medium mb-2">
              <Briefcase className="w-4 h-4 text-[#4338ca]" />
              <span>Min. Experience</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[{ label: 'Any', val: 0 }, { label: '1+ yr', val: 1 }, { label: '3+ yrs', val: 3 }, { label: '5+ yrs', val: 5 }].map(({ label, val }) => (
                <button key={val} type="button" onClick={() => setMinExp(val)}
                  className={`text-xs rounded-md px-2 py-1.5 border transition font-medium ${
                    minExp === val ? 'bg-[#f4ecfb] border-[#d8bbf3] text-[#5c248b]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion Filter List */}
          <div className="divide-y divide-gray-100 mt-1">
            {FILTER_CATEGORIES.map(({ id, label, icon: Icon }) => {
              const isOpen = openFilters[id];
              return (
                <div key={id} className="py-3">
                  <button type="button" onClick={() => toggleFilter(id)}
                    className="w-full flex items-center justify-between text-left group">
                    <div className="flex items-center gap-2.5 text-xs text-gray-700 group-hover:text-[#5c248b] font-medium transition">
                      <Icon className="w-4 h-4 text-[#4338ca] flex-shrink-0" />
                      <span>{label}</span>
                    </div>
                    {isOpen
                      ? <ChevronUp className="w-3.5 h-3.5 text-[#4338ca]" />
                      : <ChevronDown className="w-3.5 h-3.5 text-[#4338ca]" />
                    }
                  </button>
                  {isOpen && (
                    <div className="mt-2.5 pl-6 space-y-1.5 text-xs text-gray-500">
                      <label className="flex items-center gap-2 cursor-pointer hover:text-gray-800">
                        <input type="checkbox" className="rounded border-gray-300 accent-[#7f56d9]" />
                        <span>Option A</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:text-gray-800">
                        <input type="checkbox" className="rounded border-gray-300 accent-[#7f56d9]" />
                        <span>Option B</span>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── RIGHT RESULTS AREA ── */}
        <main className="flex-1 p-6 lg:p-8">

          {/* Counter Row */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              All candidates ({candidates.length > 0 ? candidates.length : '—'})
            </h3>
            {isSearching && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />
                <span>Querying PostGIS database…</span>
              </div>
            )}
          </div>

          {/* Search Message / Empty State */}
          {searchMessage && candidates.length === 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">No results found</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">{searchMessage}</p>
            </div>
          )}

          {/* Candidate Card List */}
          <div ref={dropdownRef} className="space-y-4">
            {candidates.map((candidate) => {
              const tags: string[] = candidate.top_skills?.slice(0, 4) || [];
              const fee = candidate.distance_km ? `${candidate.distance_km.toFixed(1)} km away` : null;
              const matchPct = candidate.match_score ? `${Math.round(candidate.match_score * 100)}% match` : null;
              const isOpen = activeDropdownId === candidate.candidate_id;

              return (
                <div key={candidate.candidate_id}
                  className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 transition hover:shadow-md hover:border-purple-100/60 cursor-pointer"
                  onClick={() => setSelectedCandidate(candidate)}>
                  <div className="flex items-start gap-4">

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#f4ecfb] flex-shrink-0 flex items-center justify-center shadow-sm border border-purple-100">
                      <span className="text-lg font-bold text-[#5c248b]">
                        {(candidate.display_name || '?')[0].toUpperCase()}
                      </span>
                    </div>

                    {/* Middle Info */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-sm font-bold text-gray-900">{candidate.display_name || 'Anonymous Candidate'}</h4>
                        {candidate.match_score && candidate.match_score >= 0.8 && (
                          <span className="bg-[#fef3c7] text-[#92400e] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            Dullnit Verified Talent
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-600 leading-relaxed max-w-2xl">
                        {candidate.headline || `${candidate.total_years_experience || 0}+ years of professional experience`}
                      </p>
                      {/* Blue Tag Links */}
                      {tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#2563eb]">
                          {tags.map((tag: string, idx: number) => (
                            <span key={idx} className="hover:underline cursor-pointer">
                              {tag}{idx < tags.length - 1 ? ',' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Actions */}
                    <div className="flex flex-col items-end gap-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        {/* Distance / Match */}
                        {(fee || matchPct) && (
                          <div className="text-xs text-right">
                            {matchPct && <p className="font-semibold text-[#5c248b]">{matchPct}</p>}
                            {fee && <p className="text-gray-500 text-[11px]">{fee}</p>}
                          </div>
                        )}

                        {/* Save Dropdown */}
                        <div className="relative">
                          <button type="button"
                            onClick={() => setActiveDropdownId(isOpen ? null : candidate.candidate_id)}
                            className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm transition">
                            <span>Save</span>
                            <ChevronDown className="w-3 h-3 text-gray-500" />
                          </button>

                          {isOpen && (
                            <div className="absolute right-0 top-9 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-2.5 text-xs text-gray-700">
                              <button type="button"
                                className="w-full px-4 py-2 flex items-center gap-2 text-left hover:bg-gray-50 text-[#1e1b4b] font-medium">
                                <Plus className="w-3.5 h-3.5 text-[#4338ca]" />
                                <span>Create candidate list</span>
                              </button>
                              <div className="h-[1px] bg-gray-100 my-1.5" />
                              <div className="space-y-0.5">
                                {SAVED_LISTS.map((list, idx) => (
                                  <button key={idx} type="button"
                                    className="w-full px-4 py-1.5 flex items-center justify-between text-left hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-1.5 truncate pr-2">
                                      <span className="truncate">{list.title}</span>
                                      {list.isPrivate && <EyeOff className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                                    </div>
                                    <span className="text-gray-400 text-[11px] font-normal">{list.count}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* More Options */}
                        <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Meta badges */}
                      <div className="flex items-center gap-3 text-[11px] text-gray-400">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{candidate.total_years_experience || 0} yrs exp</span>
                        </div>
                        {candidate.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{candidate.city}</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </main>
      </div>

      {/* ── CANDIDATE DETAIL MODAL ── */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedCandidate(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setSelectedCandidate(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-[#f4ecfb] flex items-center justify-center flex-shrink-0 border border-purple-100 shadow-sm">
                <span className="text-2xl font-bold text-[#5c248b]">
                  {(selectedCandidate.display_name || '?')[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedCandidate.display_name || 'Anonymous Candidate'}</h2>
                <p className="text-sm text-gray-500">{selectedCandidate.headline || 'Professional Candidate'}</p>
                {selectedCandidate.city && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{selectedCandidate.city}{selectedCandidate.distance_km ? `, ${selectedCandidate.distance_km.toFixed(1)} km away` : ''}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Match Score */}
              {selectedCandidate.match_score && (
                <div className="rounded-xl bg-[#f4ecfb] border border-[#d8bbf3] p-4">
                  <p className="text-xs font-semibold text-[#5c248b] uppercase tracking-wide mb-1">Match Score</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-purple-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-[#7f56d9] rounded-full" style={{ width: `${Math.round(selectedCandidate.match_score * 100)}%` }} />
                    </div>
                    <span className="text-sm font-bold text-[#5c248b]">{Math.round(selectedCandidate.match_score * 100)}%</span>
                  </div>
                </div>
              )}

              {/* Skills */}
              {selectedCandidate.top_skills && selectedCandidate.top_skills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Matched Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.top_skills.map((s: string, i: number) => (
                      <span key={i} className="rounded-full bg-[#f4ecfb] border border-[#d8bbf3] text-[#5c248b] px-3 py-1 text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Match Reasons */}
              {selectedCandidate.match_reasons && selectedCandidate.match_reasons.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Why they match</p>
                  <ul className="space-y-1">
                    {selectedCandidate.match_reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button type="button"
                className="flex-1 bg-[#2d0e44] hover:bg-[#1e0a2f] text-white text-sm font-semibold py-3 rounded-xl transition shadow-md">
                Request Intro
              </button>
              <button type="button" onClick={() => setSelectedCandidate(null)}
                className="flex-1 bg-white border border-gray-200 text-gray-700 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
