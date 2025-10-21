# Micro-Frontend Architecture with Module Federation

**[🇺🇸 English](./README.md)** | **[🇷🇺 Русский](./README.ru.md)**

## Table of Contents

- [Overview](#overview)
- [Architecture Decisions](#architecture-decisions)
  - [1. Micro-Frontend Architecture](#1-micro-frontend-architecture)
  - [2. Tailwind CSS Integration](#2-tailwind-css-integration)
  - [3. Internationalization (i18n) System](#3-internationalization-i18n-system)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)

---

## Overview

This project demonstrates a production-ready micro-frontend architecture using **Webpack Module Federation**. The system includes:

- **Host Application** - Main shell application
- **Remote Micro-frontends** - Independent feature modules (Users, Statistics)
- **Shared UI Library** - Reusable components with Tailwind CSS
- **Internationalization System** - Lazy-loaded translations with version control and caching

**Tech Stack:**
- React 18.3.1 + TypeScript 5.3.3
- Webpack 5 Module Federation
- Tailwind CSS 3.4.1
- i18next 23.10.1
- AWS S3 + CloudFront

---

## Architecture Decisions

### 1. Micro-Frontend Architecture

#### Challenge

Build a scalable architecture where:
- Multiple teams can work independently on different features
- Micro-frontends can be deployed independently without affecting others
- Shared code (React, i18next) should load only once
- Each micro-frontend should be deployable to production separately

#### Solution

**Webpack Module Federation** with the following structure:

```
┌─────────────────────────────────────────┐
│           HOST (Shell App)              │
│  - Routing                              │
│  - i18n initialization                  │
│  - Layout & Navigation                  │
└─────────┬───────────────────────────────┘
          │
          ├─► Remote: Users Module
          │   (independently deployed)
          │
          ├─► Remote: Statistics Module
          │   (independently deployed)
          │
          └─► Shared UI Library
              (Button, Card + Tailwind CSS)
```

**Key Configuration:**

**Host exposes:**
```javascript
exposes: {
  './i18n': './src/i18n/index.ts',
  './useRemoteTranslations': './src/hooks/useRemoteTranslations.ts'
}
```

**Remotes import from host:**
```javascript
remotes: {
  host: 'host@https://cdn.example.com/host/remoteEntry.js'
}
```

**Shared dependencies (singleton):**
```javascript
shared: {
  react: { singleton: true, eager: true },
  'react-dom': { singleton: true, eager: true },
  i18next: { singleton: true, eager: true },
  'react-i18next': { singleton: true, eager: true }
}
```

**Benefits:**
- ✅ Each remote can be deployed independently
- ✅ React loads only once (singleton)
- ✅ No code duplication
- ✅ Type safety with TypeScript

---

### 2. Tailwind CSS Integration

#### Challenge

Multiple micro-frontends need to:
- Share the same design system (colors, spacing, components)
- Avoid CSS conflicts and duplicated styles
- Load Tailwind CSS only once
- Allow each micro-frontend to use Tailwind classes without additional configuration

#### Solution

**Build-Time Compiled Tailwind CSS in Shared Package**

> **Key Principle**: Tailwind CSS is compiled **once during deployment** by scanning all micro-frontends. The resulting CSS bundle is loaded once by the host, and all micro-frontends use the same pre-compiled styles.

```
packages/shared/
├── tailwind.config.js      # Scans ALL micro-frontends
├── postcss.config.js       # PostCSS configuration
├── src/
│   ├── styles.css          # @tailwind directives
│   └── components/
│       ├── Button.tsx      # Shared UI components
│       └── Card.tsx
└── dist/
    └── styles.css          # ⚡ Single compiled CSS bundle
```

**Configuration:**

```javascript
// shared/tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    // ⚡ Scan ALL packages to collect Tailwind classes
    '../host/src/**/*.{js,jsx,ts,tsx}',
    '../remote-users/src/**/*.{js,jsx,ts,tsx}',
    '../remote-statistic/src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981',
      }
    }
  }
}
```

**Usage in micro-frontends:**

```typescript
// Import once in host
import '@guesty/shared/dist/styles.css';

// Import components with Tailwind classes
import { Button, Card } from '@guesty/shared/dist';

// Use Tailwind classes directly - no additional setup needed
<div className="flex items-center space-x-4">
  <Button variant="primary">Click me</Button>
</div>
```

**Build Process:**

1. **Shared builds first**: `npm run build:shared`
   - Tailwind scans all micro-frontends for used classes
   - Compiles → `dist/styles.css` (single bundle with only used classes)
   
2. **Host imports compiled CSS**: Single CSS bundle loaded once

3. **Remotes use classes**: No additional CSS needed, no runtime overhead

**Benefits:**
- ✅ **Single CSS bundle** - No duplication across micro-frontends
- ✅ **One-time compilation** - Tailwind runs once at build time, not per micro-frontend
- ✅ **Consistent design system** - All micro-frontends use the same theme
- ✅ **Tree-shaking** - Only used Tailwind classes are included
- ✅ **No runtime CSS conflicts** - Classes are pre-compiled and deterministic
- ✅ **Zero configuration** - Micro-frontends just use classes, no setup required

---

### 3. Internationalization (i18n) System

#### Challenge

Requirements for 200+ micro-frontends:
1. **Lazy Loading**: Load translations only when needed
2. **Version Control**: Cache translations but invalidate when updated
3. **Performance**: Minimize bundle size and API calls
4. **Independent Updates**: Update translations without redeploying apps
5. **Build-time Extraction**: Extract translation keys automatically

#### Solution

**Hybrid i18n Architecture with Lazy Loading + Version Control**

```
┌──────────────────────────────────────────────────┐
│  Build Time: Extract & Prepare Translations     │
│  scripts/extract-translations.js                 │
│  scripts/translate-and-prepare.js                │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│  S3/CloudFront: Translation Storage              │
│  /manifest.json          (cache: 1 hour)         │
│  /host/v0.1.0/en.json    (cache: forever)        │
│  /remote-users/v0.0.0/en.json                    │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│  Runtime: TranslationManager (Host)              │
│  - Check manifest for versions                   │
│  - Load namespace on demand                      │
│  - Cache in localStorage with version key        │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│  Micro-frontends: useRemoteTranslations Hook     │
│  const loaded = useRemoteTranslations('users');  │
└──────────────────────────────────────────────────┘
```

**Architecture Components:**

**1. Translation Manager (Host)**

```typescript
// packages/host/src/i18n/translationManager.ts
class TranslationManager {
  async loadNamespace(namespace: string, lang: string) {
    // 1. Load manifest (cached 1 hour)
    const manifest = await this.loadManifest();
    
    // 2. Check localStorage cache with version
    const cacheKey = `i18n:${namespace}:${lang}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached && cached.version === manifest[namespace].version) {
      return cached.data; // Cache hit
    }
    
    // 3. Fetch from CDN (versioned path)
    const url = `${CDN}/namespace/v${version}/${lang}.json`;
    const translations = await fetch(url).then(r => r.json());
    
    // 4. Add to i18n and cache
    i18n.addResourceBundle(lang, namespace, translations);
    localStorage.setItem(cacheKey, { version, data: translations });
  }
}
```

**2. React Hook for Lazy Loading**

```typescript
// packages/host/src/hooks/useRemoteTranslations.ts
export function useRemoteTranslations(namespace: string): boolean {
  const { i18n } = useTranslation(namespace);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load on mount
    translationManager.loadNamespace(namespace, i18n.language)
      .then(() => setLoaded(true));
    
    // Listen for language changes
    const handler = (lng: string) => {
      setLoaded(false); // Show loading state
      translationManager.loadNamespace(namespace, lng)
        .then(() => setLoaded(true));
    };
    i18n.on('languageChanged', handler);
    
    return () => i18n.off('languageChanged', handler);
  }, [namespace]);

  return loaded;
}
```

**3. Usage in Micro-frontends**

```typescript
// packages/remote-users/src/UsersApp.tsx
import { useRemoteTranslations } from 'host/useRemoteTranslations';

