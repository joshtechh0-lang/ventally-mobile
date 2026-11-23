import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';

const BIOMETRIC_UNIQUE_ID_KEY = '@biometric_unique_id';

interface SensorAvailability {
  available: boolean;
  type: string | null;
}

export interface BiometricIdResult {
  success: boolean;
  uniqueId: string | null;
}

class BiometricAuth {
  private static instance: ReactNativeBiometrics | null = null;

  private static getRNBiometrics(): ReactNativeBiometrics {
    if (!BiometricAuth.instance) {
      BiometricAuth.instance = new ReactNativeBiometrics();
    }
    return BiometricAuth.instance;
  }

  static async isSensorAvailable(): Promise<SensorAvailability> {
    try {
      const rnBiometrics = this.getRNBiometrics();
      const result = await rnBiometrics.isSensorAvailable();

      if (!result.available) {
        return { available: false, type: null };
      }

      const typeLabel: string | null = result.biometryType
        ? result.biometryType === 'FaceID'
          ? 'Face ID'
          : result.biometryType === 'TouchID'
            ? 'Touch ID'
            : 'Fingerprint'
        : null;

      return {
        available: true,
        type: typeLabel,
      };
    } catch (error) {
      console.error('Biometric check failed:', error);
      return { available: false, type: null };
    }
  }

  static async authenticate(promptMessage = 'Authenticate to continue'): Promise<boolean> {
    try {
      const rnBiometrics = this.getRNBiometrics();
      const result = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
      });
      console.log('result===>>>>', result);
      return result?.success;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  static async setupBiometrics(): Promise<boolean> {
    const { available, type } = await this.isSensorAvailable();

    if (!available) {
      Alert.alert(
        'Biometrics not available',
        type
          ? `${type} is not available on this device.`
          : 'Biometric authentication is not available on this device.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return this.authenticate();
  }

  /**
   * Get the stored biometric unique ID for this device (if any).
   */
  static async getStoredBiometricId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(BIOMETRIC_UNIQUE_ID_KEY);
    } catch (error) {
      console.error('Error getting biometric ID:', error);
      return null;
    }
  }

  /**
   * Create biometric keys and return a unique ID for this device's biometric enrollment.
   * The ID is the public key (unique per device). Stored in AsyncStorage for later use.
   * Call after user has successfully authenticated (e.g. after simplePrompt success).
   */
  static async createKeysAndGetUniqueId(): Promise<BiometricIdResult> {
    try {
      const rnBiometrics = this.getRNBiometrics();
      const keysExist = await rnBiometrics.biometricKeysExist();

      if (keysExist.keysExist) {
        const stored = await AsyncStorage.getItem(BIOMETRIC_UNIQUE_ID_KEY);
        if (stored) {
          return { success: true, uniqueId: stored };
        }
        await rnBiometrics.deleteKeys();
      }

      const { publicKey } = await rnBiometrics.createKeys();
      await AsyncStorage.setItem(BIOMETRIC_UNIQUE_ID_KEY, publicKey);
      return { success: true, uniqueId: publicKey };
    } catch (error) {
      console.error('Error creating biometric keys / unique ID:', error);
      return { success: false, uniqueId: null };
    }
  }

  /**
   * Enable biometrics and get a unique ID: authenticate, then create keys and store ID.
   */
  static async enableAndGetUniqueId(): Promise<BiometricIdResult> {
    const { available } = await this.isSensorAvailable();
    if (!available) {
      return { success: false, uniqueId: null };
    }
    const authenticated = await this.authenticate();
    if (!authenticated) {
      return { success: false, uniqueId: null };
    }
    return this.createKeysAndGetUniqueId();
  }

  /**
   * Create a signature for a given challenge using the biometric private key.
   * This is used for the challenge-response authentication flow.
   */
  static async createSignature(challenge: string, promptMessage = 'Authenticate to login'): Promise<string | null> {
    try {
      const rnBiometrics = this.getRNBiometrics();
      const { success, signature } = await rnBiometrics.createSignature({
        promptMessage,
        payload: challenge,
      });

      if (success && signature) {
        return signature;
      }
      return null;
    } catch (error) {
      console.error('Error creating biometric signature:', error);
      return null;
    }
  }

  /**
   * Delete biometric keys from the device.
   */
  static async deleteKeys(): Promise<boolean> {
    try {
      const rnBiometrics = this.getRNBiometrics();
      const { keysDeleted } = await rnBiometrics.deleteKeys();
      await AsyncStorage.removeItem(BIOMETRIC_UNIQUE_ID_KEY);
      return keysDeleted;
    } catch (error) {
      console.error('Error deleting biometric keys:', error);
      return false;
    }
  }
}

export default BiometricAuth;
