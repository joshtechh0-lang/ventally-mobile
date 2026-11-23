import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import GlassWrapper from '../../components/GlassWrapper';
import Button from '../../components/Button';
import { happyIcon, neutralIcon, sadIcon, axiousIcon, star, starFilled, heart } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import { useSelector } from 'react-redux';
import { Loader } from '../../components';
import { apiInstance } from '../../api';
import { toastError } from '../../utils/toast';
import type { RootState } from '../../store/store';
import { useWallet } from '../../api/apiHooks/useWallet';

// Mood emojis for feedback about call or chat
const MOOD_EMOJIS = [
  { key: 'veryHappy', icon: happyIcon },
  // { key: 'happy', icon: happyIcon },
  { key: 'neutral', icon: neutralIcon },
  { key: 'sad', icon: sadIcon },
  { key: 'verySad', icon: axiousIcon },
] as const;

const SessionFeedbackScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const { t } = useTranslationWithUpdate();
  const { theme } = useTheme();
  const { data, type } = route?.params;
  const { user } = useSelector((state: any) => state.user);
  const session = useSelector((state: RootState) => state.session);
  console.log('Session details in feedback screen:', session);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedMood, setSelectedMood] = useState<string>('happy');
  const [feedback, setFeedback] = useState('');
  const [starRating, setStarRating] = useState<number>(4);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(true);
  const { getSubscription } = useWallet();
  const homeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch subscription to decide whether to show upgrade offer
  useEffect(() => {
    getSubscription().then((res: any) => {
      const sub = res?.subscription ?? res?.data?.subscription;
      setIsSubscriber(sub?.status === 'active');
    }).catch(() => setIsSubscriber(false));
  }, []);

  // Navigate to home 3 seconds after thank you is shown
  useEffect(() => {
    if (!showThankYou) return;
    homeTimeoutRef.current = setTimeout(() => {
      setShowThankYou(false);
      (navigation as any).dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: routes.venterHomeTab }],
        }),
      );
    }, 3000);
    return () => {
      if (homeTimeoutRef.current) {
        clearTimeout(homeTimeoutRef.current);
        homeTimeoutRef.current = null;
      }
    };
  }, [showThankYou, navigation]);

  const styles = StyleSheet.create({
    content: {
      flex: 1,

    },
    scrollContent: {
      flexGrow: 1,
      alignItems: 'center',
    },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(1),
    },
    subtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + "90",
      textAlign: 'center',
      marginBottom: hp(5.5),
    },
    moodRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: "center",
      gap: wp(3),
      marginBottom: hp(3),
    },
    moodButton: {
      width: hp(6),
      height: hp(6),
      borderRadius: hp(3.5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    moodIcon: {
      width: hp(3),
      height: hp(3),
      tintColor: theme.white,
      resizeMode: 'contain',
      alignSelf: "center"
    },
    feedbackCard: {
      width: '100%',
      paddingHorizontal: wp(4),
      // paddingVertical: hp(1),
      borderRadius: hp(2),
      marginBottom: hp(2),
    },
    feedbackLabel: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.7),
      color: theme.white,
      marginBottom: hp(1),
    },
    feedbackInput: {
      height: hp(10),
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      minHeight: hp(8),
      textAlignVertical: 'top',
    },
    starRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: wp(2),
      marginBottom: hp(5),
    },
    starButton: {
      padding: wp(1),
    },
    starIcon: {
      width: hp(2.8),
      height: hp(2.8),
      tintColor: theme.white,
      resizeMode: 'contain',
    },
    buttonsColumn: {
      gap: hp(1.5),
      width: '100%',
    },
    thankYouContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: wp(5),
    },
    thankYouTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
    },
    heartEmoji: {
      fontSize: hp(3),
    },
    glassBg: {
      backgroundColor: theme.black + "30"
    }
  });

  const handleBack = () => {
    const parent = (navigation as any).getParent();
    if (parent) {
      parent.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: routes.venterHomeTab }],
        })
      );
    } else {
      (navigation as any).navigate(routes.venterHomeTab);
    }
  };

  const handleSubmit = async () => {
    console.log('session====+=+==+=++=+=+>' , session);
    const payload = {
      sessionType: type,
      sessionId: session?.sessionId,
      revieweeId: session?.listenerId,
      rating: starRating,
      comment: feedback
    }
    console?.log('--------------------------->>Payload', JSON?.stringify(payload, null, 2));
    try {
      setIsLoading(true);
      const res = await apiInstance.post('reviews', payload)
      console?.log('--------------------------->>Res', res);
      if ((res as any)?.success) {
        setShowThankYou(true);
      }

    } catch (err: any) {
      console?.log('--------------------------->>Err', err);
      toastError({ text: err?.error })
    } finally {
      setIsLoading(false);
    }

    // setShowThankYou(true);
  };

  const handleSkip = () => {
    console?.log('--------------------------->>Chat', data);

    setShowThankYou(true);

  };

