import { useEffect, useRef, useCallback } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Platform, PermissionsAndroid, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Cold-start debug logger ──────────────────────────────────────────────────
// Writes timestamped lines to AsyncStorage key '__cs_debug_log'.
// View on device: Settings → App Info, or via the DebugOverlay component.
export const CS_DEBUG_KEY = '__cs_debug_log';
export const csLog = async (msg: string) => {
  try {
    const ts = new Date().toISOString().slice(11, 23); // HH:mm:ss.mmm
    const line = `${ts} ${msg}\n`;
    const existing = (await AsyncStorage.getItem(CS_DEBUG_KEY)) || '';
    // Keep last 3000 chars so it doesn't grow unbounded
    const trimmed = (existing + line).slice(-3000);
    await AsyncStorage.setItem(CS_DEBUG_KEY, trimmed);
  } catch (_) {}
};
import { useDispatch, useSelector } from 'react-redux';
import apiInstance from '../api/apiInstance';
import { getAccessToken } from '../api/apiInstance';
import { setRequests } from '../store/slices/listenerSlice';
import type { RequestItem } from '../store/slices/listenerSlice';
import type { RootState } from '../store/store';
import { store } from '../store/store';

// ── Foreground session-request sound loop ─────────────────────────────────────
// When a session_request arrives while the app is in the FOREGROUND, we display
// a local notification with sound and loop it every ~3s until the request is
// accepted, declined, or the 60s TTL elapses.
const SOUND_INTERVAL_MS = 3200;
const MAX_LOOPS = 18; // ~60s
let _fgLoopTimer: ReturnType<typeof setTimeout> | null = null;
let _fgLoopCount = 0;

export function stopForegroundSessionLoop() {
  if (_fgLoopTimer !== null) {
    clearTimeout(_fgLoopTimer);
    _fgLoopTimer = null;
  }
  _fgLoopCount = 0;
  // Cancel the notification too so it disappears from the drawer
  notifee.cancelNotification('incoming_session_request').catch(() => {});
}

