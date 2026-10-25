import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  onOpenEarlyAccess?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenEarlyAccess }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const activeLinkClass =
    'text-ink-primary border-b-2 border-accent-olive font-body-md font-medium pb-1';

  const inactiveLinkClass =
    'text-ink-muted font-body-md hover:text-ink-primary transition-colors pb-1 text-body-sm font-body-sm';

  return (
    <header className="sticky top-0 z-50 bg-canvas-base border-b border-hairline-default backdrop-blur-md bg-opacity-95">
      <div className="flex justify-between items-center h-16 px-3.5 sm:px-6 md:px-12 max-w-7xl mx-auto w-full">
        {/* Brand Logo Anchor */}
        <Link
          to="/"
          className="flex items-center group py-1 min-h-[44px] shrink-0"
          aria-label="Kynetic AI Home"
        >
          <img
            alt="Kynetic AI — Autonomous Compute Intelligence Logo"
            className="h-7 sm:h-8 md:h-9 w-auto max-w-[130px] sm:max-w-none object-contain transition-opacity group-hover:opacity-90"
            src="/assets/Kynetic%20AI%20Logo.png"
          />
        </Link>

        {/* Center Navigation Links (desktop) */}
        <nav className="hidden lg:flex items-center space-x-6 text-[13px]">
          <Link
            to="/"
            className={currentPath === '/' ? activeLinkClass : inactiveLinkClass}
          >
            Platform
          </Link>
          <Link
            to="/dashboard"
            className={currentPath === '/dashboard' ? activeLinkClass : inactiveLinkClass}
          >
            Dashboard
          </Link>
          <Link
            to="/workload-planner"
            className={currentPath === '/workload-planner' ? activeLinkClass : inactiveLinkClass}
          >
            Workload Planner
          </Link>
          <Link
            to="/recommendations"
            className={currentPath === '/recommendations' ? activeLinkClass : inactiveLinkClass}
          >
            Recommendations
          </Link>
          <Link
            to="/providers"
            className={currentPath === '/providers' ? activeLinkClass : inactiveLinkClass}
          >
            Providers
          </Link>
          <Link
            to="/architecture"
            className={currentPath === '/architecture' ? activeLinkClass : inactiveLinkClass}
          >
            Architecture
          </Link>
          <Link
            to="/docs"
            className={currentPath === '/docs' ? activeLinkClass : inactiveLinkClass}
          >
            Docs
          </Link>
          <a
            href="/#faq"
            className="text-ink-muted font-body-md hover:text-ink-primary transition-colors pb-1 text-body-sm font-body-sm"
          >
            FAQ
          </a>
        </nav>

        {/* Right CTAs */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            to="/signin"
            className="text-ink-muted hover:text-ink-primary text-body-sm font-body-sm font-medium transition-colors hidden sm:inline-block"
          >
            Sign In
          </Link>

          <Link
            to="/early-access"
            onClick={(e) => {
              if (onOpenEarlyAccess) {
                e.preventDefault();
                onOpenEarlyAccess();
              }
            }}
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-ink-primary hover:bg-accent-olive-deep text-canvas-base rounded-full text-xs sm:text-label-mono font-label-mono font-medium transition-all duration-150 active:scale-[0.98] min-h-[38px] sm:min-h-[40px] whitespace-nowrap"
          >
            <span>Get early access</span>
            <span className="text-[10px] sm:text-xs">↗</span>
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-ink-primary rounded border border-hairline-default hover:bg-canvas-alternate min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu & Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 bg-ink-primary/30 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-navigation-drawer"
            className="relative z-50 lg:hidden border-t border-hairline-default bg-canvas-alternate px-4 sm:px-6 py-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-xl"
          >
            <nav className="flex flex-col font-body-sm text-ink-body">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-2 rounded hover:bg-canvas-base text-ink-primary font-medium flex items-center justify-between min-h-[44px]"
              >
                <span>Platform</span>
                {currentPath === '/' && <span className="text-xs text-accent-olive">●</span>}
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-2 rounded hover:bg-canvas-base hover:text-ink-primary flex items-center justify-between min-h-[44px]"
              >
                <span>Dashboard</span>
                {currentPath === '/dashboard' && (
                  <span className="text-xs text-accent-olive">●</span>
                )}
              </Link>
              <Link
                to="/workload-planner"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-2 rounded hover:bg-canvas-base hover:text-ink-primary flex items-center justify-between min-h-[44px]"
              >
                <span>Workload Planner</span>
                {currentPath === '/workload-planner' && (
                  <span className="text-xs text-accent-olive">●</span>
                )}
              </Link>
              <Link
                to="/recommendations"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-2 rounded hover:bg-canvas-base hover:text-ink-primary flex items-center justify-between min-h-[44px]"
              >
                <span>Recommendations</span>
                {currentPath === '/recommendations' && (
                  <span className="text-xs text-accent-olive">●</span>
                )}
              </Link>
              <Link
                to="/providers"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-2 rounded hover:bg-canvas-base hover:text-ink-primary flex items-center justify-between min-h-[44px]"
              >
                <span>Providers</span>
                {currentPath === '/providers' && (
                  <span className="text-xs text-accent-olive">●</span>
                )}
              </Link>
              <Link
                to="/architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-2 rounded hover:bg-canvas-base hover:text-ink-primary flex items-center justify-between min-h-[44px]"
              >
                <span>Architecture</span>
                {currentPath === '/architecture' && (
                  <span className="text-xs text-accent-olive">●</span>
                )}
              </Link>
              <Link
                to="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-2 rounded hover:bg-canvas-base hover:text-ink-primary flex items-center justify-between min-h-[44px]"
              >
                <span>Docs</span>
                {currentPath === '/docs' && <span className="text-xs text-accent-olive">●</span>}
              </Link>
              <a
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-2 rounded hover:bg-canvas-base hover:text-ink-primary flex items-center justify-between min-h-[44px]"
              >
                <span>FAQ</span>
                <span className="text-xs text-ink-muted">→</span>
              </a>
              <div className="pt-3 mt-2 border-t border-hairline-subtle flex flex-col gap-2">
                <Link
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-2 rounded hover:bg-canvas-base text-ink-primary font-medium flex items-center justify-between min-h-[44px]"
                >
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-sm">login</span>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-2 rounded hover:bg-canvas-base text-accent-olive font-semibold flex items-center justify-between min-h-[44px]"
                >
                  <span>Create Account</span>
                  <span className="material-symbols-outlined text-sm">arrow_outward</span>
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

