import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Briefcase, 
  Sparkles, 
  ShieldCheck, 
  FileCheck2, 
  Lock, 
  AlertCircle, 
  Loader2, 
  CheckCircle2
} from 'lucide-react';

const GoogleAuthPanel = ({ mode = 'login' }) => {
  const isSignUp = mode === 'signup';
  const { user, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isGsiReady, setIsGsiReady] = useState(false);
  const [error, setError] = useState('');
  
  // Account linking state for legacy users
  const [linkingState, setLinkingState] = useState({
    required: false,
    email: '',
    credential: ''
  });
  const [linkPassword, setLinkPassword] = useState('');
  const [isLinkingLoading, setIsLinkingLoading] = useState(false);

  const googleButtonRef = useRef(null);

  // If already authenticated, redirect to workspace
  useEffect(() => {
    if (user) {
      navigate('/workspace', { replace: true });
    }
  }, [user, navigate]);

  // Handle Google Credential Response
  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      setError('No credential received from Google. Please try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await loginWithGoogle(response.credential);
      if (result && result.success) {
        navigate('/workspace');
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.code === 'ACCOUNT_LINKING_REQUIRED' || errData?.linkingRequired) {
        setLinkingState({
          required: true,
          email: errData.email || 'your account',
          credential: response.credential
        });
        setError('');
      } else if (errData?.code === 'GOOGLE_ACCOUNT_CONFLICT') {
        setError('This email is already associated with another Google account.');
      } else if (errData?.code === 'EMAIL_NOT_VERIFIED') {
        setError('Your Google email address is not verified by Google.');
      } else if (errData?.code === 'INVALID_CREDENTIAL') {
        setError('Google sign-in token is invalid or expired. Please try again.');
      } else {
        setError(errData?.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Password for Legacy Account Linking
  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!linkPassword) {
      setError('Please enter your existing password to verify ownership.');
      return;
    }

    setIsLinkingLoading(true);
    setError('');

    try {
      const result = await loginWithGoogle(linkingState.credential, linkPassword);
      if (result && result.success) {
        navigate('/workspace');
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.code === 'INVALID_LINKING_PASSWORD') {
        setError('Incorrect password. Please enter the correct password for your existing account.');
      } else {
        setError(errData?.message || 'Account linking failed. Please try again.');
      }
    } finally {
      setIsLinkingLoading(false);
    }
  };

  const handleCancelLinking = () => {
    setLinkingState({ required: false, email: '', credential: '' });
    setLinkPassword('');
    setError('');
  };

  const handleCredentialResponseRef = useRef(handleCredentialResponse);
  handleCredentialResponseRef.current = handleCredentialResponse;

  // Initialize Google Identity Services
  useEffect(() => {
    let isMounted = true;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError('Google Client ID is missing. Please configure VITE_GOOGLE_CLIENT_ID.');
      return;
    }

    const renderButton = () => {
      if (!window.google?.accounts?.id || !isMounted) return false;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (res) => handleCredentialResponseRef.current?.(res),
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleButtonRef.current && isMounted) {
          googleButtonRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            type: 'standard',
            shape: 'rectangular',
            theme: 'outline',
            text: isSignUp ? 'signup_with' : 'continue_with',
            size: 'large',
            logo_alignment: 'left',
            width: 320,
          });
        }
        setIsGsiReady(true);
        return true;
      } catch (err) {
        console.error('[GIS Initialization Error]:', err);
        return false;
      }
    };

    if (window.google?.accounts?.id) {
      renderButton();
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (renderButton() || attempts >= 30) {
          clearInterval(interval);
        }
      }, 100);

      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [isSignUp]);

  const handleManualTrigger = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google Sign-In is still loading. Please refresh the page if this persists.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center bg-slate-50/60 py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-3.5rem)]">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Brand & Value Proposition (Desktop/Laptop friendly) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>AI-Powered Resume & Job Fit Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {isSignUp ? (
              <>
                Land interviews faster with <br className="hidden sm:inline" />
                <span className="text-indigo-600">AI job alignment.</span>
              </>
            ) : (
              <>
                Welcome back to <br className="hidden sm:inline" />
                <span className="text-indigo-600">MatchAI Workspace.</span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
            Analyze your resume against any job description, uncover critical skill gaps, rewrite bullets for ATS readability, and build job-ready resumes in minutes.
          </p>

          {/* Key Value Highlights */}
          <div className="pt-2 space-y-4 max-w-lg">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-md bg-indigo-100/70 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <FileCheck2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Instant Compatibility Score</h4>
                <p className="text-xs text-slate-500">Benchmark your resume against job requirements with precise scoring.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-md bg-indigo-100/70 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">AI Keyword & Skill Gap Insights</h4>
                <p className="text-xs text-slate-500">Identify missing keywords and get actionable improvement recommendations.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-md bg-indigo-100/70 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Secure & Verified Authentication</h4>
                <p className="text-xs text-slate-500">Fast, passwordless sign-in verified directly by Google Identity Services.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Powered by Google Gemini AI • Zero data sharing</span>
          </div>
        </div>

        {/* Right Column: Google Authentication Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 lg:p-10 w-full transition-all">
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 mb-4">
                <Briefcase className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {isSignUp ? 'Create your account' : 'Sign in to MatchAI'}
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
                {isSignUp 
                  ? 'Start matching your resume with top opportunities' 
                  : 'Continue to access your resume analysis workspace'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div role="alert" className="mb-6 p-3.5 bg-red-50 border border-red-200/80 rounded-xl text-red-700 text-sm flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs sm:text-sm leading-relaxed">{error}</div>
              </div>
            )}

            {/* Account Linking Modal/Form (When legacy email account with password is detected) */}
            {linkingState.required ? (
              <div className="space-y-5 py-2">
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-amber-800 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 font-semibold mb-1 text-amber-900">
                    <Lock className="h-4 w-4 text-amber-600" />
                    <span>Existing Account Detected</span>
                  </div>
                  <p className="leading-relaxed">
                    An account for <strong className="font-semibold text-amber-900">{linkingState.email}</strong> already exists with password sign-in.
                  </p>
                  <p className="mt-1 leading-relaxed text-amber-700">
                    To link your Google identity and keep all your saved resume drafts, please verify your existing account password:
                  </p>
                </div>

                <form onSubmit={handleLinkSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="linking-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Account Password
                    </label>
                    <input
                      id="linking-password"
                      type="password"
                      required
                      value={linkPassword}
                      onChange={(e) => setLinkPassword(e.target.value)}
                      placeholder="Enter your existing password"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isLinkingLoading}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 shadow-sm transition-colors"
                    >
                      {isLinkingLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Linking Account...</span>
                        </>
                      ) : (
                        <span>Verify & Link Account</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelLinking}
                      disabled={isLinkingLoading}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Standard Google-Only Sign-In Section */
              <div className="space-y-5">
                
                {/* Google Button Container */}
                <div className="flex flex-col items-center justify-center min-h-[50px] relative">
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/90 z-20 flex items-center justify-center rounded-lg gap-2 text-sm font-medium text-indigo-600">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Verifying with Google...</span>
                    </div>
                  )}

                  {/* Render target for official Google Identity Services button */}
                  <div 
                    ref={googleButtonRef} 
                    className="flex justify-center w-full min-h-[44px]"
                    style={{ minHeight: '44px' }}
                  />

                  {/* Fallback button shown if GSI is still loading */}
                  {!isGsiReady && !isLoading && (
                    <button
                      type="button"
                      onClick={handleManualTrigger}
                      className="w-full max-w-[320px] flex items-center justify-center gap-3 px-4 py-2.5 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm transition-all"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>{isSignUp ? 'Sign up with Google' : 'Continue with Google'}</span>
                    </button>
                  )}
                </div>

                {/* Features & Security assurance */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  <span>Google-verified sign in • No password required</span>
                </div>

                {/* Route Switcher Link */}
                <div className="text-center pt-2 text-sm text-slate-500">
                  {isSignUp ? (
                    <>
                      Already have an account?{' '}
                      <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                        Sign in
                      </Link>
                    </>
                  ) : (
                    <>
                      New to MatchAI?{' '}
                      <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                        Create an account
                      </Link>
                    </>
                  )}
                </div>

              </div>
            )}

            {/* Legal / Terms */}
            <p className="mt-8 text-center text-xs text-slate-400 leading-normal">
              By continuing, you agree to MatchAI's{' '}
              <span className="text-slate-500 hover:text-slate-700 cursor-pointer">Terms of Service</span>{' '}
              and{' '}
              <span className="text-slate-500 hover:text-slate-700 cursor-pointer">Privacy Policy</span>.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default GoogleAuthPanel;