const handleThankYouPress = () => {
    const parent = (navigation as any).getParent();
    if (parent) {
        parent.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: routes.venterHomeTab }],
            })
        );
    } else {
        (navigation as any).navigate(routes.venterHomeTab);
    }
  };

  // Thank you view
  if (showThankYou) {
    return (
      <HomeWrapper>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: wp(5), gap: hp(2) }}>
          <TouchableOpacity onPress={handleThankYouPress} activeOpacity={1}>
            <GlassWrapper bordered glassStyles={{ backgroundColor: theme.black + '10' }} style={{ width: '100%', paddingVertical: hp(8), paddingHorizontal: wp(4) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(2) }}>
                <Text style={styles.thankYouTitle}>{t('SessionRating.thankYouTitle')}{' '}</Text>
                <Image source={heart} style={{ width: hp(2.8), height: hp(2.8), resizeMode: 'contain' }} />
              </View>
            </GlassWrapper>
          </TouchableOpacity>

          {/* Membership upgrade offer — non-subscriber venters */}
          {user?.userType === 'venter' && !isSubscriber && (
            <GlassWrapper bordered glassStyles={{ backgroundColor: theme.black + '15' }} style={{ width: '100%', padding: hp(2.5), alignItems: 'center' }}>
              <Text style={{ color: 'rgba(170,120,255,0.9)', fontSize: hp(1.3), fontFamily: fontFamilies.semiBold, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: hp(0.5) }}>Member plan</Text>
              <Text style={{ color: theme.white, fontSize: hp(2), fontFamily: fontFamilies.bold, textAlign: 'center', marginBottom: hp(0.5) }}>Unlimited support, every month</Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: hp(1.4), fontFamily: fontFamilies.normal, textAlign: 'center', marginBottom: hp(2.5) }}>Rollover minutes · no per-session charge · priority matching</Text>
              <Button
                title="See membership plans"
                onPress={() => {
                  if (homeTimeoutRef.current) clearTimeout(homeTimeoutRef.current);
                  (navigation as any).navigate(routes.venterInternal, { screen: routes.venterUpgradePlan });
                }}
                buttonStyle={{ width: '100%' }}
                glassStyles={{ width: '100%' }}
                titleStyle={{ color: theme.white }}
                disabled={false}
                borderedGlassButton
              />
              <TouchableOpacity onPress={handleThankYouPress} style={{ marginTop: hp(1.5) }}>
                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: hp(1.4), fontFamily: fontFamilies.normal }}>Maybe later</Text>
              </TouchableOpacity>
            </GlassWrapper>
          )}
        </View>
      </HomeWrapper>
    );
  }

  return (
    <HomeWrapper>
      <ScreenHeader
        title=""
        onBackPress={handleBack}
        showBackButton
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: wp(4) }}>

          <Text style={styles.title}>{t('SessionRating.moodCheckTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('SessionRating.moodCheckSubtitle')}
          </Text>
        </View>

        <GlassWrapper bordered style={{ width: "100%", padding: hp(2), height: "100%" }} glassStyles={{
          backgroundColor: theme.black + "30"
        }}    >

          {/* Mood emoji selector */}
          <View style={styles.moodRow}>
            {MOOD_EMOJIS.map((mood) => {
              const isSelected = selectedMood === mood.key;
              return (
                <TouchableOpacity
                  key={mood.key}
                  onPress={() => setSelectedMood(mood.key)}
                  activeOpacity={0.7}
                >
                  <GlassWrapper
                    // bordered={!isSelected}
                    glassStyles={{
                      backgroundColor: isSelected ? theme.white + "20" : theme.black + '40'

                    }}
                    style={{
                      ...styles.moodButton,
                    }}
                  >
                    <Image source={mood.icon} style={styles.moodIcon} />
                  </GlassWrapper>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.feedbackLabel}>
            {t('SessionRating.feedbackLabel')}
          </Text>
          {/* Feedback input */}
          <GlassWrapper bordered glassStyles={styles.glassBg} style={styles.feedbackCard}>

            <TextInput
              style={styles.feedbackInput}
              value={feedback}
              onChangeText={setFeedback}
              placeholder={t('SessionRating.feedbackPlaceholder')}
              placeholderTextColor={theme.white60}
              multiline
            />
          </GlassWrapper>

          {/* Star rating */}
          <Text style={[styles.feedbackLabel, {
            alignSelf: "center",
            marginBottom: hp(2)
          }]}>
            {t('SessionRating.helpfulRatingLabel')}
          </Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((index) => (
              <TouchableOpacity
                key={index}
                style={styles.starButton}
                onPress={() => setStarRating(index)}
                activeOpacity={0.7}
              >
                <Image
                  source={index <= starRating ? starFilled : star}
                  style={styles.starIcon}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttonsColumn}>
            <Button
              title={t('SessionRating.submit')}
              onPress={handleSubmit}
              buttonStyle={{}}
              titleStyle={{}}
              disabled={false}
              glassStyles={[styles.glassBg, { width: '100%' }]}
              leftIcon={undefined}
              iconStyle={{}}
            />
            <Button
              title={t('SessionRating.skip')}
              onPress={handleSkip}
              buttonStyle={{}}
              titleStyle={{}}
              disabled={false}
              glassStyles={[styles.glassBg, { width: '80%', alignSelf: "center" }]}
              leftIcon={undefined}
              iconStyle={{}}
              borderedGlassButton
            />
          </View>
        </GlassWrapper>
        <Loader isVisible={isLoading} />

      </ScrollView>
    </HomeWrapper>
  );
};

export default SessionFeedbackScreen;
