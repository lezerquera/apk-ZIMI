/**
 * Domain Configuration for ZIMI PWA
 * This file contains domain-specific settings that can be easily updated
 * when deploying to different domains or environments.
 */

// Production domain configuration
const PRODUCTION_CONFIG = {
  domain: 'app.drzerquera.com',
  protocol: 'https',
  backend: {
    url: 'https://api.drzerquera.com',
    // Alternative: same domain with /api path
    // url: 'https://app.drzerquera.com'
  },
  pwa: {
    name: 'ZIMI - Dr. Zerquera',
    shortName: 'ZIMI',
    description: 'Aplicación móvil del Instituto de Medicina Integrativa del Dr. Pablo Zerquera',
    themeColor: '#1e40af',
    backgroundColor: '#ffffff',
    startUrl: '/',
    scope: '/',
    display: 'standalone'
  },
  security: {
    enableHTTPS: true,
    enforceSecureConnection: true,
    corsOrigins: ['https://app.drzerquera.com', 'https://drzerquera.com']
  },
  seo: {
    title: 'ZIMI - Dr. Pablo Zerquera | Medicina Integrativa',
    description: 'Instituto de Medicina Integrativa del Dr. Pablo Zerquera. Medicina Oriental, Funcional y Homeopática en Miami',
    keywords: 'medicina integrativa, acupuntura, homeopatía, Dr. Zerquera, citas médicas, telemedicina',
    ogImage: 'https://drzerquera.com/wp-content/uploads/2024/02/ZIMI.png',
    canonical: 'https://app.drzerquera.com'
  }
};

// Staging/Development configuration
const STAGING_CONFIG = {
  ...PRODUCTION_CONFIG,
  domain: 'staging.drzerquera.com',
  backend: {
    url: 'https://staging-api.drzerquera.com'
  },
  seo: {
    ...PRODUCTION_CONFIG.seo,
    title: '[STAGING] ZIMI - Dr. Pablo Zerquera',
    canonical: 'https://staging.drzerquera.com'
  }
};

// Default configuration (current preview environment)
const DEFAULT_CONFIG = {
  domain: window.location.hostname,
  protocol: window.location.protocol.replace(':', ''),
  backend: {
    url: process.env.REACT_APP_BACKEND_URL || window.location.origin
  },
  pwa: PRODUCTION_CONFIG.pwa,
  security: {
    enableHTTPS: window.location.protocol === 'https:',
    enforceSecureConnection: false,
    corsOrigins: ['*']
  },
  seo: {
    ...PRODUCTION_CONFIG.seo,
    canonical: window.location.origin
  }
};

// Environment detection
const getEnvironment = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'app.drzerquera.com') {
    return 'production';
  } else if (hostname === 'staging.drzerquera.com') {
    return 'staging';
  } else {
    return 'development';
  }
};

// Export configuration based on environment
const CONFIG_MAP = {
  production: PRODUCTION_CONFIG,
  staging: STAGING_CONFIG,
  development: DEFAULT_CONFIG
};

export const DOMAIN_CONFIG = CONFIG_MAP[getEnvironment()];

// Helper functions
export const getBackendUrl = () => DOMAIN_CONFIG.backend.url;
export const getApiUrl = () => `${DOMAIN_CONFIG.backend.url}/api`;
export const getFullUrl = (path = '') => `${DOMAIN_CONFIG.protocol}://${DOMAIN_CONFIG.domain}${path}`;
export const isProduction = () => getEnvironment() === 'production';
export const isSecure = () => DOMAIN_CONFIG.security.enableHTTPS;

// PWA Installation helpers
export const isPWAInstallable = () => {
  return 'serviceWorker' in navigator && window.location.protocol === 'https:';
};

export const generateManifest = () => ({
  name: DOMAIN_CONFIG.pwa.name,
  short_name: DOMAIN_CONFIG.pwa.shortName,
  description: DOMAIN_CONFIG.pwa.description,
  start_url: DOMAIN_CONFIG.pwa.startUrl,
  scope: DOMAIN_CONFIG.pwa.scope,
  display: DOMAIN_CONFIG.pwa.display,
  theme_color: DOMAIN_CONFIG.pwa.themeColor,
  background_color: DOMAIN_CONFIG.pwa.backgroundColor,
  orientation: 'portrait-primary',
  lang: 'es',
  categories: ['medical', 'health', 'lifestyle'],
  icons: [
    {
      src: 'https://drzerquera.com/wp-content/uploads/2024/02/ZIMI.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: 'https://drzerquera.com/wp-content/uploads/2024/02/ZIMI.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable'
    }
  ]
});

export default DOMAIN_CONFIG;