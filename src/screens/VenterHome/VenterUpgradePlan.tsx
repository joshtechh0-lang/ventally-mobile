import React, { useEffect, useState } from 'react';
import { Platform, View, Text, StyleSheet, TouchableOpacity, Linking, FlatList } from 'react-native';
import iapService, { SUBSCRIPTION_SKUS } from '../../services/iapService';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import { routes } from '../../navigation/routes';
import { getKeyboardAwareScrollViewProps, getKeyboardAwareContentStyle } from '../../utils/keyboard';
import apiInstance, { ApiResponse } from '../../api/apiInstance';
import { toastError, toastSuccess } from '../../utils/toast';
import WebView from 'react-native-webview';
import { ScreenHeader } from '../../components/';

const VenterUpgradePlan = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  const [selectedPlan, setSelectedPlan] = useState<string | undefined>();
  const [planType, setPlanType] = useState<'monthly' | 'annual'>('monthly');
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<any> = await apiInstance.get('payments/subscription-plans');
      if (response.success && response.data?.plans) {
        const mapped = response.data.plans
          .filter((p: any) => {
            const lower = p.name.toLowerCase();
            return lower.includes('free trial') || lower.includes('free tier') ||
                   lower.includes('light support') || lower.includes('balanced support');
          })
          .map((p: any) => {
            const lower = p.name.toLowerCase();
            const isLightSupport   = lower.includes('light support');
            const isBalanced       = lower.includes('balanced support');
            const isHighSupport    = lower.includes('high support');
            const isConsistentCare = lower.includes('consistent care');
            const isPayAsYouGo     = lower.includes('pay as you go');
            const isFree           = lower.includes('free trial') || lower.includes('free tier');
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
              descriptionKey,
              overageKey,
              messagesKey,
              description: p.included_minutes ? (p.included_minutes + ' minutes included.') : (p.description || ''),
              monthlyPrice: Number(p.price_monthly) || Number(p.monthlyPrice) || 0,
              annualPrice: Number(p.annual_price) || Number(p.annualPrice) || 0,
              features: p.features || [],
            };
          });
        setPlans(mapped);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedPlan) {
      toastError({ text: t('ChoosePlan.selectPlan') || 'Please select a plan', theme });
      return;
    }
    try {
      setLoading(true);
      const selectedPlanData = plans.find((p: any) => p.id === selectedPlan);
      
      // Free plan - no payment needed
      if (selectedPlanData && selectedPlanData.monthlyPrice === 0 && selectedPlanData.annualPrice === 0) {
        try {
          await apiInstance.post('payments/select-free-plan', { planId: selectedPlan });
        } catch {
          // Even if API fails, navigate home
        }
        (navigation as any).replace(routes.venterHomeTab);
        return;
      }

      // Cancel any existing free tier subscription before paid checkout
      try {
        await apiInstance.post('payments/cancel-subscription', {});
      } catch {
        // Ignore - might not have a free tier subscription
      }

      if (Platform.OS === 'ios') {
        const selectedPlanData = plans.find((p: any) => p.id === selectedPlan);
        const planName = selectedPlanData?.name || '';
        const planSkuMap: Record<string, string> = {
          'light support': SUBSCRIPTION_SKUS.light_support_monthly,
          'balanced support': SUBSCRIPTION_SKUS.balanced_support_monthly,
        };
        let sku = '';
        for (const [key, value] of Object.entries(planSkuMap)) {
          if (planName.toLowerCase().includes(key)) {
            sku = planType === 'annual' ? value.replace('_monthly', '_annual') : value;
            break;
          }
        }
        if (!sku) {
          toastError({ text: 'Plan not available on iOS', theme });
          return;
        }
        await iapService.purchaseSubscription(sku);
      } else {
        const res: any = await apiInstance.post('payments/create-subscription-checkout', { planId: selectedPlan });
        setUrl(res?.data?.url);
      }
    } catch (err: any) {
      if (err?.message?.includes('You already have an active subscription')) {
        (navigation as any).goBack();
        toastSuccess({ text: 'You already have an active subscription', theme });
      } else {
        toastError({ text: err?.message || err?.error, theme });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigation.goBack();

  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url: navUrl } = navState;
    if (!navUrl) return;
    if (navUrl.includes('subscription-success') || navUrl.includes('/venter/home')) {
      setUrl('');
      toastSuccess({ text: 'Plan subscribed successfully!', theme });
      navigation.goBack();
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1 },
    tabContainer: { flexDirection: 'row', marginBottom: hp(2), borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    tab: { paddingVertical: hp(1.5), alignItems: 'center', justifyContent: 'center', flex: 1 },
    tabActive: { borderBottomColor: theme.white, borderBottomWidth: 2 },
    tabText: { color: 'rgba(255,255,255,0.5)', fontFamily: fontFamilies.medium, fontSize: hp(1.8) },
    tabTextActive: { color: theme.white },
    planCard: { borderRadius: hp(2), padding: hp(2), marginBottom: hp(1.5), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' },
    planCardSelected: { borderColor: '#ff00ff', backgroundColor: 'rgba(255,0,255,0.08)' },
    planName: { color: theme.white, fontFamily: fontFamilies.semiBold, fontSize: hp(2), marginBottom: hp(0.5) },
    planPrice: { color: theme.white, fontFamily: fontFamilies.bold, fontSize: hp(2.5), marginBottom: hp(0.5) },
    planDescription: { color: 'rgba(255,255,255,0.6)', fontFamily: fontFamilies.normal, fontSize: hp(1.5) },
  });

  return (
    <HomeWrapper key={langKey}>
      {url ? (
        <View style={styles.container}>
          <ScreenHeader onBackPress={handleBack} title={t('ChoosePlan.title') || 'Choose Plan'} />
          <WebView
            source={{ uri: url }}
            style={{ flex: 1 }}
            startInLoadingState={true}
            onNavigationStateChange={handleWebViewNavigationStateChange}
          />
        </View>
      ) : (
        <View style={styles.container}>
          <ScreenHeader onBackPress={handleBack} title={t('ChoosePlan.title') || 'Choose Plan'} containerStyle={{ paddingHorizontal: 0 }} />
          <KeyboardAwareScrollView
            {...getKeyboardAwareScrollViewProps()}
            extraScrollHeight={hp(25)}
            contentContainerStyle={getKeyboardAwareContentStyle()}
          >
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, planType === 'monthly' && styles.tabActive]}
                onPress={() => setPlanType('monthly')}
              >
                <Text style={[styles.tabText, planType === 'monthly' && styles.tabTextActive]}>
                  {t('ChoosePlan.monthly') || 'Monthly'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, planType === 'annual' && styles.tabActive]}
                onPress={() => setPlanType('annual')}
              >
                <Text style={[styles.tabText, planType === 'annual' && styles.tabTextActive]}>
                  {t('ChoosePlan.annual') || 'Annual'}
                </Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: hp(10) }}>
                <Text style={{ color: theme.white, fontFamily: fontFamilies.normal }}>Loading plans...</Text>
              </View>
            ) : plans.length === 0 ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: hp(10) }}>
                <Text style={{ color: theme.white, fontFamily: fontFamilies.normal }}>No plans available</Text>
              </View>
            ) : (
              <FlatList
                data={plans}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                contentContainerStyle={{ paddingHorizontal: wp(4) }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.planCard, selectedPlan === item.id && styles.planCardSelected]}
                    onPress={() => setSelectedPlan(item.id)}
                  >
                    <Text style={styles.planName}>{item.nameKey ? t(item.nameKey) || item.name : item.name}</Text>
                    <Text style={styles.planPrice}>
                      {(item.monthlyPrice === 0 && item.annualPrice === 0)
                        ? t('ChoosePlan.free')
                        : `$${planType === 'monthly' ? item.monthlyPrice : item.annualPrice}/${planType === 'monthly' ? 'monthly' : 'annually'}`}
                    </Text>
                    {!!(item.descriptionKey ? t(item.descriptionKey) : item.description) && (
                      <Text style={styles.planDescription}>{item.descriptionKey ? t(item.descriptionKey) : item.description}</Text>
                    )}
                    {!!item.overageKey && !!t(item.overageKey) && (
                      <Text style={styles.planDescription}>{t(item.overageKey)}</Text>
                    )}
                    {!!item.messagesKey && !!t(item.messagesKey) && (
                      <Text style={styles.planDescription}>{t(item.messagesKey)}</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}

            <View style={{ paddingHorizontal: wp(4), paddingTop: hp(2), paddingBottom: hp(4) }}>
              <Button
                title={loading ? 'Loading...' : t('ChoosePlan.continue') || 'Continue'}
                onPress={handleContinue}
                disabled={loading || !selectedPlan}
                glassStyles={{ width: '100%' }}
                buttonStyle={{}}
                titleStyle={{}}
                leftIcon={undefined}
                iconStyle={{}}
              />
            </View>
          </KeyboardAwareScrollView>
        </View>
      )}
    </HomeWrapper>
  );
};

export default VenterUpgradePlan;
