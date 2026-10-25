import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EarlyAccessModal } from './components/EarlyAccessModal';
import { HomePage } from './pages/HomePage';
import { WorkloadPlannerPage } from './pages/WorkloadPlannerPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { DocsPage } from './pages/DocsPage';
import { EarlyAccessPage } from './pages/EarlyAccessPage';
import { MobileHomePage } from './pages/MobileHomePage';
import { DashboardPage } from './pages/DashboardPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ProvidersPage } from './pages/ProvidersPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { LegalPage } from './pages/LegalPage';

// Scroll to top on navigation helper
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  const [isEarlyAccessOpen, setIsEarlyAccessOpen] = useState(false);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-canvas-base text-ink-primary font-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed">
        <Routes>
          {/* Flagship Desktop Homepage (Olive Brutalist) */}
          <Route
            path="/"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <HomePage onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <Footer variant="olive" />
              </>
            }
          />

          {/* Legacy blue route redirects to Olive Homepage */}
          <Route path="/light-blue" element={<Navigate to="/" replace />} />

          {/* Workload Planner Page */}
          <Route
            path="/workload-planner"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <WorkloadPlannerPage onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <Footer variant="editorial" />
              </>
            }
          />

          {/* Console / Dashboard Page */}
          <Route
            path="/dashboard"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <DashboardPage onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <Footer variant="editorial" />
              </>
            }
          />

          {/* Compute Recommendations Page */}
          <Route
            path="/recommendations"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <RecommendationsPage onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <Footer variant="editorial" />
              </>
            }
          />

          {/* Compute Providers Directory Page */}
          <Route
            path="/providers"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <ProvidersPage />
                <Footer variant="editorial" />
              </>
            }
          />

          {/* Architecture & Control Plane Page */}
          <Route
            path="/architecture"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <ArchitecturePage onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <Footer variant="editorial" />
              </>
            }
          />

          {/* Documentation Quickstart Page */}
          <Route
            path="/docs"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <DocsPage onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <Footer variant="editorial" />
              </>
            }
          />

          {/* Request Early Access Standalone Page */}
          <Route
            path="/early-access"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <EarlyAccessPage />
                <Footer variant="editorial" />
              </>
            }
          />

          {/* Sign In Page */}
          <Route
            path="/signin"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <SignInPage />
                <Footer variant="editorial" />
              </>
            }
          />
          <Route path="/login" element={<Navigate to="/signin" replace />} />

          {/* Sign Up Page */}
          <Route
            path="/signup"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <SignUpPage />
                <Footer variant="editorial" />
              </>
            }
          />
          {/* Legal & Governance Pages */}
          <Route
            path="/privacy-policy"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <LegalPage initialTab="privacy" />
                <Footer variant="editorial" />
              </>
            }
          />
          <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />

          <Route
            path="/terms"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <LegalPage initialTab="terms" />
                <Footer variant="editorial" />
              </>
            }
          />
          <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />

          <Route
            path="/cookie-policy"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <LegalPage initialTab="cookies" />
                <Footer variant="editorial" />
              </>
            }
          />

          <Route
            path="/refund-policy"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <LegalPage initialTab="refund" />
                <Footer variant="editorial" />
              </>
            }
          />

          <Route
            path="/cookie-consent"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <LegalPage initialTab="consent" />
                <Footer variant="editorial" />
              </>
            }
          />
          <Route path="/consent" element={<Navigate to="/cookie-consent" replace />} />

          <Route
            path="/user-data-collection"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <LegalPage initialTab="data-collection" />
                <Footer variant="editorial" />
              </>
            }
          />
          <Route path="/data-collection" element={<Navigate to="/user-data-collection" replace />} />
          <Route path="/what-user-data-you-collect" element={<Navigate to="/user-data-collection" replace />} />

          <Route
            path="/third-party-embeds"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <LegalPage initialTab="third-party" />
                <Footer variant="editorial" />
              </>
            }
          />
          <Route path="/third-party" element={<Navigate to="/third-party-embeds" replace />} />

          {/* Dedicated Mobile Viewport Experience */}
          <Route
            path="/mobile"
            element={
              <MobileHomePage onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
            }
          />

          {/* Fallback to Home */}
          <Route
            path="*"
            element={
              <>
                <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <HomePage onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />
                <Footer variant="olive" />
              </>
            }
          />
        </Routes>

        {/* Global Early Access Application Modal */}
        <EarlyAccessModal
          isOpen={isEarlyAccessOpen}
          onClose={() => setIsEarlyAccessOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
