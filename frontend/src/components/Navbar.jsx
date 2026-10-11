import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, User, LogOut, Menu, X, ArrowRight, LayoutDashboard, FileText } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Do not render navbar on dedicated full-screen auth pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  const isHome = location.pathname === '/';
  const isDashboard = location.pathname === '/dashboard';
  const isAnalyze = location.pathname === '/analyze';

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (isHome) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Brand Wordmark */}
          <div className="flex items-center gap-6 lg:gap-10">
            <Link 
              to="/" 
              className="flex items-center gap-2.5 text-[#0F172A] hover:opacity-90 transition-opacity group shrink-0"
            >
              <div className="h-9 w-9 rounded-xl bg-[#0284C7] flex items-center justify-center text-white shadow-sm shadow-sky-100 group-hover:scale-105 transition-transform">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-[#0F172A] leading-none">
                  JobFit AI
                </span>
                <span className="text-[10px] font-semibold text-[#0284C7] tracking-wider uppercase mt-0.5">
                  Career Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <button
                type="button"
                onClick={() => handleNavClick('features')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-sky-50 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('how-it-works')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-sky-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('preview')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-sky-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Product Preview
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('faq')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-sky-50 transition-colors cursor-pointer"
              >
                FAQ
              </button>

              {user && (
                <>
                  <span className="text-slate-300">|</span>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                      isDashboard 
                        ? 'text-[#0284C7] bg-sky-50 font-semibold' 
                        : 'text-[#475569] hover:text-[#0F172A] hover:bg-sky-50'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/analyze"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                      isAnalyze 
                        ? 'text-[#0284C7] bg-sky-50 font-semibold' 
                        : 'text-[#475569] hover:text-[#0F172A] hover:bg-sky-50'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Analyze</span>
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-2 pr-3 py-1 bg-white border border-[#E2E8F0] rounded-full shadow-2xs">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName || 'User'}
                      className="h-6 w-6 rounded-full object-cover border border-[#E2E8F0]"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`h-6 w-6 rounded-full bg-sky-100 items-center justify-center text-[#0284C7] text-xs font-semibold ${user.avatar ? 'hidden' : 'flex'}`}>
                    {user.fullName?.charAt(0) || <User className="h-3 w-3" />}
                  </div>
                  <span className="text-xs font-semibold text-[#0F172A] max-w-[130px] truncate">
                    {user.fullName || user.email}
                  </span>
                </div>

                <Link
                  to="/analyze"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369a1] shadow-xs transition-colors"
                >
                  <span>Analyze Resume</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-[#475569] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[#0F172A] hover:bg-slate-50 border border-[#E2E8F0] transition-all"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369a1] shadow-xs transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link
                to="/analyze"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0284C7]"
              >
                Analyze
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E2E8F0] bg-white px-4 pt-2 pb-6 space-y-3 shadow-md animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1">
            <button
              type="button"
              onClick={() => handleNavClick('features')}
              className="text-left px-3 py-2 rounded-lg text-sm font-medium text-[#475569] hover:bg-sky-50"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('how-it-works')}
              className="text-left px-3 py-2 rounded-lg text-sm font-medium text-[#475569] hover:bg-sky-50"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('preview')}
              className="text-left px-3 py-2 rounded-lg text-sm font-medium text-[#475569] hover:bg-sky-50"
            >
              Product Preview
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('faq')}
              className="text-left px-3 py-2 rounded-lg text-sm font-medium text-[#475569] hover:bg-sky-50"
            >
              FAQ
            </button>

            {user && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-[#0284C7] bg-sky-50 flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/analyze"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-[#0284C7] bg-sky-50 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Analyze Resume</span>
                </Link>
              </>
            )}
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
            {user ? (
              <>
                <div className="px-3 py-2 text-xs text-[#475569]">
                  Signed in as <strong className="text-[#0F172A]">{user.fullName || user.email}</strong>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-center py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-red-100"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-[#0F172A] border border-[#E2E8F0] hover:bg-slate-50 transition-colors"
                >
                  Log in with Google
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369a1] shadow-xs transition-colors"
                >
                  Sign up with Google
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
