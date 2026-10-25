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
