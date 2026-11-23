import { Platform, PermissionsAndroid } from 'react-native';

export enum PermissionType {
  MICROPHONE = 'microphone',
  SPEAKER = 'speaker',
}

/**
 * Request microphone permission
 * Note: Speaker permission is typically automatic on mobile devices
 */
export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'Ventally needs access to your microphone to connect you through clear audio.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      // iOS - Requires native module setup
      // For now, return true as placeholder
      // You'll need to set up AVAudioSession permissions in Info.plist
      // and use a native module or library like react-native-permissions
      return true;
    }
  } catch (err) {
    console.warn('Permission error:', err);
    return false;
  }
};

/**
 * Check microphone permission status
 */
export const checkMicrophonePermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      return result;
    } else {
      // iOS placeholder
      return true;
    }
  } catch (err) {
    console.warn('Permission check error:', err);
    return false;
  }
};
