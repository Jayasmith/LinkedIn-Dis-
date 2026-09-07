import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ResumeExtractionResult } from '../types';
import {
  FileText, Edit3, UploadCloud, CheckCircle2, ArrowRight, ChevronDown,
  Zap, Code, Database, Cpu, Briefcase, Globe, Sliders, Sparkles,
  Server, MapPin, Plus, X, Trash2, AlertTriangle, CheckCheck
} from 'lucide-react';

interface Flow1Props {
  onConfirmProfile: () => void;
}

interface WorkExperienceItem {
  company: string;
  job_title: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  role_category: string;
  description: string;
}

interface EducationItem {
  degree_title: string;
  institution: string;
  field_of_study: string;
  degree_level: 'Bachelor' | 'Master' | 'Doctorate' | 'Diploma' | 'Other';
}

const STEPS = [
  { id: 1, title: 'Upload Document' },
  { id: 2, title: 'Pipeline Processing' },
  { id: 3, title: 'Candidate Persona' },
  { id: 4, title: 'Review & Persist' },
];

const FUNCTIONAL_AREAS = [
  { id: 'software', label: 'Software & AI Engineering', icon: Code },
  { id: 'data', label: 'Data Science & Analytics', icon: Database },
  { id: 'cloud', label: 'Cloud & DevOps', icon: Cpu },
  { id: 'product', label: 'Product & Project Mgmt', icon: Briefcase },
  { id: 'web', label: 'Web & Mobile Systems', icon: Globe },
  { id: 'hr', label: 'HR & Talent Operations', icon: Sliders },
];

const PIPELINE_STAGES = [
  'Uploading file & computing SHA-256 deduplication hash',
  'Extracting text streams via PyMuPDF / python-docx',
  'Running deterministic regex parser (Emails, Phones, URLs)',
  'Google Gemini AI analyzing structured experience & skill taxonomies',
  'Fact reconciliation & provenance tagging',
];

const ROLE_CATEGORIES = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Operations', 'Finance', 'Other'];
const DEGREE_LEVELS: EducationItem['degree_level'][] = ['Bachelor', 'Master', 'Doctorate', 'Diploma', 'Other'];

