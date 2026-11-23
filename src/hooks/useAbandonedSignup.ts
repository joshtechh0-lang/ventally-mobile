import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import apiInstance from '../api/apiInstance';

/**
 * useAbandonedSignup
 *
 * Fires a backend event when the user has typed an email on the SignUp screen
 * but leaves without completing registration (back navigation or app backgrounded).
 *
 * Usage in SignUp.tsx:
 *   useAbandonedSignup({ email: emailOrPhone, userType: selectedUsage, isSubmitted });
 *
 * @param email       - The email address the user typed (fires only if non-empty)
 * @param userType    - "venter" | "listener" | undefined
 * @param isSubmitted - Set to true once the register API call succeeds; suppresses the event
 */
interface UseAbandonedSignupOptions {
  email: string;
  userType?: string;
  isSubmitted: boolean;
}

export function useAbandonedSignup({ email, userType, isSubmitted }: UseAbandonedSignupOptions) {
  const hasFiredRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);

  function maybeFireEvent(step: string) {
    // Don't fire if already submitted, no email, or already fired this session
    if (isSubmitted || !email || !email.includes('@') || hasFiredRef.current) return;

    hasFiredRef.current = true;

    apiInstance
      .post('auth/track-abandoned', {
        email: email.trim().toLowerCase(),
        userType: userType || null,
        step,
        platform: 'mobile',
      })
      .catch(() => {
        // Silently ignore — tracking failures should never surface to the user
      });
  }

  // Fire when component unmounts (user navigated away)
  useEffect(() => {
    return () => {
      maybeFireEvent('signup_screen_exited');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, userType, isSubmitted]);

  // Also fire when app is backgrounded with email filled
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (
        appStateRef.current === 'active' &&
        (nextState === 'background' || nextState === 'inactive')
      ) {
        maybeFireEvent('app_backgrounded');
      }
      appStateRef.current = nextState;
    });

    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, userType, isSubmitted]);
}
