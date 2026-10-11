import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Check, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, verifyResetToken } = useContext(AuthContext);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Token validation state on mount
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [tokenError, setTokenError] = useState('');

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate reset token upon mount
  useEffect(() => {
    let isMounted = true;

    const checkToken = async () => {
      if (!token) {
        if (isMounted) {
          setIsTokenValid(false);
          setTokenError('No password reset token was provided.');
          setIsVerifyingToken(false);
        }
        return;
      }

      try {
        if (verifyResetToken) {
          await verifyResetToken(token);
        }
        if (isMounted) {
          setIsTokenValid(true);
          setIsVerifyingToken(false);
        }
      } catch (err) {
        if (isMounted) {
          setIsTokenValid(false);
          setTokenError(
            err.response?.data?.message || 
            'This password reset link is invalid or has expired. Please request a new link.'
          );
          setIsVerifyingToken(false);
        }
      }
    };

    checkToken();

    return () => {
      isMounted = false;
    };
  }, [token, verifyResetToken]);

  // Live password validation checklist
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isPasswordValid) {
      setFormError('Please fulfill all password requirements before proceeding.');
      return;
    }

    if (!passwordsMatch) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, password, confirmPassword);
      setIsSuccess(true);
      // Seamlessly redirect to /login with confirmation message
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            message: 'Your password has been reset successfully. Please log in with your new password.'
          }
        });
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setFormError(msg);
      if (err.response?.data?.code === 'INVALID_OR_EXPIRED_TOKEN') {
        setIsTokenValid(false);
        setTokenError(msg);
      }
    } finally {
      setIsSubmitting(false);
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
              Reset Your Password
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Create a new secure password for your MatchAI account.
            </p>
          </div>

          {/* Loading verification state */}
          {isVerifyingToken && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 text-sm">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <span>Verifying reset link security...</span>
            </div>
          )}

          {/* Invalid or Expired Token View */}
          {!isVerifyingToken && !isTokenValid && (
            <div className="space-y-6">
              <div role="alert" className="p-4 rounded-xl text-sm bg-amber-50 border border-amber-200 text-amber-800 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-amber-900">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  <span>Invalid or Expired Link</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-amber-800">
                  {tokenError || 'This password reset link is invalid or has expired.'}
                </p>
                <p className="text-xs text-amber-700 pt-1">
                  Password reset links expire after 20 minutes and can only be used once for security.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  to="/forgot-password"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Request a New Reset Link</span>
                </Link>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Success Notification View */}
          {!isVerifyingToken && isTokenValid && isSuccess && (
            <div className="py-6 space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Password Reset Successfully!</h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Redirecting you to login with your new credentials...
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  state={{ message: 'Your password has been reset successfully. Please log in with your new password.' }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  <span>Go to Login</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Valid Token Reset Form */}
          {!isVerifyingToken && isTokenValid && !isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Form Error */}
              {formError && (
                <div role="alert" className="p-3.5 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
                  <div className="flex-1 text-xs sm:text-sm leading-relaxed">{formError}</div>
                </div>
              )}

              {/* New Password Input */}
              <div>
                <label 
                  htmlFor="reset-password" 
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="reset-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label 
                  htmlFor="reset-confirm-password" 
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Live Password Strength Checklist */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-600">
                <div className="font-medium text-slate-700 mb-1">Password Requirements:</div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {hasMinLength ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {hasUppercase ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>One uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {hasLowercase ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>One lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {hasNumber ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>One number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {hasSpecial ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>One special character (@$!%*?&)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {passwordsMatch ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !isPasswordValid || !passwordsMatch}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 shadow-sm transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Cancel / Back to Login */}
              <div className="text-center pt-3 border-t border-slate-100">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 hover:underline"
                >
                  Cancel and return to login
                </Link>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default ResetPasswordPage;
