import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Pressable } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassView from '../../components/GlassWrapper';
import Button from '../../components/Button';
import AuthStepsHeader from '../../components/AuthStepsHeader';
import { chevronIcon, tickIcon } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import { usePayments } from '../../api/apiHooks/usePayments';
import { useWallet } from '../../api/apiHooks/useWallet';
import { useState, useEffect } from 'react';
import { toastSuccess, toastError } from '../../utils/toast';
import { GlassModal } from '../../components';

const SubscriptionDetailsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleManageSubscription = () => {
    (navigation as any).navigate(routes.venterUpgradePlan as never);
  };


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(4),
      paddingTop: hp(2),
    },
    scrollContent: {
      paddingBottom: hp(4),
    },
    premiumCard: {
      width: '100%',
      borderRadius: hp(2),
      paddingVertical: hp(4),
      paddingHorizontal: wp(4),
      marginBottom: hp(4),
      backgroundColor: theme.black + "20"
    },
    premiumCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(2),
      gap: wp(2),
    },
    chevronButton: {
      width: hp(4),
      height: hp(4),
      borderRadius: hp(2),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(3),
    },
    chevronIcon: {
      width: hp(2),
      height: hp(2),
      tintColor: theme.white,
      resizeMode: 'contain',
    },
    premiumTitle: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(1.8),
      color: theme.white,
    },
    premiumSubtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
    },
    manageSubscriptionButton: {
      width: '100%',
      marginTop: hp(2),
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: hp(1),
      borderRadius: hp(999),
      backgroundColor: theme.white + "5"
    },
    manageSubscriptionButtonText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
      color: theme.white,
    },
    sectionTitle: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(3),
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(2.5),
    },
    detailLabel: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      opacity: 0.9,
    },
    detailValue: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
      color: theme.white,
    },
  });

  const { cancelSubscription } = usePayments();
  const { getSubscription } = useWallet();
  const [loading, setLoading] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const data = await getSubscription();
      setSubscription(data);
    } catch (error) {
      console.log('Error fetching subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };
  const handleCancelPress = () => {
    setShowConfirm(true);
  };

  const handleConfirmCancel = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const response = await cancelSubscription();
      setCancelled(true);
      fetchSubscription(); // Refresh subscription status
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toastError({ text: error?.message || t('Common.error.somethingWentWrong'), theme });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper key={langKey}>
      <View style={styles.container}>
        <AuthStepsHeader
          handleBack={handleBack}
          title={t('SubscriptionDetails.title')}
          glassyTitle={false}
        />

        <ScrollView
          style={{ flex: 1, marginTop: hp(2) }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Ventally Premium Card */}
          <GlassView bordered style={styles.premiumCard} radius={hp(2)} opacity={0.03}>
            <View style={styles.premiumCardHeader}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleBack}
              >
                <View style={{
                  width: hp(4),
                  // height: hp(4),
                  paddingVertical: hp(2),
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: hp(.8),
                  backgroundColor: theme.white + "20"
                }}
                >
                  <Image source={chevronIcon} style={styles.chevronIcon} />
                </View>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.premiumTitle}>
                  {subscription?.hasSubscription ? (subscription?.subscription?.planName || t('SubscriptionDetails.premiumTitle')) : t('SubscriptionDetails.freePlan')}
                </Text>
                <Text style={styles.premiumSubtitle}>
                  {subscription?.hasSubscription ? t('SubscriptionDetails.premiumSubtitle') : t('SubscriptionDetails.upgradeMessage')}
                </Text>
              </View>

            </View>

            <Pressable

              onPress={handleManageSubscription}
              disabled={false}
              style={styles.manageSubscriptionButton}>
              <Text style={styles.manageSubscriptionButtonText}>
                {t('SubscriptionDetails.manageSubscription')}
              </Text>

            </Pressable>
          </GlassView>

          {/* Subscription Details Section */}
          {!loadingSubscription && subscription?.hasSubscription && (
            <>
              <Text style={styles.sectionTitle}>
                {t('SubscriptionDetails.detailsTitle')}
              </Text>
              <GlassView style={{ padding: hp(2) }} bordered >

                {/* Next Billing Date */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    {t('SubscriptionDetails.nextBillingDate')}
                  </Text>
                  <Text style={styles.detailValue}>
                    {subscription?.subscription?.billingCycleEnd ? new Date(subscription.subscription.billingCycleEnd).toLocaleDateString() : '-'}
                  </Text>
                </View>

                {/* Monthly Plan */}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    {t('SubscriptionDetails.monthlyPlan')}
                  </Text>
                  <Text style={styles.detailValue}>
                    {subscription?.subscription?.monthlyPrice ? `$${subscription.subscription.monthlyPrice}` : '-'}
                  </Text>
                </View>

                {/* Funds Used */}
                <View style={[styles.detailRow, {
                  marginBottom: 0
                }]}>
                  <Text style={styles.detailLabel}>
                    {t('SubscriptionDetails.fundsUsed')}
                  </Text>
                  <Text style={styles.detailValue}>
                    {subscription?.subscription?.usedMinutes ? `${subscription.subscription.usedMinutes} min` : '-'}
                  </Text>
                </View>
              </GlassView>
            </>
          )}


        </ScrollView>
        <View>

          {subscription?.hasSubscription && (
            <Button
              title={t('SubscriptionDetails.cancelSubscription')}
              onPress={handleCancelPress}
              loading={loading}
              disabled={loading}
            />
          )}
        </View>


        <GlassModal
          visible={showConfirm}
          onClose={() => setShowConfirm(false)}
          onPrimaryPress={handleConfirmCancel}
          title={t('SubscriptionDetails.cancelSubscription')}
          message={t('SubscriptionDetails.cancelConfirmationMessage')}
          primaryButtonText={t('Common.yes')}
          secondaryButtonText={t('Common.no')}
          onSecondaryPress={() => setShowConfirm(false)}
        />
        <GlassModal
          icon={tickIcon}
          iconBorder={cancelled}
          visible={cancelled}
          onClose={() => setCancelled(false)}
          onPrimaryPress={() => {
            setShowConfirm(false);
            setCancelled(false);
            navigation.goBack();
          }}
          title={t('SubscriptionDetails.cancelled')}
          message={t('SubscriptionDetails.cancelledMessage')}
          primaryButtonText={t('Common.continue')}
          dismissOnBackPress
          bottomAttachedBtn
        />
      </View>
    </AuthWrapper>
  );
};

export default SubscriptionDetailsScreen;