const UsersApp = () => {
  const { t } = useTranslation('remote-users');
  const loaded = useRemoteTranslations('remote-users');
  
  if (!loaded) return <LoadingSpinner />;
  
  return <div>{t('users.page_title')}</div>;
};
```

**4. Build-time Extraction**

```javascript
// scripts/extract-translations.js
// Uses Babel AST to find all t('key') calls
traverse(ast, {
  CallExpression(path) {
    if (isTranslationCall(path)) {
      const key = path.node.arguments[0].value;
      keys.add(key);
    }
  }
});
```

**5. Manifest Generation**

```javascript
// scripts/translate-and-prepare.js
{
  "host": {
    "version": "0.1.0",        // from package.json
    "size": 5407,
    "keyCount": 27,
    "priority": "critical"
  },
  "remote-users": {
    "version": "0.0.0",
    "size": 1091,
    "keyCount": 6,
    "priority": "low"
  }
}
```

**Translation File Structure:**

```
locales-dist/
├── manifest.json                    # Version registry
├── host/
│   └── v0.1.0/
│       ├── en.json
│       ├── he.json
│       └── ru.json
├── remote-users/
│   └── v0.0.0/
│       ├── en.json
│       ├── he.json
│       └── ru.json
```

**Caching Strategy:**

| File Type | Cache-Control | Why |
|-----------|---------------|-----|
| `manifest.json` | `max-age=3600` | Check for new versions hourly |
| `/host/v0.1.0/en.json` | `max-age=31536000, immutable` | Version in path = never changes |
| localStorage | version-based | Invalidate on version mismatch |

**Deployment Workflow:**

```bash
# 1. Extract translation keys
npm run i18n:extract

