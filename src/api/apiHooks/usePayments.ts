import apiInstance from '../apiInstance';
import type {
    CreditPacksResponse,
    SubscriptionPlansResponse,
    CreateCheckoutSessionPayload,
    CreateCheckoutSessionResponse,
    CreateSubscriptionCheckoutPayload,
    CreateSubscriptionCheckoutResponse,
    VerifyCheckoutResponse,
    CancelSubscriptionResponse,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for Payments API endpoints
 */
export const usePayments = () => {
    /**
     * Get available credit packs
     */
    const getCreditPacks = async (): Promise<CreditPacksResponse> => {
        try {
            const response = await apiInstance.get<CreditPacksResponse>('payments/credit-packs');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get subscription plans
     */
    const getSubscriptionPlans = async (): Promise<SubscriptionPlansResponse> => {
        try {
            const response = await apiInstance.get<SubscriptionPlansResponse>('payments/subscription-plans');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Create checkout session for credit pack
     */
    const createCheckoutSession = async (payload: CreateCheckoutSessionPayload): Promise<CreateCheckoutSessionResponse> => {
        try {
            const response = await apiInstance.post<CreateCheckoutSessionResponse>('payments/create-checkout-session', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Create checkout session for subscription
     */
    const createSubscriptionCheckout = async (payload: CreateSubscriptionCheckoutPayload): Promise<CreateSubscriptionCheckoutResponse> => {
        try {
            const response = await apiInstance.post<CreateSubscriptionCheckoutResponse>('payments/create-subscription-checkout', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Verify checkout session
     */
    const verifyCheckout = async (sessionId: string): Promise<VerifyCheckoutResponse> => {
        try {
            const response = await apiInstance.get<VerifyCheckoutResponse>('payments/verify-checkout', {
                params: { sessionId },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Cancel active subscription
     */
    const cancelSubscription = async (): Promise<CancelSubscriptionResponse> => {
        try {
            const response = await apiInstance.post<CancelSubscriptionResponse>('payments/cancel-subscription');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        getCreditPacks,
        getSubscriptionPlans,
        createCheckoutSession,
        createSubscriptionCheckout,
        verifyCheckout,
        cancelSubscription,
    };
};
