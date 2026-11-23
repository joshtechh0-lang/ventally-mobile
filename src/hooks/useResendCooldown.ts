import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@otpResendCooldown:';

const readUntil = async (key: string): Promise<number> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_PREFIX + key);
    const ts = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(ts) ? ts : 0;
  } catch {
    return 0;
  }
};

const writeUntil = async (key: string, until: number) => {
  try {
    if (until > Date.now()) {
      await AsyncStorage.setItem(STORAGE_PREFIX + key, String(until));
    } else {
      await AsyncStorage.removeItem(STORAGE_PREFIX + key);
    }
  } catch {}
};

const computeSecondsLeft = (until: number) =>
  Math.max(0, Math.ceil((until - Date.now()) / 1000));

/**
 * Tracks an OTP resend cooldown keyed by something stable (usually the email
 * or identifier). Returns the remaining seconds, a `canResend` flag, and a
 * `startCooldown` function to call after a successful resend. The timestamp
 * is persisted to AsyncStorage so the cooldown survives reloads.
 *
 * If `startImmediately` is true, the cooldown is initialized on mount (useful
 * for OTP screens where a code was just sent during the prior step).
 */
export const useResendCooldown = (
  key: string | undefined | null,
  durationSec: number = 300,
  startImmediately: boolean = true,
) => {
  const safeKey = key || '';
  // Initialize synchronously to the full duration when startImmediately so the
  // countdown is visible on the first render. The async AsyncStorage read
  // below will correct downward if a previous cooldown is still pending.
  const [secondsLeft, setSecondsLeft] = useState(
    startImmediately && safeKey ? durationSec : 0,
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTicking = useCallback((until: number) => {
    clearTimer();
    setSecondsLeft(computeSecondsLeft(until));
    if (until <= Date.now()) return;
    intervalRef.current = setInterval(() => {
      const left = computeSecondsLeft(until);
      setSecondsLeft(left);
      if (left <= 0) clearTimer();
    }, 1000);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!safeKey) {
      setSecondsLeft(0);
      return;
    }
    (async () => {
      let until = await readUntil(safeKey);
      if (!until && startImmediately) {
        until = Date.now() + durationSec * 1000;
        await writeUntil(safeKey, until);
      }
      if (cancelled) return;
      startTicking(until);
    })();
    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [safeKey, durationSec, startImmediately, startTicking]);

  const startCooldown = useCallback(() => {
    if (!safeKey) return;
    const until = Date.now() + durationSec * 1000;
    writeUntil(safeKey, until);
    startTicking(until);
  }, [safeKey, durationSec, startTicking]);

  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  const formatted = `${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`;

  return {
    secondsLeft,
    canResend: secondsLeft <= 0,
    formatted,
    startCooldown,
  };
};
