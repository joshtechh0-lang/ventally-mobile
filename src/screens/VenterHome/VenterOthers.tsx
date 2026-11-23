import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassWrapper from '../../components/GlassWrapper';
import { chevronIcon, happyIcon, journeyIcon, recoveryIcon, reflections, userIcon } from '../../assets/icons';
import HomeWrapper from '../../wrapper/HomeWrapper';
import SettingsItem from '../../components/shared/SettingsItem';
import { routes } from '../../navigation/routes';

interface ExtraOption {
  title: string;
  subtitle: string;
  route: string;
}

const EXTRA_OPTIONS: ExtraOption[] = [
  {
    title: 'Referrals',
    subtitle: 'Invite friends and earn rewards',
    route: routes.referral,
  },
  {
    title: 'Community Discount',
    subtitle: 'Verify eligibility for discounts',
    route: routes.verifyPass,
  },
  {
    title: 'Affiliate Program',
    subtitle: 'Earn commissions as an affiliate',
    route: routes.affiliate,
  },
];

const VenterOthers = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const navigation = useNavigation();

  const otherOptions = [
    { title: t('VenterOthers.options.mood.title'), subtitle: t('VenterOthers.options.moodHistory.subtitle'), icon: happyIcon },
    { title: t('VenterOthers.options.reflections.title'), subtitle: t('VenterOthers.options.sessionHistory.subtitle'), icon: reflections },
    { title: t('VenterOthers.options.recovery.title'), subtitle: t('VenterOthers.options.wellness.subtitle'), icon: recoveryIcon },
    { title: t('VenterOthers.options.journey.title'), subtitle: t('VenterOthers.options.guidelines.subtitle'), icon: journeyIcon },
    { title: t('VenterOthers.options.profile.title'), subtitle: t('VenterOthers.options.profile.subtitle'), icon: userIcon },
  ];

  const handleOptionPress = (index: number) => {
    if (index === 0) {
      (navigation as any).navigate(routes.venterInternal, { screen: routes.venterMoods });
      return;
    }
    if (index === 1) {
      (navigation as any).navigate(routes.venterInternal, { screen: routes.venterReflections });
      return;
    }
    if (index === 2) {
      (navigation as any).navigate(routes.venterInternal, { screen: routes.venterRecoveryDashboard });
      return;
    }
    if (index === 3) {
      (navigation as any).navigate(routes.venterInternal, { screen: routes.venterJourneyDashboard });
      return;
    }
    if (index === 4) {
      (navigation as any).navigate(routes.profile);
      return;
    }
  };

  const handleExtraOptionPress = (route: string) => {
    (navigation as any).navigate(routes.venterInternal, { screen: route });
  };

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(8),
    },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.2),
      color: theme.white,
      marginBottom: hp(4),
      textAlign: 'center',
    },
    optionItem: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(.8),

      marginBottom: hp(2),
      backgroundColor: theme.black + "10",
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(0.5),
    },
    optionSubtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white60,
    },
    chevron: {
      width: hp(2),
      height: hp(2),
      tintColor: theme.white60,
    },
  });

  return (
    <HomeWrapper key={langKey}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('VenterOthers.title')}</Text>

        {otherOptions.map((option, index) => (
          <GlassWrapper key={index} bordered radius={hp(2)} style={styles.optionItem}>
            <SettingsItem
              leftIcon={option.icon}
              title={option.title}
              onPress={() => handleOptionPress(index)}
              rightComponent={<Image source={chevronIcon}
                style={{
                  transform: [{ rotate: '-90deg' }],
                  width: hp(2.5),
                  height: hp(2.5),
                  resizeMode: 'contain',
                  tintColor: theme.white,
                }}
              />}
            />
          </GlassWrapper>
        ))}

        {EXTRA_OPTIONS.map((opt) => (
          <GlassWrapper key={opt.route} bordered radius={hp(2)} style={styles.optionItem}>
            <SettingsItem
              title={opt.title}
              subtitle={opt.subtitle}
              onPress={() => handleExtraOptionPress(opt.route)}
              rightComponent={<Image source={chevronIcon}
                style={{
                  transform: [{ rotate: '-90deg' }],
                  width: hp(2.5),
                  height: hp(2.5),
                  resizeMode: 'contain',
                  tintColor: theme.white,
                }}
              />}
            />
          </GlassWrapper>
        ))}

        <View style={{ height: hp(12) }} />
      </ScrollView>
    </HomeWrapper>
  );
};

export default VenterOthers;