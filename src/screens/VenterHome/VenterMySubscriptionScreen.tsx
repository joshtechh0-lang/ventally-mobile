import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { routes } from '../../navigation/routes';
import { Button, ScreenHeader } from '../../components';
import GlassView from '../../components/GlassWrapper';

const VenterMySubscriptionScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { theme } = useTheme();

  const handleBack = () => navigation.goBack();

  const handleChoosePlan = () => {
    (navigation as any).navigate(routes.auth, {
      screen: routes.choosePlan,
    });
  };

  const handleSubscriptionPress = () => {
    (navigation as any).navigate(routes.auth, {
      screen: routes.subscriptionDetails,
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    content: {
      flex: 1,
      // paddingHorizontal: wp(2),
    },
    card: {
      paddingVertical: hp(3),
      paddingHorizontal: wp(5),
      marginBottom: hp(3),
      borderRadius: hp(2),
    },
    sectionTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2),
      color: theme.white,
      marginBottom: hp(1),
    },
    row: {
      marginBottom: hp(1),
    },
    label: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
    },
    value: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
      color: theme.white,
    },
    manageRow: {
      marginTop: hp(1.5),
      paddingTop: hp(2),
    },
    subscriptionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: hp(1),
    },
    buttonWrap: {
      position: 'absolute',
      left: wp(5),
      right: wp(5),
      bottom: hp(6),
    },
  });

  return (
    <HomeWrapper key={langKey}>
      <ScreenHeader
        title={t('VenterMySubscription.title')}
        onBackPress={handleBack}
        showBackButton
      />
      <View style={styles.container}>


        <View style={styles.content}>
          <GlassView bordered glassStyles={styles.card}>
            <Text style={styles.sectionTitle}>
              {t('VenterMySubscription.currentBilling')}
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>{t('VenterMySubscription.planName')}</Text>
              <Text style={styles.value}>
                {t('VenterMySubscription.planNameValue')}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>
                {t('VenterMySubscription.endsIn')}
              </Text>
              <Text style={styles.value}>
                {t('VenterMySubscription.endsInValue')}
              </Text>
            </View>

            <View style={styles.manageRow}>
              <Text style={styles.sectionTitle}>
                {t('VenterMySubscription.manage')}
              </Text>
              <Pressable
                style={styles.subscriptionRow}
                onPress={handleSubscriptionPress}
              >
                <Text style={styles.value}>
                  {t('VenterMySubscription.subscription')}
                </Text>
              </Pressable>
            </View>
          </GlassView>
        </View>

        <View style={styles.buttonWrap}>
          <Button
            title={t('VenterMySubscription.choosePlan')}
            onPress={handleChoosePlan}
            buttonStyle={{}}
            titleStyle={{}}
            glassStyles={{}}
            disabled={false}
            leftIcon={undefined}
            iconStyle={{}}
          />
        </View>
      </View>
    </HomeWrapper>
  );
};

export default VenterMySubscriptionScreen;
