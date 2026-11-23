import apiInstance from '../apiInstance';
import type {
    BlockUserResponse,
    UnblockUserResponse,
    CheckBlockStatusResponse,
    GetBlockedUsersResponse,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for User Blocking API endpoints
 */
export const useBlock = () => {
    /**
     * Block a user
     */
    const blockUser = async (userId: string): Promise<BlockUserResponse> => {
        try {
            const response = await apiInstance.post<BlockUserResponse>(`users/${userId}/block`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Unblock a user
     */
    const unblockUser = async (userId: string): Promise<UnblockUserResponse> => {
        try {
            const response = await apiInstance.delete<UnblockUserResponse>(`users/${userId}/block`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Check if a user is blocked
     */
    const checkBlockStatus = async (userId: string): Promise<CheckBlockStatusResponse> => {
        try {
            const response = await apiInstance.get<CheckBlockStatusResponse>(`users/${userId}/blocked`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get list of blocked users
     */
    const getBlockedUsers = async (page: number = 1, limit: number = 20): Promise<GetBlockedUsersResponse> => {
        try {
            const response = await apiInstance.get<GetBlockedUsersResponse>('users/blocked', {
                params: { page, limit },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        blockUser,
        unblockUser,
        checkBlockStatus,
        getBlockedUsers,
    };
};
