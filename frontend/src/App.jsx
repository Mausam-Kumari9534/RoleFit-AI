import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import AnalyzePage from './pages/AnalyzePage';
import AnalysisResultsPage from './pages/AnalysisResultsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F0F9FF] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-[#0284C7] animate-spin" />
          <span className="text-sm font-semibold text-[#0F172A]">Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F0F9FF] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-[#0284C7] animate-spin" />
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-[#F0F9FF] text-[#0F172A] font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/login" 
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicOnlyRoute>
                <SignupPage />
              </PublicOnlyRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analyze" 
            element={
              <ProtectedRoute>
                <AnalyzePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analysis/:id" 
            element={
              <ProtectedRoute>
                <AnalysisResultsPage />
              </ProtectedRoute>
            } 
          />

          {/* Preserved Resume Builder */}
          <Route 
            path="/resume-builder" 
            element={
              <ProtectedRoute>
                <ResumeBuilderPage />
              </ProtectedRoute>
            } 
          />

          {/* Legacy route redirects */}
          <Route path="/workspace" element={<Navigate to="/dashboard" replace />} />
          <Route path="/upload" element={<Navigate to="/analyze" replace />} />
          <Route path="/results" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
