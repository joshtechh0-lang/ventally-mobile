import apiInstance from '../apiInstance';
import type {
    SobrietyStatusResponse,
    StartSobrietyPayload,
    LogRelapsePayload,
    SobrietyHistoryResponse,
    VenterHomeSummaryResponse,
    GenericMessageResponse,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for Sobriety and Recovery API endpoints
 */
export const useRecovery = () => {
    /**
     * Get current sobriety status, days sober, and milestones
     */
    const getSobrietyStatus = async (): Promise<SobrietyStatusResponse> => {
        try {
            const response = await apiInstance.get<SobrietyStatusResponse>('sobriety/status');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Start or update sobriety tracking
     */
    const startSobriety = async (payload: StartSobrietyPayload): Promise<SobrietyStatusResponse> => {
        try {
            const response = await apiInstance.post<SobrietyStatusResponse>('sobriety/start', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Log a relapse event
     */
    const logRelapse = async (payload: LogRelapsePayload): Promise<SobrietyStatusResponse> => {
        try {
            const response = await apiInstance.post<SobrietyStatusResponse>('sobriety/relapse', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get sobriety events timeline
     */
    const getSobrietyHistory = async (limit: number = 30, offset: number = 0): Promise<SobrietyHistoryResponse> => {
        try {
            const response = await apiInstance.get<SobrietyHistoryResponse>(`sobriety/history?limit=${limit}&offset=${offset}`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get venter home summary (progress, highlights, achievements, recent entries)
     */
    const getVenterHomeSummary = async (limit: number = 10): Promise<VenterHomeSummaryResponse> => {
        try {
            const response = await apiInstance.get<VenterHomeSummaryResponse>(`home/summary?limit=${limit}`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        getSobrietyStatus,
        startSobriety,
        logRelapse,
        getSobrietyHistory,
        getVenterHomeSummary,
    };
};