function startForegroundSessionLoop(remoteMessage: any) {
  stopForegroundSessionLoop();
  _fgLoopCount = 0;

  const loop = async () => {
    _fgLoopCount++;
    if (_fgLoopCount >= MAX_LOOPS) {
      stopForegroundSessionLoop();
      return;
    }
    try {
      await notifee.displayNotification({
        id: 'incoming_session_request',
        title: remoteMessage?.notification?.title || remoteMessage?.data?.title || 'Ventally',
        body: remoteMessage?.notification?.body || remoteMessage?.data?.body || 'A venter needs support',
        android: {
          channelId: CHANNEL_INCOMING,
          pressAction: { id: 'default' },
          importance: AndroidImportance.HIGH,
          sound: 'session_request',
          ongoing: true,
          onlyAlertOnce: false,
          autoCancel: false,
          vibrationPattern: [0, 400, 200, 400],
          fullScreenAction: { id: 'default', launchActivity: 'default' },
        },
        ios: {
          sound: 'session_request.wav',
          // critical: true requires Apple entitlement — without it iOS silently
          // drops the notification entirely. Use foregroundPresentationOptions
          // instead so banners always show when the app is in foreground.
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
        data: remoteMessage?.data || {},
      });
    } catch (_) {}
    _fgLoopTimer = setTimeout(loop, SOUND_INTERVAL_MS);
  };

  _fgLoopTimer = setTimeout(loop, SOUND_INTERVAL_MS);
}

// ─── Create Android notification channels ─────────────────────────────────────
// NOTE: Android channels are immutable after first creation. If you change sound
// or importance, bump the channel ID suffix (v2 → v3) to force a fresh channel.
const CHANNEL_ID = 'ventally_default_v4';
const CHANNEL_INCOMING = 'ventally_incoming_v4';

const ensureChannels = async () => {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Ventally Notifications',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
  await notifee.createChannel({
    id: CHANNEL_INCOMING,
    name: 'Incoming Session Requests',
    importance: AndroidImportance.HIGH,
    sound: 'session_request',   // matches res/raw/session_request.wav
    vibration: true,
    vibrationPattern: [0, 400, 200, 400, 200, 400],
  });
};

// Keep old name working
const ensureChannel = ensureChannels;

// ─── Display a local notification (foreground messages) ──────────────────────
const displayLocalNotification = async (remoteMessage: any) => {
  await ensureChannels();
  const isSessionRequest = remoteMessage?.data?.type === 'session_request';
  const channelId = isSessionRequest ? CHANNEL_INCOMING : CHANNEL_ID;
  await notifee.displayNotification({
    // Fixed ID so we can update/cancel it and loop the sound
    id: isSessionRequest ? 'incoming_session_request' : undefined,
    title: remoteMessage?.notification?.title || remoteMessage?.data?.title || 'Ventally',
    body: remoteMessage?.notification?.body || remoteMessage?.data?.body || 'A venter needs support',
    android: {
      channelId,
      pressAction: { id: 'default' },
      importance: AndroidImportance.HIGH,
      ongoing: isSessionRequest,
      autoCancel: !isSessionRequest,
      onlyAlertOnce: false,
      vibrationPattern: isSessionRequest ? [0, 400, 200, 400, 200, 400] : undefined,
      // Full-screen intent: shows over lock screen, keeps banner visible
      fullScreenAction: isSessionRequest ? {
        id: 'default',
        launchActivity: 'default',
      } : undefined,
    },
    ios: {
      sound: isSessionRequest ? 'session_request.wav' : 'default',
      // critical: true requires Apple entitlement — silently dropped without it.
      // foregroundPresentationOptions ensures banners show when app is in foreground.
      foregroundPresentationOptions: {
        alert: true,
        badge: true,
        sound: true,
      },
    },
    data: remoteMessage?.data || {},
  });

  // Start looping the sound for foreground session_request notifications
  if (isSessionRequest) {
    startForegroundSessionLoop(remoteMessage);
  }
};

// ─── Register FCM token with backend ─────────────────────────────────────────
const registerTokenWithBackend = async (token: string) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return;
    const res = await apiInstance.post('notifications/register', {
      token,
      device_type: Platform.OS,
    }) as { success?: boolean };
    if (res?.success) {
      console.log('✅ FCM token registered with backend');
    }
  } catch (err) {
    console.log('[FCM] Failed to register token with backend:', err);
  }
};

// ─── Get or refresh FCM token and sync to backend ────────────────────────────
// Always fetches the live token from FCM — never relies solely on AsyncStorage.
// The cache is only used to skip an unnecessary backend re-registration when
// the token hasn't changed (token stays the same across sessions unless FCM
// rotates it, which is handled by onTokenRefresh). This ensures that after a
// fresh build install (new GoogleService-Info.plist / new Firebase project) the
// correct token is fetched and sent to the backend rather than the stale one
// that was registered against the previous Firebase project.

// ─── One-time token rotation key ─────────────────────────────────────────────
// Bump this string whenever the Firebase project or GoogleService-Info.plist
// changes. On the next launch after an app update, the old token is deleted and
// a fresh one is fetched, fixing SenderId-mismatch errors caused by stale tokens
// surviving an app update (as opposed to a clean install).
const FCM_ROTATION_KEY = 'fcm_rotation_v2';

const rotateFcmTokenIfNeeded = async (): Promise<void> => {
  try {
    const rotated = await AsyncStorage.getItem(FCM_ROTATION_KEY);
    if (rotated) return; // already rotated on this install
    console.log('[FCM] One-time token rotation — deleting stale token');
    await messaging().deleteToken().catch(() => {});
    await AsyncStorage.removeItem('fcmToken');
    await AsyncStorage.setItem(FCM_ROTATION_KEY, '1');
    console.log('[FCM] Stale token deleted — fresh token will be fetched');
  } catch (err) {
    console.log('[FCM] Token rotation error (non-fatal):', err);
  }
};

