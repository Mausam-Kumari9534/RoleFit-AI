import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  KeyRound, 
  Mail, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await forgotPassword(trimmedEmail);
      setMessage(
        data.message || 
        'If an account exists for this email, a password reset link has been sent.'
      );
    } catch (err) {
      // Do not expose internal details or email service errors
      setError(
        err.response?.data?.message || 
        'Unable to process your request at this time. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center bg-slate-50/60 py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-3.5rem)]">
      <div className="w-full max-w-md">
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 w-full transition-all">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 mb-4">
              <KeyRound className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Forgot your password?
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Enter your registered email and we'll send you a password reset link.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div role="alert" className="mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1 text-xs sm:text-sm leading-relaxed">{error}</div>
            </div>
          )}

          {/* Success Message */}
          {message ? (
            <div className="space-y-6">
              <div role="status" className="p-4 rounded-xl text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-900">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>Check your inbox</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-emerald-800">
                  {message}
                </p>
                <div className="pt-2 text-xs text-emerald-700 border-t border-emerald-100/80">
                  Password reset links expire in 20 minutes. If you don't see the email, please check your spam or junk folder.
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setMessage('');
                    setEmail('');
                  }}
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Send to a different email
                </button>

                <div className="text-center pt-2">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to login</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Reset Request Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="forgot-email" 
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 shadow-sm transition-colors cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </div>

              {/* Back to Login */}
              <div className="text-center pt-4 border-t border-slate-100">
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}

          {/* Security note */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <span>Encrypted reset tokens • Single-use security</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
