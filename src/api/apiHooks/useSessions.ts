import apiInstance from '../apiInstance';
import type {
    CreateSessionPayload,
    CreateSessionResponse,
    ActiveSessionsResponse,
    SessionDetailsResponse,
    AcceptSessionResponse,
    EndSessionResponse,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for Sessions API endpoints
 */
export const useSessions = () => {
    /**
     * Create a new call session
     */
    const createSession = async (payload: CreateSessionPayload): Promise<CreateSessionResponse> => {
        try {
            const response = await apiInstance.post<CreateSessionResponse>('sessions', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get active sessions
     */
    const getActiveSessions = async (): Promise<ActiveSessionsResponse> => {
        try {
            const response = await apiInstance.get<ActiveSessionsResponse>('sessions/active');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get session details
     */
    const getSessionDetails = async (sessionId: string): Promise<SessionDetailsResponse> => {
        try {
            const response = await apiInstance.get<SessionDetailsResponse>(`sessions/${sessionId}`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Accept a call session (listener only)
     */
    const acceptSession = async (sessionId: string): Promise<AcceptSessionResponse> => {
        try {
            const response = await apiInstance.post<AcceptSessionResponse>(`sessions/${sessionId}/accept`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * End a call session
     */
    const endSession = async (sessionId: string): Promise<EndSessionResponse> => {
        try {
            const response = await apiInstance.post<EndSessionResponse>(`sessions/${sessionId}/end`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        createSession,
        getActiveSessions,
        getSessionDetails,
        acceptSession,
        endSession,
    };
};
