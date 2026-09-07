import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import type {
  CandidateProfile,
  CandidatePersona,
  ResumeExtractionResult,
} from '../types';
import {
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Edit3,
  Plus,
  Trash2,
  MapPin,
  Briefcase,
  GraduationCap,
  Globe,
  RefreshCw,
  Eye,
  Info,
} from 'lucide-react';

interface CandidateDashboardProps {
  onOpenAuth: () => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ onOpenAuth }) => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [persona, setPersona] = useState<CandidatePersona | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'upload' | 'review'>('profile');

  // Manual editing state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [headline, setHeadline] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [totalYears, setTotalYears] = useState<number>(0);
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [availability, setAvailability] = useState<string>('available_now');
  const [visibility, setVisibility] = useState<'public' | 'anonymous' | 'private'>('public');

  // Skills input state
  const [newSkill, setNewSkill] = useState<string>('');
  const [newSkillYears, setNewSkillYears] = useState<number>(1);

  // Resume Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgressState, setUploadProgressState] = useState<string | null>(null);
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);
  const [extractionData, setExtractionData] = useState<ResumeExtractionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Persona regeneration state
  const [isRegeneratingPersona, setIsRegeneratingPersona] = useState<boolean>(false);

  const fetchProfileAndPersona = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await api.getMyProfile();
      setProfile(p);
      setFullName(p.full_name || '');
      setHeadline(p.headline || '');
      setBio(p.bio || '');
      setTotalYears(p.total_years_experience || 0);
      setCity(p.location?.city || '');
      setCountry(p.location?.country || '');
      setLatitude(p.location?.latitude);
      setLongitude(p.location?.longitude);
      setAvailability(p.availability_status || 'available_now');
      setVisibility(p.profile_visibility || 'public');

      try {
        const pers = await api.getPersona();
        setPersona(pers);
      } catch (err) {
        // Persona might not yet be generated
        setPersona(null);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('401')) {
        setError('Please sign in to view and manage your candidate profile.');
      } else {
        setError(err.message || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndPersona();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const updated = await api.updateProfile({
        full_name: fullName,
        headline,
        bio,
        total_years_experience: totalYears,
        availability_status: availability,
        profile_visibility: visibility,
      });

      if (city || country) {
        await api.setLocation({
          city,
          country,
          latitude: latitude ? Number(latitude) : undefined,
          longitude: longitude ? Number(longitude) : undefined,
        });
      }

      setProfile(updated);
      setIsEditing(false);
      await fetchProfileAndPersona();
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    try {
      await api.addSkill(newSkill.trim(), 'General', newSkillYears);
      setNewSkill('');
      setNewSkillYears(1);
      await fetchProfileAndPersona();
    } catch (err: any) {
      alert(err.message || 'Failed to add skill');
    }
  };

  const handleRemoveSkill = async (id: string) => {
    try {
      await api.removeSkill(id);
      await fetchProfileAndPersona();
    } catch (err: any) {
      alert(err.message || 'Failed to remove skill');
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadResume = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgressState('Uploading & validating file...');
    try {
      setUploadProgressState('Extracting raw text (PyMuPDF / python-docx)...');
      const res = await api.uploadResume(selectedFile);
      setUploadedResumeId(res.id);

      setUploadProgressState('Running rule parser & Gemini AI structured extraction...');
      // Fetch extraction preview
      const review = await api.getExtractionReview(res.id);
      setExtractionData(review.reconciled_data);
      setActiveSubTab('review');
      setUploadProgressState(null);
    } catch (err: any) {
      alert(err.message || 'Resume processing failed');
      setUploadProgressState(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmExtraction = async () => {
    if (!uploadedResumeId || !extractionData) return;
    setLoading(true);
    try {
      await api.confirmExtraction(uploadedResumeId, extractionData);
      alert('Profile confirmed and updated from resume successfully!');
      setActiveSubTab('profile');
      await fetchProfileAndPersona();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm extraction');
    } finally {
      setLoading(false);
    }
  };

  const handleRegeneratePersona = async () => {
    setIsRegeneratingPersona(true);
    try {
      const newPersona = await api.regeneratePersona();
      setPersona(newPersona);
    } catch (err: any) {
      alert(err.message || 'Failed to regenerate persona');
    } finally {
      setIsRegeneratingPersona(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <RefreshCw className="animate-spin mx-auto text-blue-600 mb-3" size={32} />
        <p className="text-slate-600 font-medium">Loading candidate profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card max-w-xl mx-auto p-8 text-center my-12">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-200">
          <Info size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 font-heading mb-2">Access Candidate Portal</h3>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <button onClick={onOpenAuth} className="neu-btn neu-btn-primary mx-auto">
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Mode Switcher */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            {profile?.full_name || 'My Professional Profile'}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            {profile?.headline || 'Build your authoritative profile manually or parse your resume'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`neu-btn text-xs font-semibold ${
              activeSubTab === 'profile' ? 'neu-btn-primary' : 'neu-btn-secondary'
            }`}
          >
            <Edit3 size={14} />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => setActiveSubTab('upload')}
            className={`neu-btn text-xs font-semibold ${
              activeSubTab === 'upload' ? 'neu-btn-primary' : 'neu-btn-secondary'
            }`}
          >
            <UploadCloud size={14} />
            <span>Upload Resume</span>
          </button>
          {extractionData && (
            <button
              onClick={() => setActiveSubTab('review')}
              className={`neu-btn text-xs font-semibold ${
                activeSubTab === 'review' ? 'neu-btn-primary' : 'neu-btn-secondary'
              }`}
            >
              <CheckCircle2 size={14} className="text-green-500" />
              <span>Review Extracted</span>
            </button>
          )}
        </div>
      </div>

      {/* SUBTAB 1: PROFILE OVERVIEW & EDITING */}
      {activeSubTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Core Info Card */}
            <div className="glass-card p-6">
              <div className="flex-between mb-5">
                <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                  <Briefcase size={18} className="text-blue-600" />
                  <span>General Information</span>
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="neu-btn neu-btn-secondary !py-1.5 !px-3 text-xs"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="neu-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Headline</label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        className="neu-input"
                        placeholder="e.g. Senior Backend Engineer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Professional Biography</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="neu-input"
                      placeholder="Brief overview of your background..."
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Total Exp (Yrs)</label>
                      <input
                        type="number"
                        value={totalYears}
                        onChange={(e) => setTotalYears(Number(e.target.value))}
                        className="neu-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Availability</label>
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="neu-input text-xs"
                      >
                        <option value="available_now">Available Now</option>
                        <option value="open_to_offers">Open to Offers</option>
                        <option value="not_available">Not Available</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="neu-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="neu-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Latitude (for PostGIS)</label>
                      <input
                        type="number"
                        step="any"
                        value={latitude ?? ''}
                        onChange={(e) => setLatitude(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="e.g. 6.9271"
                        className="neu-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Longitude (for PostGIS)</label>
                      <input
                        type="number"
                        step="any"
                        value={longitude ?? ''}
                        onChange={(e) => setLongitude(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="e.g. 79.8612"
                        className="neu-input text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button onClick={handleSaveProfile} className="neu-btn neu-btn-primary !py-2 !px-5 text-xs">
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {profile?.bio || 'No biography provided yet. Add a short summary of your background.'}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                      <MapPin size={14} className="text-blue-500" />
                      <span>{profile?.location?.city ? `${profile.location.city}, ${profile.location.country}` : 'Location unconfigured'}</span>
                      {profile?.location?.latitude && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({profile.location.latitude.toFixed(2)}, {profile.location.longitude?.toFixed(2)})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                      <Briefcase size={14} className="text-purple-500" />
                      <span>{profile?.total_years_experience || 0} Years Experience</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                      <Globe size={14} className="text-green-500" />
                      <span className="capitalize">{profile?.availability_status?.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Skills Card */}
            <div className="glass-card p-6">
              <h3 className="text-base font-bold text-slate-900 font-heading mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-blue-600" />
                <span>Skills & Canonical Normalization</span>
              </h3>

              {/* Add Skill Form */}
              <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. React.js, FastAPI, Docker..."
                  className="neu-input text-xs"
                />
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={newSkillYears}
                  onChange={(e) => setNewSkillYears(Number(e.target.value))}
                  title="Years"
                  className="neu-input text-xs w-20 text-center"
                />
                <button type="submit" className="neu-btn neu-btn-primary !py-1.5 !px-3 text-xs shrink-0">
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </form>

              {/* Skills List */}
              <div className="flex flex-wrap gap-2">
                {profile?.skills && profile.skills.length > 0 ? (
                  profile.skills.map((s) => (
                    <span key={s.id} className="skill-tag text-xs group">
                      <span className="font-semibold">{s.normalized_name}</span>
                      {s.original_name !== s.normalized_name && (
                        <span className="text-[10px] text-slate-400">({s.original_name})</span>
                      )}
                      {s.years_experience ? (
                        <span className="text-[10px] text-blue-500 font-bold">{s.years_experience}y</span>
                      ) : null}
                      <button
                        onClick={() => handleRemoveSkill(s.id)}
                        className="opacity-60 hover:opacity-100 text-red-500 hover:text-red-700 ml-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
                )}
              </div>
            </div>

            {/* Experiences Card */}
            <div className="glass-card p-6">
              <h3 className="text-base font-bold text-slate-900 font-heading mb-4 flex items-center gap-2">
                <Briefcase size={18} className="text-blue-600" />
                <span>Work Experience</span>
              </h3>
              {profile?.experiences && profile.experiences.length > 0 ? (
                <div className="space-y-4">
                  {profile.experiences.map((exp) => (
                    <div key={exp.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex-between mb-1">
                        <h4 className="text-sm font-bold text-slate-800">{exp.original_job_title}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {exp.normalized_role || 'General'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold">{exp.company}</p>
                      {exp.description && (
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No work experience logged yet.</p>
              )}
            </div>

            {/* Education Card */}
            <div className="glass-card p-6">
              <h3 className="text-base font-bold text-slate-900 font-heading mb-4 flex items-center gap-2">
                <GraduationCap size={18} className="text-blue-600" />
                <span>Education & Qualifications</span>
              </h3>
              {profile?.education && profile.education.length > 0 ? (
                <div className="space-y-3">
                  {profile.education.map((edu) => (
                    <div key={edu.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex-between">
                        <h4 className="text-xs font-bold text-slate-800">{edu.original_degree}</h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                          {edu.normalized_degree_level || 'Higher Ed'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No education records added yet.</p>
              )}
            </div>
          </div>

          {/* Right Column: Derived Persona Card */}
          <div className="space-y-6">
            <div className="glass-card p-6 relative overflow-hidden">
              <div className="flex-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  Derived Candidate Persona
                </span>
                <button
                  onClick={handleRegeneratePersona}
                  disabled={isRegeneratingPersona}
                  className="neu-btn neu-btn-secondary !p-1.5 rounded-lg text-slate-600 hover:text-blue-600"
                  title="Regenerate Persona via AI"
                >
                  <RefreshCw size={14} className={isRegeneratingPersona ? 'animate-spin' : ''} />
                </button>
              </div>

              {persona ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 font-heading leading-snug">
                      {persona.headline}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-white">
                        {persona.seniority_level}
                      </span>
                      <span className="text-xs text-slate-600 font-semibold">
                        {persona.primary_profession}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-200/60">
                    "{persona.summary}"
                  </p>

                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Key Competencies
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.top_skills.map((sk, idx) => (
                        <span key={idx} className="skill-tag text-[11px]">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {persona.suggested_roles && persona.suggested_roles.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Suggested Roles
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {persona.suggested_roles.map((r, idx) => (
                          <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex-between text-[11px] text-slate-400">
                    <span>Generated: {new Date(persona.generated_at).toLocaleDateString()}</span>
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Searchable
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles size={28} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 mb-4">
                    Persona not yet generated for this profile.
                  </p>
                  <button
                    onClick={handleRegeneratePersona}
                    disabled={isRegeneratingPersona}
                    className="neu-btn neu-btn-primary !py-2 !px-4 text-xs mx-auto"
                  >
                    {isRegeneratingPersona ? 'Generating...' : 'Generate Persona'}
                  </button>
                </div>
              )}
            </div>

            {/* Profile Visibility Controls */}
            <div className="glass-card p-5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Eye size={14} className="text-blue-500" />
                Discovery Status
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Your profile is currently <strong className="text-slate-700 font-bold">{visibility}</strong> and{' '}
                {profile?.is_searchable ? (
                  <span className="text-green-600 font-bold">visible to recruiters</span>
                ) : (
                  <span className="text-amber-600 font-bold">hidden from searches</span>
                )}
                .
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = visibility === 'public' ? 'private' : 'public';
                    setVisibility(next);
                    api.updateProfile({ profile_visibility: next }).then((res) => setProfile(res));
                  }}
                  className="neu-btn neu-btn-secondary !py-1.5 !px-3 text-xs w-full"
                >
                  Toggle to {visibility === 'public' ? 'Private' : 'Public'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: RESUME UPLOAD */}
      {activeSubTab === 'upload' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass-card p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 font-heading mb-2">
              Upload CV or Resume
            </h2>
            <p className="text-xs text-slate-500 mb-6 max-w-md mx-auto">
              We extract text without LLMs (using PyMuPDF & python-docx), parse obvious patterns with rules, and run structured Gemini AI extraction before letting you review the facts.
            </p>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="dropzone mb-6"
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
              <UploadCloud size={42} className="text-blue-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">
                {selectedFile ? selectedFile.name : 'Click to browse or drop PDF / DOCX here'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                  : 'Supported formats: PDF, DOCX (Max 10MB)'}
              </p>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUploadResume}
              disabled={!selectedFile || isUploading}
              className="neu-btn neu-btn-primary !py-2.5 !px-8 text-sm font-semibold mx-auto"
            >
              {isUploading ? 'Processing Document...' : 'Upload & Analyze Resume'}
            </button>

            {/* Progress Status */}
            {uploadProgressState && (
              <div className="mt-6 p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-left">
                <div className="flex items-center gap-3">
                  <RefreshCw className="animate-spin text-blue-600 shrink-0" size={18} />
                  <div>
                    <p className="text-xs font-bold text-blue-800">Pipeline In Progress</p>
                    <p className="text-xs text-blue-600">{uploadProgressState}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: EXTRACTED REVIEW & CONFIRMATION */}
      {activeSubTab === 'review' && extractionData && (
        <div className="space-y-6">
          <div className="glass-card p-6 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border-blue-200">
            <div className="flex-between flex-wrap gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full border border-blue-200">
                  AI + Rule Reconciliation Review
                </span>
                <h2 className="text-xl font-bold text-slate-900 font-heading mt-2">
                  Review Extracted Information
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Confirm the parsed facts. Nothing becomes authoritative until you click "Confirm & Persist Profile".
                </p>
              </div>

              <button
                onClick={handleConfirmExtraction}
                className="neu-btn neu-btn-primary !py-2.5 !px-6 text-sm font-semibold shadow-lg"
              >
                <CheckCircle2 size={16} />
                <span>Confirm & Persist Profile</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Extracted Personal Info */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-slate-800 font-heading mb-4 flex items-center gap-2">
                <Briefcase size={16} className="text-blue-500" />
                <span>Extracted Identity & Summary</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Full Name:</span>
                  <span className="text-slate-800 font-bold text-sm">
                    {extractionData.personal_information.full_name || 'Not detected'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Headline:</span>
                  <span className="text-slate-700">
                    {extractionData.professional_information.headline || 'Not detected'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Location:</span>
                  <span className="text-slate-700">
                    {extractionData.personal_information.city
                      ? `${extractionData.personal_information.city}, ${extractionData.personal_information.country}`
                      : 'Not detected'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Estimated Experience:</span>
                  <span className="text-slate-700 font-bold">
                    {extractionData.professional_information.estimated_total_experience_years ?? 0} Years
                  </span>
                </div>
              </div>
            </div>

            {/* Extracted Skills with Provenance */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-slate-800 font-heading mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-blue-500" />
                <span>Extracted Skills (with Provenance)</span>
              </h3>
              <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
                {extractionData.skills && extractionData.skills.length > 0 ? (
                  extractionData.skills.map((sk, idx) => (
                    <span key={idx} className="skill-tag text-xs">
                      <span className="font-semibold">{sk.normalized_name || sk.original_name}</span>
                      <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-blue-100 text-blue-700 font-mono font-bold">
                        {sk.source}
                      </span>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No skills detected.</p>
                )}
              </div>
            </div>
          </div>

          {/* Extracted Experience List */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-slate-800 font-heading mb-4 flex items-center gap-2">
              <Briefcase size={16} className="text-blue-500" />
              <span>Extracted Work History</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {extractionData.experience && extractionData.experience.length > 0 ? (
                extractionData.experience.map((exp, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex-between mb-1">
                      <span className="font-bold text-slate-800">{exp.original_job_title}</span>
                      <span className="text-[10px] text-purple-600 font-bold">
                        {exp.normalized_role || 'General'}
                      </span>
                    </div>
                    <p className="text-slate-600 font-semibold">{exp.company}</p>
                    {exp.description && (
                      <p className="text-slate-500 mt-2 text-[11px] leading-relaxed line-clamp-3">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No experience records detected.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
