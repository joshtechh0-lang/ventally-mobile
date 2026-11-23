import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassView from '../../components/GlassWrapper';
import Button from '../../components/Button';
import { loop, tickIcon } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { setReturnToSession } from '../../store/slices/callSlice';
import GlassModal from '../../components/shared/GlassModal';
import { usePayments } from '../../api/apiHooks/usePayments';
import { toastError } from '../../utils/toast';

const SubscriptionSuccessScreen = () => {
  const route = useRoute();
  const { plan } = (route.params as any) || {};
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const { returnToSession, sessionType } = useSelector((state: RootState) => state.call);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showRenewalSuccessModal, setShowRenewalSuccessModal] = useState(false);
  const [showRenewalFailedModal, setShowRenewalFailedModal] = useState(false);
  const { cancelSubscription } = usePayments();
  const [loading, setLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const planType = plan?.name?.toLowerCase().includes('standard') ? 'standard' :
    plan?.name?.toLowerCase().includes('pay as you go') ? 'payAsYouGo' :
      plan?.name?.toLowerCase().includes('free') ? 'free' : 'basic';

  const planInfo = (t('BasicPlanDetails', { returnObjects: true }) as any)[planType];

  console.log('user====>>>', user);


  const handleLetsStart = () => {
    if (returnToSession && sessionType) {
      // User came from low credit (call or chat)
      dispatch(setReturnToSession(false));
      (navigation as any).replace(routes.chatStack, {
        screen: routes.findingListener,
      });
    } else {

      (navigation as any).replace(routes.venterHomeTab as never);

    }
  };

  const handleChangeSubscription = () => {
    // Trigger renewal flow to show modals
    handleRenewSubscription();
  };

  const handleCancelSubscription = () => {
    setShowConfirmCancel(true);
  };

  const handleConfirmCancel = async () => {
    setShowConfirmCancel(false);
    setLoading(true);
    try {
      await cancelSubscription();
      setCancelled(true);
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toastError({ text: error?.message || t('Common.error.somethingWentWrong'), theme });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelModalClose = () => {
    setShowConfirmCancel(false);
    setShowRenewalSuccessModal(false);
    setShowRenewalFailedModal(false);
    setCancelled(false);
  };

  const handleRenewSubscription = () => {
    // Simulate renewal process
    const success = Math.random() > 0.3; // 70% success rate
    if (success) {
      setShowRenewalSuccessModal(true);
    } else {
      setShowRenewalFailedModal(true);
    }
  };

  const handleRenewalSuccessClose = () => {
    setShowRenewalSuccessModal(false);
  };

  const handleUpdatePaymentMethod = () => {
    setShowRenewalFailedModal(false);
    // Navigate to payment method update screen
    navigation.navigate(routes.subscriptionDetails as never);
  };

  const handleTryAgain = () => {
    setShowRenewalFailedModal(false);
    handleRenewSubscription();
  };

  const handleRenewalFailedClose = () => {
    setShowRenewalFailedModal(false);
  };


  const styles = StyleSheet.create({
    container: {
      width: "100%",

      flex: 1,
      paddingHorizontal: wp(4),
      paddingTop: hp(4),
    },
    scrollContent: {
      paddingBottom: hp(4),
      alignItems: 'center',
    },
    checkmarkCircle: {
      width: hp(7),
      height: hp(7),
      borderRadius: hp(6),
      // backgroundColor: theme.white + '30',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: hp(4),
    },
    checkmarkIcon: {
      width: hp(4),
      height: hp(4),
      tintColor: theme.white,
      alignSelf: "center"
    },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(2),
    },
    subtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      textAlign: 'center',
      opacity: 0.9,
      marginBottom: hp(6),
    },
    benefitsCard: {
      width: '100%',
      // maxWidth: wp(90),
      borderRadius: hp(2),
      paddingVertical: hp(3),
      paddingHorizontal: wp(4),
      marginBottom: hp(2),
      // borderWidth: 1,
      // borderColor: theme.white + '30',
      // backgroundColor: theme.white + '15',
    },
    benefitsTitle: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(2),
    },
    benefitItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: hp(2),
    },
    benefitCheckmark: {
      width: hp(2),
      height: hp(2),
      borderRadius: hp(1.25),
      backgroundColor: theme.magenda,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(3),
      marginTop: hp(0.2),
    },
    benefitCheckmarkIcon: {
      width: hp(1.5),
      height: hp(1.5),
      tintColor: theme.white,
    },
    benefitText: {
      flex: 1,
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white,
      lineHeight: hp(2.4),
    },
    changeSubscriptionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(3),
    },
    changeSubscriptionText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white,
      marginLeft: wp(2),
    },
    changeSubscriptionIcon: {
      height: hp(2),
      width: hp(2),
      resizeMode: "contain"
    }
    ,
    renewalText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      textAlign: 'center',
      opacity: 0.8,
      marginTop: hp(6),
      marginBottom: hp(2),
    },
    letsStartButtonContainer: {
      width: '100%',
      marginBottom: hp(3),
      alignSelf: "flex-end"
    },
    cancelSubscriptionText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      textAlign: 'center',
      opacity: 0.7,
      textDecorationLine: 'underline',
    },
  });

  return (
    <AuthWrapper key={langKey}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Checkmark Icon */}
        <GlassView opacity={0.05} glassStyles={styles.checkmarkCircle}>
          <Image
            source={tickIcon}
            style={styles.checkmarkIcon}
            resizeMode="contain"
          />
        </GlassView>

        {/* Title */}
        <Text style={styles.title}>
          {t('SubscriptionSuccess.title')}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {planInfo?.description || t('SubscriptionSuccess.subtitle')}
        </Text>

        {/* Benefits Card */}
        <GlassView
          style={styles.benefitsCard}
          radius={hp(2)}
          opacity={0.02}
          bordered

        >
          <Text style={styles.benefitsTitle}>
            {t('SubscriptionSuccess.benefitsTitle')}
          </Text>

          {/* Dynamic Included Minutes Feature */}
          {plan?.included_minutes > 0 && (
            <View style={styles.benefitItem}>
              <View style={styles.benefitCheckmark}>
                <Image source={tickIcon} style={styles.benefitCheckmarkIcon} resizeMode="contain" />
              </View>
              <Text style={styles.benefitText}>
                {plan.included_minutes} {t('BasicPlanDetails.minutes')} {t('BasicPlanDetails.included')}
              </Text>
            </View>
          )}

          {/* Dynamic Overage/Rate Feature */}
          {plan?.overage_rate > 0 && (
            <View style={styles.benefitItem}>
              <View style={styles.benefitCheckmark}>
                <Image source={tickIcon} style={styles.benefitCheckmarkIcon} resizeMode="contain" />
              </View>
              <Text style={styles.benefitText}>
                ${plan.overage_rate} / {t('BasicPlanDetails.voiceMinute')}
              </Text>
            </View>
          )}

          {/* Dynamic Payment/Subscription Feature */}
          {planType === 'payAsYouGo' && (
            <View style={styles.benefitItem}>
              <View style={styles.benefitCheckmark}>
                <Image source={tickIcon} style={styles.benefitCheckmarkIcon} resizeMode="contain" />
              </View>
              <Text style={styles.benefitText}>
                {t('BasicPlanDetails.noSubscriptionRequired')}
              </Text>
            </View>
          )}

          {/* Dynamic Technical Features from API */}
          {plan?.features?.map((featKey: string, index: number) => (
            <View key={`tech-${index}`} style={styles.benefitItem}>
              <View style={styles.benefitCheckmark}>
                <Image source={tickIcon} style={styles.benefitCheckmarkIcon} resizeMode="contain" />
              </View>
              <Text style={styles.benefitText}>
                {t(`PlanFeatures.${featKey.toLowerCase()}`, featKey)}
              </Text>
            </View>
          ))}

          {/* Support Feature */}
          {plan?.support && (
            <View style={styles.benefitItem}>
              <View style={styles.benefitCheckmark}>
                <Image source={tickIcon} style={styles.benefitCheckmarkIcon} resizeMode="contain" />
              </View>
              <Text style={styles.benefitText}>
                {plan.support}
              </Text>
            </View>
          )}
          {plan?.included_messages_monthly &&
            <View style={styles.benefitItem}>
              <View style={styles.benefitCheckmark}>
                <Image source={tickIcon} style={styles.benefitCheckmarkIcon} resizeMode="contain" />
              </View>
              <Text style={styles.benefitText}>
                {plan?.included_messages_monthly} {t('ChoosePlan.includedMessagesAnnual')}
              </Text>
            </View>}
          {/* Optional fallback benefits from translation if no dynamic plan data */}

        </GlassView>

        {/* Change Subscription */}
        <TouchableOpacity
          style={styles.changeSubscriptionContainer}
          onPress={handleChangeSubscription}
          activeOpacity={0.7}
        >
          <Image source={loop} style={styles.changeSubscriptionIcon} />
          <Text style={styles.changeSubscriptionText}>
            {t('SubscriptionSuccess.changeSubscription')}
          </Text>
        </TouchableOpacity>

        {/* Renewal Date */}


        {/* Let's Start / Back to Session Button */}
        <View style={styles.letsStartButtonContainer}>
          <Text style={styles.renewalText}>
            {planType === 'payAsYouGo'
              ? t('ChoosePlan.payAsYouGo')
              : t('SubscriptionSuccess.renewalDate', {
                date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              })}
          </Text>
          <Button
            title={
              returnToSession && sessionType
                ? sessionType === 'call'
                  ? t('SubscriptionSuccess.backToCall')
                  : t('SubscriptionSuccess.backToChat')
                : t('SubscriptionSuccess.letsStart')
            }
            onPress={handleLetsStart}
            disabled={false}
            buttonStyle={{}}
            titleStyle={{}}
            glassStyles={{}}
            leftIcon={undefined}
            iconStyle={{}}
          />
        </View>

        {/* Cancel Subscription */}
        <TouchableOpacity onPress={handleCancelSubscription} activeOpacity={0.7}>
          <Text style={styles.cancelSubscriptionText}>
            {t('SubscriptionSuccess.cancelSubscription')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirm Cancellation Modal */}
      <GlassModal
        visible={showConfirmCancel}
        onClose={() => setShowConfirmCancel(false)}
        onPrimaryPress={handleConfirmCancel}
        title={t('SubscriptionSuccess.cancelSubscription')}
        message={t('SubscriptionSuccess.cancelConfirmationMessage') || "Are you sure you want to cancel your subscription?"}
        showButtons
        primaryButtonText={t('Common.yes')}
        secondaryButtonText={t('Common.no')}
        onSecondaryPress={() => setShowConfirmCancel(false)}
        dismissOnBackPress
      // bottomAttachedBtn
      />

      {/* Subscription Cancelled Modal */}
      <GlassModal
        visible={cancelled}
        onClose={handleCancelModalClose}
        showIcon
        icon={tickIcon}
        iconBorder
        title={t('SubscriptionDetails.cancelled') || t('SubscriptionSuccess.subscriptionCancelledTitle')}
        message={t('SubscriptionDetails.cancelledMessage') || t('SubscriptionSuccess.subscriptionCancelledMessage')}
        showButtons
        primaryButtonText={t('Common.continue')}
        onPrimaryPress={handleCancelModalClose}
        dismissOnOverlayPress={false}
        dismissOnBackPress
        bottomAttachedBtn
      />

      {/* Subscription Renewed Modal */}
      <GlassModal
        visible={showRenewalSuccessModal}
        onClose={handleRenewalSuccessClose}
        showIcon
        icon={tickIcon}
        iconBorder
        title={t('SubscriptionSuccess.subscriptionRenewedTitle')}
        message={t('SubscriptionSuccess.subscriptionRenewedMessage')}
        showButtons
        primaryButtonText={t('SubscriptionSuccess.continue')}
        onPrimaryPress={handleRenewalSuccessClose}
        dismissOnOverlayPress
        dismissOnBackPress
        bottomAttachedBtn
      />

      {/* Renewal Failed Modal */}
      <GlassModal
        visible={showRenewalFailedModal}
        onClose={handleRenewalFailedClose}
        showIcon={false}
        title={t('SubscriptionSuccess.renewalFailedTitle')}
        message={t('SubscriptionSuccess.renewalFailedMessage')}
        showButtons
        primaryButtonText={t('SubscriptionSuccess.updatePaymentMethod')}
        secondaryButtonText={t('SubscriptionSuccess.tryAgain')}
        tertiaryButtonText={t('SubscriptionSuccess.close')}
        onPrimaryPress={handleUpdatePaymentMethod}
        onSecondaryPress={handleTryAgain}
        onTertiaryPress={handleRenewalFailedClose}
        dismissOnOverlayPress={false}
        dismissOnBackPress
        bottomAttachedBtn
      />
    </AuthWrapper>
  );
};

export default SubscriptionSuccessScreen;
