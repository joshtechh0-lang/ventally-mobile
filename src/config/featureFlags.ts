import { Platform } from 'react-native';

/**
 * Admin surfaces are omitted on iOS builds for App Store review (Guideline 1.1.4 / policy alignment).
 * Flip to true for internal or TestFlight builds that need admin, or after approval with reviewer notes.
 */
export const ENABLE_ADMIN_FLOW = Platform.OS !== 'ios';
