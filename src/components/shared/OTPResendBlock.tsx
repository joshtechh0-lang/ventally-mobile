import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { info } from '../../assets/icons';

interface Props {
  canResend: boolean;
  cooldownLabel: string;
  resendLoading?: boolean;
  onResend: () => void;
}

/**
 * Info notice ("Verification emails may take a few minutes…") + the
 * "Didn't receive the code? Resend in MM:SS" line. Matches the web OTP
 * resend layout: no boxed card around the notice, timer is highlighted
 * inline in the resend prompt.
 */
const OTPResendBlock: React.FC<Props> = ({
  canResend,
  cooldownLabel,
  resendLoading = false,
  onResend,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    wrapper: {
      width: '100%',
      alignItems: 'center',
      marginTop: hp(1),
    },
    notice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: wp(2),
      paddingHorizontal: wp(2),
      marginBottom: hp(2.5),
    },
    icon: {
      width: hp(1.8),
      height: hp(1.8),
      tintColor: theme.white + 'aa',
      marginTop: hp(0.2),
      resizeMode: 'contain',
    },
    noticeText: {
      flex: 1,
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.5),
      lineHeight: hp(2.1),
      color: theme.white + 'b3',
    },
    resendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    resendText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.7),
      color: theme.white + 'd9',
    },
    resendLink: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.7),
      color: theme.magenda,
      textDecorationLine: 'underline',
      marginLeft: wp(1.5),
    },
    resendLinkDisabled: {
      opacity: 0.5,
    },
    timer: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(1.7),
      color: theme.magenda,
      letterSpacing: 1,
      marginLeft: wp(1),
    },
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.notice}>
        <Image source={info} style={styles.icon} />
        <Text style={styles.noticeText}>
          {t(
            'EmailVerification.deliveryNotice',
            'Verification emails may take a few minutes to arrive. Please check your Spam or Promotions folder if you do not see it. Your code will remain valid for up to 1 hour, and new codes can be requested after 5 minutes.',
          )}
        </Text>
      </View>

      <View style={styles.resendRow}>
        <Text style={styles.resendText}>
          {t('EmailVerification.didntReceiveCode', "Didn't receive the code?")}
        </Text>
        {canResend ? (
          <TouchableOpacity onPress={onResend} disabled={resendLoading}>
            <Text
              style={[
                styles.resendLink,
                resendLoading && styles.resendLinkDisabled,
              ]}
            >
              {t('EmailVerification.resend', 'Resend')}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={[styles.resendText, { marginLeft: wp(1.5) }]}>
              {t('EmailVerification.resendIn', 'Resend in')}
            </Text>
            <Text style={styles.timer}>{cooldownLabel}</Text>
          </>
        )}
      </View>
    </View>
  );
};

export default OTPResendBlock;
