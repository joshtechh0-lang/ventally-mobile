/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// ─── Background / killed-state FCM handler ────────────────────────────────────
// Must be registered at the module level (outside any component) so it runs
// even when the app is in the background or has been killed.
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Display a local notification via Notifee (handles sound + Android channel)
async function displayPushNotification(remoteMessage) {
  const data = remoteMessage?.data || {};
  const isSessionRequest = data?.type === 'session_request';

  // IMPORTANT: Android notification channels are immutable after first creation.
  // If settings changed (sound, importance), bump the channel ID (e.g. _v2 → _v3)
  // so Android creates a fresh channel with the correct settings.
  // The session_request channel uses a custom WAV sound from res/raw/.
  const channelId = isSessionRequest ? 'ventally_incoming_v3' : 'ventally_default_v3';

  await notifee.createChannel({
    id: 'ventally_default_v3',
    name: 'Ventally Notifications',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });

  if (isSessionRequest) {
    // Custom sound file: android/app/src/main/res/raw/session_request.wav
    // Sound name must match the filename without extension.
    await notifee.createChannel({
      id: 'ventally_incoming_v3',
      name: 'Incoming Session Requests',
      importance: AndroidImportance.HIGH,
      sound: 'session_request',
      vibration: true,
      vibrationPattern: [0, 400, 200, 400, 200, 400],
    });
  }

  const notificationId = isSessionRequest ? 'incoming_session_request' : undefined;

  await notifee.displayNotification({
    // Use a fixed ID for session_request so we can cancel it and loop the sound
    id: notificationId,
    title: remoteMessage?.notification?.title || data?.title || 'Ventally',
    body: remoteMessage?.notification?.body || data?.body || 'A venter needs support',
    android: {
      channelId,
      pressAction: { id: 'default' },
      importance: AndroidImportance.HIGH,
      ongoing: isSessionRequest,
      onlyAlertOnce: false,
      autoCancel: !isSessionRequest,
      vibrationPattern: isSessionRequest ? [0, 400, 200, 400, 200, 400] : undefined,
      // Full-screen intent: launches MainActivity over lock screen (WhatsApp-style).
      // Keeps the heads-up banner visible until the user acts.
      // USE_FULL_SCREEN_INTENT is already declared in AndroidManifest.
      fullScreenAction: isSessionRequest ? {
        id: 'default',
        // 'default' resolves to the app's main launch activity (MainActivity)
        launchActivity: 'default',
      } : undefined,
    },
    ios: {
      sound: isSessionRequest ? 'session_request.wav' : 'default',
    },
    data,
  });

  // Start looping the alert sound for session_request notifications.
  // We re-display (update) the notification every 3s so Android replays the sound.
  // The loop is cleared when the notification is cancelled (accept/dismiss).
  if (isSessionRequest) {
    startSessionRequestLoop(remoteMessage);
  }
}

// ── Session request sound loop ────────────────────────────────────────────────
// Android plays the channel sound once per displayNotification call.
// To loop it, we re-display the same notification (same ID) every ~3s.
// The loop stops when:
//   • The notification is cancelled (user taps Accept/Decline in the overlay)
//   • onBackgroundEvent fires with DISMISSED (user swipes away)
//   • 60s elapses (request TTL on backend)
let _sessionRequestLoopTimer = null;
let _sessionRequestLoopCount = 0;
const SESSION_REQUEST_SOUND_INTERVAL_MS = 3200; // slightly longer than wav duration
const SESSION_REQUEST_MAX_LOOPS = 18; // ~60s total

function startSessionRequestLoop(remoteMessage) {
  stopSessionRequestLoop(); // clear any existing loop
  _sessionRequestLoopCount = 0;

  const loop = async () => {
    _sessionRequestLoopCount++;
    if (_sessionRequestLoopCount >= SESSION_REQUEST_MAX_LOOPS) {
      stopSessionRequestLoop();
      // Cancel the notification after TTL — request is certainly expired
      await notifee.cancelNotification('incoming_session_request').catch(() => {});
      return;
    }
    // Re-display with same id to replay sound without creating a new notification
    try {
      await displaySessionRequestSound(remoteMessage);
    } catch (_) {}
    _sessionRequestLoopTimer = setTimeout(loop, SESSION_REQUEST_SOUND_INTERVAL_MS);
  };

  _sessionRequestLoopTimer = setTimeout(loop, SESSION_REQUEST_SOUND_INTERVAL_MS);
}

function stopSessionRequestLoop() {
  if (_sessionRequestLoopTimer !== null) {
    clearTimeout(_sessionRequestLoopTimer);
    _sessionRequestLoopTimer = null;
  }
  _sessionRequestLoopCount = 0;
}

// Re-displays the notification with the same fixed ID to replay the sound.
// Uses onlyAlertOnce: false so Android always plays the sound again.
async function displaySessionRequestSound(remoteMessage) {
  const data = remoteMessage?.data || {};
  await notifee.displayNotification({
    id: 'incoming_session_request',
    title: remoteMessage?.notification?.title || data?.title || 'Ventally',
    body: remoteMessage?.notification?.body || data?.body || 'A venter needs support',
    android: {
      channelId: 'ventally_incoming_v3',
      pressAction: { id: 'default' },
      importance: AndroidImportance.HIGH,
      ongoing: true,
      onlyAlertOnce: false,
      autoCancel: false,
      vibrationPattern: [0, 400, 200, 400],
      fullScreenAction: {
        id: 'default',
        launchActivity: 'default',
      },
    },
    ios: {
      sound: 'session_request.wav',
    },
    data,
  });
}

