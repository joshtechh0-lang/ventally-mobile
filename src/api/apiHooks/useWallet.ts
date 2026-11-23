import apiInstance from '../apiInstance';
import type {
    WalletBalanceResponse,
    TransactionsResponse,
    SubscriptionResponse,
    UpdateAutoRechargePayload,
    UpdateAutoRechargeResponse,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for Wallet API endpoints
 */
export const useWallet = () => {
    /**
     * Get wallet balance and auto-recharge settings
     */
    const getBalance = async (): Promise<WalletBalanceResponse> => {
        try {
            const response = await apiInstance.get<WalletBalanceResponse>('wallet/balance');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get transaction history with pagination
     */
    const getTransactions = async (limit: number = 50, offset: number = 0): Promise<TransactionsResponse> => {
        try {
            const response = await apiInstance.get<TransactionsResponse>('wallet/transactions', {
                params: { limit, offset },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get subscription status
     */
    const getSubscription = async (): Promise<SubscriptionResponse> => {
        try {
            const response = await apiInstance.get<SubscriptionResponse>('wallet/subscription');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Update auto-recharge settings
     */
    const updateAutoRecharge = async (payload: UpdateAutoRechargePayload): Promise<UpdateAutoRechargeResponse> => {
        try {
            const response = await apiInstance.put<UpdateAutoRechargeResponse>('wallet/auto-recharge', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        getBalance,
        getTransactions,
        getSubscription,
        updateAutoRecharge,
    };
};
