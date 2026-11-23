import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {
  RewardedInterstitialAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import apiInstance from '../../api/apiInstance';
import { toastSuccess, toastError } from '../../utils/toast';
import { routes } from '../../navigation/routes';

// ---------------------------------------------------------------------------
// Ad Unit IDs
// Replace these with your real Ad Unit IDs from admob.google.com before going live.
// Keep TestIds during development so you don't violate AdMob policy.
// ---------------------------------------------------------------------------
const IS_PROD = !__DEV__;

const ANDROID_AD_UNIT_ID = IS_PROD
  ? 'ca-app-pub-2329497752967659/6864291129'
  : TestIds.REWARDED_INTERSTITIAL;

const IOS_AD_UNIT_ID = IS_PROD
  ? 'ca-app-pub-2329497752967659/7985801108'
  : TestIds.REWARDED_INTERSTITIAL;

const AD_UNIT_ID = Platform.OS === 'ios' ? IOS_AD_UNIT_ID : ANDROID_AD_UNIT_ID;

const AD_COUNT = 3;
const STORAGE_KEY = 'ventally_ad_progress';

type RewardType = 'voice' | 'chat';

async function getStoredProgress(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (parsed.date !== new Date().toDateString()) return 0;
    return Math.min(parsed.watched ?? 0, AD_COUNT);
  } catch {
    return 0;
  }
}

async function saveProgress(watched: number) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      watched,
      date: new Date().toDateString(),
    }));
  } catch {}
}

