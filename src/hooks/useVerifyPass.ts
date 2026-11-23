import { useState, useCallback } from 'react';
import apiInstance from '../api/apiInstance';

export interface VerifyPassStatus {
  isVerified: boolean;
  communityType: string | null;
  verifiedAt: string | null;
}

export function useVerifyPass() {
  const [status, setStatus] = useState<VerifyPassStatus | null>(null);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Separate error state for URL fetch so it doesn't surface in the main UI
  const [_urlError, setUrlError] = useState<string | null>(null);

  const fetchStatus = useCallback(async (): Promise<VerifyPassStatus | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiInstance.get('verify-pass/status');
      const data = res.data?.data ?? res.data;
      const s: VerifyPassStatus = {
        isVerified: data.isVerified ?? false,
        communityType: data.communityType ?? null,
        verifiedAt: data.verifiedAt ?? null,
      };
      setStatus(s);
      return s;
    } catch (err: any) {
      setError(err?.error || 'Failed to load verification status');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVerifyUrl = useCallback(async (): Promise<string | null> => {
    try {
      setLoading(true);
      const res = await apiInstance.get('verify-pass/url');
      const url = res.data?.data?.url ?? res.data?.url;
      setVerifyUrl(url);
      return url;
    } catch (err: any) {
      // URL errors are silent — caller uses the fallback URL
      setUrlError(err?.error || 'Failed to get verification URL');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmVerification = useCallback(async (token: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiInstance.post('verify-pass/verify', { token });
      const data = res.data?.data ?? res.data;
      if (data?.success || data?.isVerified) {
        setStatus({
          isVerified: true,
          communityType: data.communityType ?? null,
          verifiedAt: new Date().toISOString(),
        });
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err?.error || 'Verification failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    status,
    verifyUrl,
    loading,
    error,
    fetchStatus,
    fetchVerifyUrl,
    confirmVerification,
  };
}
