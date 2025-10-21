import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translationManager } from '../i18n';

export function useRemoteTranslations(namespace: string): boolean {
  const { i18n } = useTranslation(namespace);
  const [loaded, setLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const loadTranslations = async () => {
      try {
        const currentLang = i18n.language || 'en';
        await translationManager.loadNamespace(namespace, currentLang);
        setLoaded(true);

        const handleLanguageChange = async (lng: string) => {
          try {
            await translationManager.loadNamespace(namespace, lng);
            setRefreshKey(prev => prev + 1);
          } catch (err) {
            console.error(`Failed to load translations for ${namespace}/${lng}:`, err);
          }
        };

        i18n.on('languageChanged', handleLanguageChange);

        cleanup = () => {
          i18n.off('languageChanged', handleLanguageChange);
        };
      } catch (err) {
        console.error('Failed to load translations:', err);
        setLoaded(true); // Fallback
      }
    };

    loadTranslations();

    return () => cleanup?.();
  }, [i18n, namespace, refreshKey]);

  return loaded;
}