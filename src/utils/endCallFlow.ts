import { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { routes } from '../navigation/routes';

interface EndCallParams {
  sessionId: string | null;
  isVenter: boolean;
  navigationRef: NavigationContainerRefWithCurrent<any>;
  dispatch: (action: any) => void;
  endCallAction: () => any;
  endCallApi: (sessionId: string) => Promise<any>;
}

/**
 * The single source of truth for "end a call": confirm with the backend,
 * clear Redux call state, and navigate to the correct role-specific feedback
 * screen. Used by both CallStatusBar's end button and PersistentCallWebView's
 * handling of the standalone web view's end button — so both trigger paths
 * are guaranteed to behave identically.
 */
export async function endCallAndNavigate({
  sessionId,
  isVenter,
  navigationRef,
  dispatch,
  endCallAction,
  endCallApi,
}: EndCallParams) {
  if (sessionId) {
    try {
      await endCallApi(sessionId);
    } catch (err) {
      console.error('Error ending call via API:', err);
    }
  }

  dispatch(endCallAction());
  if (navigationRef.isReady()) {
    if (isVenter) {
      (navigationRef as any).navigate(routes.chatSessionFeedback, { type: 'call', data: null });
    } else {
      (navigationRef as any).navigate(routes.listenerSessionFeedback);
    }
  }
}
