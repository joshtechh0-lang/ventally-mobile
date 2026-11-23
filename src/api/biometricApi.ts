import apiInstance, { ApiResponse } from './apiInstance';

export interface BiometricRegisterRequest {
    publicKey: string;
    deviceId: string;
    deviceName: string;
}

export interface BiometricLoginRequest {
    email: string;
    deviceId: string;
    challenge: string;
    signature: string;
}

export interface BiometricStatusResponse {
    biometric: {
        enabled: boolean;
        deviceName: string;
        registeredAt: string;
    };
}

export interface BiometricLoginResponse {
    user: any;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}

const biometricApi = {
    /**
     * Register biometric authentication for the current user
     */
    registerBiometric: async (data: BiometricRegisterRequest): Promise<ApiResponse> => {
        try {
            const response = await (apiInstance.post('auth/biometric/register', data) as any);
            return response;
        } catch (error: any) {
            return {
                success: false,
                error: error?.message || 'Failed to register biometric authentication',
            };
        }
    },

    /**
     * Login using biometric signature
     */
    loginWithBiometric: async (data: BiometricLoginRequest): Promise<ApiResponse> => {
        try {
            const response = await (apiInstance.post('auth/biometric/login', data) as any);
            return response;
        } catch (error: any) {
            return {
                success: false,
                error: error?.message || 'Biometric login failed',
            };
        }
    },

    /**
     * Disable biometric authentication
     */
    disableBiometric: async (): Promise<ApiResponse> => {
        try {
            const response = await (apiInstance.post('auth/biometric/disable', {}) as any);
            return response;
        } catch (error: any) {
            return {
                success: false,
                error: error?.message || 'Failed to disable biometric authentication',
            };
        }
    },

    /**
     * Get biometric registration status for the current user
     */
    getBiometricStatus: async (): Promise<ApiResponse> => {
        try {
            const response = await (apiInstance.get('auth/biometric/status') as any);
            return response;
        } catch (error: any) {
            return {
                success: false,
                error: error?.message || 'Failed to get biometric status',
            };
        }
    },
};

export default biometricApi;
