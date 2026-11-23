import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

/**
 * useTranslationWithUpdate - wraps useTranslation and forces re-render on language change
 * Use this instead of useTranslation() in screens that don't auto-update
 */
export const useTranslationWithUpdate = (ns?: string) => {
  const { t, i18n } = useTranslation(ns);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handler = () => forceUpdate(n => n + 1);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  return { t, i18n };
};
