import { useState } from 'react';
import { Flow1_ProfileForm } from './components/Flow1_ProfileForm';
import { Flow2_PersonaView } from './components/Flow2_PersonaView';
import { Flow3_RecruiterView } from './components/Flow3_RecruiterView';
import { Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function App() {
  const [currentFlow, setCurrentFlow] = useState<'flow1' | 'flow2' | 'flow3'>('flow1');
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#240b3b] font-sans antialiased text-slate-800">
      
      {/* Top Navbar / Platform Brand Header (Matches DullnitProfileCVPage.jsx) */}
      <header className="w-full bg-[#1e0a2f]/90 backdrop-blur-md border-b border-purple-900/40 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => setCurrentFlow('flow1')}
        >
          <div className="flex items-center gap-1.5 text-white font-black text-xl tracking-wider">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>DULLNIT</span>
          </div>
          <span className="bg-[#411961] text-purple-200 border border-purple-400/20 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
            Talent Platform
          </span>
        </div>

        {/* 3 Core Flow Switcher Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/10">
          <button 
            type="button"
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentFlow === 'flow1'
                ? 'bg-white text-[#1e0a2f] shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setCurrentFlow('flow1')}
          >
            1. Profile & CV Form
          </button>
          <button 
            type="button"
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentFlow === 'flow2'
                ? 'bg-white text-[#1e0a2f] shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setCurrentFlow('flow2')}
          >
            2. Candidate Persona ("Personal Find")
          </button>
          <button 
            type="button"
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentFlow === 'flow3'
                ? 'bg-white text-[#1e0a2f] shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setCurrentFlow('flow3')}
          >
            3. Recruiter Search & View
          </button>
        </nav>

        {/* System Telemetry & Status Action */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setShowStatusModal(true)}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1.5 rounded-full text-xs text-white/90 cursor-pointer hover:bg-white/15 transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">System Status: Active</span>
          </div>
        </div>
      </header>

      {/* Main Flow Container — no padding so Flow2/3 go full-width */}
      <main>
        {currentFlow === 'flow1' && (
          <Flow1_ProfileForm onConfirmProfile={() => setCurrentFlow('flow2')} />
        )}
        {currentFlow === 'flow2' && (
          <Flow2_PersonaView
            onGoToUpload={() => setCurrentFlow('flow1')}
            onRegenerate={() => {}}
          />
        )}
        {currentFlow === 'flow3' && (
          <Flow3_RecruiterView />
        )}
      </main>

      {/* System Status Architecture Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-gray-900">Dullnit Architecture Status</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2.5 text-xs mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Backend Engine</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> FastAPI (Port 8000)
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Database & Spatial</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PostgreSQL + PostGIS (Colombo 6.9271° N, 79.8612° E)
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">AI Ingestion & NLP</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Google Gemini Structured Output
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Document Parsing</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PyMuPDF (PDF) + python-docx (DOCX/DOC)
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">UI Design System</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Tailored Bento-Grid & Cisco Neumorphic
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="button" 
                className="px-5 py-2.5 bg-[#2d0e44] hover:bg-[#1e0a2f] text-white rounded-xl text-xs font-semibold transition cursor-pointer" 
                onClick={() => setShowStatusModal(false)}
              >
                Close Status
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
