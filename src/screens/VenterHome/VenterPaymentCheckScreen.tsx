import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useSelector, useDispatch } from 'react-redux';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { routes } from '../../navigation/routes';
import { deductBalance } from '../../store/slices/userSlice';
import type { RootState } from '../../store/store';
import { Button, ScreenHeader } from '../../components';
import GlassView from '../../components/GlassWrapper';
import { SESSION_COST } from '../../constants/payment';

const VenterPaymentCheckScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const balance = useSelector((state: RootState) => state.user.user.balance ?? 0);
  const sessionType = useSelector((state: RootState) => state.call.sessionType);

  const hasEnoughBalance = balance >= SESSION_COST;

  const handleContinue = () => {
    dispatch(deductBalance(SESSION_COST));
    (navigation as any).navigate(routes.chatStack, {
      screen: routes.findingListener,
    });
  };

  const handleAddFunds = () => {
    (navigation as any).navigate(routes.venterHomeTab, {
      screen: routes.venterWallet,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: wp(2),
    },
    card: {
      paddingVertical: hp(3),
      paddingHorizontal: wp(5),
      marginBottom: hp(3),
      borderRadius: hp(2),
    },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.2),
      color: theme.white,
      marginBottom: hp(2),
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(1.5),
    },
    label: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white + '99',
    },
    value: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.8),
      color: theme.white,
    },
    divider: {
      height: 1,
      backgroundColor: theme.white + '20',
      marginVertical: hp(1.5),
    },
    insufficientText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.7),
      color: theme.white + 'cc',
      textAlign: 'center',
      marginBottom: hp(3),
    },
    buttonWrap: {
      marginTop: hp(2),
    },
  });

  return (
    <HomeWrapper key={langKey}>
      <ScreenHeader title="" onBackPress={handleBack} showBackButton />

      <View style={styles.container}>

        <View style={styles.content}>
          <GlassView bordered glassStyles={styles.card}>
            <Text style={styles.title}>
              {hasEnoughBalance
                ? t('VenterPaymentCheck.title')
                : t('VenterPaymentCheck.insufficientTitle')}
            </Text>

            <View style={styles.row}>
              <Text style={styles.label}>{t('VenterPaymentCheck.yourBalance')}</Text>
              <Text style={styles.value}>${balance.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>
                {sessionType === 'call'
                  ? t('VenterPaymentCheck.callCost')
                  : t('VenterPaymentCheck.chatCost')}
              </Text>
              <Text style={styles.value}>${SESSION_COST.toFixed(2)}</Text>
            </View>

            {!hasEnoughBalance && (
              <Text style={styles.insufficientText}>
                {t('VenterPaymentCheck.insufficientMessage')}
              </Text>
            )}
          </GlassView>

          {hasEnoughBalance ? (
            <View style={styles.buttonWrap}>
              <Button
                title={t('VenterPaymentCheck.continue')}
                onPress={handleContinue}
                buttonStyle={{}}
                titleStyle={{}}
                glassStyles={{}}
                disabled={false}
                leftIcon={undefined}
                iconStyle={{}}
              />
            </View>
          ) : (
            <View style={styles.buttonWrap}>
              <Button
                title={t('VenterPaymentCheck.addFunds')}
                onPress={handleAddFunds}
                buttonStyle={{}}
                titleStyle={{}}
                glassStyles={{}}
                disabled={false}
                leftIcon={undefined}
                iconStyle={{}}
              />
            </View>
          )}
        </View>
      </View>
    </HomeWrapper>
  );
};

export default VenterPaymentCheckScreen;
