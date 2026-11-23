import { useState, useCallback } from 'react';
import apiInstance from '../api/apiInstance';

export interface Discount {
  id: string;
  name: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  source: string;
  appliesTo: string;
}

export function useDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyDiscounts = useCallback(async (): Promise<Discount[]> => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiInstance.get('discounts/my');
      const data: Discount[] = res.data?.data ?? [];
      setDiscounts(data);
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load discounts');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const hasSubscriptionDiscount = discounts.some(
    (d) => d.appliesTo === 'subscription' || d.appliesTo === 'both'
  );

  const bestSubscriptionDiscount = discounts
    .filter((d) => d.appliesTo === 'subscription' || d.appliesTo === 'both')
    .sort((a, b) => b.discountValue - a.discountValue)[0] ?? null;

  return {
    discounts,
    loading,
    error,
    fetchMyDiscounts,
    hasSubscriptionDiscount,
    bestSubscriptionDiscount,
  };
}