const syncFcmToken = async (forceRefresh = false) => {
  try {
    // One-time rotation: delete any stale token from a previous Firebase project.
    await rotateFcmTokenIfNeeded();

    // Always get the current token from FCM — never skip this call.
    const liveToken = await messaging().getToken();
    if (!liveToken) {
      console.log('[FCM] getToken() returned null — skipping registration');
      return;
    }

    const cachedToken = await AsyncStorage.getItem('fcmToken');
    const tokenChanged = forceRefresh || liveToken !== cachedToken;

    // Always update the cache to the live token.
    if (tokenChanged) {
      await AsyncStorage.setItem('fcmToken', liveToken);
      console.log('[FCM] Token changed or forced — registering with backend');
      await registerTokenWithBackend(liveToken);
    } else {
      // Token unchanged — still register so the backend marks it active,
      // but this is a best-effort call and we don't need to await it.
      registerTokenWithBackend(liveToken).catch(() => {});
    }
  } catch (err) {
    console.log('[FCM] Token sync error:', err);
  }
};

// ─── Shared normalizer for calls/pending response rows ───────────────────────
function normalizeRequest(raw: any): RequestItem {
  return {
    id: raw.requestId ?? raw.id,
    type: (raw.requestType === 'call' ? 'call' : 'message') as 'call' | 'message',
    title: raw.requester?.anonymousName ?? 'Anonymous',
    requestType: raw.requestType ?? null,
    requestId: raw.requestId ?? raw.id ?? null,
    venterId: raw.requester?.id ?? raw.venterId ?? null,
    listenerId: raw.listenerId ?? null,
    ratePerMinute: raw.ratePerMinute ?? null,
  };
}

