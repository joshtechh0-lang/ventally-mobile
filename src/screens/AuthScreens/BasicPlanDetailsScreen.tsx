import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassView from '../../components/GlassWrapper';
import { backIcon, tickIcon } from '../../assets/icons';
import { ScreenHeader } from '../../components';

const BasicPlanDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan } = (route.params as any) || {};
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

  const planType = plan?.name?.toLowerCase().includes('standard') ? 'standard' :
    plan?.name?.toLowerCase().includes('high support') ? 'highSupport' :
      plan?.name?.toLowerCase().includes('consistent') ? 'consistentCare' :
        plan?.name?.toLowerCase().includes('pay as you go') ? 'payAsYouGo' :
          plan?.name?.toLowerCase().includes('free') ? 'free' : 'basic';

  const planInfo = (t('BasicPlanDetails', { returnObjects: true }) as any)[planType];
  const features = planInfo?.features || [];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      // paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    scrollContent: {
      paddingBottom: hp(4),
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: hp(3),
      width: '100%',
    },
    backButtonContainer: {
      position: 'absolute',
      left: 0,
      zIndex: 1,
    },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.4),
      color: theme.white,
      textAlign: 'center',
    },
    description: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white,
      textAlign: 'center',
      lineHeight: hp(2.6),
      marginBottom: hp(4),
      opacity: 0.9,
      paddingHorizontal: wp(5),
    },
    card: {
      width: '100%',
      paddingVertical: hp(3),
      paddingHorizontal: wp(6),
      marginBottom: hp(2),
    },
    cardTitle: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2),
      color: theme.white,
      marginBottom: hp(2.5),
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(2.2),
    },
    checkmarkCircle: {
      width: hp(2.8),
      height: hp(2.8),
      borderRadius: hp(1.4),
      backgroundColor: '#C7B8D6', // Lavender from screenshot
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(4),
    },
    checkmarkIcon: {
      width: hp(1.6),
      height: hp(1.6),
      tintColor: theme.white,
      resizeMode: "contain",
    },
    featureText: {
      flex: 1,
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.9),
      color: theme.white,
      opacity: 1,
    },
    backIcon: {
      width: hp(2.2),
      height: hp(2.2),
      resizeMode: "contain",
      tintColor: theme.white,
    },
  });

  return (
    <AuthWrapper key={langKey}>

      <View style={styles.container}>
        <ScreenHeader
          title={plan?.nameKey ? t(plan.nameKey) : plan?.name || t('BasicPlanDetails.title')}
          onBackPress={handleBack}
        />
        {/* Header with back button */}


        <ScrollView
          style={{
            flex: 1,
            paddingHorizontal: wp(5)
          }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Subtitle / Description */}
          <Text style={styles.description}>
            {planInfo?.description}
          </Text>

          {/* Features Card */}
          <GlassView
            glassStyles={styles.card}
            radius={hp(2)}
            // opacity={0.05}
            bordered
          >
            <Text style={styles.cardTitle}>
              {t('BasicPlanDetails.yourPlanIncludes')}
            </Text>

            {/* Dynamic Included Minutes Feature */}
            {plan?.included_minutes > 0 && (
              <View style={styles.featureItem}>
                <View style={styles.checkmarkCircle}>
                  <Image source={tickIcon} style={styles.checkmarkIcon} />
                </View>
                <Text style={styles.featureText}>
                  {plan.included_minutes} {t('BasicPlanDetails.minutes')} {t('BasicPlanDetails.included')}
                </Text>
              </View>
            )}

            {/* Dynamic Overage/Rate Feature */}
            {plan?.overage_rate > 0 && (
              <View style={styles.featureItem}>
                <View style={styles.checkmarkCircle}>
                  <Image source={tickIcon} style={styles.checkmarkIcon} />
                </View>
                <Text style={styles.featureText}>
                  ${plan.overage_rate} / {t('BasicPlanDetails.voiceMinute')}
                </Text>
              </View>
            )}

            {/* Dynamic Payment/Subscription Feature */}
            {planType === 'payAsYouGo' && (
              <View style={styles.featureItem}>
                <View style={styles.checkmarkCircle}>
                  <Image source={tickIcon} style={styles.checkmarkIcon} />
                </View>
                <Text style={styles.featureText}>
                  {t('BasicPlanDetails.noSubscriptionRequired')}
                </Text>
              </View>
            )}



            {/* Dynamic Technical Features from API */}
            {plan?.features?.map((featKey: string, index: number) => (
              <View key={`tech-${index}`} style={styles.featureItem}>
                <View style={styles.checkmarkCircle}>
                  <Image source={tickIcon} style={styles.checkmarkIcon} />
                </View>
                <Text style={styles.featureText}>
                  {featKey}
                </Text>
              </View>
            ))}

            {plan?.price_monthly && <View style={styles.featureItem}>
              <View style={styles.checkmarkCircle}>
                <Image source={tickIcon} style={styles.checkmarkIcon} />
              </View>
              <Text style={styles.featureText}>
                {plan?.price_monthly}
              </Text>
            </View>}

          </GlassView>
        </ScrollView>
      </View>
    </AuthWrapper>
  );
};

export default BasicPlanDetailsScreen;
