import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { jwtDecode } from "jwt-decode";
// Try to import react-native-device-info if available
let DeviceInfo: any = null;
try {
    DeviceInfo = require('react-native-device-info');
} catch (e) {
    console.log('react-native-device-info not available, using fallback');
}

const DEVICE_ID_KEY = '@device_id';
const BIOMETRIC_EMAIL_KEY = '@biometric_email';


type TwilioTokenPayload = {
    grants: {
        identity: string;
        voice?: any;
    };
    exp: number;
    iat: number;
    iss: string;
    sub: string;
    jti: string;
};

export const getIdentityFromTwilioToken = (token: string) => {
    const decoded = jwtDecode<TwilioTokenPayload>(token);
    return decoded?.grants?.identity;
};


/**
 * Generate a simple UUID v4
 */
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Get or generate a unique device ID
 * This ID persists across app sessions and represents this specific device
 */
export async function getDeviceId(): Promise<string> {
    try {
        // Check if we already have a stored device ID
        let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

        if (deviceId) {
            return deviceId;
        }

        // Try to get unique ID from device-info library
        if (DeviceInfo && DeviceInfo.getUniqueId) {
            deviceId = await DeviceInfo.getUniqueId();
        } else {
            // Fallback: generate and store a UUID
            deviceId = generateUUID();
        }

        // Store for future use
        if (deviceId) {
            await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
            return deviceId;
        }
        return generateUUID();
    } catch (error) {
        console.error('Error getting device ID:', error);
        // Fallback to a random UUID
        return generateUUID();
    }
}

/**
 * Get device name/model
 */
export async function getDeviceName(): Promise<string> {
    try {
        if (DeviceInfo) {
            const model = await DeviceInfo.getModel();
            const brand = await DeviceInfo.getBrand();
            return `${brand} ${model}`;
        }

        // Fallback to platform info
        return Platform.OS === 'ios' ? 'iPhone' : 'Android Device';
    } catch (error) {
        console.error('Error getting device name:', error);
        return Platform.OS === 'ios' ? 'iPhone' : 'Android Device';
    }
}

/**
 * Store email for biometric login
 */
export async function storeBiometricEmail(email: string): Promise<void> {
    try {
        await AsyncStorage.setItem(BIOMETRIC_EMAIL_KEY, email);
    } catch (error) {
        console.error('Error storing biometric email:', error);
    }
}

/**
 * Get stored email for biometric login
 */
export async function getBiometricEmail(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(BIOMETRIC_EMAIL_KEY);

    } catch (error) {
        console.error('Error getting biometric email:', error);
        return null;
    }
}

/**
 * Clear stored biometric email (on logout or disable)
 */
export async function clearBiometricEmail(): Promise<void> {
    try {
        await AsyncStorage.removeItem(BIOMETRIC_EMAIL_KEY);
    } catch (error) {
        console.error('Error clearing biometric email:', error);
    }
}

/**
 * Check if biometric login is set up (has stored email)
 */
export async function isBiometricLoginSetup(): Promise<boolean> {
    const email = await getBiometricEmail();
    return email !== null && email.length > 0;
}
