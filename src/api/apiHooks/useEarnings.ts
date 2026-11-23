import { useCallback } from 'react';
import apiInstance from '../apiInstance';
import type {
    EarningsSummaryResponse,
    EarningsTransactionsResponse,
    PayoutsResponse,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for Earnings API endpoints
 */
export const useEarnings = () => {
    /**
     * Get listener earnings summary
     */
    const getEarningsSummary = useCallback(async (): Promise<EarningsSummaryResponse> => {
        try {
            const response = await apiInstance.get<EarningsSummaryResponse>('earnings/summary');
            return response?.data;
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * Get listener earnings transactions with pagination and filtering
     */
    const getEarningsTransactions = async (
        limit: number = 50,
        offset: number = 0,
        status?: 'pending' | 'available' | 'paid' | 'cancelled',
        sessionType?: 'call' | 'chat'
    ): Promise<EarningsTransactionsResponse> => {
        try {
            const response = await apiInstance.get<EarningsTransactionsResponse>('earnings', {
                params: { limit, offset, status, sessionType },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get listener payout history with pagination and filtering
     */
    const getPayouts = async (
        limit: number = 50,
        offset: number = 0,
        status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
    ): Promise<PayoutsResponse> => {
        try {
            const response = await apiInstance.get<PayoutsResponse>('earnings/payouts', {
                params: { limit, offset, status },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        getEarningsSummary,
        getEarningsTransactions,
        getPayouts,
    };
};
