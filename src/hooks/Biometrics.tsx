import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  private static instance: any = null;

  private static getRNBiometrics(): any {
    if (Platform.OS === 'android') return null;
    if (!BiometricAuth.instance) {
      const ReactNativeBiometrics = require('react-native-biometrics').default;
      BiometricAuth.instance = new ReactNativeBiometrics();
    }
    return BiometricAuth.instance;
  }

  static async isSensorAvailable(): Promise<SensorAvailability> {
    if (Platform.OS === 'android') return { available: false, type: null };
    try {
      const rnBiometrics = this.getRNBiometrics();
      const result = await rnBiometrics.isSensorAvailable();
      if (!result.available) return { available: false, type: null };
      const typeLabel: string | null = result.biometryType
        ? result.biometryType === 'FaceID' ? 'Face ID'
          : result.biometryType === 'TouchID' ? 'Touch ID' : 'Fingerprint'
        : null;
      return { available: true, type: typeLabel };
    } catch (error) {
      console.error('Biometric check failed:', error);
      return { available: false, type: null };
    }
  }

  static async authenticate(promptMessage = 'Authenticate to continue'): Promise<boolean> {
    if (Platform.OS === 'android') return false;
    try {
      const rnBiometrics = this.getRNBiometrics();
      const result = await rnBiometrics.simplePrompt({ promptMessage, cancelButtonText: 'Cancel' });
      return result?.success;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  static async setupBiometrics(): Promise<boolean> {
    if (Platform.OS === 'android') return false;
    const { available, type } = await this.isSensorAvailable();
    if (!available) {
      Alert.alert(
        'Biometrics not available',
        type ? `${type} is not available on this device.` : 'Biometric authentication is not available on this device.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return this.authenticate();
  }

  static async getStoredBiometricId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(BIOMETRIC_UNIQUE_ID_KEY);
    } catch (error) {
      console.error('Error getting biometric ID:', error);
      return null;
    }
  }

  static async createKeysAndGetUniqueId(): Promise<BiometricIdResult> {
    if (Platform.OS === 'android') return { success: false, uniqueId: null };
    try {
      const rnBiometrics = this.getRNBiometrics();
      const keysExist = await rnBiometrics.biometricKeysExist();
      if (keysExist.keysExist) {
        const stored = await AsyncStorage.getItem(BIOMETRIC_UNIQUE_ID_KEY);
        if (stored) return { success: true, uniqueId: stored };
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

  static async enableAndGetUniqueId(): Promise<BiometricIdResult> {
    if (Platform.OS === 'android') return { success: false, uniqueId: null };
    const { available } = await this.isSensorAvailable();
    if (!available) return { success: false, uniqueId: null };
    const authenticated = await this.authenticate();
    if (!authenticated) return { success: false, uniqueId: null };
    return this.createKeysAndGetUniqueId();
  }

  static async createSignature(challenge: string, promptMessage = 'Authenticate to login'): Promise<string | null> {
    if (Platform.OS === 'android') return null;
    try {
      const rnBiometrics = this.getRNBiometrics();
      const { success, signature } = await rnBiometrics.createSignature({ promptMessage, payload: challenge });
      if (success && signature) return signature;
      return null;
    } catch (error) {
      console.error('Error creating biometric signature:', error);
      return null;
    }
  }

  static async deleteKeys(): Promise<boolean> {
    if (Platform.OS === 'android') return false;
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
