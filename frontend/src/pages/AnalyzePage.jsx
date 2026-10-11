import React, { useState, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  UploadCloud, 
  FileText, 
  X, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft,
  Briefcase,
  ShieldCheck
} from 'lucide-react';

const AnalyzePage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  const steps = [
    'Parsing PDF text and structure in ephemeral memory...',
    'Mining job requirements and industry keywords...',
    'Running semantic comparison and scoring with Gemini AI...',
    'Finalizing compatibility breakdown and saving report...'
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    
    // Check file type
    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setError('Only PDF resumes are supported in Phase 1.');
      return false;
    }

    // Check file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Resume file exceeds the 5MB size limit.');
      return false;
    }

    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (validateFile(dropped)) {
      setFile(dropped);
      setError('');
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (validateFile(selected)) {
      setFile(selected);
      setError('');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please upload your resume in PDF format.');
      return;
    }

    const trimmedJd = jobDescription.trim();
    if (!trimmedJd) {
      setError('Please provide the target job description.');
      return;
    }

    if (trimmedJd.length < 50) {
      setError('Job description is too brief. Please paste at least 50 characters.');
      return;
    }

    if (trimmedJd.length > 15000) {
      setError('Job description exceeds 15,000 characters limit.');
      return;
    }

    setLoading(true);
    setLoadingStep(0);

    // Multi-step animated progress simulation
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2800);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', trimmedJd);

    try {
      const response = await axios.post('/api/analyze-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearInterval(interval);

      if (response.data?.success && response.data?.reportId) {
        navigate(`/analysis/${response.data.reportId}`);
      } else {
        setError(response.data?.error || 'Analysis failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      clearInterval(interval);
      console.error('Analysis error:', err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Server error occurred during analysis. Please try again.';
      setError(errMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] text-[#0F172A] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0284C7] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0284C7] uppercase tracking-wider mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Compatibility Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
            Analyze Resume Against Job Description
          </h1>
          <p className="text-sm text-[#475569] mt-1.5 leading-relaxed">
            Upload your resume and paste the target job requirements to calculate your compatibility score, detect missing keywords, and get tailored recommendations.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Step 1: Upload Resume Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-sky-100 text-[#0284C7] text-xs font-extrabold flex items-center justify-center">1</span>
                  <span>Upload Resume (PDF)</span>
                </h2>
                <p className="text-xs text-[#475569] mt-0.5">
                  Phase 1 supports PDF format up to 5MB. Must contain selectable text.
                </p>
              </div>
            </div>

            {/* Dropzone */}
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#0284C7] bg-sky-50'
                    : 'border-[#BAE6FD] bg-[#F0F9FF]/60 hover:bg-[#F0F9FF] hover:border-[#0284C7]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="mx-auto h-12 w-12 rounded-xl bg-white border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center mb-3 shadow-2xs">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-[#0F172A]">
                  Click to select a PDF or drag and drop here
                </h4>
                <p className="text-xs text-[#475569] mt-1">
                  Maximum file size: 5MB • Ephemeral memory parsing only
                </p>
              </div>
            ) : (
              <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A] truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </h4>
                    <span className="text-[11px] text-[#475569]">
                      {(file.size / 1024).toFixed(1)} KB • PDF Document
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white transition-colors"
                  title="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Target Job Description Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-sky-100 text-[#0284C7] text-xs font-extrabold flex items-center justify-center">2</span>
                  <span>Target Job Description</span>
                </h2>
                <p className="text-xs text-[#475569] mt-0.5">
                  Paste the requirements, responsibilities, and qualifications from the job posting.
                </p>
              </div>
              <span className="text-xs text-[#475569]">
                {jobDescription.length.toLocaleString()} / 15,000 chars
              </span>
            </div>

            <textarea
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer:
We are looking for an experienced software engineer with strong React, TypeScript, and modern CSS expertise. 
Requirements:
- 4+ years of professional web development experience
- Solid proficiency in React, TypeScript, REST APIs, and state management
- Familiarity with CI/CD, testing (Jest, Cypress), and cloud services..."
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] text-sm shadow-2xs placeholder-[#475569]/50 focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-transparent transition-all"
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs sm:text-sm leading-relaxed">{error}</div>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-[#475569]">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Strict data privacy: Resumes are processed in ephemeral memory.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white bg-[#0284C7] hover:bg-[#0369a1] disabled:opacity-50 shadow-xs transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Analyze Resume</span>
                </>
              )}
            </button>
          </div>

          {/* Loading Progress State */}
          {loading && (
            <div className="bg-white rounded-2xl border border-[#BAE6FD] p-6 text-center space-y-4 shadow-sm animate-in fade-in duration-300">
              <div className="mx-auto h-12 w-12 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">
                Evaluating Your Resume Alignment
              </h3>
              <p className="text-xs text-[#0284C7] font-medium transition-all">
                {steps[loadingStep]}
              </p>
              <div className="w-full max-w-md mx-auto bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#0284C7] h-full transition-all duration-700 ease-out"
                  style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          )}

        </form>

      </div>
    </div>
  );
};

export default AnalyzePage;
