import apiInstance from '../apiInstance';
import type {
    ChangePasswordPayload,
    ChangePasswordResponse,
    ChangeEmailRequestPayload,
    ChangeEmailVerifyPayload,
    ChangePhoneRequestPayload,
    ChangePhoneVerifyPayload,
    GenericMessageResponse,
    TwoFactorSettingsResponse,
    UpdateTwoFactorSettingsPayload,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for Credentials Change API endpoints (Password, Email, Phone)
 */
export const useCredentialsChange = () => {
    /**
     * Change authenticated user's password
     */
    const changePassword = async (payload: ChangePasswordPayload): Promise<ChangePasswordResponse> => {
        try {
            const response = await apiInstance.post<ChangePasswordResponse>('auth/change-password', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Request OTP to change email
     */
    const requestEmailChangeOTP = async (payload: ChangeEmailRequestPayload): Promise<GenericMessageResponse> => {
        try {
            const response = await apiInstance.post<GenericMessageResponse>('auth/change-email/request-otp', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Verify OTP and change email
     */
    const verifyEmailChangeOTP = async (payload: ChangeEmailVerifyPayload): Promise<GenericMessageResponse> => {
        try {
            const response = await apiInstance.post<GenericMessageResponse>('auth/change-email/verify-otp', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Request OTP to change phone
     */
    const requestPhoneChangeOTP = async (payload: ChangePhoneRequestPayload): Promise<GenericMessageResponse> => {
        try {
            const response = await apiInstance.post<GenericMessageResponse>('auth/change-phone/request-otp', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Verify OTP and change phone
     */
    const verifyPhoneChangeOTP = async (payload: ChangePhoneVerifyPayload): Promise<GenericMessageResponse> => {
        try {
            const response = await apiInstance.post<GenericMessageResponse>('auth/change-phone/verify-otp', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get two-factor authentication settings
     */
    const getTwoFactorSettings = async (): Promise<TwoFactorSettingsResponse> => {
        try {
            const response = await apiInstance.get<TwoFactorSettingsResponse>('auth/security/2fa');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Update two-factor authentication settings
     */
    const updateTwoFactorSettings = async (payload: UpdateTwoFactorSettingsPayload): Promise<GenericMessageResponse> => {
        try {
            const response = await apiInstance.put<GenericMessageResponse>('auth/security/2fa', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        changePassword,
        requestEmailChangeOTP,
        verifyEmailChangeOTP,
        requestPhoneChangeOTP,
        verifyPhoneChangeOTP,
        getTwoFactorSettings,
        updateTwoFactorSettings,
    };
};
