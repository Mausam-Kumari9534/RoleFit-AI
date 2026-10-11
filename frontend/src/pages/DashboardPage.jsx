import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Briefcase, 
  Plus, 
  FileText, 
  Calendar, 
  Trash2, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  Target, 
  Award, 
  ExternalLink,
  Sparkles,
  BarChart3,
  User,
  LogOut
} from 'lucide-react';

const DashboardPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/reports');
      if (res.data.success) {
        setReports(res.data.reports || []);
      }
    } catch (err) {
      console.error('Fetch reports error:', err);
      setError('Unable to load your analysis history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id) => {
    setDeleting(true);
    try {
      const res = await axios.delete(`/api/reports/${id}`);
      if (res.data.success) {
        setReports(prev => prev.filter(r => r._id !== id));
        setDeleteId(null);
      }
    } catch (err) {
      console.error('Delete report error:', err);
      alert('Failed to delete report. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Compute real metrics strictly from existing reports
  const totalReports = reports.length;
  const highestScore = totalReports > 0 ? Math.max(...reports.map(r => r.matchScore || 0)) : null;
  const avgScore = totalReports > 0 ? Math.round(reports.reduce((acc, r) => acc + (r.matchScore || 0), 0) / totalReports) : null;

  return (
    <div className="min-h-screen bg-[#F0F9FF] text-[#0F172A] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header & Welcome Banner */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0284C7] uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Candidate Workspace</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                Welcome back, {user?.fullName || 'Job Seeker'}!
              </h1>
              <p className="text-sm text-[#475569]">
                Review your saved resume match reports or run an analysis against a new job description.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/analyze"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369a1] shadow-xs transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Analyze Resume</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Real Summary Metrics (Only calculated from real saved reports) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs">
            <div className="flex items-center justify-between text-[#475569] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Reports</span>
              <FileText className="h-4 w-4 text-[#0284C7]" />
            </div>
            <div className="text-3xl font-extrabold text-[#0F172A]">
              {loading ? '-' : totalReports}
            </div>
            <p className="text-[11px] text-[#475569] mt-1">
              Saved analyses in your workspace
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs">
            <div className="flex items-center justify-between text-[#475569] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Top Match Score</span>
              <Award className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-[#0F172A]">
              {loading ? '-' : (highestScore !== null ? `${highestScore}%` : 'N/A')}
            </div>
            <p className="text-[11px] text-[#475569] mt-1">
              Highest calculated compatibility
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs">
            <div className="flex items-center justify-between text-[#475569] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Average Compatibility</span>
              <Target className="h-4 w-4 text-[#0284C7]" />
            </div>
            <div className="text-3xl font-extrabold text-[#0F172A]">
              {loading ? '-' : (avgScore !== null ? `${avgScore}%` : 'N/A')}
            </div>
            <p className="text-[11px] text-[#475569] mt-1">
              Across all evaluated roles
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 text-sm text-red-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchReports}
              className="px-3 py-1.5 bg-white border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Analysis History Section */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">Recent Resume Analyses</h2>
              <p className="text-xs text-[#475569]">Saved reports strictly accessible to your account</p>
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="animate-pulse flex items-center justify-between p-4 border border-[#E2E8F0] rounded-xl">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                  </div>
                  <div className="h-8 bg-slate-100 rounded w-16"></div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && reports.length === 0 && (
            <div className="p-12 text-center max-w-md mx-auto space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-sky-50 border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">No resume analyses yet</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Upload your resume in PDF format and paste a job description to receive your first AI compatibility breakdown.
              </p>
              <div className="pt-2">
                <Link
                  to="/analyze"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369a1] shadow-xs transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Analyze Your First Resume</span>
                </Link>
              </div>
            </div>
          )}

          {/* Real Reports List */}
          {!loading && reports.length > 0 && (
            <div className="divide-y divide-[#E2E8F0]">
              {reports.map((report) => {
                const score = report.matchScore || 0;
                let badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                if (score >= 80) badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                else if (score >= 60) badgeColor = 'bg-sky-50 text-[#0284C7] border-sky-200';

                return (
                  <div 
                    key={report._id} 
                    className="p-6 hover:bg-[#F0F9FF]/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-bold text-[#0F172A]">
                          {report.jobTitle || 'Target Role'}
                        </h4>
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-extrabold border ${badgeColor}`}>
                          {score}% Match
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#475569]">
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

                    <div className="flex items-center gap-2.5 shrink-0">
                      <Link
                        to={`/analysis/${report._id}`}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
                      >
                        <span>View Analysis</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeleteId(report._id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete report"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
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
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#475569] hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDeleteReport(deleteId)}
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

export default DashboardPage;
