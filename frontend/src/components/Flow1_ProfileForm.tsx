import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import type { ResumeExtractionResult } from '../types';

interface Flow1Props {
  onConfirmProfile: () => void;
}

export const Flow1_ProfileForm: React.FC<Flow1Props> = ({ onConfirmProfile }) => {
  const [activeMethod, setActiveMethod] = useState<'manual' | 'upload'>('upload');
  const [step, setStep] = useState<number>(1); // 1: Basics, 2: Skills/Work, 3: Review
  
  // Real Form State (starts clean, or loads from DB)
  const [fullName, setFullName] = useState<string>('');
  const [headline, setHeadline] = useState<string>('');
  const [city, setCity] = useState<string>('Colombo');
  const [country, setCountry] = useState<string>('Sri Lanka');
  const [latitude, setLatitude] = useState<number>(6.9271);
  const [longitude, setLongitude] = useState<number>(79.8612);
  const [totalYears, setTotalYears] = useState<number>(0);
  const [visibility, setVisibility] = useState<string>('Public (Recommended)');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState<string>('');

  // Method B Real Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pipelineMessage, setPipelineMessage] = useState<string | null>(null);
  const [pipelineStepIndex, setPipelineStepIndex] = useState<number>(0);
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);
  const [extractionData, setExtractionData] = useState<ResumeExtractionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pipelineStages = [
    '1. Uploading file & computing SHA-256 hash',
    '2. Extracting raw document text (PyMuPDF / python-docx)',
    '3. Running deterministic regex rules (Emails, Phones, URLs)',
    '4. Google Gemini AI analyzing structured experience & skills',
    '5. Fact reconciliation & provenance tagging'
  ];

  // Check if candidate already has a profile saved in DB
  useEffect(() => {
    const loadExistingProfile = async () => {
      try {
        await api.ensureCandidateAuth();
        const existing = await api.getMyProfile();
        if (existing) {
          if (existing.full_name) setFullName(existing.full_name);
          if (existing.headline) setHeadline(existing.headline);
          if (existing.total_years_experience) setTotalYears(existing.total_years_experience);
          if (existing.location) {
            if (existing.location.city) setCity(existing.location.city);
            if (existing.location.country) setCountry(existing.location.country);
            if (existing.location.latitude) setLatitude(existing.location.latitude);
            if (existing.location.longitude) setLongitude(existing.location.longitude);
          }
          if (existing.skills && existing.skills.length > 0) {
            setSkills(existing.skills.map((s) => s.normalized_name || s.original_name));
          }
        }
      } catch (err) {
        // No existing profile or guest
      }
    };
    loadExistingProfile();
  }, []);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // REAL Method B CV Upload & Gemini Extraction
  const handleRealUploadAndScan = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a resume file (.pdf, .docx, or .doc) first.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setPipelineStepIndex(1);
    setPipelineMessage('Authenticating and uploading document...');

    try {
      await api.ensureCandidateAuth();
      
      setPipelineStepIndex(2);
      setPipelineMessage('Extracting document text with PyMuPDF / python-docx...');
      const uploadRes = await api.uploadResume(selectedFile);
      setUploadedResumeId(uploadRes.id);

      setPipelineStepIndex(3);
      setPipelineMessage('Executing deterministic regex rules and Gemini AI structured extraction...');
      
      // Wait for extraction review
      const review = await api.getExtractionReview(uploadRes.id);
      setPipelineStepIndex(5);
      setPipelineMessage('Extraction completed successfully!');

      if (review && review.reconciled_data) {
        setExtractionData(review.reconciled_data);
        const rec = review.reconciled_data;
        if (rec.personal_information?.full_name) {
          setFullName(rec.personal_information.full_name);
        }
        if (rec.personal_information?.city) {
          setCity(rec.personal_information.city);
        }
        if (rec.professional_information?.headline) {
          setHeadline(rec.professional_information.headline);
        } else if (rec.professional_information?.current_title) {
          setHeadline(rec.professional_information.current_title);
        }
        if (rec.professional_information?.estimated_total_experience_years) {
          setTotalYears(rec.professional_information.estimated_total_experience_years);
        }
        if (rec.skills && rec.skills.length > 0) {
          setSkills(rec.skills.map((s) => s.original_name));
        }
      }

      // Automatically advance to Step 3 Review
      setTimeout(() => {
        setIsProcessing(false);
        setStep(3);
      }, 800);

    } catch (err: any) {
      console.error('Extraction error:', err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Failed to extract text from document. Please ensure the file is a valid PDF or Word document.');
    }
  };

  // Confirm and Commit Authoritative Facts to PostgreSQL Database
  const handleConfirmAndPersist = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await api.ensureCandidateAuth();

      // If this was from an uploaded CV
      if (uploadedResumeId && extractionData) {
        // Update extraction data with any edits candidate made
        const updatedExtraction: ResumeExtractionResult = {
          ...extractionData,
          personal_information: {
            ...extractionData.personal_information,
            full_name: fullName,
            city: city,
          },
          professional_information: {
            ...extractionData.professional_information,
            headline: headline,
            current_title: headline,
            estimated_total_experience_years: totalYears,
          },
        };

        await api.confirmExtraction(uploadedResumeId, updatedExtraction);
      } else {
        // Manual entry confirmation
        await api.updateProfile({
          full_name: fullName,
          headline: headline,
          total_years_experience: totalYears,
          profile_visibility: visibility.startsWith('Anonymous') ? 'anonymous' : 'public',
        });

        await api.setLocation({
          city,
          country,
          latitude,
          longitude,
        });

        // Add skills
        for (const s of skills) {
          try {
            await api.addSkill(s, 'Core Skills', totalYears || 2);
          } catch {
            // ignore duplicate
          }
        }

        // Trigger persona synthesis
        try {
          await api.regeneratePersona();
        } catch {
          // handled
        }
      }

      setIsProcessing(false);
      // Navigate to Flow 2 ("Personal Find")
      onConfirmProfile();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Failed to persist profile to database.');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
      {/* Left Column: Form & Stepper */}
      <div>
        {/* Method Toggle Buttons */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <button 
            type="button"
            onClick={() => setActiveMethod('upload')}
            className={`neu-btn-secondary ${activeMethod === 'upload' ? 'active-pill' : ''}`}
            style={{ 
              flex: 1, 
              padding: '14px', 
              borderRadius: '12px', 
              background: activeMethod === 'upload' ? '#eff6ff' : '#ffffff', 
              borderColor: activeMethod === 'upload' ? '#2563eb' : '#cbd5e1', 
              fontWeight: '700' 
            }}
          >
            📄 Method B: Upload CV / Resume (Word & PDF)
          </button>
          <button 
            type="button"
            onClick={() => setActiveMethod('manual')}
            className={`neu-btn-secondary ${activeMethod === 'manual' ? 'active-pill' : ''}`}
            style={{ 
              flex: 1, 
              padding: '14px', 
              borderRadius: '12px', 
              background: activeMethod === 'manual' ? '#eff6ff' : '#ffffff', 
              borderColor: activeMethod === 'manual' ? '#2563eb' : '#cbd5e1', 
              fontWeight: '700' 
            }}
          >
            ✍️ Method A: Manual Profile Entry
          </button>
        </div>

        {/* Cisco-Style Step Header */}
        <div className="neu-card" style={{ marginBottom: '24px', padding: '20px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {[
              { num: 1, label: activeMethod === 'upload' ? 'Upload Document' : 'Identity & Location' },
              { num: 2, label: activeMethod === 'upload' ? 'Extraction Pipeline' : 'Experience & Skills' },
              { num: 3, label: 'Review & Persist' }
            ].map((s) => (
              <div 
                key={s.num} 
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                onClick={() => setStep(s.num)}
              >
                <span style={{
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%',
                  background: step >= s.num ? '#2563eb' : '#e2e8f0',
                  color: step >= s.num ? '#ffffff' : '#64748b',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: '800'
                }}>
                  {s.num}
                </span>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: step === s.num ? '700' : '500', 
                  color: step === s.num ? '#0f172a' : '#64748b' 
                }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1.5px solid #ef4444', 
            borderRadius: '10px', 
            padding: '14px 18px', 
            color: '#b91c1c', 
            fontSize: '13px', 
            fontWeight: '600', 
            marginBottom: '20px' 
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* METHOD B: REAL RESUME UPLOAD (PDF / DOCX / DOC) */}
        {activeMethod === 'upload' && step !== 3 && (
          <div className="neu-card">
            <h2 className="title-lg">Resume Ingestion & Real Text Extraction</h2>
            <p className="text-subtitle">
              Drop your real CV document. Supported formats: <b>.PDF, .DOCX, and .DOC (Word)</b>. 
              Extraction runs via PyMuPDF and python-docx, followed by Google Gemini AI structured output.
            </p>

            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                  setErrorMessage(null);
                }
              }}
            />

            <div 
              style={{
                border: '2.5px dashed',
                borderColor: selectedFile ? '#10b981' : '#94a3b8',
                borderRadius: '16px',
                padding: '44px 24px',
                textAlign: 'center',
                background: selectedFile ? '#f0fdf4' : '#f8fafc',
                cursor: 'pointer',
                marginBottom: '24px'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {selectedFile ? (selectedFile.name.endsWith('.pdf') ? '📄' : '📝') : '📂'}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                {selectedFile ? selectedFile.name : 'Click to select or drag & drop your CV file'}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                {selectedFile 
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB • Click button below to run real extraction`
                  : 'Supported formats: Word (.docx, .doc) & PDF (.pdf) — Max 10MB'}
              </p>
            </div>

            {isProcessing && (
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '18px' }}>⏳</span>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#2563eb', margin: 0 }}>
                    {pipelineMessage || 'Processing CV with live AI extraction pipeline...'}
                  </h4>
                </div>
                {pipelineStages.map((pStep, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <span style={{
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%',
                      background: pipelineStepIndex > idx ? '#047857' : pipelineStepIndex === idx + 1 ? '#2563eb' : '#e2e8f0',
                      color: '#ffffff', 
                      fontSize: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: '700'
                    }}>
                      {pipelineStepIndex > idx ? '✓' : idx + 1}
                    </span>
                    <span style={{ 
                      fontSize: '13px', 
                      color: pipelineStepIndex >= idx + 1 ? '#0f172a' : '#94a3b8', 
                      fontWeight: pipelineStepIndex === idx + 1 ? '700' : '400' 
                    }}>
                      {pStep}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                className="neu-btn-primary" 
                onClick={handleRealUploadAndScan}
                disabled={!selectedFile || isProcessing}
                style={{ opacity: !selectedFile || isProcessing ? 0.6 : 1, cursor: !selectedFile || isProcessing ? 'not-allowed' : 'pointer' }}
              >
                {isProcessing ? 'Extracting Real Facts...' : '⚡ Scan & Extract CV Facts'}
              </button>
            </div>
          </div>
        )}

        {/* METHOD A: MANUAL PROFILE ENTRY */}
        {activeMethod === 'manual' && step === 1 && (
          <div className="neu-card">
            <h2 className="title-lg">1. Identity & Geocoding</h2>
            <p className="text-subtitle">Enter your real details for recruiter discovery and PostGIS distance queries.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  className="neu-input" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Professional Headline</label>
                <input 
                  className="neu-input" 
                  value={headline} 
                  onChange={(e) => setHeadline(e.target.value)} 
                  placeholder="e.g. Full Stack Engineer / AI Specialist"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">City, Country</label>
                <input 
                  className="neu-input" 
                  value={`${city}, ${country}`} 
                  onChange={(e) => {
                    const parts = e.target.value.split(',');
                    setCity(parts[0]?.trim() || '');
                    if (parts[1]) setCountry(parts[1].trim());
                  }} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Latitude (PostGIS)</label>
                <input 
                  type="number" 
                  step="any"
                  className="neu-input" 
                  value={latitude} 
                  onChange={(e) => setLatitude(Number(e.target.value))} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude (PostGIS)</label>
                <input 
                  type="number" 
                  step="any"
                  className="neu-input" 
                  value={longitude} 
                  onChange={(e) => setLongitude(Number(e.target.value))} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Presets:</span>
              <button
                type="button"
                className="badge-pill badge-blue"
                style={{ cursor: 'pointer' }}
                onClick={() => { setCity('Colombo'); setLatitude(6.9271); setLongitude(79.8612); }}
              >
                Colombo (6.9271° N, 79.8612° E)
              </button>
              <button
                type="button"
                className="badge-pill badge-blue"
                style={{ cursor: 'pointer' }}
                onClick={() => { setCity('Kandy'); setLatitude(7.2906); setLongitude(80.6337); }}
              >
                Kandy (7.2906° N, 80.6337° E)
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Profile Visibility Setting</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['Public (Recommended)', 'Anonymous (Protected)', 'Private'].map((vis) => (
                  <button 
                    key={vis} 
                    type="button" 
                    className="neu-btn-secondary" 
                    onClick={() => setVisibility(vis)}
                    style={{ 
                      flex: 1, 
                      background: visibility === vis ? '#eff6ff' : '#ffffff', 
                      borderColor: visibility === vis ? '#2563eb' : '#cbd5e1',
                      fontWeight: visibility === vis ? '700' : '500'
                    }}
                  >
                    {vis}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button 
                type="button"
                className="neu-btn-primary" 
                onClick={() => setStep(2)}
                disabled={!fullName.trim()}
              >
                Continue to Skills &rarr;
              </button>
            </div>
          </div>
        )}

        {/* METHOD A: SKILLS & EXPERIENCE */}
        {activeMethod === 'manual' && step === 2 && (
          <div className="neu-card">
            <h2 className="title-lg">2. Availability & Skills Matrix</h2>
            <p className="text-subtitle">Add the technical proficiencies and experience you want recruiters to discover.</p>

            <div className="form-group">
              <label className="form-label">Total Years of Experience</label>
              <input 
                type="number"
                min="0"
                max="50"
                className="neu-input"
                style={{ maxWidth: '140px' }}
                value={totalYears}
                onChange={(e) => setTotalYears(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Add Technical Skills</label>
              <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '12px' }}>
                <input 
                  className="neu-input" 
                  placeholder="e.g. Python, FastAPI, Docker, React, AWS..." 
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)} 
                />
                <button type="submit" className="neu-btn-secondary">+ Add</button>
              </form>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
              {skills.length > 0 ? (
                skills.map(s => (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '6px 14px', borderRadius: '20px', fontWeight: '600', fontSize: '13px' }}>
                    {s}
                    <span 
                      style={{ cursor: 'pointer', color: '#ef4444', fontWeight: '800' }} 
                      onClick={() => handleRemoveSkill(s)}
                    >
                      &times;
                    </span>
                  </span>
                ))
              ) : (
                <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                  No skills added yet. Type a skill name above and press + Add.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button type="button" className="neu-btn-secondary" onClick={() => setStep(1)}>&larr; Back</button>
              <button type="button" className="neu-btn-primary" onClick={() => setStep(3)}>Proceed to Review &rarr;</button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & PROVENANCE INSPECTION */}
        {step === 3 && (
          <div className="neu-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="title-lg" style={{ margin: 0 }}>Review Extracted Profile Facts</h2>
              <span className="badge-pill badge-success">✓ Ready for Database</span>
            </div>
            <p className="text-subtitle">
              Verify your information before committing authoritative records to PostgreSQL and generating your Gemini AI persona.
            </p>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="form-label">Full Name</span>
                  <span className="provenance-tag">
                    {extractionData?.personal_information?.full_name ? '[Extracted from CV]' : '[Manual Input]'}
                  </span>
                </div>
                <input 
                  className="neu-input" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="Candidate Full Name"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="form-label">Professional Headline</span>
                    <span className="provenance-tag">[Gemini AI Title]</span>
                  </div>
                  <input 
                    className="neu-input" 
                    value={headline} 
                    onChange={(e) => setHeadline(e.target.value)} 
                    placeholder="e.g. Lead Systems Engineer"
                  />
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="form-label">Total Experience</span>
                    <span className="provenance-tag">[Years]</span>
                  </div>
                  <input 
                    type="number"
                    className="neu-input" 
                    value={totalYears} 
                    onChange={(e) => setTotalYears(Number(e.target.value))} 
                  />
                </div>
              </div>

              {/* Real Extracted Skills with Provenance */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="form-label">Skills Taxonomy</span>
                  <span className="provenance-tag">
                    {extractionData ? `[${extractionData.skills.length} Extracted Skills]` : `[${skills.length} Skills]`}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {skills.length > 0 ? (
                    skills.map(s => <span key={s} className="badge-pill badge-blue">{s}</span>)
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>No skills captured yet.</span>
                  )}
                </div>
              </div>

              {/* Experience list if available from real CV */}
              {extractionData?.experience && extractionData.experience.length > 0 && (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                  <span className="form-label" style={{ marginBottom: '8px' }}>
                    Extracted Work History ({extractionData.experience.length} Roles):
                  </span>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {extractionData.experience.map((exp, idx) => (
                      <div key={idx} style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                        <span style={{ fontWeight: '700', color: '#0f172a' }}>{exp.original_job_title}</span>
                        {exp.company && <span style={{ color: '#2563eb' }}> &bull; {exp.company}</span>}
                        {exp.start_date && <span style={{ color: '#64748b', fontSize: '11px', marginLeft: '8px' }}>({exp.start_date} - {exp.end_date || 'Present'})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
              <button 
                type="button" 
                className="neu-btn-secondary" 
                onClick={() => setStep(activeMethod === 'upload' ? 1 : 2)}
              >
                &larr; Back
              </button>
              <button 
                type="button" 
                className="neu-btn-primary" 
                onClick={handleConfirmAndPersist}
                disabled={isProcessing}
              >
                {isProcessing ? 'Persisting to Database...' : '💾 Confirm & Persist to Database'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column Context Card */}
      <div>
        <div className="neu-card" style={{ position: 'sticky', top: '24px' }}>
          <h3 className="title-md" style={{ marginBottom: '8px' }}>Ingestion Engine Status</h3>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
            Authoritative candidate profiles require geocoded location coordinates for PostGIS spatial searches and confirmed skill tags.
          </p>
          <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#1d4ed8' }}>⚡ PostGIS Proximity Ready</span>
            <p style={{ fontSize: '12px', color: '#1e40af', marginTop: '4px' }}>
              {city} ({latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E) configured.
            </p>
          </div>
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Supported Ingestion:</span>
            <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>Word (.docx, .doc) & PDF (.pdf)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Flow1_ProfileForm;
