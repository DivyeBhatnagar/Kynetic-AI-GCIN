import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  onOpenEarlyAccess?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenEarlyAccess }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const activeLinkClass =
    'text-ink-primary border-b-2 border-accent-olive font-body-md font-medium pb-1';

  const inactiveLinkClass =
    'text-ink-muted font-body-md hover:text-ink-primary transition-colors pb-1 text-body-sm font-body-sm';

  return (
    <header className="sticky top-0 z-50 bg-canvas-base border-b border-hairline-default backdrop-blur-md bg-opacity-95">
      <div className="flex justify-between items-center h-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
        {/* Brand Logo Anchor */}
        <Link
          to="/"
          className="flex items-center group py-1"
          aria-label="Kynetic AI Home"
        >
          <img
            alt="Kynetic AI"
            className="h-8 md:h-9 w-auto object-contain transition-opacity group-hover:opacity-90"
            src="/assets/Kynetic%20AI%20Logo.png"
          />
        </Link>

        {/* Center Navigation Links */}
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
        </nav>

        {/* Right CTAs */}
        <div className="flex items-center gap-4">
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
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink-primary hover:bg-accent-olive-deep text-canvas-base rounded-full text-label-mono font-label-mono font-medium transition-all duration-150 active:scale-[0.98]"
          >
            <span>Get early access</span>
            <span className="text-xs">↗</span>
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-ink-primary rounded border border-hairline-default hover:bg-canvas-alternate"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-hairline-default bg-canvas-alternate px-6 py-4 space-y-3">
          <nav className="flex flex-col gap-3 font-body-sm text-ink-body">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-ink-primary font-medium flex items-center justify-between"
            >
              <span>Platform</span>
              {currentPath === '/' && <span className="text-xs text-accent-olive">●</span>}
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-ink-primary flex items-center justify-between"
            >
              <span>Dashboard</span>
              {currentPath === '/dashboard' && (
                <span className="text-xs text-accent-olive">●</span>
              )}
            </Link>
            <Link
              to="/workload-planner"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-ink-primary flex items-center justify-between"
            >
              <span>Workload Planner</span>
              {currentPath === '/workload-planner' && (
                <span className="text-xs text-accent-olive">●</span>
              )}
            </Link>
            <Link
              to="/recommendations"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-ink-primary flex items-center justify-between"
            >
              <span>Recommendations</span>
              {currentPath === '/recommendations' && (
                <span className="text-xs text-accent-olive">●</span>
              )}
            </Link>
            <Link
              to="/providers"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-ink-primary flex items-center justify-between"
            >
              <span>Providers</span>
              {currentPath === '/providers' && (
                <span className="text-xs text-accent-olive">●</span>
              )}
            </Link>
            <Link
              to="/architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-ink-primary flex items-center justify-between"
            >
              <span>Architecture</span>
              {currentPath === '/architecture' && (
                <span className="text-xs text-accent-olive">●</span>
              )}
            </Link>
            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-ink-primary flex items-center justify-between"
            >
              <span>Docs</span>
              {currentPath === '/docs' && <span className="text-xs text-accent-olive">●</span>}
            </Link>
            <div className="pt-2 mt-2 border-t border-hairline-subtle flex flex-col gap-2">
              <Link
                to="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-ink-primary font-medium flex items-center justify-between"
              >
                <span>Sign In</span>
                <span className="material-symbols-outlined text-sm">login</span>
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-accent-olive font-semibold flex items-center justify-between"
              >
                <span>Create Account</span>
                <span className="material-symbols-outlined text-sm">arrow_outward</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