# 2. Update translations and bump version in package.json
# (manual or automated translation service)

# 3. Prepare translations with new version
npm run i18n:translate
# Creates: /host/v0.2.0/en.json (new version)

# 4. Deploy to S3
npm run deploy:translations
# Old version (v0.1.0) still available
# New users get v0.2.0 from manifest
```

**Benefits:**

- ✅ **Lazy Loading**: Translations load only when micro-frontend is accessed
- ✅ **Version Control**: localStorage cache invalidated automatically on version change
- ✅ **Performance**: 
  - Immutable cache for versioned files (1 year)
  - Manifest cached 1 hour (small file)
  - No duplicate translations in bundles
- ✅ **Independent Updates**: Deploy translations without redeploying apps
- ✅ **Scalability**: Supports 200+ micro-frontends
  - Each namespace loads independently
  - Parallel loading possible
- ✅ **Type Safety**: TypeScript types for all translation keys
- ✅ **Developer Experience**:
  - Auto-extraction of keys
  - Flat key structure: `'users.page_title'`
  - Single command: `npm run i18n:translate`

---

## Project Structure

```
guesty_test/
├── packages/
│   ├── host/                    # Shell application
│   │   ├── src/
│   │   │   ├── i18n/
│   │   │   │   ├── index.ts                # i18n initialization
│   │   │   │   └── translationManager.ts   # Lazy loading logic
│   │   │   ├── hooks/
│   │   │   │   └── useRemoteTranslations.ts
│   │   │   ├── components/
│   │   │   │   ├── Header.tsx              # Language switcher
│   │   │   │   └── Home.tsx
│   │   │   └── App.tsx
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   ├── he.json
│   │   │   └── ru.json
│   │   └── webpack.config.js
│   │
│   ├── remote-users/            # Users micro-frontend
│   │   ├── src/
│   │   │   └── UsersApp.tsx
│   │   ├── locales/
│   │   └── webpack.config.js
│   │
│   ├── remote-statistic/        # Statistics micro-frontend
│   │   ├── src/
│   │   │   └── StatisticApp.tsx
│   │   ├── locales/
│   │   └── webpack.config.js
│   │
│   └── shared/                  # Shared UI library
│       ├── src/
│       │   ├── components/
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   └── LoadingSpinner.tsx
│       │   └── styles.css       # Tailwind directives
│       ├── tailwind.config.js
│       └── postcss.config.js
│
├── scripts/
│   ├── extract-translations.js           # AST-based key extraction
│   ├── translate-and-prepare.js          # Manifest generation
│   ├── deploy-to-s3.sh                   # App deployment
│   └── deploy-translations-to-s3.sh      # Translation deployment
│
├── locales-dist/                # Generated translations
│   ├── manifest.json
│   ├── host/v0.1.0/
│   ├── remote-users/v0.0.0/
│   └── remote-statistic/v0.0.0/
│
└── package.json                 # Workspace scripts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Build shared library
npm run build:shared

# Prepare translations
npm run i18n:translate
```

### Development

```bash
# Run all micro-frontends concurrently
npm run dev

# Or run individually:
npm run dev:host           # http://localhost:3000
npm run dev:remote-users   # http://localhost:3001
npm run dev:remote-statistic # http://localhost:3002
```

### Build

```bash
# Build all packages
npm run build

# Or build individually:
npm run build:host
npm run build:remote-users
npm run build:remote-statistic
```

---

## Deployment

### Setup AWS Credentials

```bash
# Configure AWS CLI
aws configure
```

### Environment Variables

Create `.env` file:

```bash
NODE_ENV=production
CLOUDFRONT_DOMAIN=123456.cloudfront.net
CLOUDFRONT_ID=123456
BUCKET_NAME=your_bucket_name
```

### Deploy Translations

```bash
# Extract keys → prepare translations → deploy to S3
npm run i18n:extract
npm run i18n:translate
npm run deploy:translations
```

### Deploy Application

```bash
# Deploy all micro-frontends
npm run deploy:all

# Or deploy individually (selective invalidation):
npm run deploy:host
npm run deploy:remote-users
npm run deploy:remote-statistic
```

**Selective Deployment Benefits:**
- Only invalidates changed micro-frontend
- Other micro-frontends remain cached
- Faster deployments
- No impact on users of unchanged modules