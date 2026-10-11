import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Target, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Search, 
  ChevronDown, 
  Briefcase, 
  UploadCloud, 
  Layers, 
  Check, 
  XCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const [openFaq, setOpenFaq] = useState(0);
  const [activePreviewTab, setActivePreviewTab] = useState('score');

  const faqs = [
    {
      question: 'How is the compatibility score calculated?',
      answer: 'JobFit AI calculates your score using a documented 4-pillar methodology: Technical Skills Alignment (40%), ATS Keyword Coverage (30%), Role Experience Relevance (20%), and Format Readability (10%). It represents an advisory compatibility estimate, not an employer ATS prediction.'
    },
    {
      question: 'What file formats are supported in Phase 1?',
      answer: 'Phase 1 supports PDF documents up to 5MB. Ensure your PDF contains selectable text rather than flat scanned images so our parser can accurately extract your experience.'
    },
    {
      question: 'How is my personal data and resume protected?',
      answer: 'Your resume is processed in ephemeral server memory and is never exposed through public URLs. Saved reports are protected by server-side resource ownership so only your authenticated account can ever view them.'
    },
    {
      question: 'Why does JobFit AI use Google-only authentication?',
      answer: 'Google Identity Services provides fast, verified, passwordless sign-in. You never need to remember passwords or worry about credential compromises.'
    },
    {
      question: 'Does the AI fabricate qualifications or work history?',
      answer: 'No. JobFit AI is explicitly constrained to suggest enhancements grounded strictly in your existing work experience, projects, and skills. We do not invent companies, degrees, or certifications.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F9FF] text-[#0F172A] selection:bg-sky-200 selection:text-sky-900">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#BAE6FD] text-[#0284C7] shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-[#0284C7]" />
              <span>AI Resume & Job Description Compatibility</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-[1.12]">
              Make Your Resume <br className="hidden sm:inline" />
              <span className="text-[#0284C7]">Work Smarter.</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#475569] leading-relaxed max-w-xl">
              Compare your resume with a job description, discover skill gaps, and get actionable AI-powered recommendations.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                to={user ? "/analyze" : "/login"}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-[#0284C7] hover:bg-[#0369a1] shadow-sm shadow-sky-200 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Analyze My Resume</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-base font-semibold text-[#0F172A] bg-white hover:bg-slate-50 border border-[#E2E8F0] shadow-2xs transition-all"
              >
                Explore Features
              </a>
            </div>

            {/* Micro reassurance */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#475569]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>PDF upload support</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Google-verified sign in</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Private & ephemeral processing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Polished Product Illustration (Lightweight CSS 3D & cards) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md w-full transition-all">
              
              {/* Back Card: Sample Job Description Match Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-6 space-y-4">
                
                {/* Header score badge */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7]">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0F172A]">Senior Frontend Engineer</h4>
                      <p className="text-[11px] text-[#475569]">Target Position</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-extrabold text-[#0284C7]">86%</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Strong Match</span>
                  </div>
                </div>

                {/* Score Breakdown Bars */}
                <div className="space-y-2 pt-1 text-xs">
                  <div>
                    <div className="flex justify-between text-[#475569] mb-1">
                      <span>Technical Skills Alignment (40%)</span>
                      <span className="font-semibold text-[#0F172A]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0284C7] rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#475569] mb-1">
                      <span>ATS Keyword Coverage (30%)</span>
                      <span className="font-semibold text-[#0F172A]">82%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#475569] mb-1">
                      <span>Experience Relevance (20%)</span>
                      <span className="font-semibold text-[#0F172A]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Skills tags preview */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-[#475569] block mb-1.5">Matched Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <Check className="h-3 w-3" /> React 19
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <Check className="h-3 w-3" /> TypeScript
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Tailwind CSS
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-amber-600" /> Docker
                    </span>
                  </div>
                </div>

                {/* Recommendation snippet */}
                <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-3 text-xs text-[#0F172A]">
                  <div className="flex items-center gap-1.5 font-semibold text-[#0284C7] mb-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Actionable Recommendation</span>
                  </div>
                  <p className="text-[11px] text-[#475569] leading-relaxed">
                    Quantify component performance optimizations in your work history to boost role alignment.
                  </p>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2. PRODUCT PREVIEW SECTION */}
      <section id="preview" className="py-16 md:py-24 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold tracking-wider uppercase text-[#0284C7] mb-2">
              Product Preview
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
              Inside a Genuine JobFit AI Report
            </h3>
            <p className="text-sm text-[#475569] mt-2">
              Every analysis breaks down your resume into actionable, recruiter-focused dimensions.
            </p>
          </div>

          {/* Interactive Preview Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 bg-[#F0F9FF] border border-[#E2E8F0] rounded-xl">
              <button
                type="button"
                onClick={() => setActivePreviewTab('score')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activePreviewTab === 'score'
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                1. Compatibility Score
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('skills')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activePreviewTab === 'skills'
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                2. Skill Gap Diagnosis
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('rewrites')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activePreviewTab === 'rewrites'
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                3. Bullet Rewrites
              </button>
            </div>
          </div>

          {/* Tab Content Cards */}
          <div className="bg-[#F0F9FF] rounded-2xl border border-[#BAE6FD] p-6 sm:p-8 max-w-4xl mx-auto shadow-sm">
            {activePreviewTab === 'score' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 text-center p-6 bg-white rounded-xl border border-[#E2E8F0]">
                  <span className="text-5xl font-black text-[#0284C7] block">84%</span>
                  <span className="text-sm font-bold text-[#0F172A] mt-2 block">Match Score</span>
                  <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                    Weighted evaluation across technical skills, ATS keywords, and project experience.
                  </p>
                </div>
                <div className="md:col-span-7 space-y-3">
                  <h4 className="text-sm font-bold text-[#0F172A]">Documented Calculation Breakdown</h4>
                  <div className="bg-white p-3 rounded-lg border border-[#E2E8F0] flex justify-between text-xs">
                    <span className="text-[#475569]">Technical Stack Match (40% weight)</span>
                    <strong className="text-[#0284C7]">88%</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#E2E8F0] flex justify-between text-xs">
                    <span className="text-[#475569]">ATS Keyword Density (30% weight)</span>
                    <strong className="text-[#0284C7]">80%</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#E2E8F0] flex justify-between text-xs">
                    <span className="text-[#475569]">Role Experience Alignment (20% weight)</span>
                    <strong className="text-[#0284C7]">85%</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#E2E8F0] flex justify-between text-xs">
                    <span className="text-[#475569]">Format & Structure Safety (10% weight)</span>
                    <strong className="text-[#0284C7]">95%</strong>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'skills' && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Confirmed Skills Found in Resume</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['JavaScript', 'React.js', 'Node.js', 'PostgreSQL', 'REST APIs', 'Git', 'CSS3/Tailwind'].map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#BAE6FD]">
                  <h4 className="text-sm font-bold text-[#0F172A] mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Missing Skills Identified from Job Description</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs font-semibold">
                      Kubernetes • Critical
                    </span>
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold">
                      AWS Lambda • Important
                    </span>
                    <span className="px-2.5 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold">
                      Redis • Optional
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'rewrites' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block mb-1">
                    Original Bullet (Weak Impact)
                  </span>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    "Responsible for developing front-end features and fixing bugs on the web portal."
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                    AI Optimized Bullet (Actionable & Quantified)
                  </span>
                  <p className="text-xs text-[#0F172A] font-medium leading-relaxed">
                    "Engineered 12+ responsive user-facing React interfaces, improving lighthouse performance by 28% and resolving 40+ high-priority frontend issues."
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 3. REAL PROBLEMS JOBFIT AI SOLVES */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold tracking-wider uppercase text-[#0284C7] mb-2">
            The Problem
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
            Why Qualified Job Seekers Get Filtered Out
          </h3>
          <p className="text-sm text-[#475569] mt-2">
            Most rejections happen before a human recruiter even reads your profile.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              01
            </div>
            <h4 className="text-base font-bold text-[#0F172A]">The ATS Black Hole</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Automated Applicant Tracking Systems discard resumes missing verbatim industry keywords and credentials.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              02
            </div>
            <h4 className="text-base font-bold text-[#0F172A]">Generic Resumes</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Sending one standard resume to 50 distinct job postings leads to low match rates and silent rejections.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center font-bold">
              03
            </div>
            <h4 className="text-base font-bold text-[#0F172A]">Subjective Guessing</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Candidates struggle to objectively evaluate whether their experience satisfies a job listing's must-have requirements.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              04
            </div>
            <h4 className="text-base font-bold text-[#0F172A]">Zero Actionable Feedback</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Automated rejection emails never explain what skills or experience were missing from your resume.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-16 md:py-24 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold tracking-wider uppercase text-[#0284C7] mb-2">
              Workflow
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
              How JobFit AI Works in 3 Simple Steps
            </h3>
            <p className="text-sm text-[#475569] mt-2">
              Get recruiter-level feedback in under 30 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#F0F9FF] p-6 rounded-2xl border border-[#BAE6FD] text-left space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#0284C7] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-base font-bold text-[#0F172A]">Upload Your Resume</h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Upload your resume in PDF format. We safely extract text in ephemeral memory without saving raw files.
              </p>
            </div>

            <div className="bg-[#F0F9FF] p-6 rounded-2xl border border-[#BAE6FD] text-left space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#0284C7] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-base font-bold text-[#0F172A]">Add Job Description</h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Paste the full target job posting from LinkedIn, Indeed, or the employer portal to set the benchmark.
              </p>
            </div>

            <div className="bg-[#F0F9FF] p-6 rounded-2xl border border-[#BAE6FD] text-left space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#0284C7] text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-base font-bold text-[#0F172A]">Review AI Results</h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Receive an objective compatibility score, uncover missing keywords, and follow concrete bullet rewrites.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. CORE FEATURES */}
      <section id="features" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold tracking-wider uppercase text-[#0284C7] mb-2">
            Capabilities
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
            Core Features Built for Career Success
          </h3>
          <p className="text-sm text-[#475569] mt-2">
            Every tool is designed to make your application stand out to both algorithms and hiring managers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-[#0F172A]">Deep Semantic Matching</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Analyzes context rather than raw word frequency alone to understand true experience overlap.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-[#0F172A]">Skill Gap Diagnosis</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Highlights both critical must-haves and nice-to-have competencies not evidenced in your resume.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-[#0F172A]">ATS Keyword Optimization</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Extracts high-impact terminology directly from the job spec so your resume navigates automated filters.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-[#0F172A]">Actionable Bullet Rewrites</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Transforms passive task descriptions into quantifiable achievements with strong active verbs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-[#0F172A]">Privacy-First Storage</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Strict server-side ownership. Your reports belong exclusively to you, and resume text is never shared.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-[#0F172A]">Recruiter Perspective</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Receives a final verdict and application decision checklist so you know whether to apply immediately.
            </p>
          </div>
        </div>
      </section>

      {/* 6. ILLUSTRATIVE ANALYSIS EXAMPLE */}
      <section className="py-16 md:py-24 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold tracking-wider uppercase text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block mb-2">
              Illustrative Demo Data
            </span>
            <h3 className="text-2xl font-extrabold text-[#0F172A]">
              Sample Full-Stack Engineer Analysis
            </h3>
            <p className="text-xs text-[#475569] mt-1">
              Example of how findings are structured and presented to candidates.
            </p>
          </div>

          <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#BAE6FD] gap-4">
              <div>
                <span className="text-xs text-[#475569]">Target Position:</span>
                <h4 className="text-lg font-bold text-[#0F172A]">Full-Stack React & Node Developer</h4>
                <p className="text-xs text-[#475569] mt-0.5">Resume File: alex_morgan_resume.pdf</p>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-[#E2E8F0]">
                <div className="text-right">
                  <span className="text-xs text-[#475569] block leading-none">Compatibility</span>
                  <span className="text-xl font-black text-[#0284C7]">82%</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  Qualified
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
                <span className="font-bold text-[#0F172A] block mb-2">Matched Core Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">React.js</span>
                  <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">Node.js</span>
                  <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">TypeScript</span>
                  <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">PostgreSQL</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
                <span className="font-bold text-[#0F172A] block mb-2">Missing Priority Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-red-50 text-red-800 px-2 py-0.5 rounded border border-red-200">Docker (Critical)</span>
                  <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">Redis (Important)</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] text-xs">
              <span className="font-bold text-[#0284C7] block mb-1">Key Recommendation</span>
              <p className="text-[#475569] leading-relaxed">
                Add containerization or deployment experience with Docker in your projects section to meet the infrastructure requirement.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="bg-white rounded-3xl border border-[#BAE6FD] p-8 sm:p-14 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Ready to Optimize Your Resume?
            </h3>
            <p className="text-base text-[#475569] leading-relaxed">
              Sign in with Google, upload your resume, and get an actionable match report in seconds.
            </p>
            <div className="pt-2">
              <Link
                to={user ? "/analyze" : "/signup"}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-semibold text-white bg-[#0284C7] hover:bg-[#0369a1] shadow-sm shadow-sky-200 transition-all hover:scale-[1.01]"
              >
                <span>Analyze My Resume Now</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section id="faq" className="py-16 md:py-24 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold tracking-wider uppercase text-[#0284C7] mb-2">
              Questions & Answers
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#F0F9FF]/50 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full px-5 py-4 text-left flex justify-between items-center text-sm font-bold text-[#0F172A] hover:text-[#0284C7] focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`h-4 w-4 text-[#475569] transition-transform ${openFaq === idx ? 'rotate-180 text-[#0284C7]' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-[#475569] leading-relaxed border-t border-[#BAE6FD]/40 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="py-12 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#0284C7] flex items-center justify-center text-white">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="font-bold text-base text-[#0F172A]">JobFit AI</span>
              <span className="text-xs text-[#475569]">© {new Date().getFullYear()} JobFit AI. All rights reserved.</span>
            </div>

            <div className="flex items-center gap-6 text-xs text-[#475569]">
              <a href="#features" className="hover:text-[#0F172A]">Features</a>
              <a href="#how-it-works" className="hover:text-[#0F172A]">How It Works</a>
              <a href="#preview" className="hover:text-[#0F172A]">Product Preview</a>
              <a href="#faq" className="hover:text-[#0F172A]">FAQ</a>
              <Link to="/#terms" className="hover:text-[#0F172A]">Terms of Service</Link>
              <Link to="/#privacy" className="hover:text-[#0F172A]">Privacy Policy</Link>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
