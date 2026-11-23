import apiInstance from '../apiInstance';
import type {
    SaveReflectionPayload,
    SaveReflectionResponse,
    TodayReflectionResponse,
    ReflectionHistoryResponse,
    UpdateReflectionPayload,
    UpdateReflectionResponse,
    DeleteReflectionResponse,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for Reflection API endpoints
 */
export const useReflections = () => {
    /**
     * Save or update reflection for today
     */
    const saveReflection = async (payload: SaveReflectionPayload): Promise<SaveReflectionResponse> => {
        try {
            const response = await apiInstance.post<SaveReflectionResponse>('reflections/save', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get today's reflection
     */
    const getTodayReflection = async (): Promise<TodayReflectionResponse> => {
        try {
            const response = await apiInstance.get<TodayReflectionResponse>('reflections/today');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get reflection history with pagination and optional date filtering
     */
    const getReflectionHistory = async (
        limit: number = 30,
        offset: number = 0,
        start_date?: string,
        end_date?: string
    ): Promise<ReflectionHistoryResponse> => {
        try {
            const response = await apiInstance.get<ReflectionHistoryResponse>('reflections/history', {
                params: { limit, offset, start_date, end_date },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Update a specific reflection
     */
    const updateReflection = async (
        reflectionId: string,
        payload: UpdateReflectionPayload
    ): Promise<UpdateReflectionResponse> => {
        try {
            const response = await apiInstance.put<UpdateReflectionResponse>(
                `reflections/${reflectionId}`,
                payload
            );
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Delete a reflection entry
     */
    const deleteReflection = async (reflectionId: string): Promise<DeleteReflectionResponse> => {
        try {
            const response = await apiInstance.delete<DeleteReflectionResponse>(
                `reflections/${reflectionId}`
            );
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        saveReflection,
        getTodayReflection,
        getReflectionHistory,
        updateReflection,
        deleteReflection,
    };
};
