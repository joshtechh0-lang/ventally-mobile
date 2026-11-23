import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import {
  createAgoraRtcEngine,
  IRtcEngine,
  IRtcEngineEventHandler,
  RtcConnection,
  ChannelProfileType,
  ClientRoleType,
} from 'react-native-agora';

const DEFAULT_APP_ID = '25832db4fae5418f977c634900af9904';

async function requestAudioPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.MODIFY_AUDIO_SETTINGS,
    ]);
    return results[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED;
  } catch (e) {
    return false;
  }
}

interface UseAgoraOptions {
  appId?: string;
  onJoinChannelSuccess?: (channel: string, uid: number) => void;
  onUserJoined?: (uid: number) => void;
  onUserOffline?: (uid: number) => void;
  onError?: (errCode: number) => void;
}

export interface JoinChannelParams {
  token: string;
  channelName: string;
  uid?: number | null;
}

export function useAgora(options: UseAgoraOptions = {}) {
  const { appId = DEFAULT_APP_ID } = options;

  const onJoinRef = useRef(options.onJoinChannelSuccess);
  const onUserJoinedRef = useRef(options.onUserJoined);
  const onUserOfflineRef = useRef(options.onUserOffline);
  const onErrorRef = useRef(options.onError);

  useEffect(() => { onJoinRef.current = options.onJoinChannelSuccess; }, [options.onJoinChannelSuccess]);
  useEffect(() => { onUserJoinedRef.current = options.onUserJoined; }, [options.onUserJoined]);
  useEffect(() => { onUserOfflineRef.current = options.onUserOffline; }, [options.onUserOffline]);
  useEffect(() => { onErrorRef.current = options.onError; }, [options.onError]);

  const engineRef = useRef<IRtcEngine | null>(null);
  const readyRef = useRef(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [remoteUid, setRemoteUid] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let destroyed = false;

    const init = async () => {
      if (readyRef.current) return;
      try {
        const ok = await requestAudioPermission();
        if (!ok) throw new Error('Microphone permission denied');

        const engine = createAgoraRtcEngine();

        engine.initialize({
          appId,
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
        });

        engine.enableAudio();
        engine.enableWebSdkInteroperability(true);
        engine.setDefaultAudioRouteToSpeakerphone(true);

        const handler: IRtcEngineEventHandler = {
          onJoinChannelSuccess(connection: RtcConnection, _elapsed: number) {
            if (destroyed) return;
            console.log('[Agora] Joined:', connection.channelId, connection.localUid);
            engine.muteLocalAudioStream(false);
            engine.muteAllRemoteAudioStreams(false);
            engine.setEnableSpeakerphone(true);
            setIsJoined(true);
            setIsConnecting(false);
            setError(null);
            onJoinRef.current?.(connection.channelId ?? '', connection.localUid ?? 0);
          },
          onUserJoined(_conn: RtcConnection, uid: number) {
            if (destroyed) return;
            console.log('[Agora] Remote user joined:', uid);
            engine.muteAllRemoteAudioStreams(false);
            setRemoteUid(uid);
            onUserJoinedRef.current?.(uid);
          },
          onUserOffline(_conn: RtcConnection, uid: number) {
            if (destroyed) return;
            console.log('[Agora] Remote user left:', uid);
            setRemoteUid(0);
            onUserOfflineRef.current?.(uid);
          },
          onError(errCode: number, msg: string) {
            if (destroyed) return;
            console.error('[Agora] Error:', errCode, msg);
            setError(msg || String(errCode));
            setIsConnecting(false);
            onErrorRef.current?.(errCode);
          },
        };

        engine.registerEventHandler(handler);
        engineRef.current = engine;
        readyRef.current = true;
        console.log('[Agora] Engine ready');
      } catch (e) {
        console.error('[Agora] Init error:', e);
        if (!destroyed) setError(e instanceof Error ? e.message : String(e));
      }
    };

    init();

    return () => {
      destroyed = true;
      try { engineRef.current?.leaveChannel(); } catch (_) {}
      try { engineRef.current?.release(); } catch (_) {}
      engineRef.current = null;
      readyRef.current = false;
    };
  }, [appId]);

  const joinChannel = useCallback(async (params: JoinChannelParams) => {
    const channel = params.channelName?.trim();
    if (!channel) { setError('Channel name required'); return; }

    if (!readyRef.current || !engineRef.current) {
      console.warn('[Agora] Engine not ready, waiting...');
      for (let i = 0; i < 10; i++) {
        await new Promise<void>(r => setTimeout(r, 500));
        if (readyRef.current && engineRef.current) break;
      }
      if (!engineRef.current) { setError('Engine not initialized'); return; }
    }

    const uid = params.uid === undefined || params.uid === null ? 0 : Number(params.uid);
    console.log('[Agora] Joining channel:', channel, 'uid:', uid);
    setIsConnecting(true);

    try {
      const result = engineRef.current.joinChannel(params.token, channel, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        publishMicrophoneTrack: true,
        autoSubscribeAudio: true,
      });
      console.log('[Agora] joinChannel result:', result);
      if (result < 0) { setError('Join failed: ' + result); setIsConnecting(false); }
    } catch (e) {
      console.error('[Agora] joinChannel threw:', String(e));
      setError(String(e));
      setIsConnecting(false);
    }
  }, []);

  const leaveChannel = useCallback(() => {
    try {
      engineRef.current?.leaveChannel();
      setIsJoined(false);
      setRemoteUid(0);
      setIsConnecting(false);
    } catch (e) {
      console.error('[Agora] Leave error:', e);
    }
  }, []);

  const toggleMute = useCallback((mute: boolean) => {
    try { engineRef.current?.muteLocalAudioStream(mute); } catch (_) {}
  }, []);

  const setSpeakerphoneEnabled = useCallback((enabled: boolean) => {
    try { engineRef.current?.setEnableSpeakerphone(enabled); } catch (_) {}
  }, []);

  return { joinChannel, leaveChannel, toggleMute, setSpeakerphoneEnabled, isJoined, isConnecting, remoteUid, error };
}

export { useAgora as default };
