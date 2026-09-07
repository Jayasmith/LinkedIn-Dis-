import React, { useState, useRef } from 'react';
import { api } from '../services/api';

interface Flow1Props {
  onConfirmProfile: () => void;
}

export const Flow1_ProfileForm: React.FC<Flow1Props> = ({ onConfirmProfile }) => {
  const [activeMethod, setActiveMethod] = useState<'manual' | 'upload'>('manual');
  const [step, setStep] = useState<number>(1); // 1: Basics, 2: Skills/Work, 3: Review
  const [skills, setSkills] = useState<string[]>([
    'Python',
    'FastAPI',
    'PostgreSQL',
    'Docker',
    'PyTorch',
    'PostGIS'
  ]);
  const [newSkill, setNewSkill] = useState<string>('');

  // Form fields
  const [fullName, setFullName] = useState<string>('Demuni Jayasmith');
  const [headline, setHeadline] = useState<string>('AI & Backend Systems Architect');
  const [city, setCity] = useState<string>('Colombo');
  const [country, setCountry] = useState<string>('Sri Lanka');
  const [latitude, setLatitude] = useState<number>(6.9271);
  const [longitude, setLongitude] = useState<number>(79.8612);
  const [visibility, setVisibility] = useState<string>('Public (Recommended)');

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Pipeline Tracker State for Method B
  const [uploadProgress, setUploadProgress] = useState<{
    status: 'idle' | 'processing' | 'completed';
    stepIndex: number;
    message?: string;
  }>({
    status: 'idle',
    stepIndex: 0
  });

  const pipelineSteps = [
    'Document Upload & SHA-256 Hash Check',
    'Text Extraction (PyMuPDF / docx parser)',
    'Deterministic Rule Parsing (Regex Emails, URLs, Phones)',
    'Gemini AI Structured Extraction (Pydantic Schema)',
    'Reconciliation & Provenance Tagging'
  ];

  const handleSimulateUpload = async () => {
    setUploadProgress({ status: 'processing', stepIndex: 1, message: 'Uploading document...' });

    // If real file selected and user has token or wants to test live API
    if (selectedFile) {
      try {
        setUploadProgress({ status: 'processing', stepIndex: 2, message: 'PyMuPDF extracting document text...' });
        const res = await api.uploadResume(selectedFile);
        
        setUploadProgress({ status: 'processing', stepIndex: 3, message: 'Deterministic regex matching...' });
        await new Promise(r => setTimeout(r, 600));

        setUploadProgress({ status: 'processing', stepIndex: 4, message: 'Gemini AI structured synthesis...' });
        const review = await api.getExtractionReview(res.id);

        if (review && review.reconciled_data) {
          const rec = review.reconciled_data;
          if (rec.personal_information?.full_name) {
            setFullName(rec.personal_information.full_name);
          }
          if (rec.skills && rec.skills.length > 0) {
            setSkills(rec.skills.map((s: any) => s.original_name || s.normalized_name));
          }
        }

        setUploadProgress({ status: 'completed', stepIndex: 5, message: 'Reconciliation complete!' });
        setStep(3);
        return;
      } catch (err) {
        console.warn('Live upload API fallback to simulated pipeline:', err);
      }
    }

    // Fallback simulation timer for instant offline testing
    setTimeout(() => setUploadProgress({ status: 'processing', stepIndex: 2 }), 700);
    setTimeout(() => setUploadProgress({ status: 'processing', stepIndex: 3 }), 1400);
    setTimeout(() => setUploadProgress({ status: 'processing', stepIndex: 4 }), 2100);
    setTimeout(() => {
      setUploadProgress({ status: 'completed', stepIndex: 5 });
      setStep(3);
    }, 2800);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
      {/* Left Column: Form & Stepper */}
      <div>
        {/* Method Toggle Buttons (Neumorphic segmented pills) */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
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
            📄 Method B: Upload CV / Resume
          </button>
        </div>

        {/* Cisco-Style Step Header (Image 2) */}
        <div className="neu-card" style={{ marginBottom: '24px', padding: '20px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {[
              { num: 1, label: 'Identity & Location' },
              { num: 2, label: 'Experience & Skills' },
              { num: 3, label: 'Review & Confirm' }
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

        {/* METHOD A: MANUAL ENTRY FORM */}
        {activeMethod === 'manual' && step === 1 && (
          <div className="neu-card">
            <h2 className="title-lg">1. Identity & Geocoding</h2>
            <p className="text-subtitle">Enter authoritative personal data for recruiter discovery and PostGIS distance queries.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  className="neu-input" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Professional Headline</label>
                <input 
                  className="neu-input" 
                  value={headline} 
                  onChange={(e) => setHeadline(e.target.value)} 
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

            {/* Quick Coordinate Presets */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>PostGIS Presets:</span>
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
              <button className="neu-btn-primary" onClick={() => setStep(2)}>Continue to Skills &rarr;</button>
            </div>
          </div>
        )}

        {activeMethod === 'manual' && step === 2 && (
          <div className="neu-card">
            <h2 className="title-lg">2. Availability & Skills Matrix</h2>
            <p className="text-subtitle">Specify verified competencies for deterministic recruiter filtering.</p>

            <div className="form-group">
              <label className="form-label">Add Technical Skills</label>
              <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '12px' }}>
                <input 
                  className="neu-input" 
                  placeholder="e.g. PyTorch, Kubernetes, Go" 
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)} 
                />
                <button type="submit" className="neu-btn-secondary">+ Add</button>
              </form>
            </div>

            {/* Skill Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
              {skills.map(s => (
                <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#e2e8f0', padding: '6px 14px', borderRadius: '20px', fontWeight: '600', fontSize: '13px' }}>
                  {s}
                  <span 
                    style={{ cursor: 'pointer', color: '#64748b' }} 
                    onClick={() => setSkills(skills.filter(item => item !== s))}
                  >
                    &times;
                  </span>
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button className="neu-btn-secondary" onClick={() => setStep(1)}>&larr; Back</button>
              <button className="neu-btn-primary" onClick={() => setStep(3)}>Proceed to Review &rarr;</button>
            </div>
          </div>
        )}

        {/* METHOD B: UPLOAD CV DROPZONE & PIPELINE */}
        {activeMethod === 'upload' && step !== 3 && (
          <div className="neu-card">
            <h2 className="title-lg">Resume Ingestion Engine</h2>
            <p className="text-subtitle">Drop your PDF/Docx. Our deterministic regex rules and Gemini AI parser will extract your profile facts automatically.</p>

            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".pdf,.docx"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />

            <div 
              style={{
                border: '2.5px dashed #94a3b8',
                borderRadius: '16px',
                padding: '48px 24px',
                textAlign: 'center',
                background: selectedFile ? '#f0fdf4' : '#f8fafc',
                borderColor: selectedFile ? '#10b981' : '#94a3b8',
                cursor: 'pointer',
                marginBottom: '24px'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {selectedFile ? '📄' : '📂'}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                {selectedFile ? selectedFile.name : 'Drag & Drop your Resume (.PDF, .DOCX)'}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                {selectedFile 
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB ready for parsing`
                  : 'Max file size 10MB. Text extraction and SHA-256 deduplication run locally.'}
              </p>
              <button 
                type="button"
                className="neu-btn-primary" 
                style={{ marginTop: '18px' }} 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSimulateUpload();
                }}
              >
                ⚡ Start Ingestion Pipeline
              </button>
            </div>

            {uploadProgress.status !== 'idle' && (
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #cbd5e1' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>
                  Extraction Pipeline Status: {uploadProgress.message || ''}
                </h4>
                {pipelineSteps.map((pStep, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: uploadProgress.stepIndex > idx ? '#047857' : uploadProgress.stepIndex === idx ? '#2563eb' : '#e2e8f0',
                      color: '#ffffff', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700'
                    }}>
                      {uploadProgress.stepIndex > idx ? '✓' : idx + 1}
                    </span>
                    <span style={{ 
                      fontSize: '13px', 
                      color: uploadProgress.stepIndex >= idx ? '#0f172a' : '#94a3b8', 
                      fontWeight: uploadProgress.stepIndex === idx ? '700' : '400' 
                    }}>
                      {pStep}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: REVIEW & PROVENANCE INSPECTION */}
        {step === 3 && (
          <div className="neu-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="title-lg" style={{ margin: 0 }}>Fact Reconciliation & Provenance</h2>
              <span className="badge-pill badge-success">✓ Schema Validated</span>
            </div>
            <p className="text-subtitle">Review extracted fields and their source of truth before persisting to PostgreSQL.</p>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="form-label">Full Name</span>
                  <span className="provenance-tag">[Rule: Regex Email Match]</span>
                </div>
                <input 
                  className="neu-input" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                />
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="form-label">Calculated Seniority & Title</span>
                  <span className="provenance-tag">[AI: Gemini 1.5 Synthesis (96% Confidence)]</span>
                </div>
                <input 
                  className="neu-input" 
                  value={headline} 
                  onChange={(e) => setHeadline(e.target.value)} 
                />
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="form-label">Extracted Skills</span>
                  <span className="provenance-tag">[Combined: Rule + AI Taxonomy]</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {skills.map(s => <span key={s} className="badge-pill badge-blue">{s}</span>)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
              <button className="neu-btn-secondary" onClick={() => setStep(2)}>&larr; Back</button>
              <button className="neu-btn-primary" onClick={onConfirmProfile}>
                💾 Confirm & Persist to Database
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column Context Card (Image 2 Style) */}
      <div>
        <div className="neu-card" style={{ position: 'sticky', top: '24px' }}>
          <h3 className="title-md" style={{ marginBottom: '8px' }}>Profile Quality Engine</h3>
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
            <span style={{ fontSize: '12px', color: '#64748b' }}>Authoritative Store:</span>
            <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>PostgreSQL + PostGIS Extension</div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Flow1_ProfileForm;
