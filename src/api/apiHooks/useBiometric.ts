import apiInstance from '../apiInstance';
import type {
    RegisterBiometricPayload,
    RegisterBiometricResponse,
    BiometricLoginPayload,
    BiometricLoginResponse,
    DisableBiometricResponse,
    BiometricStatusResponse,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for Biometric API endpoints
 */
export const useBiometric = () => {
    /**
     * Register biometric authentication (Face ID / Fingerprint)
     */
    const registerBiometric = async (payload: RegisterBiometricPayload): Promise<RegisterBiometricResponse> => {
        try {
            const response = await apiInstance.post<RegisterBiometricResponse>('auth/biometric/register', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Login with biometric authentication
     */
    const loginWithBiometric = async (payload: BiometricLoginPayload): Promise<BiometricLoginResponse> => {
        try {
            const response = await apiInstance.post<BiometricLoginResponse>('auth/biometric/login', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Disable biometric authentication
     */
    const disableBiometric = async (): Promise<DisableBiometricResponse> => {
        try {
            const response = await apiInstance.post<DisableBiometricResponse>('auth/biometric/disable');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get biometric authentication status
     */
    const getBiometricStatus = async (): Promise<BiometricStatusResponse> => {
        try {
            const response = await apiInstance.get<BiometricStatusResponse>('auth/biometric/status');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        registerBiometric,
        loginWithBiometric,
        disableBiometric,
        getBiometricStatus,
    };
};
