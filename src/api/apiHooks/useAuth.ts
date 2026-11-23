import apiInstance from '../apiInstance';
import type {
    LogoutResponse,
    DeleteAccountPayload,
    DeleteAccountResponse,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for Auth API endpoints
 */
export const useAuth = () => {
    /**
     * Logout current user
     */
    const logout = async (): Promise<LogoutResponse> => {
        try {
            const response = await apiInstance.post<LogoutResponse>('auth/logout');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Delete user account
     */
    const deleteAccount = async (payload: DeleteAccountPayload): Promise<DeleteAccountResponse> => {
        try {
            const response = await apiInstance.delete<DeleteAccountResponse>('auth/account', { data: payload });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        logout,
        deleteAccount,
    };
};
