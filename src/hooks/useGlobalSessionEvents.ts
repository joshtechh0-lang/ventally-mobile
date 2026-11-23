import { useEffect } from 'react';
import { useDispatch, useStore } from 'react-redux';
import type { RootState } from '../store/store';
import { endCall, endChatSession, setCrisisEnded } from '../store/slices/callSlice';
import { clearRequests, removeRequest } from '../store/slices/listenerSlice';
import socketService from '../sockets';
import { navigationRef, dismissedRequestIds } from '../navigation';
import { routes } from '../navigation/routes';

/**
 * Attaches a global session:ended socket listener so that crisis navigation
 * happens from ANY screen, not just the active call/chat screen.
 *
 * Listener  → navigated to listenerSessionFeedback.
 * Venter    → crisisEnded flag set so the active call/chat screen shows the 988 overlay.
 *
 * Uses store.getState() so a dispatch() made immediately before in another handler
 * is already visible — prevents double-navigation when the local screen also handles the event.
 */
export function useGlobalSessionEvents() {
  const dispatch = useDispatch();
  const store = useStore<RootState>();

  useEffect(() => {
    const handleCallEnded = (data: any) => {
      const rootState = store.getState() as RootState;
      const callState = rootState.call;
      const isVenter = rootState.user.isVenter;

      console.log('[GlobalSessionEvents] RECEIVED call:ended', {
        data,
        isActive: callState.isActive,
        crisisEnded: callState.crisisEnded,
      });

      if (callState.crisisEnded) return;

      dispatch(endCall());

      const payload = { type: 'call', data: (callState as any).currentCall ?? null };
      console.log('[GlobalSessionEvents] payload', data);
      if (isVenter) {
        if (data?.skipTip || data?.reason === 'crisis') {
          dispatch(setCrisisEnded(true));
        } else {
          // @ts-ignore
          navigationRef.navigate(routes.chatSessionFeedback as never, payload as never);
        }
      } else {
        if (data?.skipTip || data?.reason === 'crisis') {
          navigationRef.navigate(routes.listenerHomeTab as never);
        } else {
          // @ts-ignore
          navigationRef.navigate(routes.listenerSessionFeedback as never, payload as never);
        }
      }
    };

    const handleSessionEnded = (data: any) => {
      const rootState = store.getState() as RootState;
      const callState = rootState.call;
      const isVenter = rootState.user.isVenter;

      console.log('[GlobalSessionEvents] RECEIVED session:ended', {
        data,
        isActive: callState.isActive,
        isChatActive: callState.isChatActive,
        isVenter,
      });

      if (callState.isActive) {
        dispatch(endCall());
        if (isVenter) {
          // ActiveCallScreen watches crisisEnded and shows the 988 overlay
          dispatch(setCrisisEnded(true));
        } else if (data?.skipTip) {
          navigationRef.navigate(routes.listenerHomeTab as never);
        } else {
          navigationRef.navigate(routes.listenerSessionFeedback as never);
        }
      } else if (callState.isChatActive) {
        dispatch(endChatSession());
        if (isVenter) {
          // ChatScreen watches crisisEnded and shows the 988 overlay
          dispatch(setCrisisEnded(true));
        } else if (data?.skipTip) {
          navigationRef.navigate(routes.listenerHomeTab as never);
        } else {
          navigationRef.navigate(routes.listenerSessionFeedback as never);
        }
      } else {
        console.log('[GlobalSessionEvents] session:ended ignored — no active call or chat');
      }
    };

    // When the venter cancels a pending request, remove it from the overlay
    const handleCallCancelled = (data: any) => {
      const requestId = data?.requestId ?? data?.callId ?? data?.id;
      console.log('[GlobalSessionEvents] call:cancelled — removing request', requestId);
      if (requestId) {
        dismissedRequestIds.add(requestId);
        dispatch(removeRequest(requestId));
      } else {
        // No ID — clear all pending requests to be safe
        dispatch(clearRequests());
      }
    };

    // When listener declines, also ensure it's removed from Redux
    const handleCallDeclined = (data: any) => {
      const requestId = data?.requestId ?? data?.callId ?? data?.id;
      console.log('[GlobalSessionEvents] call:declined — removing request', requestId);
      if (requestId) {
        dismissedRequestIds.add(requestId);
        dispatch(removeRequest(requestId));
      }
    };

    socketService.on('call:ended', handleCallEnded);
    socketService.on('session:ended', handleSessionEnded);
    socketService.on('call:cancelled', handleCallCancelled);
    socketService.on('call:declined', handleCallDeclined);
    return () => {
      socketService.off('call:ended', handleCallEnded);
      socketService.off('session:ended', handleSessionEnded);
      socketService.off('call:cancelled', handleCallCancelled);
      socketService.off('call:declined', handleCallDeclined);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
