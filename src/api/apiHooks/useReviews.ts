import apiInstance from '../apiInstance';
import type {
    SubmitReviewPayload,
    SubmitReviewResponse,
    GetUserReviewsResponse,
    GetSessionReviewsResponse,
    CanReviewResponse,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for Reviews API endpoints
 */
export const useReviews = () => {
    /**
     * Submit a rating and optional comment for another user after a session
     */
    const submitReview = async (payload: SubmitReviewPayload): Promise<SubmitReviewResponse> => {
        try {
            const response = await apiInstance.post<SubmitReviewResponse>('reviews', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get all reviews received by a specific user (typically a listener)
     */
    const getUserReviews = async (
        userId: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<GetUserReviewsResponse> => {
        try {
            const response = await apiInstance.get<GetUserReviewsResponse>(`reviews/${userId}`, {
                params: { limit, offset },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get all reviews for a specific session (both directions if mutual review)
     */
    const getSessionReviews = async (
        sessionType: 'call' | 'chat',
        sessionId: string
    ): Promise<GetSessionReviewsResponse> => {
        try {
            const response = await apiInstance.get<GetSessionReviewsResponse>(`reviews/session/${sessionType}/${sessionId}`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Check if the authenticated user can submit a review for a specific session
     */
    const checkCanReview = async (
        sessionType: 'call' | 'chat',
        sessionId: string
    ): Promise<CanReviewResponse> => {
        try {
            const response = await apiInstance.get<CanReviewResponse>(`reviews/can-review/${sessionType}/${sessionId}`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        submitReview,
        getUserReviews,
        getSessionReviews,
        checkCanReview,
    };
};