// ───────── Section Card wrapper (matches INSPIRE.TXT SectionCard.jsx) ─────────
function SectionCard({ title, description, children, action }: {
  title: string; description?: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-black/10 bg-white p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-1 text-sm text-black/50">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export const Flow1_ProfileForm: React.FC<Flow1Props> = ({ onConfirmProfile }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [ingestionMethod, setIngestionMethod] = useState<'upload' | 'manual'>('upload');

  // Upload-mode state
  const [domain, setDomain] = useState('Software Engineering & AI');
  const [experienceLevel, setExperienceLevel] = useState('Mid-level (3 - 5 Years)');
  const [locationHub, setLocationHub] = useState('Colombo (6.9271° N, 79.8612° E)');
  const [currency, setCurrency] = useState('USD');
  const [functionalArea, setFunctionalArea] = useState('software');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Pipeline state
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStepIndex, setPipelineStepIndex] = useState(0);
  const [pipelineMessage, setPipelineMessage] = useState<string | null>(null);
  const [extractionData, setExtractionData] = useState<ResumeExtractionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ocrRequired, setOcrRequired] = useState(false);
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);

  // Manual-mode state
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('Colombo');
  const [country, setCountry] = useState('Sri Lanka');
  const [latitude, setLatitude] = useState(6.9271);
  const [longitude, setLongitude] = useState(79.8612);
  const [totalYears, setTotalYears] = useState(0);
  const [availability, setAvailability] = useState<'Available Now' | 'Open to Offers' | 'Unavailable'>('Available Now');
  const [visibility, setVisibility] = useState<'Public' | 'Anonymous' | 'Private'>('Public');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillDraft, setNewSkillDraft] = useState('');
  const [workHistory, setWorkHistory] = useState<WorkExperienceItem[]>([]);
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await api.ensureCandidateAuth();
        const existing = await api.getMyProfile();
        if (existing) {
          if (existing.full_name) setFullName(existing.full_name);
          if (existing.headline) setHeadline(existing.headline);
          if (existing.bio) setBio(existing.bio);
          if (existing.total_years_experience) setTotalYears(existing.total_years_experience);
          if (existing.location) {
            if (existing.location.city) setCity(existing.location.city);
            if (existing.location.country) setCountry(existing.location.country);
            if (existing.location.latitude) setLatitude(existing.location.latitude);
            if (existing.location.longitude) setLongitude(existing.location.longitude);
          }
          if (existing.skills?.length) {
            setSkills(existing.skills.map((s: any) => s.normalized_name || s.original_name));
          }
        }
      } catch { /* guest */ }
    })();
  }, []);

  // ── Drag & Drop ──
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  // ── Skills ──
  const addSkill = () => {
    const t = newSkillDraft.trim();
    if (t && !skills.includes(t)) { setSkills([...skills, t]); setNewSkillDraft(''); }
  };

  // ── Work History ──
  const addWork = () => setWorkHistory([...workHistory, { company: '', job_title: '', start_date: '', end_date: '', is_current: false, role_category: 'Engineering', description: '' }]);
  const updateWork = (i: number, field: keyof WorkExperienceItem, val: any) => {
    const u = [...workHistory]; u[i] = { ...u[i], [field]: val }; setWorkHistory(u);
  };
  const removeWork = (i: number) => setWorkHistory(workHistory.filter((_, idx) => idx !== i));

  // ── Education ──
  const addEdu = () => setEducationList([...educationList, { degree_title: '', institution: '', field_of_study: '', degree_level: 'Bachelor' }]);
  const updateEdu = (i: number, field: keyof EducationItem, val: any) => {
    const u = [...educationList]; u[i] = { ...u[i], [field]: val }; setEducationList(u);
  };
  const removeEdu = (i: number) => setEducationList(educationList.filter((_, idx) => idx !== i));

  // ── Upload Pipeline ──
  const handleStartPipeline = async () => {
    if (!selectedFile) { setErrorMessage('Please select a resume file (.pdf, .docx, or .doc) first.'); return; }
    setIsProcessing(true); setErrorMessage(null); setOcrRequired(false);
    setCurrentStep(2); setPipelineStepIndex(1);
    setPipelineMessage('Uploading document and verifying SHA-256 hash...');

    try {
      const uploadResult = await api.uploadResume(selectedFile);
      setPipelineStepIndex(2); setPipelineMessage('Extracting text via PyMuPDF / python-docx...');
      await new Promise(r => setTimeout(r, 800));
      setPipelineStepIndex(3); setPipelineMessage('Running regex parser for emails, phones, coordinates...');
      await new Promise(r => setTimeout(r, 600));
      setPipelineStepIndex(4); setPipelineMessage('Gemini AI extracting structured experience & skill taxonomies...');
      const reviewResult = await api.getExtractionReview(uploadResult.id);
      setUploadedResumeId(uploadResult.id);
      setExtractionData(reviewResult.reconciled_data);
      if ((reviewResult as any).raw_text_length < 50) setOcrRequired(true);
      setPipelineStepIndex(5); setPipelineMessage('Fact reconciliation & provenance tagging complete.');
      await new Promise(r => setTimeout(r, 600));
      setCurrentStep(3);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Pipeline failed. Please try again.');
      setCurrentStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Manual Save ──
  const handleManualSave = async () => {
    if (!fullName.trim()) { setErrorMessage('Full name is required.'); return; }
    setIsSaving(true); setErrorMessage(null);
    try {
      await api.ensureCandidateAuth();
      await api.updateProfile({
        full_name: fullName,
        headline,
        bio,
        total_years_experience: totalYears,
        availability_status: availability,
        profile_visibility: visibility,
      });
      await api.setLocation({ city, country, latitude, longitude });
      for (const skill of skills) {
        try {
          await api.addSkill(skill);
        } catch { /* skip duplicate */ }
      }
      setSaveSuccess(true);
      setTimeout(() => { setSaveSuccess(false); onConfirmProfile(); }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Save failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Confirm Extracted ──
  const handleConfirmExtracted = async () => {
    if (!uploadedResumeId || !extractionData) return;
    setIsSaving(true);
    try {
      await api.confirmExtraction(uploadedResumeId, extractionData);
      onConfirmProfile();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Confirm failed.');
    } finally {
      setIsSaving(false);
    }
  };

  // ═══════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#240b3b] py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center font-sans antialiased text-slate-800">

      {/* ── NAVBAR ── */}
      <div className="w-full max-w-6xl mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-white font-black text-xl tracking-wider">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>DULLNIT</span>
          </div>
          <span className="bg-[#411961] text-purple-200 border border-purple-400/20 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
            Talent Platform
          </span>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-3.5 py-1.5 rounded-full text-xs text-white/90">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium">System Status: Active</span>
        </div>
      </div>

      {/* ── MAIN CARD ── */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-950/20 p-6 sm:p-10">

        {/* ── STEPPER ── */}
        <div className="w-full border-b border-gray-100 pb-7 mb-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {STEPS.map((step, idx) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isActive ? 'bg-[#1e0a2f] text-white shadow-md'
                        : isCompleted ? 'bg-purple-100 text-[#5925dc] border border-[#7f56d9]'
                        : 'border border-gray-300 text-gray-400 bg-white'
                    }`}>
                      {isCompleted ? <CheckCheck className="w-3.5 h-3.5" /> : step.id}
                    </div>
                    <span className={`text-sm tracking-tight ${
                      isActive ? 'font-semibold text-gray-900'
                        : isCompleted ? 'font-medium text-gray-700'
                        : 'font-normal text-gray-400'
                    }`}>{step.title}</span>
                  </div>
                  {idx < STEPS.length - 1 && <div className="flex-1 mx-4 h-[1.5px] bg-gray-200 hidden md:block" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ══════════ STEP 1: UPLOAD DOCUMENT ══════════ */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── LEFT FORM COLUMN ── */}
            <div className="lg:col-span-8 bg-white/80 rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.03)]">

              {/* Method Toggle Pills */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
                  Ingestion Method
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: 'upload', label: 'Method B: Upload CV / Resume (Word & PDF)', Icon: FileText },
                    { value: 'manual', label: 'Method A: Manual Profile Entry', Icon: Edit3 },
                  ].map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setIngestionMethod(value as 'upload' | 'manual')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition ${
                        ingestionMethod === value
                          ? 'bg-[#f4ecfb] border border-[#d8bbf3] text-[#5c248b] shadow-sm ring-2 ring-[#7f56d9]/20'
                          : 'bg-[#f7f8fa] border border-gray-200/80 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${ingestionMethod === value ? 'text-[#7f56d9]' : 'text-gray-400'}`} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {ingestionMethod === 'upload' ? (
                <div className="space-y-6">
                  {/* Domain & Experience */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Closest match to candidate industry / domain</label>
                      <div className="relative">
                        <select value={domain} onChange={e => setDomain(e.target.value)}
                          className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9] pr-10 cursor-pointer">
                          <option>Software Engineering & AI</option>
                          <option>Data Science & Big Data</option>
                          <option>Business Management & IT</option>
                          <option>Education & Academic</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Candidate experience tier</label>
                      <div className="relative">
                        <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)}
                          className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9] pr-10 cursor-pointer">
                          <option>Entry / Student (0 - 1 Years)</option>
                          <option>Junior (1 - 3 Years)</option>
                          <option>Mid-level (3 - 5 Years)</option>
                          <option>Senior (5 - 8 Years)</option>
                          <option>Lead / Specialist (8+ Years)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Location & Currency */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">PostGIS Proximity Anchor & Preferred Currency</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 relative">
                        <select value={locationHub} onChange={e => setLocationHub(e.target.value)}
                          className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9] pr-10 cursor-pointer">
                          <option>Colombo (6.9271° N, 79.8612° E) [PostGIS Ready]</option>
                          <option>Kandy (7.2906° N, 80.6337° E)</option>
                          <option>Remote - Worldwide Available</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <div className="relative">
                        <select value={currency} onChange={e => setCurrency(e.target.value)}
                          className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9] pr-10 cursor-pointer">
                          <option>USD ($)</option><option>LKR (Rs)</option><option>GBP (£)</option><option>EUR (€)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Functional Area Chips */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2.5">Select candidate functional area</label>
                    <div className="flex flex-wrap gap-2.5">
                      {FUNCTIONAL_AREAS.map(({ id, label, icon: Icon }) => {
                        const sel = functionalArea === id;
                        return (
                          <button key={id} type="button" onClick={() => setFunctionalArea(id)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                              sel ? 'bg-[#f4ecfb] border border-[#d8bbf3] text-[#5c248b] shadow-sm ring-1 ring-[#7f56d9]/30'
                                : 'bg-[#f7f8fa] border border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                            }`}>
                            <Icon className={`w-3.5 h-3.5 ${sel ? 'text-[#5c248b]' : 'text-gray-400'}`} />
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Upload Dropzone */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-700">Resume Ingestion & Extraction</label>
                      <span className="text-[11px] text-gray-400">PyMuPDF / docx + Gemini AI Extraction</span>
                    </div>
                    <div
                      onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${
                        dragActive ? 'border-[#7f56d9] bg-[#f8f5fe]'
                          : selectedFile ? 'border-emerald-300 bg-emerald-50/40'
                          : 'border-gray-200 hover:border-purple-300 bg-[#fafafa]'
                      }`}
                    >
                      <input type="file" id="cv-file-upload" className="hidden" accept=".pdf,.docx,.doc" onChange={handleFileChange} />
                      <label htmlFor="cv-file-upload" className="cursor-pointer block">
                        {selectedFile ? (
                          <div className="flex flex-col items-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
                            <p className="text-sm font-semibold text-gray-800">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI Pipeline</p>
                            <span className="mt-2 text-xs text-[#7f56d9] font-medium underline">Click to choose a different document</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="w-11 h-11 rounded-full bg-purple-100/70 text-[#7f56d9] flex items-center justify-center mb-2">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-gray-800">Click to select or <span className="text-[#7f56d9] font-semibold">drag & drop</span> your CV file</p>
                            <p className="text-xs text-gray-400 mt-1">Supported formats: Word (.docx, .doc) & PDF (.pdf) — Max file size 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── MANUAL MODE: Section Cards ── */
                <div className="space-y-5">
                  {/* Personal Identity */}
                  <SectionCard title="Personal Identity" description="Your name, headline, and professional bio.">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs uppercase tracking-wide text-black/50">Name <span className="text-black">*</span></label>
                        <input className="mt-1.5 w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9]"
                          value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Demuni Jayasmith" />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-black/50">Headline</label>
                        <input className="mt-1.5 w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9]"
                          value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Senior Backend Engineer" />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-black/50">Bio</label>
                        <textarea rows={4} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9] resize-none"
                          value={bio} onChange={e => setBio(e.target.value)} placeholder="A short paragraph about your background and what you're looking for." />
                      </div>
                    </div>
                  </SectionCard>

                  {/* Location */}
                  <SectionCard title="Location" description="City, country and PostGIS geocoordinates.">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'City', val: city, set: setCity, placeholder: 'Colombo' },
                        { label: 'Country', val: country, set: setCountry, placeholder: 'Sri Lanka' },
                      ].map(({ label, val, set, placeholder }) => (
                        <div key={label}>
                          <label className="text-xs uppercase tracking-wide text-black/50">{label}</label>
                          <input className="mt-1.5 w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9]"
                            value={val} onChange={e => set(e.target.value)} placeholder={placeholder} />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs uppercase tracking-wide text-black/50">Latitude</label>
                        <input type="number" step="any" className="mt-1.5 w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9]"
                          value={latitude} onChange={e => setLatitude(parseFloat(e.target.value) || 0)} placeholder="6.9271" />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-black/50">Longitude</label>
                        <input type="number" step="any" className="mt-1.5 w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9]"
                          value={longitude} onChange={e => setLongitude(parseFloat(e.target.value) || 0)} placeholder="79.8612" />
                      </div>
                    </div>
                  </SectionCard>

                  {/* Career Details */}
                  <SectionCard title="Career Details" description="Experience tier, availability and visibility settings.">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="text-xs uppercase tracking-wide text-black/50">Years of Experience</label>
                        <input type="number" min="0" className="mt-1.5 w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9]"
                          value={totalYears} onChange={e => setTotalYears(parseInt(e.target.value) || 0)} />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-black/50">Availability</label>
                        <div className="relative mt-1.5">
                          <select value={availability} onChange={e => setAvailability(e.target.value as any)}
                            className="w-full appearance-none border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9] pr-10 cursor-pointer bg-white">
                            <option>Available Now</option><option>Open to Offers</option><option>Unavailable</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-black/50">Profile Visibility</label>
                        <div className="relative mt-1.5">
                          <select value={visibility} onChange={e => setVisibility(e.target.value as any)}
                            className="w-full appearance-none border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9] pr-10 cursor-pointer bg-white">
                            <option>Public</option><option>Anonymous</option><option>Private</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  {/* Skills */}
                  <SectionCard title="Skills" description="Add your technical and professional skills.">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9]"
                          value={newSkillDraft} onChange={e => setNewSkillDraft(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                          placeholder="Type a skill and press Enter" />
                        <button type="button" onClick={addSkill}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm font-medium hover:bg-gray-50 transition">
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s, i) => (
                          <span key={i} className="inline-flex items-center gap-1 rounded-full border border-black/15 bg-black/[0.03] px-3 py-1 text-sm">
                            {s}
                            <button type="button" onClick={() => setSkills(skills.filter((_, idx) => idx !== i))} className="text-black/40 hover:text-black">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                        {skills.length === 0 && <p className="text-sm text-black/40">No skills added yet.</p>}
                      </div>
                    </div>
                  </SectionCard>

                  {/* Work History */}
                  <SectionCard title="Work History" description="Add your work experience entries."
                    action={<button type="button" onClick={addWork} className="inline-flex items-center gap-1 text-sm font-medium text-[#5c248b] hover:text-[#3d1465]"><Plus className="w-4 h-4" /> Add entry</button>}>
                    <div className="space-y-4">
                      {workHistory.map((it, i) => (
                        <div key={i} className="rounded-lg border border-black/10 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wide text-black/40">Entry {i + 1}</span>
                            <button type="button" onClick={() => removeWork(i)} className="text-black/40 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: 'Company', field: 'company', placeholder: 'Acme Inc.' },
                              { label: 'Job Title', field: 'job_title', placeholder: 'Software Engineer' },
                            ].map(({ label, field, placeholder }) => (
                              <div key={field}>
                                <label className="text-xs text-black/50">{label}</label>
                                <input className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30"
                                  value={(it as any)[field]} onChange={e => updateWork(i, field as any, e.target.value)} placeholder={placeholder} />
                              </div>
                            ))}
                            <div>
                              <label className="text-xs text-black/50">Start Date</label>
                              <input type="date" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30"
                                value={it.start_date} onChange={e => updateWork(i, 'start_date', e.target.value)} />
                            </div>
                            <div>
                              <label className="text-xs text-black/50">End Date</label>
                              <input type="date" disabled={it.is_current} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 disabled:opacity-50"
                                value={it.end_date} onChange={e => updateWork(i, 'end_date', e.target.value)} />
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                              <input type="checkbox" id={`curr-${i}`} checked={it.is_current}
                                onChange={e => updateWork(i, 'is_current', e.target.checked)}
                                className="rounded border-gray-300 text-[#7f56d9] focus:ring-0 cursor-pointer" />
                              <label htmlFor={`curr-${i}`} className="text-sm cursor-pointer">Current position</label>
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs text-black/50">Role Category</label>
                              <div className="relative mt-1">
                                <select value={it.role_category} onChange={e => updateWork(i, 'role_category', e.target.value)}
                                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 pr-8 bg-white cursor-pointer">
                                  {ROLE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs text-black/50">Description</label>
                              <textarea rows={3} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 resize-none"
                                value={it.description} onChange={e => updateWork(i, 'description', e.target.value)} placeholder="What you did and achieved." />
                            </div>
                          </div>
                        </div>
                      ))}
                      {workHistory.length === 0 && <p className="text-sm text-black/40">No work entries yet. Click "Add entry" above.</p>}
                    </div>
                  </SectionCard>

                  {/* Education */}
                  <SectionCard title="Education" description="Add your academic qualifications."
                    action={<button type="button" onClick={addEdu} className="inline-flex items-center gap-1 text-sm font-medium text-[#5c248b] hover:text-[#3d1465]"><Plus className="w-4 h-4" /> Add entry</button>}>
                    <div className="space-y-4">
                      {educationList.map((it, i) => (
                        <div key={i} className="rounded-lg border border-black/10 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wide text-black/40">Entry {i + 1}</span>
                            <button type="button" onClick={() => removeEdu(i)} className="text-black/40 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-black/50">Degree Title</label>
                              <input className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30"
                                value={it.degree_title} onChange={e => updateEdu(i, 'degree_title', e.target.value)} placeholder="B.Sc. Computer Science" />
                            </div>
                            <div>
                              <label className="text-xs text-black/50">Institution</label>
                              <input className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30"
                                value={it.institution} onChange={e => updateEdu(i, 'institution', e.target.value)} placeholder="University of Colombo" />
                            </div>
                            <div>
                              <label className="text-xs text-black/50">Field of Study</label>
                              <input className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30"
                                value={it.field_of_study} onChange={e => updateEdu(i, 'field_of_study', e.target.value)} placeholder="Software Engineering" />
                            </div>
                            <div>
                              <label className="text-xs text-black/50">Degree Level</label>
                              <div className="relative mt-1">
                                <select value={it.degree_level} onChange={e => updateEdu(i, 'degree_level', e.target.value as any)}
                                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 pr-8 bg-white cursor-pointer">
                                  {DEGREE_LEVELS.map(d => <option key={d}>{d}</option>)}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {educationList.length === 0 && <p className="text-sm text-black/40">No education entries yet. Click "Add entry" above.</p>}
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* Error Banner */}
              {errorMessage && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* ── RIGHT ENGINE STATUS COLUMN ── */}
            <div className="lg:col-span-4 pl-0 lg:pl-4 pt-1 flex flex-col justify-between h-full">
              <div>
                <h2 className="text-3xl font-light text-gray-800 leading-tight">
                  About <br /><span className="font-normal text-gray-900">Ingestion Engine</span>
                </h2>
                <p className="mt-3 text-xs sm:text-sm text-gray-500 leading-relaxed">
                  Authoritative candidate profiles require geocoded location coordinates for PostGIS spatial searches and confirmed skill tags.
                </p>
                <div className="mt-5 p-4 rounded-xl bg-purple-50/60 border border-purple-100/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#5925dc]">
                    <Zap className="w-3.5 h-3.5" /><span>PostGIS Proximity Ready</span>
                  </div>
                  <p className="text-[11px] text-gray-600 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-purple-600" />
                    <span>Colombo (6.9271° N, 79.8612° E) configured</span>
                  </p>
                  <div className="pt-2 border-t border-purple-100/60 flex items-center justify-between text-[11px] text-gray-500">
                    <span>Supported log-in:</span>
                    <span className="font-semibold text-gray-700">Word (.docx, .doc) & PDF (.pdf)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>Current Target Store:</span>
                    <span className="font-semibold text-gray-700 flex items-center gap-1">
                      <Server className="w-3 h-3 text-emerald-600" /> PostgreSQL
                    </span>
                  </div>
                </div>
              </div>
              {/* SVG City Line-art */}
              <div className="mt-8 flex justify-center lg:justify-end pr-2">
                <svg viewBox="0 0 240 220" className="w-48 sm:w-56 h-auto text-[#716982] stroke-current fill-none stroke-[1.8]" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="120" cy="120" r="80" className="stroke-none fill-[#f8f6fc]" />
                  <line x1="20" y1="185" x2="220" y2="185" strokeLinecap="round" />
                  <line x1="40" y1="192" x2="100" y2="192" strokeLinecap="round" strokeWidth="1.2" />
                  <rect x="30" y="140" width="45" height="45" rx="1" />
                  <g className="fill-current stroke-none">
                    <circle cx="45" cy="155" r="1.3" /><circle cx="60" cy="155" r="1.3" />
                    <circle cx="45" cy="170" r="1.3" /><circle cx="60" cy="170" r="1.3" />
                  </g>
                  <rect x="45" y="85" width="45" height="100" rx="1" />
                  <g className="fill-current stroke-none">
                    <circle cx="60" cy="102" r="1.3" /><circle cx="75" cy="102" r="1.3" />
                    <circle cx="60" cy="118" r="1.3" /><circle cx="75" cy="118" r="1.3" />
                    <circle cx="60" cy="134" r="1.3" /><circle cx="75" cy="134" r="1.3" />
                  </g>
                  <rect x="90" y="115" width="70" height="70" rx="1" />
                  <line x1="125" y1="98" x2="125" y2="115" />
                  <rect x="115" y="160" width="20" height="25" rx="1" />
                  <g className="fill-current stroke-none">
                    <circle cx="105" cy="130" r="1.3" /><circle cx="125" cy="130" r="1.3" /><circle cx="145" cy="130" r="1.3" />
                    <circle cx="105" cy="145" r="1.3" /><circle cx="145" cy="145" r="1.3" />
                  </g>
                  <line x1="185" y1="160" x2="185" y2="185" />
                  <path d="M 185,130 A 14,14 0 0,1 200,145 A 12,12 0 0,1 196,165 A 12,12 0 0,1 174,165 A 12,12 0 0,1 170,145 A 14,14 0 0,1 185,130 Z" />
                  <line x1="185" y1="145" x2="185" y2="168" strokeWidth="1.2" />
                  <line x1="185" y1="152" x2="192" y2="148" strokeWidth="1.2" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ STEP 2: PIPELINE PROCESSING ══════════ */}
        {currentStep === 2 && (
          <div className="max-w-xl mx-auto py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Extraction Pipeline</h2>
            <p className="text-sm text-gray-500 mb-8">Your CV is being analysed by Google Gemini. Please wait…</p>
            <div className="space-y-4">
              {PIPELINE_STAGES.map((stage, idx) => {
                const stageNum = idx + 1;
                const done = stageNum < pipelineStepIndex;
                const active = stageNum === pipelineStepIndex;
                return (
                  <div key={idx} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                      done ? 'bg-emerald-500 text-white'
                        : active ? 'bg-[#7f56d9] text-white animate-pulse'
                        : 'border-2 border-gray-200 text-gray-400'
                    }`}>
                      {done ? <CheckCheck className="w-4 h-4" /> : stageNum}
                    </div>
                    <div className="pt-1.5">
                      <p className={`text-sm ${active ? 'text-gray-900 font-medium' : done ? 'text-gray-500 line-through' : 'text-gray-400'}`}>{stage}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {ocrRequired && (
              <div className="mt-6 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Scanned PDF detected — text extraction quality may be limited. Consider uploading a text-based .docx file for better results.</span>
              </div>
            )}
            {pipelineMessage && <p className="mt-4 text-xs text-gray-500 italic">{pipelineMessage}</p>}
          </div>
        )}

        {/* ══════════ STEP 3: CANDIDATE PERSONA PREVIEW ══════════ */}
        {currentStep === 3 && extractionData && (
          <div className="max-w-3xl mx-auto py-4">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Extraction Complete</h2>
                <p className="text-sm text-gray-500">Review the extracted data before persisting to PostgreSQL.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', val: extractionData.personal_information?.full_name },
                { label: 'Email', val: extractionData.personal_information?.email },
                { label: 'Phone', val: extractionData.personal_information?.phone },
                { label: 'Location', val: `${extractionData.personal_information?.city || ''}, ${extractionData.personal_information?.country || ''}` },
                { label: 'Headline', val: extractionData.professional_information?.current_title },
                { label: 'Years Experience', val: extractionData.professional_information?.estimated_total_experience_years?.toString() },
              ].map(({ label, val }) => val && (
                <div key={label} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{val}</p>
                </div>
              ))}
            </div>
            {extractionData.skills && extractionData.skills.length > 0 && (
              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-2">Extracted Skills</p>
                <div className="flex flex-wrap gap-2">
                  {extractionData.skills.map((s, i) => (
                    <span key={i} className="rounded-full bg-[#f4ecfb] border border-[#d8bbf3] text-[#5c248b] px-3 py-1 text-xs font-medium">
                      {s.normalized_name || s.original_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {errorMessage && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* ══════════ BOTTOM ACTION BAR ══════════ */}
        <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between">
          {currentStep > 1 && currentStep !== 2 && (
            <button type="button" onClick={() => setCurrentStep(currentStep - 1)}
              className="text-sm text-gray-500 hover:text-gray-800 font-medium transition">
              ← Back
            </button>
          )}
          <div className="ml-auto">
            {currentStep === 1 && ingestionMethod === 'upload' && (
              <button type="button" onClick={handleStartPipeline}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-[#2d0e44] hover:bg-[#200832] active:scale-[0.99] disabled:opacity-60 text-white px-7 py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer">
                <Sparkles className="w-4 h-4" /><span>Start Ingestion Pipeline</span><ArrowRight className="w-4 h-4" />
              </button>
            )}
            {currentStep === 1 && ingestionMethod === 'manual' && (
              <button type="button" onClick={handleManualSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#2d0e44] hover:bg-[#200832] disabled:opacity-60 text-white px-7 py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-md cursor-pointer">
                {saveSuccess ? <><CheckCircle2 className="w-4 h-4 text-emerald-300" /><span>Saved!</span></> : <><span>Save Profile</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            )}
            {currentStep === 3 && extractionData && (
              <button type="button" onClick={handleConfirmExtracted}
                disabled={isSaving}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-7 py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-md cursor-pointer">
                <CheckCircle2 className="w-4 h-4" /><span>Confirm & Save to Database</span><ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};