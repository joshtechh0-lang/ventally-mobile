import { useCallback } from 'react';
import apiInstance from '../apiInstance';
import type {
    GoOnlineResponse,
    GoOfflineResponse,
    HeartbeatResponse,
    AvailableListenersResponse,
    UpdateRatePayload,
    UpdateRateResponse,
    AvailabilityStatusResponse,
    ListenerProfileResponse,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for Availability API endpoints
 */
export const useAvailability = () => {
    /**
     * Go online as listener
     */
    const goOnline = useCallback(async (): Promise<GoOnlineResponse> => {
        try {
            const response = await apiInstance.post<GoOnlineResponse>('availability/online');
            return response?.data;
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * Go offline as listener
     */
    const goOffline = useCallback(async (): Promise<GoOfflineResponse> => {
        try {
            const response = await apiInstance.post<GoOfflineResponse>('availability/offline');
            return response?.data;
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * Send presence heartbeat
     */
    const sendHeartbeat = useCallback(async (): Promise<HeartbeatResponse> => {
        try {
            const response = await apiInstance.post<HeartbeatResponse>('availability/heartbeat');
            return response?.data;
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * Get available listeners
     */
    const getAvailableListeners = useCallback(async (): Promise<AvailableListenersResponse> => {
        try {
            const response = await apiInstance.get('availability/listeners');
            console.log('response====>>>>>>>', response);
            return response?.data;
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * Update listener rate
     */
    const updateRate = useCallback(async (payload: UpdateRatePayload): Promise<UpdateRateResponse> => {
        try {
            const response = await apiInstance.put<UpdateRateResponse>('availability/rate', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * Get current availability status
     */
    const getStatus = useCallback(async (): Promise<AvailabilityStatusResponse> => {
        try {
            const response = await apiInstance.get<AvailabilityStatusResponse>('availability/status');
            return response?.data;
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * Get listener profile
     */
    const getProfile = useCallback(async (): Promise<ListenerProfileResponse> => {
        try {
            const response = await apiInstance.get<ListenerProfileResponse>('availability/profile');
            return response?.data;
        } catch (error) {
            throw error;
        }
    }, []);

    return {
        goOnline,
        goOffline,
        sendHeartbeat,
        getAvailableListeners,
        updateRate,
        getStatus,
        getProfile,
    };
};
