import apiInstance from '../apiInstance';
import type {
    UserRoleConfigResponse,
    UpdateAvailableRolesPayload,
    UpdateAvailableRolesResponse,
    SwitchRolePayload,
    SwitchRoleResponse,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for User Roles API endpoints
 */
export const useRoles = () => {
    /**
     * Get user's current role configuration
     */
    const getUserRoles = async (): Promise<UserRoleConfigResponse> => {
        try {
            const response = await apiInstance.get<UserRoleConfigResponse>('users/roles');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Add or remove roles from user's available roles
     */
    const updateAvailableRoles = async (payload: UpdateAvailableRolesPayload): Promise<UpdateAvailableRolesResponse> => {
        try {
            const response = await apiInstance.put<UpdateAvailableRolesResponse>('users/available-roles', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Switch user's active role
     */
    const switchRole = async (payload: SwitchRolePayload): Promise<SwitchRoleResponse> => {
        try {
            const response = await apiInstance.post<SwitchRoleResponse>('users/switch-role', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        getUserRoles,
        updateAvailableRoles,
        switchRole,
    };
};
