import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

export interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
}

const DEFAULT_OG_IMAGE = 'https://kynetic.ai/assets/Kynetic%20AI%20Logo.png';
const BASE_URL = 'https://kynetic.ai';

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalPath,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
}) => {
  const location = useLocation();
  const fullTitle = `${title} | Kynetic AI`;
  const canonicalUrl = `${BASE_URL}${canonicalPath || location.pathname}`;

  useEffect(() => {
    // 1. Set Document Title
    document.title = fullTitle;

    // Helper to create or update meta tags
    const setMetaTag = (nameOrProperty: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${nameOrProperty}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, nameOrProperty);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Set Meta Description
    setMetaTag('description', description);

    // 3. Set Open Graph Tags
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:site_name', 'Kynetic AI', true);

    // 4. Set Twitter Card Tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);
    setMetaTag('twitter:site', '@KyneticAI');
    setMetaTag('twitter:creator', '@KyneticAI');

    // 5. Set Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 6. Track Page View in Analytics
    trackPageView(location.pathname, fullTitle);
  }, [fullTitle, description, canonicalUrl, ogImage, ogType, location.pathname]);

  return null;
};