// ─── Main hook ────────────────────────────────────────────────────────────────
const useNotifications = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const isVenter = useSelector((state: RootState) => state.user.isVenter);
  const tokenRefreshUnsubRef = useRef<(() => void) | null>(null);
  const foregroundMsgUnsubRef = useRef<(() => void) | null>(null);

  // When a session_request notification is tapped while the app is killed,
  // we store the pending intent here and process it once auth is ready.
  const pendingNotificationRef = useRef<any>(null);


  // Tracks whether we've started the cold-start poll for this app session
  const coldStartPolledRef = useRef(false);
  // Tracks whether cold-start poll found requests (so auth-ready doesn't double-poll)
  const coldStartFoundRef = useRef(false);

  // ── Active request check ──────────────────────────────────────────────────
  // Called on cold-start (after auth ready) and every time the app comes to
  // the foreground. Populates Redux so IncomingCallOverlay shows automatically —
  // no navigation needed. The overlay is always mounted above all screens.
  // IMPORTANT: defined BEFORE showOverlayFromNotificationData / handleNotificationTap
  // so those callbacks can close over it without getting undefined.
  const checkAndPopulatePending = useCallback(async () => {
    try {
      const state = store.getState();
      if (!state.user.isAuthenticated || state.user.isVenter) return;
      const res = await apiInstance.get('calls/pending');
      const pending: any[] = res?.data?.requests ?? [];
      if (pending.length > 0) {
        const mapped = pending.map(normalizeRequest);
        const existing = store.getState().listener.requests;
        const existingIds = new Set(existing.map((r: any) => r.id));
        const toAdd = mapped.filter((r: any) => !existingIds.has(r.id));
        if (toAdd.length > 0) {
          dispatch(setRequests([...existing, ...toAdd]));
          console.log('[FCM] Populated', toAdd.length, 'pending request(s) into Redux — overlay will show');
        }
      }
    } catch (_) {}
  }, [dispatch]);

  // When a session_request arrives in the foreground, populate Redux from the
  // server so IncomingCallOverlay shows. No navigation — the overlay sits above
  // all screens and handles accept/decline itself.
  const showOverlayFromNotificationData = useCallback((data: any) => {
    if (!data?.type) return;
    pendingNotificationRef.current = null;
    if (data.type === 'session_request') {
      // Populate Redux from server — overlay shows when requests.length > 0
      checkAndPopulatePending();
    }
  }, [checkAndPopulatePending]);

  // On notification tap (foreground or background): populate Redux so the overlay
  // shows. The overlay is always mounted above all screens — no navigation needed.
  const handleNotificationTap = useCallback((data: any) => {
    if (!data) return;
    if (data.type === 'session_request') {
      console.log('[FCM] Notification tapped — populating pending requests for overlay');
      checkAndPopulatePending();
    }
  }, [checkAndPopulatePending]);

  // ── Cold-start pending request poll ──────────────────────────────────────
  // Runs as soon as auth is confirmed (isAuthenticated = true after PersistGate
  // rehydrates). Polls calls/pending with backoff so the IncomingCallOverlay
  // appears regardless of HOW the app was opened — icon tap, notification tap,
  // killed state, background state — no timing assumptions, no notification
  // detection logic.
  //
  // Also handles housekeeping: FCM token sync and goOnline() re-send.
  useEffect(() => {
    if (!isAuthenticated || isVenter) return;
    if (coldStartPolledRef.current) return;
    coldStartPolledRef.current = true;

    const runColdStartPoll = async () => {
      await csLog('=== COLD-START POLL STARTED ===');
      await csLog(`isAuthenticated=${isAuthenticated} isVenter=${isVenter}`);

      // Housekeeping — run in parallel, don't await
      syncFcmToken().catch(() => {});
      AsyncStorage.removeItem('pendingNotificationData').catch(() => {});

      // Always re-announce availability on cold start so the backend knows
      // the listener is online and pending requests remain active.
      // App kill drops the socket so we must re-post regardless of the
      // persisted preference — the listener opened the app, they're here.
      const wasOnline = store.getState().listener.listenerAvailabilityPreference === true;
      await csLog(`wasOnline=${wasOnline} — posting availability/online unconditionally`);
      try {
        await apiInstance.post('availability/online');
        await csLog('availability/online: OK');
      } catch (e: any) {
        await csLog(`availability/online ERROR: ${e?.message}`);
      }

      // Poll calls/pending with backoff. Stops as soon as requests are found.
      // Delays: immediate, then 1s, 2s, 3.5s, 5s, 7s = up to ~18s total coverage.
      const RETRY_DELAYS = [0, 1000, 2000, 3500, 5000, 7000];

      for (let i = 0; i < RETRY_DELAYS.length; i++) {
        if (i > 0) {
          await new Promise<void>(r => setTimeout(r, RETRY_DELAYS[i]));
        }
        // Stop if another path (socket, foreground message) already populated Redux
        if (store.getState().listener.requests.length > 0) {
          await csLog('overlay already populated by another path — stopping');
          coldStartFoundRef.current = true;
          return;
        }
        try {
          await csLog(`poll attempt ${i + 1} — calling calls/pending`);
          const res = await apiInstance.get('calls/pending');
          const rawRequests: any[] = res?.data?.requests ?? [];
          await csLog(`attempt ${i + 1} result: ${rawRequests.length} request(s) | raw=${JSON.stringify(res?.data).slice(0,200)}`);
          if (rawRequests.length > 0) {
            const mapped = rawRequests.map(normalizeRequest);
            dispatch(setRequests(mapped));
            coldStartFoundRef.current = true;
            await csLog(`dispatched ${mapped.length} request(s) — overlay should show`);
            return; // done
          }
        } catch (err: any) {
          await csLog(`attempt ${i + 1} ERROR: ${err?.message} | status=${err?.response?.status} | data=${JSON.stringify(err?.response?.data).slice(0,200)}`);
        }
      }
      await csLog('=== COLD-START POLL DONE — no requests found ===');
    };

    runColdStartPoll();
  }, [isAuthenticated, isVenter, dispatch]);

  // ── Foreground resume check ───────────────────────────────────────────────
  // Every time the app comes back to the foreground (from background or lock
  // screen), poll calls/pending and populate Redux so the overlay shows if
  // there's an active request. No navigation needed — overlay handles display.
  useEffect(() => {
    if (!isAuthenticated || isVenter) return;
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkAndPopulatePending();
      }
    });
    return () => sub.remove();
  }, [isAuthenticated, isVenter, checkAndPopulatePending]);

  useEffect(() => {
    bootstrap();

    return () => {
      tokenRefreshUnsubRef.current?.();
      foregroundMsgUnsubRef.current?.();
    };
  }, []);

  const bootstrap = async () => {
    await requestPermissions();
    await ensureChannel();
    setupListeners();
    handleKilledStateNotification();
  };

  // ── Permissions ─────────────────────────────────────────────────────────
  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'ios') {
        const settings = await notifee.requestPermission({
          sound: true,
          alert: true,
          badge: true,
          provisional: false,
          // Do NOT request criticalAlert — requires Apple entitlement and
          // causes the entire permission dialog to be rejected on apps without it.
        });
        console.log('[FCM] iOS permission status:', settings.authorizationStatus);
      }

      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        // Battery optimization check removed — opening settings on every launch was disruptive.
      }

      await messaging().registerDeviceForRemoteMessages();

      const authStatus = await messaging().requestPermission();
      // requestPermission() may return NOT_DETERMINED on iOS when the user
      // already granted via notifee above — fall back to hasPermission() check.
      const hasPermission = await messaging().hasPermission();
      const granted =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL ||
        hasPermission === messaging.AuthorizationStatus.AUTHORIZED ||
        hasPermission === messaging.AuthorizationStatus.PROVISIONAL;

      console.log('[FCM] authStatus:', authStatus, 'hasPermission:', hasPermission, 'granted:', granted);

      if (granted) {
        await syncFcmToken();
      } else {
        console.log('[FCM] Permission denied');
      }
    } catch (err) {
      console.log('[FCM] Permission error:', err);
    }
  };

  // ── Listeners ───────────────────────────────────────────────────────────
  const setupListeners = () => {
    // Foreground FCM messages — display as local notification
    foregroundMsgUnsubRef.current = messaging().onMessage(async remoteMessage => {
      console.log('[FCM] Foreground message:', remoteMessage);
      await displayLocalNotification(remoteMessage);
      if (remoteMessage?.data?.type === 'session_request') {
        // Show overlay immediately from notification data, then refresh from backend
        showOverlayFromNotificationData(remoteMessage.data);
      }
    });

    // Token refresh
    tokenRefreshUnsubRef.current = messaging().onTokenRefresh(async newToken => {
      console.log('[FCM] Token refreshed');
      await AsyncStorage.setItem('fcmToken', newToken);
      await registerTokenWithBackend(newToken);
    });

    // Foreground notifee notification taps / dismissals
    notifee.onForegroundEvent(({ type, detail }) => {
      if (detail.notification?.data?.type === 'session_request') {
        if (type === EventType.DISMISSED || type === EventType.PRESS || type === EventType.ACTION_PRESS) {
          stopForegroundSessionLoop();
        }
      }
      if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
        handleNotificationTap(detail.notification?.data);
      }
    });
  };

  // ── Killed-state / background tap handling ───────────────────────────────
  const handleKilledStateNotification = () => {
    // Killed-state cold-start taps are now handled entirely by the pre-rehydration
    // useEffect above (two-phase: notifee.getInitialNotification() → AsyncStorage
    // fallback with 600ms delay). No AsyncStorage polling needed here — that old
    // approach raced against Phase 2 by deleting pendingNotificationData immediately.

    // App was in background (not killed) and user tapped notification.
    // Auth is already live here so we can act immediately.
    messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage) {
        console.log('[FCM] App opened from background via notification');
        handleNotificationTap(remoteMessage.data);
      }
    });
  };
};

export default useNotifications;
