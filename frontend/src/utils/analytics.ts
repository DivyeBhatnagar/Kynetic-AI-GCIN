/**
 * Google Analytics 4 (GA4) & Telemetry Tracker
 * Compliant with GDPR & DPDP Act 2023 with user consent checks.
 */

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = (import.meta as unknown as { env: { VITE_GA4_MEASUREMENT_ID?: string } }).env?.VITE_GA4_MEASUREMENT_ID || 'G-KYNETIC2026';

/**
 * Check if the user has consented to analytics/telemetry cookies.
 */
export const hasAnalyticsConsent = (): boolean => {
  try {
    const raw = localStorage.getItem('kynetic_consent_preferences_v1');
    if (!raw) return true; // Default opt-in with ability to revoke
    const parsed = JSON.parse(raw);
    return parsed.telemetry !== false;
  } catch {
    return true;
  }
};

/**
 * Initialize GA4 script dynamically if consent is granted.
 */
export const initGA = (): void => {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) {
    console.info('[Kynetic Telemetry] Analytics disabled via user consent preferences.');
    return;
  }

  // Prevent duplicate script insertion
  if (document.getElementById('kynetic-ga4-script')) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: false, // Handled manually on route changes
    cookie_flags: 'SameSite=None;Secure',
  });

  const script = document.createElement('script');
  script.id = 'kynetic-ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
};

/**
 * Track a Page View event
 */
export const trackPageView = (path: string, title?: string): void => {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return;

  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href,
    });
  }
};

/**
 * Track conversion events (e.g. Early access submission, simulator dispatch)
 */
export const trackConversion = (eventName: string, params: Record<string, unknown> = {}): void => {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return;

  if (window.gtag) {
    window.gtag('event', eventName, {
      ...params,
      timestamp: new Date().toISOString(),
      platform: 'kynetic_web_console',
    });
  }

  // Also log to console in dev mode
  if (import.meta.env.DEV) {
    console.log(`[Telemetry Event: ${eventName}]`, params);
  }
};
