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
          className="text-title-md font-headline-md tracking-tight text-ink-primary flex items-center gap-2.5 group"
        >
          <img
            alt="Kynetic AI Logo"
            className="w-7 h-7 object-contain rounded-sm"
            src="/assets/image.png"
          />
          <span className="font-headline-sm text-headline-sm tracking-tight text-ink-primary">
            Kynetic AI
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className={currentPath === '/' ? activeLinkClass : inactiveLinkClass}
          >
            Platform
          </Link>
          <Link
            to="/workload-planner"
            className={currentPath === '/workload-planner' ? activeLinkClass : inactiveLinkClass}
          >
            Workload Planner
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
            to="/early-access"
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
            className="md:hidden p-1.5 text-ink-primary rounded border border-hairline-default hover:bg-canvas-alternate"
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
        <div className="md:hidden border-t border-hairline-default bg-canvas-alternate px-6 py-4 space-y-3">
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
            <Link
              to="/mobile"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-ink-primary flex items-center justify-between text-ink-muted"
            >
              <span>Mobile Layout View</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
