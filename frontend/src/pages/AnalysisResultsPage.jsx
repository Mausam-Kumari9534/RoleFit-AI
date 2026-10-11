import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Award, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Download, 
  Plus, 
  Sparkles, 
  Clock, 
  Check, 
  AlertCircle, 
  Loader2,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';

const AnalysisResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/reports/${id}`);
      if (res.data.success) {
        setReport(res.data.report);
      } else {
        setError(res.data.error || 'Failed to retrieve report.');
      }
    } catch (err) {
      console.error('Fetch report error:', err);
      const status = err.response?.status;
      if (status === 403) {
        setError('You are not authorized to view this report. Reports are private to their owners.');
      } else if (status === 404) {
        setError('The requested report does not exist or has been deleted.');
      } else {
        setError('Unable to load report details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await axios.delete(`/api/reports/${id}`);
      if (res.data.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete report. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 text-[#0284C7] animate-spin mb-3" />
        <p className="text-sm font-semibold text-[#0F172A]">Loading Analysis Report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">Access Notice</h2>
          <p className="text-xs text-[#475569] leading-relaxed">{error || 'Report not found'}</p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369a1]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const score = report.matchScore || 0;
  let scoreBadge = 'bg-amber-50 text-amber-800 border-amber-200';
  if (score >= 80) scoreBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  else if (score >= 60) scoreBadge = 'bg-sky-50 text-[#0284C7] border-sky-200';

  const breakdown = report.atsBreakdown || { technical: 75, keyword: 70, experience: 80, format: 90 };

  return (
    <div className="min-h-screen bg-[#F0F9FF] text-[#0F172A] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0284C7] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <Link
              to="/analyze"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369a1] transition-colors shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Analysis</span>
            </Link>

            <button
              onClick={() => setDeleteModal(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
              title="Delete report"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Report Header Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0284C7] uppercase tracking-wider mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Compatibility Report</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                {report.jobTitle || 'Target Role Analysis'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#475569] mt-2">
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  {report.resumeFileName || 'resume.pdf'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {new Date(report.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Score Ring / Block */}
            <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl p-5 text-center min-w-[170px] shadow-2xs shrink-0">
              <span className="text-xs font-bold text-[#475569] block mb-1">
                Compatibility Score
              </span>
              <span className="text-4xl sm:text-5xl font-black text-[#0284C7]">
                {score}%
              </span>
              <div className="mt-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${scoreBadge}`}>
                  {score >= 80 ? 'Strong Match' : score >= 60 ? 'Moderate Match' : 'Gap Detected'}
                </span>
              </div>
            </div>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="mt-6 p-3.5 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-[#475569] leading-relaxed flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-[#0284C7] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0F172A] font-semibold">Advisory Estimate: </strong>
              {report.scoreMethodology || 'This score represents an algorithmic compatibility estimate calculated using weighted evaluation across technical skills, keywords, experience, and formatting. It is not an employer ATS prediction or a hiring guarantee.'}
            </div>
          </div>
        </div>

        {/* 4-Pillar Score Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
            <span className="text-xs text-[#475569] block mb-1">Technical Skills (40%)</span>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-[#0F172A]">{breakdown.technical}%</span>
              <span className="text-xs font-semibold text-[#0284C7]">Stack Match</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#0284C7] h-full rounded-full" style={{ width: `${breakdown.technical}%` }}></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
            <span className="text-xs text-[#475569] block mb-1">ATS Keywords (30%)</span>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-[#0F172A]">{breakdown.keyword}%</span>
              <span className="text-xs font-semibold text-sky-600">Density</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full" style={{ width: `${breakdown.keyword}%` }}></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
            <span className="text-xs text-[#475569] block mb-1">Experience Alignment (20%)</span>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-[#0F172A]">{breakdown.experience}%</span>
              <span className="text-xs font-semibold text-emerald-600">Seniority</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${breakdown.experience}%` }}></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
            <span className="text-xs text-[#475569] block mb-1">ATS Format Safety (10%)</span>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-[#0F172A]">{breakdown.format}%</span>
              <span className="text-xs font-semibold text-emerald-600">Clean Parser</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${breakdown.format}%` }}></div>
            </div>
          </div>
        </div>

        {/* Skills Analysis Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#E2E8F0] pb-4">
            <h2 className="text-lg font-bold text-[#0F172A]">Skills Analysis</h2>
            <p className="text-xs text-[#475569]">Comparison of skills found in your resume versus requirements in the job description.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Matched Skills ({report.matchedSkills?.length || 0})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {report.matchedSkills && report.matchedSkills.length > 0 ? (
                  report.matchedSkills.map((skill, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-[#475569]">No exact skills were matched.</p>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                <span>Required Skills Not Evidenced ({report.missingSkills?.length || 0})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {report.missingSkills && report.missingSkills.length > 0 ? (
                  report.missingSkills.map((item, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <span>{item.skill || item}</span>
                      {item.priority && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-normal">
                          {item.priority}
                        </span>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-[#475569]">No major required skills missing!</p>
                )}
              </div>
            </div>
          </div>

          {/* Partially matched skills */}
          {report.partiallyMatchedSkills && report.partiallyMatchedSkills.length > 0 && (
            <div className="pt-4 border-t border-[#E2E8F0]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0284C7] mb-2">
                Partially Demonstrated / Related Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {report.partiallyMatchedSkills.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Keyword Analysis Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#E2E8F0] pb-4">
            <h2 className="text-lg font-bold text-[#0F172A]">ATS Keyword Analysis</h2>
            <p className="text-xs text-[#475569]">Important keywords extracted from the target job posting.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-xs font-bold text-[#0F172A] block mb-2">Keywords Found in Resume</span>
              <div className="flex flex-wrap gap-1.5">
                {report.keywordAnalysis?.foundKeywords?.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-50 text-[#0F172A] border border-[#E2E8F0] rounded-md text-xs font-medium">
                    ✓ {kw}
                  </span>
                )) || <p className="text-xs text-[#475569]">None identified</p>}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-amber-700 block mb-2">Missing Priority Keywords</span>
              <div className="flex flex-wrap gap-1.5">
                {report.keywordAnalysis?.missingKeywords?.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-md text-xs font-medium">
                    + {kw}
                  </span>
                )) || <p className="text-xs text-[#475569]">All major keywords present</p>}
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations & Action Plan */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#E2E8F0] pb-4">
            <h2 className="text-lg font-bold text-[#0F172A]">Actionable Recommendations</h2>
            <p className="text-xs text-[#475569]">Grounded strictly in your actual qualifications to improve recruiter clarity.</p>
          </div>

          {report.recommendations && report.recommendations.length > 0 && (
            <div className="space-y-3">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="p-4 bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl text-xs text-[#0F172A] flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          )}

          {/* Bullet Point Rewrites */}
          {report.rewrites && report.rewrites.length > 0 && (
            <div className="pt-4 border-t border-[#E2E8F0] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0284C7]">
                Suggested Bullet Point Optimizations
              </h3>
              <div className="space-y-4">
                {report.rewrites.map((rw, i) => (
                  <div key={i} className="border border-[#E2E8F0] rounded-xl overflow-hidden text-xs">
                    <div className="p-3 bg-red-50/50 border-b border-[#E2E8F0] text-[#475569]">
                      <strong className="text-red-700 block text-[10px] uppercase font-bold mb-0.5">Original</strong>
                      {rw.before}
                    </div>
                    <div className="p-3 bg-emerald-50/50 text-[#0F172A]">
                      <strong className="text-emerald-700 block text-[10px] uppercase font-bold mb-0.5">AI Enhanced</strong>
                      {rw.after}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recruiter Verdict / Decision */}
          {report.applyDecision && (
            <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl gap-3">
              <div>
                <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Application Recommendation</span>
                <span className="text-sm font-extrabold text-[#0F172A]">{report.applyDecision.decision}</span>
                {report.applyDecision.reason && (
                  <p className="text-xs text-[#475569] mt-0.5">{report.applyDecision.reason}</p>
                )}
              </div>
              <Link
                to="/analyze"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0284C7] text-white rounded-lg text-xs font-semibold hover:bg-[#0369a1] shrink-0"
              >
                <span>Analyze Another Job</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-lg border border-[#E2E8F0] space-y-4">
            <h4 className="text-base font-bold text-[#0F172A]">Delete this analysis report?</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              This action cannot be undone. All extracted insights and scores for this report will be permanently removed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#475569] hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AnalysisResultsPage;
