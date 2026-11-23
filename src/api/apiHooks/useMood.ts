import apiInstance from '../apiInstance';
import type {
    LogMoodPayload,
    LogMoodResponse,
    TodayMoodResponse,
    UpdateMoodPayload,
    UpdateMoodResponse,
    MoodHistoryResponse,
    MoodStatsResponse,
    DeleteMoodResponse,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for Mood API endpoints
 */
export const useMood = () => {
    /**
     * Log mood for today
     */
    const logMood = async (payload: LogMoodPayload): Promise<LogMoodResponse> => {
        try {
            const response = await apiInstance.post<LogMoodResponse>('mood/log', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get today's mood
     */
    const getTodayMood = async (): Promise<TodayMoodResponse> => {
        try {
            const response = await apiInstance.get<TodayMoodResponse>('mood/today');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Update today's mood
     */
    const updateTodayMood = async (payload: UpdateMoodPayload): Promise<UpdateMoodResponse> => {
        try {
            const response = await apiInstance.put<UpdateMoodResponse>('mood/today', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get mood history with pagination and optional date filtering
     */
    const getMoodHistory = async (
        limit: number = 30,
        offset: number = 0,
        start_date?: string,
        end_date?: string
    ): Promise<MoodHistoryResponse> => {
        try {
            const response = await apiInstance.get<MoodHistoryResponse>('mood/history', {
                params: { limit, offset, start_date, end_date },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get mood statistics
     */
    const getMoodStats = async (days: number = 30): Promise<MoodStatsResponse> => {
        try {
            const response = await apiInstance.get<MoodStatsResponse>('mood/stats', {
                params: { days },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Delete a mood entry
     */
    const deleteMood = async (moodId: string): Promise<DeleteMoodResponse> => {
        try {
            const response = await apiInstance.delete<DeleteMoodResponse>(`mood/${moodId}`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        logMood,
        getTodayMood,
        updateTodayMood,
        getMoodHistory,
        getMoodStats,
        deleteMood,
    };
};
