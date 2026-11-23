import React, { useEffect, useState } from 'react';
import { Platform, View, Text, StyleSheet, TouchableOpacity, Linking, Image, FlatList } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import GlassView from '../../components/GlassWrapper';
import AuthStepsHeader from '../../components/AuthStepsHeader';
import { routes } from '../../navigation/routes';
import { getKeyboardAwareScrollViewProps, getKeyboardAwareContentStyle } from '../../utils/keyboard';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import apiInstance, { ApiResponse, setTokens } from '../../api/apiInstance';
import { toastError, toastSuccess } from '../../utils/toast';
import { WebView } from 'react-native-webview';
import EmptyState from '../../components/shared/EmptyState';
import { useRoles } from '../../api/apiHooks/useRoles';
import { setUser, setIsVenter } from '../../store/slices/userSlice';
import { ScreenHeader } from '../../components';
import { chevronIcon, starFilled } from '../../assets/icons';

interface PlanOption {
  id: string;
  name: string;
  nameKey: string;
  description: string;
  descriptionKey: string;
  monthlyPrice: number;
  annualPrice: number;
  learnMoreUrl?: string;
}

const ChoosePlanScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accountTypeChanging } = (route.params as any) || {};
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const dispatch = useDispatch();
  const { updateAvailableRoles, switchRole } = useRoles();
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>();
  const [planType, setPlanType] = useState<'monthly' | 'annual'>('monthly');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('')
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<any> = await apiInstance.get('payments/subscription-plans');
      if (response.success && response.data?.plans) {
        console?.log('----->>>', response?.data?.plans)
        // Map API response to UI format
        const mappedPlans = response.data.plans.map((p: any) => {
          const lower = p.name.toLowerCase();
          const isLightSupport    = lower.includes('light support');
          const isBalanced        = lower.includes('balanced support');
          const isHighSupport     = lower.includes('high support');
          const isConsistentCare  = lower.includes('consistent care');
          const isPayAsYouGo      = lower.includes('pay as you go');
          const isFree            = lower.includes('free trial') || lower.includes('free tier');

          const nameKey =
            isLightSupport   ? 'ChoosePlan.basicPlan' :
            isBalanced       ? 'ChoosePlan.standardPlan' :
            isHighSupport    ? 'ChoosePlan.highSupport' :
            isConsistentCare ? 'ChoosePlan.consistentCare' :
            isPayAsYouGo     ? 'ChoosePlan.payAsYouGo' :
            isFree           ? 'ChoosePlan.freeTier' : '';

          const descriptionKey =
            isLightSupport   ? 'ChoosePlan.basicPlanDescription' :
            isBalanced       ? 'ChoosePlan.standardPlanDescription' :
            isHighSupport    ? 'ChoosePlan.highSupportDescription' :
            isConsistentCare ? 'ChoosePlan.consistentCareDescription' :
            isPayAsYouGo     ? 'ChoosePlan.payAsYouGoDescription' :
            isFree           ? 'ChoosePlan.freeTierDescription' : '';

          const overageKey =
            isLightSupport   ? 'ChoosePlan.basicPlanOverage' :
            isBalanced       ? 'ChoosePlan.standardPlanOverage' :
            isHighSupport    ? 'ChoosePlan.highSupportOverage' :
            isConsistentCare ? 'ChoosePlan.consistentCareOverage' :
            isFree           ? 'ChoosePlan.freeTierOverage' : '';

          const messagesKey =
            isLightSupport   ? 'ChoosePlan.basicPlanMessages' :
            isBalanced       ? 'ChoosePlan.standardPlanMessages' :
            isHighSupport    ? 'ChoosePlan.highSupportMessages' :
            isConsistentCare ? 'ChoosePlan.consistentCareMessages' :
            isFree           ? 'ChoosePlan.freeTierMessages' : '';

          return {
            id: p.id,
            name: p.name,
            nameKey,
            description: `${p.included_minutes} minutes included.`,
            descriptionKey,
            overageKey,
            messagesKey,
            monthlyPrice: Number(p.price_monthly) || 0,
            annualPrice: Number(p.annual_price) || 0,
            features: p.features?.features || [],
            support: p.features?.support || '',
            included_minutes: p.included_minutes,
            overage_rate: p.overage_rate,
            overageText: p.display?.overageText,
            included_messages_monthly: p?.included_messages_monthly || '',
            isMostPopular: p.display?.isMostPopular || false,
          };
        });
        setPlans(mappedPlans);
      } else {
        toastError({ text: t('ChoosePlan.fetchError') || 'Failed to fetch plans', theme });
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toastError({ text: t('ChoosePlan.fetchError') || 'Failed to fetch plans', theme });
    } finally {
      setLoading(false);
    }
  };

  const isAdvancedPlan = (name: string) => {
    const lower = name.toLowerCase();
    return lower.includes('consistent care') || lower.includes('high support');
  };

  const isMostPopular = (p: any) => {
    return p.isMostPopular === true;
  };

  const isFreePlan = (p: any) => (Number(p.monthlyPrice) || 0) === 0;

  const visiblePlans = (showAdvanced
    ? plans.filter(p => isAdvancedPlan(p.name))
    : plans.filter(p => !isAdvancedPlan(p.name))
  ).filter(p => planType === 'annual' ? !isFreePlan(p) : true)
  .sort((a, b) => {
    if (isFreePlan(a)) return -1;
    if (isFreePlan(b)) return 1;
    const priceA = planType === 'monthly' ? Number(a.monthlyPrice) : Number(a.annualPrice);
    const priceB = planType === 'monthly' ? Number(b.monthlyPrice) : Number(b.annualPrice);
    return priceA - priceB; // lowest first after free
  });

  useEffect(() => {
    console.log('user===>>>', user);
  }, [user]);

  const handleContinue = async () => {
    if (!selectedPlan) {
      toastError({ text: t('ChoosePlan.selectPlan') || 'Please select a plan', theme })
      // Maybe show error toast
      return;
    }
    try {
      setLoading(true);
      const selectedPlanData = plans.find(p => p.id === selectedPlan);

      // Free plan - no payment needed
      if (selectedPlanData && (Number(selectedPlanData.monthlyPrice) || 0) === 0 && (Number(selectedPlanData.annualPrice) || 0) === 0) {
        try {
          await apiInstance.post('payments/select-free-plan', { planId: selectedPlan });
        } catch {
          // Even if API fails, navigate home
        }
        (navigation as any).replace(routes.venterHomeTab);
        return;
      }

      if (Platform.OS === 'ios') {
        // Use Apple IAP for iOS
        const planSkuMap: Record<string, string> = {
          'Light Support': SUBSCRIPTION_SKUS.light_support_monthly,
          'Balanced Support': SUBSCRIPTION_SKUS.balanced_support_monthly,
        };
        // Find matching SKU based on plan name and billing cycle
        const planName = selectedPlanData?.name || '';
        let sku = '';
        for (const [key, value] of Object.entries(planSkuMap)) {
          if (planName.toLowerCase().includes(key.toLowerCase())) {
            sku = planType === 'annual'
              ? value.replace('_monthly', '_annual')
              : value;
            break;
          }
        }
        if (!sku) {
          toastError({ text: 'Plan not available on iOS', theme });
          return;
        }
        await iapService.purchaseSubscription(sku);
      } else {
        // Use Stripe for Android
        const res = await apiInstance.post('payments/create-subscription-checkout', {
          "planId": selectedPlan
        });
        setUrl(res?.data?.url);
      }

    } catch (err: any) {
      console.log('---->>>>>>>>>>>>ERR', err)
      if (err?.message?.includes('You already have an active subscription. Please cancel it first.')) {
        (navigation as any).replace(routes.subscriptionSuccess, { plan: plans.find(p => p.id === selectedPlan) });
      }else{
        toastError({ text: err?.message || err?.error, theme })
      }
    } finally {
      setLoading(false)
    }
    // Navigate to payment methods screen

  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLearnMore = (planId: string) => {
    // Navigate to plan details screen
    const plan = plans.find(p => p.id === planId);
    (navigation as any).navigate(routes.basicPlanDetails, { plan });
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    scrollContent: {
      paddingBottom: hp(4),
    },

    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: hp(4),

    },
    tab: {
      paddingHorizontal: wp(6),
      paddingVertical: hp(1),
      borderBottomWidth: .5,
      borderBottomColor: theme.white20,
    },
    tabActive: {
      borderBottomWidth: 2,

      borderBottomColor: theme.white,
    },
    tabText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,

      opacity: 0.7,
      alignSelf: 'center',
    },
    tabTextActive: {
      fontFamily: fontFamilies.semiBold,
      opacity: 1,
    },
    planCard: {
      marginBottom: hp(2.5),
      borderRadius: hp(2),
      paddingVertical: hp(3),
      paddingHorizontal: wp(4),

    },
    planCardSelected: {
      borderColor: theme.white,
      borderWidth: 2,
      backgroundColor: theme.white + '25',
    },
    planHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: hp(1.5),
    },
    planInfo: {
      flex: 1,
      marginRight: wp(3),
      paddingHorizontal: wp(2)
    },
    planName: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
      color: theme.white,
      marginBottom: hp(0.5),
    },
    planPrice: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.2),
      color: theme.white,
      marginBottom: hp(0.5),
    },
    planDescription: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white,
      opacity: 0.8,
    },
    learnMoreLink: {
      marginTop: hp(1),
    },
    learnMoreText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.5),
      color: theme.white,
      textDecorationLine: 'underline',
    },
    radioButton: {
      width: hp(2.5),
      height: hp(2.5),
      borderRadius: hp(1.25),
      borderWidth: 2,
      borderColor: theme.white,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioButtonSelected: {
      borderColor: theme.white,
    },
    radioButtonInner: {
      width: hp(1.2),
      height: hp(1.2),
      borderRadius: hp(0.6),
      backgroundColor: theme.white,
    },
    promotionsSection: {
      marginTop: hp(2),
      marginBottom: hp(4),
    },
    promotionsLabel: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(1.5),

    },

    promoCodeInput: {
      paddingHorizontal: wp(4),
      backgroundColor: 'transparent', borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.white20,
      borderBottomColor: theme.white20
    },
    continueButtonContainer: {
      marginVertical: hp(2),
    },
    mostPopularBadge: {
      backgroundColor: '#C2AEBF',
      borderRadius: hp(0.8),
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.5),
      justifyContent: 'center',
    },
    mostPopularIcon: {
      width: hp(1.6),
      height: hp(1.6),
      tintColor: '#C2AEBF',
      resizeMode: 'contain',
    },
    mostPopularText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.3),
      color: '#1a1a1a',
    },
    advancedPlansLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: wp(1.5),
      paddingVertical: hp(1.5),
    },
    advancedPlansText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
      color: theme.white,
      textDecorationLine: 'underline',
    },
    advancedPlansChevron: {
      width: hp(1.5),
      height: hp(1.5),
      tintColor: theme.white,
      resizeMode: 'contain',
    },
  });

  const handleWebViewNavigationStateChange = async (urlData: any) => {
    const { url } = urlData;
    console?.log('---->>>>>>>>>>>>URL', url)
    if (url == 'https://api.ventally.co/api/v1/billing/subscription-success' || url == 'https://ventally-web-6tio.vercel.app/venter/home' || url == 'https://ventally-web-6tio.vercel.app/onboarding') {
      setUrl('');

      if (accountTypeChanging) {
        try {
          setLoading(true);
          // 1. Add venter role
          await updateAvailableRoles({ rolesToAdd: ['venter'], rolesToRemove: [] });

          // 2. Switch to venter role
          const res = await switchRole({ targetRole: 'venter' });

          if (res && res.tokens) {
            // 3. Update tokens
            console.log("new tokens:", {
              accessToken: res.tokens.accessToken,
              refreshToken: res.tokens.refreshToken
            });

            await setTokens(res.tokens.accessToken, res.tokens.refreshToken);

            // 4. Update Redux state
            const updatedUser = {
              ...res.user,
            };
            dispatch(setUser(updatedUser as any));
            dispatch(setIsVenter(true));
          }
        } catch (error) {
          console.error('Error switching role in ChoosePlan:', error);
        } finally {
          setLoading(false);
        }
      }

      (navigation as any).replace(routes.subscriptionSuccess, { plan: plans.find(p => p.id === selectedPlan) });
      toastSuccess({ text: 'Plan Subscribed successfully', theme });
    }
  }
  return (
    <AuthWrapper key={langKey}>
      {url ? <View style={styles.container}>
        <ScreenHeader onBackPress={handleBack} title={t('ChoosePlan.title')} />
        <WebView
          source={{ uri: url }}
          style={{ flex: 1 }}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <ActivityIndicator size="large" color={theme.white} />
            </View>
          )}
          onNavigationStateChange={handleWebViewNavigationStateChange}
        />


      </View> :
        <View style={styles.container}>
          {/* Header with back button */}
          <ScreenHeader onBackPress={handleBack} title={t('ChoosePlan.title')} containerStyle={{ paddingHorizontal: 0 }} />

          <KeyboardAwareScrollView
            {...getKeyboardAwareScrollViewProps()
            }
            extraScrollHeight={hp(25)}
            contentContainerStyle={getKeyboardAwareContentStyle()}
          >
            {/* Title */}

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, { flex: 1, borderBottomWidth: hp(.1) }, planType === 'monthly' && styles.tabActive]}
                onPress={() => setPlanType('monthly')}
              >
                <Text
                  style={[
                    styles.tabText,
                    planType === 'monthly' && styles.tabTextActive,
                  ]}
                >
                  {t('ChoosePlan.monthly')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, { flex: 1 }, planType === 'annual' && styles.tabActive]}
                onPress={() => setPlanType('annual')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(2) }}>
                  <Text
                    style={[
                      styles.tabText,
                      planType === 'annual' && styles.tabTextActive,
                    ]}
                  >
                    {t('ChoosePlan.annual')}
                  </Text>
                  <View style={{
                    backgroundColor: theme.magenda,
                    borderRadius: hp(.5),
                    paddingHorizontal: wp(2),
                    paddingBottom: hp(0.3),
                  }}>
                    <Text style={{
                      fontFamily: fontFamilies.medium,
                      fontSize: hp(1.2),
                      color: theme.white,
                    }}>Save $60/year</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            {/* Plan Cards */}


            {loading ? (
              <View style={{ paddingVertical: hp(10), justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.white} />
              </View>
            ) : (
              <FlatList
                data={visiblePlans}
                renderItem={({ item }: any) => {
                  const isSelected = selectedPlan === item.id;
                  const popular = isMostPopular(item) && !isAdvancedPlan(item.name);
                  const price = Number(planType === 'monthly' ? item.monthlyPrice : item.annualPrice) || 0;
                  const priceText =
                    price === 0
                      ? t('ChoosePlan.free')
                      : planType === 'monthly'
                        ? `${price.toFixed(2)} `
                        : `${price.toFixed(2)}`;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => setSelectedPlan(item.id)}
                      activeOpacity={0.8}
                    >
                      <GlassView
                        style={StyleSheet.flatten([
                          styles.planCard,
                        ])}
                        radius={hp(2)}
                        glassStyles={{ backgroundColor: theme.white + "5" }}
                        bordered={popular || isSelected}
                      >
                        {popular && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: wp(1.5), marginBottom: hp(1) }}>
                            <Image source={starFilled} style={styles.mostPopularIcon} />
                            <View style={styles.mostPopularBadge}>
                              <Text style={styles.mostPopularText}>
                                {t('ChoosePlan.mostPopular')}
                              </Text>
                            </View>
                          </View>
                        )}
                        <View style={styles.planHeader}>
                          <View style={styles.planInfo}>

                            <Text style={styles.planName}>
                              {item.nameKey ? t(item.nameKey) : item.name}
                            </Text>

                            <Text style={styles.planPrice}>{priceText}</Text>
                            {!!( item.descriptionKey ? t(item.descriptionKey) : item.description) && (
                              <Text style={styles.planDescription}>
                                {item.descriptionKey ? t(item.descriptionKey) : item.description}
                              </Text>
                            )}
                            {!!item.overageKey && !!t(item.overageKey) && (
                              <Text style={styles.planDescription}>{t(item.overageKey)}</Text>
                            )}
                            {!!item.messagesKey && !!t(item.messagesKey) && (
                              <Text style={styles.planDescription}>{t(item.messagesKey)}</Text>
                            )}
                          </View>
                          <View
                            style={[
                              styles.radioButton,
                              isSelected && styles.radioButtonSelected,
                            ]}
                          >
                            {isSelected && <View style={styles.radioButtonInner} />}
                          </View>
                        </View>
                        {price > 0 && (
                          <View style={{ marginTop: hp(1), paddingTop: hp(1), borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.1)' }}>
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: hp(1.3), fontFamily: fontFamilies.normal, marginBottom: hp(0.3) }}>
                              🎯 60 ad-free minutes/month included
                            </Text>
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>
                              🔄 Unused minutes roll over to next month
                            </Text>
                          </View>
                        )}
                      </GlassView>
                    </TouchableOpacity>
                  )
                }}
                ListEmptyComponent={() => (
                  <EmptyState
                    title={t('ChoosePlan.noPlans')}
                    description={t('ChoosePlan.noPlansDescription')}

                  />
                )}
              />
            )}

            {/* Promotions Section */}
            {/* <View style={styles.promotionsSection}> */}
            {!loading && <>
              <Text style={styles.promotionsLabel}>
                {t('ChoosePlan.promotions')}
              </Text>

              <Input
                placeholderTextColor={theme.white60}
                placeholder={t('ChoosePlan.addPromoCode')}
                isPlaceholderVisible
                value={promoCode}
                onChangeText={setPromoCode}
                noTitle={true}

                inputContainerStyle={styles.promoCodeInput}
                titleStyle={{ color: theme.white }}
              />
            </>

            }
            {/* </View> */}


          </KeyboardAwareScrollView>
          {/* See Advanced Plans Toggle */}
          <TouchableOpacity
            style={styles.advancedPlansLink}
            onPress={() => setShowAdvanced(prev => !prev)}
            activeOpacity={0.7}
          >
            <Text style={styles.advancedPlansText}>
              {showAdvanced
                ? t('ChoosePlan.seeBasicPlans')
                : t('ChoosePlan.seeAdvancedPlans')}
            </Text>
            <Image
              source={chevronIcon}
              style={[
                styles.advancedPlansChevron,
                { transform: [{ rotate: showAdvanced ? '90deg' : '-90deg' }] },
              ]}
            />
          </TouchableOpacity>

        {/* Trust Bar */}
        {!loading && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: wp(4), paddingVertical: hp(1) }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>{t('ChoosePlan.cancelAnytime', '✓ Cancel anytime')}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>{t('ChoosePlan.noHiddenFees', '✓ No hidden fees')}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>{t('ChoosePlan.secure', '✓ Secure')}</Text>
          </View>
        )}
          {/* BNPL Placeholder */}
          {!loading && planType === 'annual' && selectedPlan && (
            <View style={{ marginHorizontal: wp(4), marginBottom: hp(1), padding: hp(1.5), borderRadius: hp(1.5), backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' }}>
              <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: hp(1.3), fontFamily: fontFamilies.normal, textAlign: 'center' }}>
                💳 Buy now, pay later coming soon — split your annual plan into monthly installments.
              </Text>
            </View>
          )}
          {/* Continue Button */}
          <View style={styles.continueButtonContainer}>
            <Button
              title={
                !loading && selectedPlan
                  ? planType === 'annual'
                    ? 'Pay $240 for one year →'
                    : 'Subscribe for $25/month →'
                  : t('ChoosePlan.continue')
              }
              onPress={handleContinue}
            />
          </View>
        </View>}
    </AuthWrapper>
  );
};

export default ChoosePlanScreen;
