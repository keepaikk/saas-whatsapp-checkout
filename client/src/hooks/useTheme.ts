import { useEffect } from 'react';
import { Business } from '../types';

export function useTheme(business: Business | null) {
  useEffect(() => {
    if (!business) return;

    const root = document.documentElement;
    root.style.setProperty('--primary-color', business.themeColor);
    root.style.setProperty('--secondary-color', business.secondaryColor);

    // Optional: update favicon
    if (business.faviconUrl) {
      const link = document.querySelector('link[rel="icon"]') || document.createElement('link');
      link.setAttribute('rel', 'icon');
      link.setAttribute('href', business.faviconUrl);
      document.head.appendChild(link);
    }

    return () => {
      root.style.removeProperty('--primary-color');
      root.style.removeProperty('--secondary-color');
    };
  }, [business?.themeColor, business?.secondaryColor, business?.faviconUrl]);
}