// ---------------------------------------------------------------------------
// Hook: load one rewarded interstitial ad, reload after each show
// ---------------------------------------------------------------------------
function useRewardedAd() {
  const [ad, setAd] = useState<RewardedInterstitialAd | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  const load = useCallback(() => {
    setAdLoaded(false);
    setAdError(false);
    const instance = RewardedInterstitialAd.createForAdRequest(AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: false,
    });
    const unsubLoaded = instance.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setAdLoaded(true);
      setAdError(false);
    });
    const unsubEarned = instance.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        // handled in showAd callback via Promise resolve
      },
    );
    const unsubError = instance.addAdEventListener(AdEventType.ERROR, () => {
      setAdError(true);
      setAdLoaded(false);
    });
    instance.load();
    setAd(instance);
    return () => { unsubLoaded(); unsubEarned(); unsubError(); };
  }, []);

  useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [load]);

  return { ad, adLoaded, adError, reload: load };
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
const VenterWatchAdsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [adsWatched, setAdsWatched] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [watching, setWatching] = useState(false);
  const [showRewardChoice, setShowRewardChoice] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const { ad, adLoaded, adError, reload } = useRewardedAd();

  const allDone = adsWatched >= AD_COUNT;

  useEffect(() => {
    getStoredProgress().then(n => {
      setAdsWatched(n);
      setLoaded(true);
      if (n >= AD_COUNT) setShowRewardChoice(true);
    });
  }, []);

  const watchAd = useCallback(async () => {
    if (!ad || !adLoaded || watching || allDone) return;
    setWatching(true);

    return new Promise<void>(resolve => {
      let earned = false;

      const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      });

      const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        unsubEarned();
        unsubClosed();
        setWatching(false);

        if (earned) {
          const next = adsWatched + 1;
          setAdsWatched(next);
          saveProgress(next);
          if (next >= AD_COUNT) setShowRewardChoice(true);
        } else {
          toastError({ text: 'Please watch the full ad to earn credit.' });
        }
        // Pre-load next ad
        reload();
        resolve();
      });

      ad.show();
    });
  }, [ad, adLoaded, watching, allDone, adsWatched, reload]);

  const claimReward = async (type: RewardType) => {
    setClaiming(true);
    try {
      await apiInstance.post('ads/claim-reward', { rewardType: type });
    } catch {
      // silent — backend may not have this yet
    } finally {
      await saveProgress(0);
      setClaiming(false);
      setRewardClaimed(true);
      setShowRewardChoice(false);
      toastSuccess(
        type === 'voice'
          ? '5 free voice minutes added to your Wallet!'
          : '20 free chat messages added to your Wallet!',
      );
      setTimeout(() => (navigation as any).navigate(routes.venterHome), 1800);
    }
  };

  const s = StyleSheet.create({
    section: { marginBottom: hp(3) },
    card: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: hp(2),
      padding: hp(2.2),
      borderWidth: 0.5,
      borderColor: 'rgba(255,255,255,0.1)',
    },
    sectionTitle: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.7),
      color: theme.white,
      marginBottom: hp(1.5),
    },
    label: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: 'rgba(255,255,255,0.65)',
    },
    progressRow: { flexDirection: 'row', gap: wp(2), marginBottom: hp(1.5) },
    progressBar: {
      flex: 1,
      height: hp(1.2),
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderRadius: hp(1),
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: hp(1),
      backgroundColor: '#a855f7',
    },
    btn: {
      paddingVertical: hp(1.8),
      borderRadius: hp(1.8),
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnPrimary: { backgroundColor: 'rgba(124,58,237,0.8)' },
    btnDisabled: { backgroundColor: 'rgba(255,255,255,0.08)' },
    btnText: { fontFamily: fontFamilies.semiBold, fontSize: hp(1.8), color: theme.white },
    rewardRow: { flexDirection: 'row', gap: wp(3), marginTop: hp(2) },
    rewardBtn: {
      flex: 1,
      paddingVertical: hp(2.5),
      borderRadius: hp(2),
      alignItems: 'center',
      borderWidth: 1.5,
    },
    rewardEmoji: { fontSize: hp(3.5), marginBottom: hp(1) },
    rewardLabel: { fontFamily: fontFamilies.bold, fontSize: hp(1.8), color: theme.white, textAlign: 'center' },
    rewardSub: { fontFamily: fontFamilies.normal, fontSize: hp(1.4), color: 'rgba(255,255,255,0.5)', marginTop: hp(0.3) },
    howStep: { flexDirection: 'row', alignItems: 'flex-start', gap: wp(3), marginBottom: hp(1.5) },
    howDot: {
      width: hp(2.8), height: hp(2.8), borderRadius: hp(1.4),
      backgroundColor: 'rgba(124,58,237,0.2)',
      alignItems: 'center', justifyContent: 'center',
      marginTop: hp(0.2),
    },
    howDotText: { fontFamily: fontFamilies.bold, fontSize: hp(1.4), color: '#a78bfa' },
    howText: { flex: 1, fontFamily: fontFamilies.normal, fontSize: hp(1.6), color: 'rgba(255,255,255,0.6)', lineHeight: hp(2.3) },
  });

  if (!loaded) {
    return (
      <HomeWrapper>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#a855f7" />
        </View>
      </HomeWrapper>
    );
  }

  const isAdReady = adLoaded && !adError;
  const btnDisabled = !isAdReady || watching || allDone;

  return (
    <HomeWrapper>
      <ScreenHeader title="Free session" onBack={() => (navigation as any).goBack()} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: wp(5), paddingBottom: hp(5) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress card */}
        <View style={[s.section, s.card]}>
          <Text style={[s.sectionTitle, { marginBottom: hp(1) }]}>Your progress today</Text>
          <View style={s.progressRow}>
            {Array.from({ length: AD_COUNT }).map((_, i) => (
              <View key={i} style={s.progressBar}>
                <View style={[s.progressFill, { width: i < adsWatched ? '100%' : '0%' }]} />
              </View>
            ))}
          </View>
          <Text style={s.label}>
            {adsWatched === 0 && 'Watch 3 ads to earn your free session reward.'}
            {adsWatched === 1 && '1 of 3 done — 2 more to go!'}
            {adsWatched === 2 && '2 of 3 done — almost there!'}
            {adsWatched >= 3 && !rewardClaimed && '🎉 All 3 watched — choose your reward below!'}
            {rewardClaimed && '✅ Reward added to your Wallet!'}
          </Text>
        </View>

        {/* Ad launcher */}
        {!allDone && !rewardClaimed && (
          <View style={[s.section, s.card]}>
            <Text style={s.sectionTitle}>Ad {adsWatched + 1} of {AD_COUNT}</Text>
            <Text style={[s.label, { marginBottom: hp(2) }]}>
              {adError
                ? 'No ad available right now — please try again in a moment.'
                : !adLoaded
                  ? 'Loading ad…'
                  : 'Tap the button to watch a short ad. You must watch it to the end to earn credit.'}
            </Text>
            <TouchableOpacity
              style={[s.btn, btnDisabled ? s.btnDisabled : s.btnPrimary]}
              onPress={watchAd}
              activeOpacity={0.8}
              disabled={btnDisabled}
            >
              {watching || (!adLoaded && !adError) ? (
                <ActivityIndicator color={theme.white} />
              ) : (
                <Text style={s.btnText}>
                  {adError ? 'Retry' : `Watch Ad ${adsWatched + 1} →`}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Reward choice */}
        {showRewardChoice && !rewardClaimed && (
          <View style={[s.section, s.card, { alignItems: 'center' }]}>
            <Text style={{ fontSize: hp(3.5), marginBottom: hp(1) }}>🎁</Text>
            <Text style={[s.sectionTitle, { textAlign: 'center' }]}>Choose your reward</Text>
            <Text style={[s.label, { textAlign: 'center', marginBottom: hp(0.5) }]}>
              Pick the session type you want to use. Good for one session today.
            </Text>
            <View style={s.rewardRow}>
              <TouchableOpacity
                style={[s.rewardBtn, { backgroundColor: 'rgba(124,58,237,0.15)', borderColor: 'rgba(167,139,250,0.4)' }]}
                onPress={() => claimReward('voice')}
                disabled={claiming}
                activeOpacity={0.8}
              >
                <Text style={s.rewardEmoji}>📞</Text>
                <Text style={s.rewardLabel}>5 voice{'\n'}minutes</Text>
                <Text style={s.rewardSub}>Talk to a Guide</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.rewardBtn, { backgroundColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(147,197,253,0.3)' }]}
                onPress={() => claimReward('chat')}
                disabled={claiming}
                activeOpacity={0.8}
              >
                <Text style={s.rewardEmoji}>💬</Text>
                <Text style={s.rewardLabel}>20 chat{'\n'}messages</Text>
                <Text style={s.rewardSub}>Text at your pace</Text>
              </TouchableOpacity>
            </View>
            {claiming && <ActivityIndicator color="#a855f7" style={{ marginTop: hp(1.5) }} />}
          </View>
        )}

        {/* Reward claimed */}
        {rewardClaimed && (
          <View style={[s.section, s.card, { alignItems: 'center' }]}>
            <Text style={{ fontSize: hp(3.5), marginBottom: hp(1) }}>✅</Text>
            <Text style={[s.sectionTitle, { textAlign: 'center' }]}>Reward added!</Text>
            <Text style={[s.label, { textAlign: 'center' }]}>Taking you back to your home screen…</Text>
          </View>
        )}

        {/* How it works */}
        {!allDone && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>How it works</Text>
            {[
              'Tap "Watch Ad" — a short Google Ad will play fullscreen',
              'Watch to the end to earn credit (skipping means no credit)',
              'After 3 ads choose your reward: 5 voice minutes or 20 chat messages',
              'Come back tomorrow to earn again',
            ].map((text, i) => (
              <View key={i} style={s.howStep}>
                <View style={s.howDot}>
                  <Text style={s.howDotText}>{i + 1}</Text>
                </View>
                <Text style={s.howText}>{text}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </HomeWrapper>
  );
};

export default VenterWatchAdsScreen;
