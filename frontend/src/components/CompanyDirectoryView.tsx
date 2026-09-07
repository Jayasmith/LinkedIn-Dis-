import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Building2,
  MoreHorizontal,
  Briefcase,
  X,
  Check,
  Sparkles,
  Bookmark,
  ChevronRight,
  Search,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Globe,
  MapPin,
  Calendar,
  Users,
  Plus,
} from 'lucide-react';

interface JobRole {
  id: string;
  title: string;
  location: string;
  salary: string;
  is_remote: boolean;
  job_type: string;
  posted_time: string;
  posted_days_ago: number;
  applicants_count: number;
  match_score: number;
  match_count: string;
  matched_skills: string[];
  description: string;
  why_join_us: string[];
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
}

interface CompanyItem {
  id: string;
  name: string;
  industry: string;
  location: string;
  website: string;
  tech_stack: string[];
  description: string;
  engineers_count: string;
  founded_year: string;
  pastel_bg: string;
  btn_bg: string;
  btn_text: string;
  roles: JobRole[];
  illustration: React.ReactNode;
}

export const CompanyDirectoryView: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingOrgId, setSubmittingOrgId] = useState<string | null>(null);
  const [submittedOrgs, setSubmittedOrgs] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Selected job for Job Description View Modal (Jobright Inspiration Match)
  const [selectedJob, setSelectedJob] = useState<{ company: CompanyItem; job: JobRole } | null>(null);
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'helpful' | 'not_helpful' | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const companyData: CompanyItem[] = [
        {
          id: 'org-synth-2',
          name: 'Synthetix Neural Labs',
          industry: 'Applied Machine Learning & GenAI',
          location: 'San Francisco, CA',
          website: 'https://synthetixlabs.ai',
          engineers_count: '140+',
          founded_year: '2021',
          pastel_bg: '#D9E8FE', // Light blue
          btn_bg: '#D9E8FE',
          btn_text: '#1E70F9',
          tech_stack: ['PyTorch', 'Python', 'Next.js', 'Redis', 'Kubernetes'],
          description:
            'AI research and machine learning company building intelligent systems and real-time agent workflows.',
          illustration: (
            <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
              {/* Blue / Gold AI Chip & Neural Network Nodes */}
              <circle cx="40" cy="24" r="5" fill="#FBBF24" stroke="#1F2937" strokeWidth="2" />
              <circle cx="26" cy="32" r="4" fill="#FBBF24" stroke="#1F2937" strokeWidth="2" />
              <circle cx="54" cy="32" r="6" fill="#FBBF24" stroke="#1F2937" strokeWidth="2" />
              <rect x="22" y="38" width="36" height="22" rx="6" fill="#3B82F6" stroke="#1F2937" strokeWidth="2.2" />
              <path d="M28 44h10M28 49h16M28 54h6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              <path d="M18 48h4M58 48h4M40 60v4" stroke="#1F2937" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M28 34l8 4M50 35l-6 3" stroke="#1F2937" strokeWidth="1.5" strokeDasharray="2 2" />
            </svg>
          ),
          roles: [
            {
              id: 'job-synth-1',
              title: 'Junior Data Analyst / Data Scientist / ML AI Engineer',
              location: 'San Francisco, CA (or Remote)',
              salary: '$82K/yr - $127K/yr',
              is_remote: true,
              job_type: 'Full-time',
              posted_time: '2 hours ago',
              posted_days_ago: 3,
              applicants_count: 104,
              match_score: 94,
              match_count: '5 of 6 core skills matched',
              matched_skills: ['Python', 'SQL', 'Machine Learning', 'Data Pipelines', 'Model Evaluation'],
              description:
                'Synthetix Neural Labs is building autonomous AI agent runtimes that transform how enterprise engineering teams deploy and optimize deep neural models. As an AI Engineer, Entry Level / Junior Data Analyst, you will contribute directly to the development, evaluation, and deployment of neural features used by production engineering teams.',
              why_join_us: [
                'Build real, production AI agents used by Fortune 500 enterprises.',
                'High ownership culture with direct mentorship from founding research scientists.',
                'Work with multi-node GPU clusters and modern open-weights foundation models.',
              ],
              responsibilities: [
                'Analyze multidimensional data pipelines and extract structured behavioral insights for production models.',
                'Collaborate with senior ML research engineers to evaluate neural inference latency and accuracy.',
                'Maintain automated feature stores, regression benchmarks, and data quality checks.',
                'Document engineering findings and present analytics telemetry directly to leadership.',
              ],
              qualifications: [
                'Proficiency in Python, SQL, and pandas/NumPy for statistical data analysis.',
                'Solid grasp of supervised machine learning concepts and model evaluation metrics.',
                'Familiarity with containerized environments (Docker) and version control (Git).',
                'Strong problem-solving discipline and eagerness to master modern LLM orchestration.',
              ],
              benefits: [
                'Comprehensive medical, dental, and vision health coverage (100% employer paid).',
                '$3,500 annual continuous learning, books, and technical conference stipend.',
                'Flexible remote workstation equipment allowance with top-tier hardware.',
                '401(k) retirement plan with 5% immediate company matching.',
                'Generous paid time off (PTO) and flexible working hours.',
              ],
            },
            {
              id: 'job-synth-2',
              title: 'Staff ML Research Scientist',
              location: 'San Francisco, CA',
              salary: '$190K/yr - $260K/yr',
              is_remote: true,
              job_type: 'Full-time',
              posted_time: '5 hours ago',
              posted_days_ago: 5,
              applicants_count: 42,
              match_score: 88,
              match_count: '4 of 5 core skills matched',
              matched_skills: ['PyTorch', 'Distributed Training', 'CUDA', 'Transformer Architecture'],
              description:
                'Lead our core multimodal foundation model initiative. You will spearhead architectural innovations in sparse attention and continuous test-time compute across multi-node clusters.',
              why_join_us: [
                'Directly shape foundational neural model architectures with massive compute allocations.',
                'Publish novel findings in top-tier machine learning conferences (NeurIPS, ICML, ICLR).',
                'Competitive founding-tier equity package and significant strategic autonomy.',
              ],
              responsibilities: [
                'Train and fine-tune large-scale multimodal models across multi-node GPU clusters.',
                'Publish novel findings in top-tier conferences and translate research into production microservices.',
                'Mentor applied machine learning engineers and set architectural standards.',
              ],
              qualifications: [
                'Ph.D. or equivalent industry track record in Machine Learning or Computer Science.',
                'Deep mastery of PyTorch, Triton, CUDA optimization, and distributed training.',
                'Proven publications or open-source releases in generative AI or computer vision.',
              ],
              benefits: [
                'Top-tier executive health benefits, dental, and vision for you and dependents.',
                'Uncapped computational compute budget on dedicated H100/H200 GPU clusters.',
                'Comprehensive 401(k) matching and annual performance equity refreshers.',
                'Unlimited paid time off and quarterly wellness sabbaticals.',
              ],
            },
          ],
        },
        {
          id: 'org-apex-1',
          name: 'Apex Global Technologies',
          industry: 'Distributed Systems & Enterprise Cloud',
          location: 'San Jose, CA',
          website: 'https://apexglobal.tech',
          engineers_count: '250+',
          founded_year: '2018',
          pastel_bg: '#DDF5DF', // Light green
          btn_bg: '#DDF5DF',
          btn_text: '#059669',
          tech_stack: ['FastAPI', 'Python', 'React', 'Docker', 'PostgreSQL', 'PyTorch'],
          description:
            'Engineering resilient cloud intelligence platforms, low-latency search infrastructure, and next-generation AI agent runtimes for Fortune 500 enterprises.',
          illustration: (
            <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
              {/* Green / Cloud Computing Window Illustration */}
              <rect x="22" y="24" width="36" height="26" rx="5" fill="#34D399" stroke="#1F2937" strokeWidth="2.2" />
              <path d="M22 31h36" stroke="#1F2937" strokeWidth="2" />
              <circle cx="26" cy="27.5" r="1" fill="#FFFFFF" />
              <circle cx="30" cy="27.5" r="1" fill="#FFFFFF" />
              <rect x="28" y="38" width="24" height="24" rx="4" fill="#FFFFFF" stroke="#1F2937" strokeWidth="2" />
              <circle cx="40" cy="50" r="4.5" fill="#FBBF24" stroke="#1F2937" strokeWidth="1.8" />
              <path d="M33 44h5M42 44h4M33 56h14" stroke="#1F2937" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ),
          roles: [
            {
              id: 'job-apex-1',
              title: 'Principal Cloud Architect & AI Systems Engineer',
              location: 'San Jose, CA',
              salary: '$185K/yr - $240K/yr',
              is_remote: true,
              job_type: 'Full-time',
              posted_time: '1 day ago',
              posted_days_ago: 2,
              applicants_count: 58,
              match_score: 96,
              match_count: '6 of 6 core skills matched',
              matched_skills: ['FastAPI', 'Kubernetes', 'Distributed Systems', 'Python', 'Docker', 'PostgreSQL'],
              description:
                'Architect the next evolution of our global real-time inference mesh. You will design fault-tolerant microservices and low-latency API gateways across multi-region deployments.',
              why_join_us: [
                'Architect cloud systems processing billions of daily transactions for global enterprises.',
                'Modern zero-legacy microservices stack with continuous automated deployment.',
                'Lucrative base salary, equity incentives, and comprehensive family benefits.',
              ],
              responsibilities: [
                'Design high-throughput, sub-10ms distributed serving architecture for LLM reasoning engines.',
                'Partner with product teams to translate enterprise SLAs into robust infrastructure blueprints.',
                'Oversee zero-trust security postures and compliance across our cloud edge networks.',
              ],
              qualifications: [
                'Demonstrated mastery of distributed systems, Go or Python, and Kubernetes architecture.',
                'Experience scaling mission-critical platforms handling millions of queries per minute.',
                'Strong background in cloud networking, Terraform, and automated deployment topologies.',
              ],
              benefits: [
                'Comprehensive medical, dental, vision, plus executive health concierge.',
                'Annual $5,000 personal development and conference travel grant.',
                'Generous hybrid stipend with modern executive ergonomic setup.',
              ],
            },
            {
              id: 'job-apex-2',
              title: 'Senior Distributed Data Pipeline Engineer',
              location: 'San Jose, CA (or Remote)',
              salary: '$160K/yr - $210K/yr',
              is_remote: true,
              job_type: 'Full-time',
              posted_time: '3 days ago',
              posted_days_ago: 4,
              applicants_count: 73,
              match_score: 91,
              match_count: '5 of 6 core skills matched',
              matched_skills: ['Python', 'PostgreSQL', 'Docker', 'FastAPI', 'Redis'],
              description:
                'Build resilient streaming event ingestion pipelines handling terabytes of structured behavioral event data each hour.',
              why_join_us: [
                'Work with modern event architectures (Kafka, ClickHouse, Apache Flink).',
                'Collaborate directly with senior engineering leadership on data platform vision.',
                'Competitive compensation, equity packages, and flexible time-off policies.',
              ],
              responsibilities: [
                'Build high-performance real-time data ingestion microservices with FastAPI and async Python.',
                'Implement comprehensive unit, regression, and integration testing for streaming pipelines.',
                'Optimize PostgreSQL relational schemas and query performance under extreme loads.',
              ],
              qualifications: [
                '5+ years experience building data-intensive backend architectures.',
                'Strong command of SQL query tuning, partitioning, and indexing strategies.',
                'Proven track record with distributed message brokers and Docker orchestration.',
              ],
              benefits: [
                '100% employer-covered health and dental insurance.',
                'Unlimited paid time off policy with mandatory minimum rest days.',
                'Annual remote setup and coworking membership stipends.',
              ],
            },
          ],
        },
        {
          id: 'org-meridian-1',
          name: 'Meridian Health Data Corp',
          industry: 'Clinical Healthcare Intelligence & Bioinformatics',
          location: 'Boston, MA',
          website: 'https://meridianhealthdata.org',
          engineers_count: '85+',
          founded_year: '2020',
          pastel_bg: '#FEF7D6', // Soft yellow
          btn_bg: '#FEF7D6',
          btn_text: '#D97706',
          tech_stack: ['Python', 'FHIR', 'AWS', 'TensorFlow', 'PostgreSQL'],
          description:
            'Building high-throughput genomic data ingestion, compliant FHIR microservices, and clinical predictive analytics copilots for healthcare networks.',
          illustration: (
            <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
              {/* Yellow / Health Analytics & Cross Shield Illustration */}
              <rect x="22" y="24" width="36" height="36" rx="10" fill="#FDE047" stroke="#1F2937" strokeWidth="2.2" />
              <path d="M40 32v20M30 42h20" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
              <circle cx="54" cy="28" r="6" fill="#F59E0B" stroke="#1F2937" strokeWidth="1.8" />
              <path d="M52 28h4M54 26v4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="26" cy="54" r="4" fill="#FFFFFF" stroke="#1F2937" strokeWidth="1.6" />
            </svg>
          ),
          roles: [
            {
              id: 'job-meridian-1',
              title: 'Clinical AI Research Engineer (Genomics & NLP)',
              location: 'Boston, MA (or Remote)',
              salary: '$145K/yr - $195K/yr',
              is_remote: true,
              job_type: 'Full-time',
              posted_time: '4 hours ago',
              posted_days_ago: 1,
              applicants_count: 36,
              match_score: 92,
              match_count: '5 of 5 core skills matched',
              matched_skills: ['Python', 'FHIR', 'Biomedical NLP', 'PostgreSQL', 'Machine Learning'],
              description:
                'Develop clinical-grade diagnostic classification pipelines and secure federated learning models deployed directly within accredited hospital networks.',
              why_join_us: [
                'Apply machine learning to directly accelerate clinical discoveries and patient care.',
                'Work alongside world-class bioinformaticians and physician-researchers.',
                'Strong intellectual property culture with active patent and paper support.',
              ],
              responsibilities: [
                'Engineer privacy-preserving NLP pipelines for electronic health record (EHR) parsing.',
                'Build reproducible validation benchmarks ensuring FDA-compliant model evaluation.',
                'Maintain high-security data pipelines honoring HIPAA and HITRUST standards.',
              ],
              qualifications: [
                'Master’s or Bachelor’s in Computer Science, Bioinformatics, or related quantitative field.',
                'Experience with clinical datasets (MIMIC, UK Biobank) and FHIR data protocols.',
                'Proficiency in Python and deep learning frameworks (PyTorch or TensorFlow).',
              ],
              benefits: [
                'Comprehensive medical, dental, vision, and wellness coverage.',
                'Generous 401(k) matching up to 6% of salary.',
                'Annual learning allowance and health savings contributions.',
              ],
            },
          ],
        },
        {
          id: 'org-krypton-1',
          name: 'Krypton Robotics',
          industry: 'Autonomous Systems & Humanoid Robotics',
          location: 'Austin, TX',
          website: 'https://kryptonrobotics.io',
          engineers_count: '110+',
          founded_year: '2022',
          pastel_bg: '#FFE4E8', // Soft pink
          btn_bg: '#FFE4E8',
          btn_text: '#E11D48',
          tech_stack: ['C++', 'Python', 'ROS2', 'PyTorch', 'TensorRT', 'CUDA'],
          description:
            'Developing autonomous perception, spatial reasoning, and tactile manipulation software for next-generation humanoid robotics.',
          illustration: (
            <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
              {/* Soft Pink / Robotic Arm & Optical Sensor */}
              <circle cx="40" cy="40" r="18" fill="#FDA4AF" stroke="#1F2937" strokeWidth="2.2" />
              <circle cx="40" cy="40" r="9" fill="#FFFFFF" stroke="#1F2937" strokeWidth="2" />
              <circle cx="40" cy="40" r="4" fill="#E11D48" />
              <path d="M22 40h-4M62 40h-4M40 22v-4M40 62v-4" stroke="#1F2937" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="56" cy="24" r="5" fill="#FBBF24" stroke="#1F2937" strokeWidth="1.8" />
            </svg>
          ),
          roles: [
            {
              id: 'job-krypton-1',
              title: 'Robotics Perception & SLAM Research Engineer',
              location: 'Austin, TX',
              salary: '$170K/yr - $230K/yr',
              is_remote: false,
              job_type: 'Full-time',
              posted_time: '2 days ago',
              posted_days_ago: 4,
              applicants_count: 49,
              match_score: 93,
              match_count: '5 of 6 core skills matched',
              matched_skills: ['C++', 'ROS2', 'PyTorch', 'Computer Vision', 'CUDA'],
              description:
                'Build low-latency visual-inertial odometry and spatial 3D reconstruction systems running directly on embodied edge compute.',
              why_join_us: [
                'Work hands-on with bleeding-edge autonomous robotic hardware.',
                'Direct ownership of perception stack from sensor drivers to neural inference.',
                'Fast-growing venture backed by premier deep-tech investors.',
              ],
              responsibilities: [
                'Implement robust visual-inertial odometry algorithms on edge compute modules.',
                'Optimize deep neural networks for sub-15ms edge inference with TensorRT.',
                'Participate in physical hardware bring-up and calibration tests.',
              ],
              qualifications: [
                'Strong proficiency in modern C++ (17/20) and Python.',
                'Demonstrated experience with SLAM, Kalman filters, and computer vision.',
                'Familiarity with ROS/ROS2 and embedded Linux environments.',
              ],
              benefits: [
                'Comprehensive medical, dental, and vision health coverage.',
                'Generous early-stage equity grants with transparent vesting.',
                'Fully catered lunches and daily gourmet snack bar.',
              ],
            },
          ],
        },
        {
          id: 'org-cortex-1',
          name: 'Cortex Cloud Intelligence',
          industry: 'Autonomous Agent Runtimes & Sandboxes',
          location: 'Seattle, WA',
          website: 'https://cortexcloud.io',
          engineers_count: '190+',
          founded_year: '2019',
          pastel_bg: '#E0F2FE', // Light blue
          btn_bg: '#E0F2FE',
          btn_text: '#0284C7',
          tech_stack: ['Go', 'Rust', 'Kubernetes', 'gRPC', 'PostgreSQL'],
          description:
            'Building distributed execution environments for autonomous AI agents with strict security sandbox boundaries.',
          illustration: (
            <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
              {/* Sky Blue / Rocket Launch & Growth Bars */}
              <rect x="22" y="44" width="7" height="14" rx="2" fill="#38BDF8" stroke="#1F2937" strokeWidth="1.8" />
              <rect x="31" y="38" width="7" height="20" rx="2" fill="#7DD3FC" stroke="#1F2937" strokeWidth="1.8" />
              <rect x="40" y="32" width="7" height="26" rx="2" fill="#0284C7" stroke="#1F2937" strokeWidth="1.8" />
              <path d="M44 26l8-8 8 8-4 4-8-8z" fill="#FBBF24" stroke="#1F2937" strokeWidth="1.8" />
              <circle cx="56" cy="38" r="8" fill="#E0F2FE" stroke="#1F2937" strokeWidth="1.8" />
            </svg>
          ),
          roles: [
            {
              id: 'job-cortex-1',
              title: 'Distributed Systems & Kernel Security Engineer',
              location: 'Seattle, WA (or Remote)',
              salary: '$165K/yr - $220K/yr',
              is_remote: true,
              job_type: 'Full-time',
              posted_time: '1 day ago',
              posted_days_ago: 3,
              applicants_count: 64,
              match_score: 89,
              match_count: '4 of 5 core skills matched',
              matched_skills: ['Rust', 'Go', 'Linux Kernel', 'Containers', 'Distributed Systems'],
              description:
                'Develop secure WebAssembly and eBPF microVM isolation layers for multi-tenant AI reasoning pipelines.',
              why_join_us: [
                'Define security sandboxing standards for next-generation generative agents.',
                'Work on open-source distributed runtimes with global adoption.',
                'Flexible remote-first culture with generous annual travel stipends.',
              ],
              responsibilities: [
                'Design microVM virtualization hooks with Firecracker and WebAssembly.',
                'Optimize low-latency inter-process messaging over gRPC and shared memory.',
                'Author rigorous security audits and hardening blueprints.',
              ],
              qualifications: [
                'Deep experience in Rust or modern Go with systems-level programming.',
                'Knowledge of Linux namespaces, cgroups, and eBPF telemetry.',
                'Strong architectural intuition for distributed consensus protocols.',
              ],
              benefits: [
                'Full medical, dental, and optical insurance with HSA contribution.',
                'Annual remote home office setup stipend and fast broadband reimbursement.',
                '401(k) retirement plan with 6% employer match.',
              ],
            },
          ],
        },
        {
          id: 'org-vector-1',
          name: 'Vector Quantum Analytics',
          industry: 'Quantum-Classical Hybrid Computing',
          location: 'New York, NY',
          website: 'https://vectorquantum.com',
          engineers_count: '65+',
          founded_year: '2023',
          pastel_bg: '#DCFCE7', // Light green
          btn_bg: '#DCFCE7',
          btn_text: '#16A34A',
          tech_stack: ['Python', 'Qiskit', 'C++', 'FastAPI', 'Ray'],
          description:
            'Commercializing quantum tensor algorithms to solve complex financial risk simulations and discrete combinatorial problems.',
          illustration: (
            <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
              {/* Light Green / Modular Simulator Window */}
              <rect x="22" y="24" width="36" height="30" rx="5" fill="#4ADE80" stroke="#1F2937" strokeWidth="2.2" />
              <path d="M22 31h36" stroke="#1F2937" strokeWidth="2" />
              <rect x="28" y="36" width="16" height="12" rx="2" fill="#FFFFFF" stroke="#1F2937" strokeWidth="1.6" />
              <circle cx="50" cy="42" r="3" fill="#FDE047" stroke="#1F2937" strokeWidth="1.5" />
              <rect x="42" y="48" width="16" height="14" rx="3" fill="#FBBF24" stroke="#1F2937" strokeWidth="1.8" />
            </svg>
          ),
          roles: [
            {
              id: 'job-vector-1',
              title: 'Quantum Algorithms & Optimization Engineer',
              location: 'New York, NY (or Remote)',
              salary: '$155K/yr - $205K/yr',
              is_remote: true,
              job_type: 'Full-time',
              posted_time: '6 hours ago',
              posted_days_ago: 2,
              applicants_count: 22,
              match_score: 95,
              match_count: '5 of 5 core skills matched',
              matched_skills: ['Python', 'Linear Algebra', 'Optimization Algorithms', 'Qiskit', 'C++'],
              description:
                'Formulate and benchmark quantum-inspired tensor networks and QAOA routines against classical HPC solvers.',
              why_join_us: [
                'Work at the intersection of mathematical physics and high-performance computing.',
                'Direct partnership with Tier-1 investment banks and research labs.',
                'Top-tier compensation and cutting-edge hybrid simulator clusters.',
              ],
              responsibilities: [
                'Implement variational quantum eigensolvers for complex matrix inversion.',
                'Scale hybrid workloads across GPU clusters using Ray and MPI.',
                'Present mathematical findings to technical client leadership.',
              ],
              qualifications: [
                'Background in Computer Science, Applied Mathematics, or Physics.',
                'Strong Python fluency and numerical linear algebra fundamentals.',
                'Familiarity with quantum computing frameworks (Qiskit, Pennylane, Cirq).',
              ],
              benefits: [
                'Comprehensive platinum health coverage for employees and dependents.',
                '$4,000 annual academic publication and travel fund.',
                'Flexible remote schedules and Manhattan office access.',
              ],
            },
          ],
        },
      ];

      setCompanies(companyData);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDossier = async (org: CompanyItem) => {
    try {
      setSubmittingOrgId(org.id);
      await api.expressInterest(org.id, 'Candidate dossier submitted directly via Company Directory.');
      setSubmittedOrgs((prev) => ({ ...prev, [org.id]: true }));
    } catch {
      setSubmittedOrgs((prev) => ({ ...prev, [org.id]: true }));
    } finally {
      setSubmittingOrgId(null);
    }
  };

  const handleApplyToJob = async (job: JobRole, company: CompanyItem) => {
    try {
      await api.expressInterest(company.id, `Application submitted for role: ${job.title}`);
      setAppliedJobs((prev) => ({ ...prev, [job.id]: true }));
      setSubmittedOrgs((prev) => ({ ...prev, [company.id]: true }));
    } catch {
      setAppliedJobs((prev) => ({ ...prev, [job.id]: true }));
      setSubmittedOrgs((prev) => ({ ...prev, [company.id]: true }));
    }
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.tech_stack.some((s) => s.toLowerCase().includes(q)) ||
      c.location.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full flex justify-center py-6 sm:py-8 px-4 sm:px-6 animate-fadeIn font-sans">
      
      {/* ── MAIN DASHBOARD CONTAINER (FLOATING WHITE WORKSPACE) ── */}
      <div className="w-full max-w-[1240px] bg-white rounded-[28px] sm:rounded-[36px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.22)] p-6 sm:p-10 md:p-12 relative overflow-hidden">

        {/* ── HEADER & SEARCH SECTION (CLEAN SAAS STYLE) ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-6 border-b border-[#F1F5F9]">
          
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] text-[#475569] text-[11px] font-bold uppercase tracking-wider mb-3">
              <Building2 className="w-3.5 h-3.5 text-[#1E293B]" />
              <span>COMPANY DIRECTORY</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-[#0F172A] tracking-tight leading-tight mb-2">
              Explore Hiring Companies
            </h1>

            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Explore organizations actively recruiting. Review tech stacks, open positions, and submit your candidate dossier directly to engineering hiring managers.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-80 lg:w-96 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stack, company, city..."
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-[#E2E8F0] text-xs font-medium text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1E70F9]/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition"
              />
            </div>
          </div>

        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-[#F8FAFC] rounded-[32px] p-6 border border-[#E2E8F0] animate-pulse space-y-4"
              >
                <div className="h-28 bg-[#E2E8F0] rounded-2xl w-full" />
                <div className="h-5 bg-[#E2E8F0] rounded-lg w-2/3" />
                <div className="h-12 bg-[#E2E8F0] rounded-xl w-full" />
                <div className="h-8 bg-[#E2E8F0] rounded-full w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            INSPIRATION IMAGE 2 STYLE COMPACT CATEGORY CARDS (GRID 3 COLUMNS)
            - Rounded rectangle with soft pastel top illustration section
            - Overlapping/nested white card body with clean typography
            - Small logo / illustration on top
            - Company name, short description, small statistics
            - Soft pastel "View Company" pill button + "View Roles" action
        ═══════════════════════════════════════════════════════════════════ */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mb-10">
            {filteredCompanies.map((company) => {
              const hasSubmitted = submittedOrgs[company.id];

              return (
                <div
                  key={company.id}
                  style={{ backgroundColor: company.pastel_bg }}
                  className="rounded-[32px] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.04)] flex flex-col justify-between transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl border border-black/[0.04] group"
                >
                  {/* TOP ILLUSTRATION / AVATAR AREA (1:1 with Reference Image 2) */}
                  <div className="h-32 sm:h-36 flex items-center justify-center relative select-none pt-2">
                    {company.illustration}
                  </div>

                  {/* BOTTOM WHITE CARD BODY */}
                  <div className="bg-white rounded-[26px] p-6 sm:p-7 flex flex-col justify-between flex-1 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-black/[0.03] -mt-2 mx-1.5 mb-1.5">
                    <div>
                      {/* Top Header: Company Name & Small Action Plus */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h2 className="text-lg sm:text-xl font-extrabold text-[#111827] tracking-tight leading-snug">
                          {company.name}
                        </h2>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedJob({ company, job: company.roles[0] });
                            setShowMatchDetails(false);
                            setFeedbackGiven(null);
                          }}
                          className="w-6 h-6 rounded-full bg-[#F3F4F6] group-hover:bg-[#E5E7EB] text-[#6B7280] flex items-center justify-center transition cursor-pointer shrink-0 mt-0.5"
                          title="View company details"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Short Description */}
                      <p className="text-xs sm:text-[13px] text-[#6B7280] leading-relaxed mb-4 line-clamp-2">
                        {company.description}
                      </p>

                      {/* Small Statistics Row */}
                      <div className="flex items-center justify-between text-xs text-[#4B5563] font-medium pb-4 border-b border-[#F3F4F6] mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#6B7280]" />
                            <span><strong className="text-[#111827]">{company.engineers_count}</strong> Engineers</span>
                          </div>
                          <span className="text-[#D1D5DB]">•</span>
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-[#6B7280]" />
                            <span><strong className="text-[#111827]">{company.roles.length}</strong> Open {company.roles.length === 1 ? 'Role' : 'Roles'}</span>
                          </div>
                        </div>

                        {hasSubmitted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <Check className="w-3 h-3 stroke-[2.5]" /> Sent
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      {/* Primary Button: Pastel "View Company" Pill matching Reference Image */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedJob({ company, job: company.roles[0] });
                          setShowMatchDetails(false);
                          setFeedbackGiven(null);
                        }}
                        style={{ backgroundColor: company.btn_bg, color: company.btn_text }}
                        className="rounded-full px-5 py-2 text-xs font-bold transition shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer text-center"
                      >
                        View Company
                      </button>

                      {/* Secondary Action: "View Roles" */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedJob({ company, job: company.roles[0] });
                          setShowMatchDetails(false);
                          setFeedbackGiven(null);
                        }}
                        className="text-xs font-bold text-[#1E70F9] hover:text-[#155FD0] hover:underline transition cursor-pointer flex items-center gap-1 py-1 px-1.5"
                      >
                        <span>View Roles</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* ── BOTTOM PAGINATION SECTION ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] flex items-center justify-center transition cursor-pointer shadow-xs"
              title="Previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              className="w-8 h-8 rounded-full bg-[#1E70F9] text-white text-xs font-bold flex items-center justify-center shadow-xs cursor-pointer"
            >
              1
            </button>

            <button
              type="button"
              className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] text-xs font-medium flex items-center justify-center transition cursor-pointer shadow-xs"
            >
              2
            </button>

            <button
              type="button"
              className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] text-xs font-medium flex items-center justify-center transition cursor-pointer shadow-xs"
            >
              3
            </button>

            <span className="text-xs text-[#94A3B8] px-1 font-medium select-none">
              ...
            </span>

            <button
              type="button"
              className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] text-xs font-medium flex items-center justify-center transition cursor-pointer shadow-xs"
            >
              10
            </button>

            <button
              type="button"
              className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] flex items-center justify-center transition cursor-pointer shadow-xs"
              title="Next page"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs font-medium text-[#64748B]">
            Showing 1–{filteredCompanies.length} of 28 companies
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          JOB DETAILS / COMPANY VIEW MODAL (PRESERVED FUNCTIONALITY)
      ═══════════════════════════════════════════════════════════════════ */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedJob(null);
          }}
        >
          <div className="bg-white rounded-[24px] sm:rounded-[32px] max-w-2xl sm:max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#E5E7EB] p-6 sm:p-10 relative text-[#111827] font-sans">
            
            {/* ── TOP BAR: COMPANY LOGO / AVATAR + COMPANY NAME + ACTIONS ── */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <span className="text-sm sm:text-base font-bold text-[#111827]">
                  {selectedJob.company.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  title="More options"
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#6B7280] transition cursor-pointer"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  title="Close job details"
                  className="w-8 h-8 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] flex items-center justify-center text-[#4B5563] hover:text-[#111827] transition cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── JOB TITLE WITH VERIFICATION BADGE ── */}
            <div className="flex items-center gap-2 mt-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight leading-tight">
                {selectedJob.job.title}
              </h1>
              <span title="Verified Employer Role" className="inline-flex items-center">
                <ShieldCheck className="w-5 h-5 text-[#6B7280] shrink-0" />
              </span>
            </div>

            {/* ── METADATA LINE: LOCATION • POSTED TIME • APPLICANTS ── */}
            <div className="text-xs sm:text-sm text-[#6B7280] flex flex-wrap items-center gap-x-1.5 gap-y-1 mb-1">
              <span>{selectedJob.job.location}</span>
              <span>•</span>
              <span className="text-[#059669] font-semibold">{selectedJob.job.posted_time}</span>
              <span>•</span>
              <span>{selectedJob.job.applicants_count} people clicked apply</span>
            </div>

            <div className="text-[11px] sm:text-xs text-[#9CA3AF] mb-4">
              Promoted by hirer • Responses managed via Dullnit Verified Candidate Dossier
            </div>

            {/* ── SMALL ROUNDED TAGS / PILLS ── */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {selectedJob.job.is_remote && (
                <span className="rounded-full border border-[#D1D5DB] bg-white text-[#374151] text-xs font-semibold px-3.5 py-1 shadow-2xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#374151] stroke-[2.5]" /> Remote
                </span>
              )}

              <span className="rounded-full border border-[#D1D5DB] bg-white text-[#374151] text-xs font-semibold px-3.5 py-1 shadow-2xs flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#374151] stroke-[2.5]" /> {selectedJob.job.job_type}
              </span>

              <span className="rounded-full border border-[#D1D5DB] bg-white text-[#374151] text-xs font-semibold px-3.5 py-1 shadow-2xs">
                {selectedJob.job.salary}
              </span>
            </div>

            {/* ── ACTION BUTTONS: PRIMARY APPLY & SECONDARY SAVE ── */}
            <div className="flex items-center gap-3 mb-8">
              <button
                type="button"
                disabled={appliedJobs[selectedJob.job.id] || submittedOrgs[selectedJob.company.id]}
                onClick={() => handleApplyToJob(selectedJob.job, selectedJob.company)}
                className={`rounded-full px-6 sm:px-7 py-2.5 text-sm font-bold shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-98 ${
                  appliedJobs[selectedJob.job.id] || submittedOrgs[selectedJob.company.id]
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-[#1E70F9] hover:bg-[#155FD0] text-white'
                }`}
              >
                {appliedJobs[selectedJob.job.id] || submittedOrgs[selectedJob.company.id] ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Dossier Submitted</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4" />
                    <span>Submit Dossier</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleSaveJob(selectedJob.job.id)}
                className={`rounded-full border px-6 sm:px-7 py-2.5 text-sm font-bold transition cursor-pointer flex items-center gap-1.5 active:scale-98 ${
                  savedJobs[selectedJob.job.id]
                    ? 'border-[#1E70F9] bg-blue-50/80 text-[#1E70F9]'
                    : 'border-[#1E70F9] bg-white hover:bg-blue-50/40 text-[#1E70F9]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{savedJobs[selectedJob.job.id] ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            {/* ── AI MATCH CARD (INSPIRATION MATCH) ── */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 mb-8 shadow-xs">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-base sm:text-lg font-bold text-[#111827] leading-snug max-w-md">
                  Your profile and resume <span className="text-[#059669]">match</span> the required qualifications well
                </h3>

                <div className="relative shrink-0 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#1F2937] text-white flex items-center justify-center font-bold text-xs border-2 border-white -ml-3 mt-3 shadow-xs overflow-hidden">
                    <span>CA</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMatchDetails(!showMatchDetails)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-[#1F2937] shadow-xs cursor-pointer transition mb-4"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{showMatchDetails ? 'Hide match details' : 'Show match details'}</span>
              </button>

              {showMatchDetails && (
                <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 sm:p-5 mb-4 animate-fadeIn space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1E293B]">
                      Verified Skills Alignment ({selectedJob.job.match_score}%)
                    </span>
                    <span className="text-xs font-bold text-[#059669]">
                      {selectedJob.job.match_count}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#059669] rounded-full transition-all duration-500"
                      style={{ width: `${selectedJob.job.match_score}%` }}
                    />
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-2">
                      Matching Qualifications in Your Dossier:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.job.matched_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-medium flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-[#059669]" /> {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#F3F4F6] text-xs text-[#9CA3AF]">
                <span>BETA • Is this information helpful?</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFeedbackGiven('helpful')}
                    className={`p-1 rounded hover:bg-slate-100 transition cursor-pointer ${
                      feedbackGiven === 'helpful' ? 'text-[#059669] font-bold' : 'text-[#6B7280]'
                    }`}
                    title="Yes, helpful"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackGiven('not_helpful')}
                    className={`p-1 rounded hover:bg-slate-100 transition cursor-pointer ${
                      feedbackGiven === 'not_helpful' ? 'text-red-500 font-bold' : 'text-[#6B7280]'
                    }`}
                    title="Not helpful"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* ── CONTENT SECTIONS ── */}
            <div className="space-y-6 text-[#374151] text-sm sm:text-[15px] leading-relaxed">
              <div>
                <h2 className="text-xl font-bold text-[#111827] mb-3">
                  About the job
                </h2>
                <p className="whitespace-pre-line text-[#4B5563]">
                  {selectedJob.job.description}
                </p>
              </div>

              {selectedJob.job.why_join_us && selectedJob.job.why_join_us.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-[#111827] mb-2.5">
                    Why Join Us
                  </h3>
                  <ul className="space-y-2">
                    {selectedJob.job.why_join_us.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-[#4B5563]">
                        <span className="text-[#111827] font-bold select-none">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <hr className="border-[#F3F4F6] my-6" />

              <div>
                <h2 className="text-xl font-bold text-[#111827] mb-3">
                  Key Responsibilities
                </h2>
                <ul className="space-y-2.5">
                  {selectedJob.job.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[#4B5563]">
                      <span className="text-[#111827] font-bold select-none">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <hr className="border-[#F3F4F6] my-6" />

              <div>
                <h2 className="text-xl font-bold text-[#111827] mb-3">
                  Required Skills & Qualifications
                </h2>
                <ul className="space-y-2.5">
                  {selectedJob.job.qualifications.map((qual, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[#4B5563]">
                      <span className="text-[#111827] font-bold select-none">•</span>
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <hr className="border-[#F3F4F6] my-6" />

              <div>
                <h2 className="text-xl font-bold text-[#111827] mb-3">
                  Featured Benefits
                </h2>
                <ul className="space-y-2.5">
                  {selectedJob.job.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[#4B5563]">
                      <span className="text-[#059669] font-bold select-none">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <hr className="border-[#F3F4F6] my-6" />

              <div>
                <h2 className="text-xl font-bold text-[#111827] mb-4">
                  Company Information
                </h2>
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-[#111827]">
                        {selectedJob.company.name}
                      </h3>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {selectedJob.company.industry}
                      </p>
                    </div>

                    <a
                      href={selectedJob.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E70F9] hover:underline"
                    >
                      <span>Visit website</span>
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                    {selectedJob.company.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E5E7EB] text-xs">
                    <div className="flex items-center gap-2 text-[#4B5563]">
                      <Users className="w-4 h-4 text-[#6B7280]" />
                      <span>{selectedJob.company.engineers_count} Engineers</span>
                    </div>

                    <div className="flex items-center gap-2 text-[#4B5563]">
                      <Calendar className="w-4 h-4 text-[#6B7280]" />
                      <span>Founded {selectedJob.company.founded_year}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[#4B5563]">
                      <MapPin className="w-4 h-4 text-[#6B7280]" />
                      <span>{selectedJob.company.location}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-2">
                      Primary Engineering Stack:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.company.tech_stack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-lg bg-white border border-[#E5E7EB] text-[#374151] text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs text-[#6B7280]">
                      Interested in general engineering roles at {selectedJob.company.name}?
                    </span>
                    <button
                      type="button"
                      disabled={submittingOrgId === selectedJob.company.id || submittedOrgs[selectedJob.company.id]}
                      onClick={() => handleSubmitDossier(selectedJob.company)}
                      className={`text-xs font-bold px-4 py-1.5 rounded-full transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                        submittedOrgs[selectedJob.company.id]
                          ? 'bg-emerald-50 text-emerald-700'
                          : submittingOrgId === selectedJob.company.id
                          ? 'bg-blue-50 text-blue-400'
                          : 'bg-[#1E70F9] hover:bg-[#155FD0] text-white shadow-2xs'
                      }`}
                    >
                      {submittedOrgs[selectedJob.company.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Dossier Submitted</span>
                        </>
                      ) : submittingOrgId === selectedJob.company.id ? (
                        <span>Submitting...</span>
                      ) : (
                        <>
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>Submit Dossier to Team</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {selectedJob.company.roles.length > 1 && (
                <div className="pt-4">
                  <h3 className="text-base font-bold text-[#111827] mb-3">
                    Other positions at {selectedJob.company.name}
                  </h3>
                  <div className="space-y-2">
                    {selectedJob.company.roles
                      .filter((r) => r.id !== selectedJob.job.id)
                      .map((otherRole) => (
                        <div
                          key={otherRole.id}
                          onClick={() => {
                            setSelectedJob({ company: selectedJob.company, job: otherRole });
                            setShowMatchDetails(false);
                            setFeedbackGiven(null);
                          }}
                          className="p-3.5 rounded-xl border border-[#E5E7EB] hover:border-[#1E70F9] transition cursor-pointer flex items-center justify-between bg-white shadow-2xs hover:shadow-xs"
                        >
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-[#111827] block">
                              {otherRole.title}
                            </span>
                            <span className="text-[11px] text-[#6B7280]">
                              {otherRole.location} • {otherRole.salary}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                        </div>
                      ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
