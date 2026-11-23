import apiInstance from '../apiInstance';
import type {
    CreateCallPayload,
    CreateCallResponse,
    CallsResponse,
    CallDetailsResponse,
    AcceptCallResponse,
    DeclineCallResponse,
    CancelCallResponse,
    EndCallResponse,
    CallTokenResponse,
    ActiveCallResponse,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for Calls API endpoints
 */
export const useCalls = () => {
    /**
     * Create voice call
     */
    const createCall = async (payload: CreateCallPayload): Promise<CreateCallResponse> => {
        try {
            const response = await apiInstance.post<CreateCallResponse>('calls', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get call history
     */
    const getCalls = async (limit: number = 20, offset: number = 0): Promise<CallsResponse> => {
        try {
            const response = await apiInstance.get<CallsResponse>('calls/history', {
                params: {
                    limit,
                    offset
                },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get call details
     */
    const getCallDetails = async (callId: string): Promise<CallDetailsResponse> => {
        try {
            const response = await apiInstance.get<CallDetailsResponse>(`calls/${callId}`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Accept call request (listener)
     */
    const acceptCall = async (callId: string): Promise<AcceptCallResponse> => {
        try {
            const response = await apiInstance.post<AcceptCallResponse>(`calls/${callId}/accept`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Decline call request (listener)
     */
    const declineCall = async (callId: string): Promise<DeclineCallResponse> => {
        try {
            const response = await apiInstance.post<DeclineCallResponse>(`calls/${callId}/decline`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Cancel call request (venter)
     */
    const cancelCall = async (callId: string): Promise<CancelCallResponse> => {
        try {
            const response = await apiInstance.post<CancelCallResponse>(`calls/${callId}/cancel`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * End voice call
     */
    const endCall = async (callId: string): Promise<EndCallResponse> => {
        try {
            const response = await apiInstance.post<EndCallResponse>(`calls/${callId}/end`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get Twilio access token
     */
    const getCallToken = async (callId: string): Promise<CallTokenResponse> => {
        try {
            const response = await apiInstance.get<CallTokenResponse>(`calls/${callId}/token`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get active call
     */
    const getActiveCall = async (): Promise<ActiveCallResponse> => {
        try {
            const response = await apiInstance.get<ActiveCallResponse>('calls/active');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        createCall,
        getCalls,
        getCallDetails,
        acceptCall,
        declineCall,
        cancelCall,
        endCall,
        getCallToken,
        getActiveCall,
    };
};