const debugLog = async (msg) => {
  try {
    const existing = await AsyncStorage.getItem('__fcm_debug_log') || '';
    await AsyncStorage.setItem('__fcm_debug_log', existing + `${new Date().toISOString()} ${msg}\n`);
  } catch (_) {}
};

// Handle FCM messages when app is in the background or killed
messaging().setBackgroundMessageHandler(async remoteMessage => {
  await debugLog(`setBackgroundMessageHandler fired, data: ${JSON.stringify(remoteMessage?.data)}, hasNotification: ${!!remoteMessage?.notification}`);
  const data = remoteMessage?.data || {};

  // For session_request messages, always persist to AsyncStorage immediately.
  // This way the app picks it up when the user opens it — even if they never
  // tap the notification. The _source field lets us distinguish from a tap.
  if (data?.type === 'session_request' && data?.venterId) {
    try {
      await AsyncStorage.setItem('pendingNotificationData', JSON.stringify({
        ...data,
        _eventType: 'background_received', // not a tap, just received
      }));
      await debugLog(`pendingNotificationData saved from setBackgroundMessageHandler`);
    } catch (e) {
      await debugLog(`AsyncStorage setItem FAILED: ${e}`);
    }
  }

  // Always display via Notifee for full-screen intent + looping sound.
  // When the FCM message also contains a notification block (OEM fallback),
  // Android may additionally show a system notification — that's acceptable
  // on killed state (setBackgroundMessageHandler doesn't fire there anyway,
  // so no double-display). On background state both fire, but Notifee uses
  // a fixed notification ID so it just updates the existing banner.
  await displayPushNotification(remoteMessage);
  await debugLog('displayPushNotification called');
});

// Handle Notifee background events (tap on notification when app killed/backgrounded)
notifee.onBackgroundEvent(async ({ type, detail }) => {
  await debugLog(`onBackgroundEvent type=${type} PRESS=${EventType.PRESS} ACTION_PRESS=${EventType.ACTION_PRESS} DISMISSED=${EventType.DISMISSED}`);
  const data = detail.notification?.data;

  // Stop the looping sound whenever the user interacts (tap or swipe)
  if (data?.type === 'session_request') {
    stopSessionRequestLoop();
  }

  // Save on ANY event type so we don't miss a tap — we'll filter by type in the app
  if (data?.type === 'session_request') {
    try {
      await AsyncStorage.setItem('pendingNotificationData', JSON.stringify({...data, _eventType: type, _writtenAt: Date.now()}));
      await debugLog(`pendingNotificationData saved, eventType=${type}`);
    } catch (e) {
      await debugLog(`AsyncStorage setItem FAILED: ${e}`);
    }
  }

  // Cancel notification on press-like events (2 or 3) or dismiss (1)
  if (type === 1 || type === 2 || type === 3 || type === EventType.PRESS || type === EventType.ACTION_PRESS || type === EventType.DISMISSED) {
    await notifee.cancelNotification(detail.notification?.id ?? 'incoming_session_request').catch(() => {});
  }
});

// ── iOS killed-state tap handling ─────────────────────────────────────────────
// On iOS with a notification+data push, the tap is captured by FCM's
// getInitialNotification(), not Notifee. We call BOTH here at module level
// (before React mounts) so the data is in AsyncStorage before auth rehydrates.
// The hook's handleAuthReady reads AsyncStorage and navigates to IncomingRequestScreen.

// Path 1: FCM getInitialNotification (alert+data push — the common iOS case)
messaging().getInitialNotification().then(async (remoteMessage) => {
  await debugLog(`FCM getInitialNotification: ${remoteMessage ? JSON.stringify(remoteMessage.data) : 'null'}`);
  if (remoteMessage?.data?.type === 'session_request') {
    try {
      // Always overwrite — this is a fresh tap from the current launch.
      // _writtenAt lets handleAuthReady discard stale data from a prior session.
      await AsyncStorage.setItem('pendingNotificationData', JSON.stringify({
        ...remoteMessage.data,
        _eventType: 2,
        _source: 'fcm_initial',
        _writtenAt: Date.now(),
      }));
      await debugLog('iOS killed-state tap (FCM): pendingNotificationData saved');
    } catch (e) {
      await debugLog(`iOS killed-state tap (FCM): AsyncStorage write failed: ${e}`);
    }
  }
}).catch((e) => debugLog(`FCM getInitialNotification error: ${e}`));

// Path 2: Notifee getInitialNotification (data-only push displayed by Notifee)
notifee.getInitialNotification().then(async (initial) => {
  await debugLog(`Notifee getInitialNotification: ${initial ? JSON.stringify(initial.notification?.data) : 'null'}`);
  if (!initial) return;
  const data = initial.notification?.data;
  if (data?.type === 'session_request') {
    try {
      // Only write if FCM path didn't already write for this launch.
      const existing = await AsyncStorage.getItem('pendingNotificationData');
      const existingParsed = existing ? JSON.parse(existing) : null;
      const alreadyFresh = existingParsed && existingParsed._source === 'fcm_initial' &&
        existingParsed._writtenAt && (Date.now() - existingParsed._writtenAt < 5000);
      if (!alreadyFresh) {
        await AsyncStorage.setItem('pendingNotificationData', JSON.stringify({
          ...data,
          _eventType: 2,
          _source: 'notifee_initial',
          _writtenAt: Date.now(),
        }));
        await debugLog('iOS killed-state tap (Notifee): pendingNotificationData saved');
      }
    } catch (e) {
      await debugLog(`iOS killed-state tap (Notifee): AsyncStorage write failed: ${e}`);
    }
    await notifee.cancelNotification(initial.notification?.id ?? 'incoming_session_request').catch(() => {});
  }
}).catch((e) => debugLog(`Notifee getInitialNotification error: ${e}`));

AppRegistry.registerComponent(appName, () => App);
