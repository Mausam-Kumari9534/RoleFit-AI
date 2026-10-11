import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, AlertCircle, Loader2, Sparkles, CheckCircle2, FileCheck2, Target, Zap } from 'lucide-react';

const SignupPage = () => {
  const { user, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isGsiReady, setIsGsiReady] = useState(false);
  const [error, setError] = useState('');
  
  const googleBtnRef = useRef(null);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      setError('Unable to receive credentials from Google. Please try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await loginWithGoogle(response.credential);
      if (result && result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result?.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Google signup error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Signup failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialResponseRef = useRef(handleCredentialResponse);
  handleCredentialResponseRef.current = handleCredentialResponse;

  useEffect(() => {
    let isMounted = true;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError('Google Client ID is not configured on the client.');
      return;
    }

    const initGsi = () => {
      if (!window.google?.accounts?.id || !isMounted) return false;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (res) => handleCredentialResponseRef.current?.(res),
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleBtnRef.current && isMounted) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            shape: 'rectangular',
            theme: 'outline',
            text: 'signup_with',
            size: 'large',
            logo_alignment: 'left',
            width: 320,
          });
        }
        setIsGsiReady(true);
        return true;
      } catch (e) {
        console.error('GIS Error:', e);
        return false;
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const timer = setInterval(() => {
        if (initGsi()) {
          clearInterval(timer);
        }
      }, 150);
      return () => {
        isMounted = false;
        clearInterval(timer);
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleManualTrigger = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google Identity Services is still loading. Please refresh.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md">
        
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-11 w-11 rounded-xl bg-[#0284C7] flex items-center justify-center text-white shadow-sm shadow-sky-200 group-hover:scale-105 transition-transform">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="text-left">
              <span className="font-bold text-xl tracking-tight text-[#0F172A] block leading-none">
                JobFit AI
              </span>
              <span className="text-[11px] font-medium text-[#0284C7] tracking-wider uppercase">
                Career Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 sm:p-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-[#0284C7] border border-sky-100 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Fast Google Setup</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Start Your Career Journey.
          </h1>
          <p className="text-sm text-[#475569] mt-2 mb-6 leading-relaxed">
            Create an account to compare your resume with real job postings and unlock AI-powered ATS optimizations.
          </p>

          {/* Quick value props */}
          <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-3.5 mb-6 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#0F172A] font-medium">
              <FileCheck2 className="h-4 w-4 text-[#0284C7] shrink-0" />
              <span>Instant ATS Compatibility Score</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#0F172A] font-medium">
              <Target className="h-4 w-4 text-[#0284C7] shrink-0" />
              <span>Uncover critical missing skills & keywords</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#0F172A] font-medium">
              <Zap className="h-4 w-4 text-[#0284C7] shrink-0" />
              <span>Actionable bullet rewrites tailored to job specs</span>
            </div>
          </div>

          {error && (
            <div role="alert" className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm flex items-start gap-2.5 text-left">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 leading-normal">{error}</div>
            </div>
          )}

          {/* Google Button Container */}
          <div className="flex flex-col items-center justify-center min-h-[50px] relative mb-6">
            {isLoading && (
              <div className="absolute inset-0 bg-white/90 z-20 flex items-center justify-center rounded-lg gap-2 text-sm font-medium text-[#0284C7]">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Creating account with Google...</span>
              </div>
            )}

            <div 
              ref={googleBtnRef} 
              className="flex justify-center w-full min-h-[44px]"
              style={{ minHeight: '44px' }}
            />

            {!isGsiReady && !isLoading && (
              <button
                type="button"
                onClick={handleManualTrigger}
                className="w-full max-w-[320px] flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0284C7] shadow-xs transition-all"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign up with Google</span>
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-center gap-1.5 text-xs text-[#475569]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>No passwords to remember • 100% verified profile</span>
          </div>

          {/* Navigation link to Login */}
          <div className="mt-6 text-sm text-[#475569]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#0284C7] hover:underline">
              Sign in with Google
            </Link>
          </div>
        </div>

        {/* Footer legal links */}
        <div className="mt-8 text-center text-xs text-[#475569] space-x-4">
          <span>By continuing, you agree to JobFit AI's</span>
          <br className="sm:hidden" />
          <Link to="/#terms" className="underline hover:text-[#0F172A]">Terms of Service</Link>
          <span>•</span>
          <Link to="/#privacy" className="underline hover:text-[#0F172A]">Privacy Policy</Link>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;
