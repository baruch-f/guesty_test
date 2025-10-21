import type { i18n as I18nInstance } from 'i18next';

interface TranslationManifest {
  [namespace: string]: {
    version: string;
    size: number;
    priority: 'critical' | 'low';
  };
}

export class TranslationManager {
  private cdnUrl: string;
  private isDev: boolean;
  private loadedNamespaces = new Set<string>();
  private i18nInstance: I18nInstance | null = null;

  constructor() {
    this.isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const domain = process.env.CLOUDFRONT_DOMAIN;
    this.cdnUrl = domain ? `https://${domain}/locales` : '';
  }

  setI18nInstance(i18n: I18nInstance) {
    this.i18nInstance = i18n;
  }

  private getI18n(): I18nInstance {
    if (!this.i18nInstance) {
      throw new Error('TranslationManager: i18n instance not initialized. Call setI18nInstance first.');
    }
    return this.i18nInstance;
  }

  async loadManifest(): Promise<TranslationManifest> {
    const cached = localStorage.getItem('translations-manifest');
    
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 3600000) {
        return data;
      }
    }

    const baseUrl = this.isDev ? '/locales-dist' : this.cdnUrl;
    const response = await fetch(`${baseUrl}/manifest.json`);
    const manifest = await response.json();
    
    if (!this.isDev) {
      localStorage.setItem('translations-manifest', JSON.stringify({
        data: manifest,
        timestamp: Date.now()
      }));
    }
    
    return manifest;
  }

  async loadNamespace(namespace: string, lang: string): Promise<void> {
    const i18n = this.getI18n();
    const key = `${namespace}:${lang}`;
    
    if (this.loadedNamespaces.has(key)) {
      return;
    }

    try {
      const manifest = await this.loadManifest();
      const namespaceInfo = manifest[namespace];
      
      if (!namespaceInfo) {
        console.warn(`Namespace ${namespace} not found in manifest`);
        return;
      }

      const cacheKey = `i18n:${namespace}:${lang}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const { version, data } = JSON.parse(cached);
        if (version === namespaceInfo.version) {
          console.log(`✓ Using cached ${namespace}/${lang} v${version}`);
          i18n.addResourceBundle(lang, namespace, data, true, true);
          this.loadedNamespaces.add(key);
          return;
        }
      }

      const translations = await this.fetchTranslations(namespace, namespaceInfo.version, lang);
      i18n.addResourceBundle(lang, namespace, translations, true, true);
      
      localStorage.setItem(cacheKey, JSON.stringify({
        version: namespaceInfo.version,
        data: translations,
        timestamp: Date.now()
      }));
      
      this.loadedNamespaces.add(key);
      console.log(`✓ Loaded ${namespace}/${lang} v${namespaceInfo.version}`);
      
    } catch (err) {
      console.error(`Failed to load namespace ${namespace}:`, err);
    }
  }

  private async fetchTranslations(namespace: string, version: string, lang: string): Promise<any> {
    const baseUrl = this.isDev ? '/locales-dist' : this.cdnUrl;
    const response = await fetch(`${baseUrl}/${namespace}/v${version}/${lang}.json`);
    return response.json();
  }

  clearCache() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('i18n:'));
    keys.forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('translations-manifest');
    console.log('✓ Translation cache cleared');
  }
}