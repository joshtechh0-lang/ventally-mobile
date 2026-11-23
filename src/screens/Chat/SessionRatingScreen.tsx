import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  PanResponder,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import type { RootState } from '../../store/store';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import GlassWrapper from '../../components/GlassWrapper';
import Button from '../../components/Button';
import { Loader } from '../../components';
import { apiInstance } from '../../api';
import { toastError, toastSuccess } from '../../utils/toast';
import { happyIcon, sadIcon, lockIcon } from '../../assets/icons';
import { routes } from '../../navigation/routes';

// Rating options
const POSITIVE_RATINGS = ['ratingHelpful', 'ratingAwesome', 'ratingGood'] as const;
const NEGATIVE_RATINGS = ['ratingOkay', 'ratingHorrible'] as const;
const ALL_RATINGS = [...POSITIVE_RATINGS, ...NEGATIVE_RATINGS] as const;

// Tip amounts
const MIN_TIP = 1;
const MAX_TIP = 100;

const SessionRatingScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const { t } = useTranslationWithUpdate();
  const { theme } = useTheme();
  // const { data, type } = route?.params;
  const [selectedRating, setSelectedRating] = useState<string>('ratingHelpful');
  const [tipAmount, setTipAmount] = useState<number>(25);
  const [isLoading, setIsLoading] = useState(false);
  
  const trackWidthRef = useRef(0);
  const { data, type } = route?.params;
  const session = useSelector((state: RootState) => state.session);
  console.log('Session details in rating screen:', session);

  // Map touch position (0-100%) to tip amount linearly
  const positionToAmount = (percent: number): number => {
    return Math.round((percent / 100) * (MAX_TIP - MIN_TIP) + MIN_TIP);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          const width = trackWidthRef.current;
          if (width <= 0) return;
          const locationX = e.nativeEvent.locationX;
          const percent = Math.max(0, Math.min(100, (locationX / width) * 100));
          setTipAmount(positionToAmount(percent));
        },
        onPanResponderMove: (e, gestureState) => {
          const width = trackWidthRef.current;
          if (width <= 0) return;
          // Use moveX relative to the view's layout if possible, 
          // but locationX in move is usually offset. 
          // For simplicity and to avoid jumps, we can calculate based on dx or use a better approach.
          // However, for this slider, calculating from locationX usually works if it's the only touch.
          const locationX = e.nativeEvent.locationX;
          const percent = Math.max(0, Math.min(100, (locationX / width) * 100));
          setTipAmount(positionToAmount(percent));
        },
      }),
    [],
  );

  // Check if rating is positive or negative
  const isPositiveRating = POSITIVE_RATINGS.includes(selectedRating as any);
  const isNegativeRating = NEGATIVE_RATINGS.includes(selectedRating as any);

  // Get icon based on rating
  const getRatingIcon = () => {
    if (isNegativeRating) return sadIcon;
    return happyIcon;
  };

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    scrollContent: {
      paddingBottom: hp(4),
      alignItems: 'center',
    },
    iconContainer: {
      width: hp(10),
      height: hp(10),
      borderRadius: hp(3),
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: theme.white + "20",

    },
    icon: {
      width: hp(5),
      height: hp(5),
      tintColor: theme.white,
      resizeMode: 'contain',
      alignSelf: 'center',
    },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      marginVertical: hp(2),

    },
    subtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white60,
      textAlign: 'center',
      marginBottom: hp(2.5),
    },
    ratingRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: wp(2),
      marginBottom: hp(1),
    },
    ratingButtonWrapper: {
      borderRadius: hp(2),
      overflow: 'hidden',
    },
    ratingButtonInner: {
      paddingVertical: hp(1.2),
      paddingHorizontal: wp(4),
    },
    ratingButtonText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + "90",
    },
    reportIssueWrapper: {
      marginBottom: hp(5),
      borderRadius: hp(99),
      overflow: 'hidden',
    },
    reportIssueInner: {
      paddingVertical: hp(1.2),
      paddingHorizontal: wp(5),
    },
    reportIssueText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + "90",
    },
    tipCard: {
      width: '100%',
      paddingHorizontal: wp(5),
      paddingVertical: hp(2.5),
      borderRadius: hp(2.5),
      marginBottom: hp(2),
    },
    tipHeading: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(2),
    },
    tipAmountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp(2),
    },
    tipAmountText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(2),
      color: theme.white,
    },
    sliderTrack: {
      height: hp(0.5),
      backgroundColor: theme.white20,
      borderRadius: hp(0.25),
      marginBottom: hp(3),
      position: 'relative',
      alignSelf: 'stretch',
    },
    sliderTrackTouchArea: {
      paddingVertical: hp(1.5),
      marginVertical: -hp(1.5),
    },
    sliderFill: {
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
      backgroundColor: theme.white,
      borderRadius: hp(0.25),
    },
    sliderThumb: {
      position: 'absolute',
      width: hp(2),
      height: hp(2),
      borderRadius: hp(1),
      backgroundColor: theme.white,
      top: -hp(0.75),
    },
    sliderValueLabel: {
      position: 'absolute',
      top: -hp(5.5),
      backgroundColor: theme.white,
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.5),
      borderRadius: hp(1),
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: wp(12),
    },
    sliderValueText: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(1.4),
      color: theme.black,
    },
    sliderValueArrow: {
      position: 'absolute',
      bottom: -hp(0.6),
      width: 0,
      height: 0,
      borderLeftWidth: hp(0.8),
      borderRightWidth: hp(0.8),
      borderTopWidth: hp(0.8),
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: theme.white,
    },
    buttonsColumn: {
      gap: hp(1.5),
      width: '100%',
    },
    disclaimerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: wp(1.5),
      marginTop: hp(2),
    },
    lockChar: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white60,
    },
    disclaimerText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white,
    },
    apologyCard: {
      width: '100%',
      paddingHorizontal: wp(5),
      paddingVertical: hp(3),
      borderRadius: hp(2.5),
      marginBottom: hp(3),
    },
    apologyText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
      textAlign: 'center',
      lineHeight: hp(2.8),
      marginBottom: hp(5),
    },
    glassBg: {
      backgroundColor: theme.black + "13",
    },
    lockIcon: {
      width: hp(1.5),
      height: hp(1.5),
      tintColor: theme.white,
      resizeMode: 'contain',
    },
  });

  const handleBack = () => navigation.goBack();

  const handleReportIssue = () => {
    (navigation as any).navigate(routes.chatReport, { data: data, type: type });
  };

  const navigateToFeedback = () => {
    (navigation as any).replace(routes.chatSessionFeedback, { data: data, type: type });
  };

  const handleSendTip = async () => {
    const callId = session?.sessionId;
    console.log('callId====+=+==+=++=+=+>' , callId);
    if (!callId) {
      navigateToFeedback();
      return;
    }
    setIsLoading(true);
    try {
      const res: any = await apiInstance.post(`session/${callId}/tip`, {
        amountCurrency: tipAmount,
        message: 'Thanks for the support',
      });
      if (res?.success) {
        console.log('Tip sent successfully' , res);
        toastSuccess({ text: t('SessionRating.tipSent') || 'Tip sent successfully' });
      }
    } catch (err: any) {
      console.log('Tip error:', err);
      toastError({ text: err?.error || 'Failed to send tip' });
    } finally {
      setIsLoading(false);
    }
    navigateToFeedback();
  };

  const handleSkip = () => {
    navigateToFeedback();
  };

  const handleContinue = () => {
    navigateToFeedback();
  };

  // Get slider position based on tip amount
  const getSliderPosition = () => {
    return ((tipAmount - MIN_TIP) / (MAX_TIP - MIN_TIP)) * 100;
  };

  // Render rating step
  const renderRatingStep = () => (
    <>
      {/* Icon - bordered={false} */}
      <GlassWrapper bordered={false} glassStyles={styles.iconContainer}>
        <Image source={getRatingIcon()} style={styles.icon} />
      </GlassWrapper>

      <Text style={styles.title}>{t('SessionRating.title')}</Text>

      {/* Rating buttons */}
      <View style={styles.ratingRow}>
        {ALL_RATINGS.map((key) => {
          const isSelected = selectedRating === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedRating(key)}
              activeOpacity={0.7}
            >
              <GlassWrapper
                radius={999}
                bordered={true}
                glassStyles={StyleSheet.flatten([styles.glassBg, isSelected && { borderColor: theme.white + "90" }])}
              >
                <View style={styles.ratingButtonInner}>
                  <Text style={[styles.ratingButtonText, isSelected && { color: theme.white, fontFamily: fontFamilies.bold }]}>
                    {t(`SessionRating.${key}`)}
                  </Text>
                </View>
              </GlassWrapper>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Report an issue */}
      <TouchableOpacity onPress={handleReportIssue} activeOpacity={0.7}>
        <GlassWrapper bordered style={styles.reportIssueWrapper} glassStyles={styles.glassBg} >
          <View style={styles.reportIssueInner}>
            <Text style={styles.reportIssueText}>
              {t('SessionRating.reportIssue')}
            </Text>
          </View>
        </GlassWrapper>
      </TouchableOpacity>

      {/* Show tip section for positive ratings */}

      <>
        <GlassWrapper bordered style={styles.tipCard} glassStyles={styles.glassBg} >
          {!isNegativeRating && <Text style={styles.tipHeading}>{t('SessionRating.tipHeading')}</Text>
          }
          {/* Tip amount labels */}
          {isNegativeRating ?
            <Text style={styles.apologyText}>
              {t('SessionRating.apologyMessage')}
            </Text> :
            <View style={styles.tipAmountRow}>
              <Text style={styles.tipAmountText}>$ {MIN_TIP}</Text>
              <Text style={styles.tipAmountText}>$ {MAX_TIP}</Text>
            </View>}

          {/* Slider track - slideable to increase/decrease tip amount */}
          {!isNegativeRating && (
            <View
              style={[styles.sliderTrackTouchArea]}
              onLayout={(e) => {
                trackWidthRef.current = e.nativeEvent.layout.width;
              }}
              {...panResponder.panHandlers}
            >
              <View style={styles.sliderTrack}>
                <View
                  style={[styles.sliderFill, { width: `${getSliderPosition()}%` }]}
                  pointerEvents="none"
                />
                <View
                  style={[
                    styles.sliderValueLabel,
                    { left: `${getSliderPosition()}%`, transform: [{ translateX: -wp(6) }] }
                  ]}
                  pointerEvents="none"
                >
                  <Text style={styles.sliderValueText}>$ {tipAmount}</Text>
                  <View style={styles.sliderValueArrow} />
                </View>
                <View
                  style={[
                    styles.sliderThumb,
                    { left: `${getSliderPosition()}%`, marginLeft: -hp(1) },
                  ]}
                  pointerEvents="none"
                />
              </View>
            </View>
          )}
          {/* Buttons */}
          <View style={styles.buttonsColumn}>
            <Button
              title={t(isNegativeRating ? 'SessionRating.continue' : 'SessionRating.sendTip')}
              onPress={() => isNegativeRating ? handleContinue() : handleSendTip()}
              buttonStyle={{}}
              titleStyle={{}}
              disabled={false}
              glassStyles={{ width: '100%', backgroundColor: theme.black + "30" }}
              leftIcon={undefined}
              iconStyle={{}}
            />
            <Button
              title={t('SessionRating.skip')}
              onPress={handleSkip}
              buttonStyle={{}}
              titleStyle={{}}
              disabled={false}
              glassStyles={{ width: '100%', backgroundColor: theme.black + "30" }}
              leftIcon={undefined}
              iconStyle={{}}
              borderedGlassButton
            />
          </View>
        </GlassWrapper>

        {!isNegativeRating && <View style={styles.disclaimerRow}>
          <Image source={lockIcon} style={styles.lockIcon} />
          <Text style={styles.disclaimerText}>
            {t('SessionRating.tipsDisclaimer')}
          </Text>
        </View>}
      </>


    </>
  );

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
        {renderRatingStep()}
      </ScrollView>
      <Loader isVisible={isLoading} />
    </HomeWrapper>
  );
};

export default SessionRatingScreen;
