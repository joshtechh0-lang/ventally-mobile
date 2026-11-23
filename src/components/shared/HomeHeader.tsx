import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType, Pressable } from 'react-native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassView from '../GlassWrapper';
import { useNavigation } from '@react-navigation/native';
import { routes } from '../../navigation/routes';
import { useSelector } from 'react-redux';
import { useNotifications } from '../../api/apiHooks/useNotifications';
import { useFocusEffect } from '@react-navigation/native';
import { RootState } from '../../store';
import { useTranslation } from 'react-i18next';
import messaging from '@react-native-firebase/messaging';

interface HomeHeaderProps {
  leftIcon?: ImageSourcePropType;
  /** Label below logo (e.g. "VENTALLY") */
  leftLabel?: string;
  /** Main title (e.g. "Welcome!") */
  title?: string;
  /** Subtitle (e.g. "Admin Store") */
  subtitle?: string;
  rightIcon?: ImageSourcePropType;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  admin?: boolean;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  leftIcon,
  leftLabel,
  title,
  subtitle,
  rightIcon,
  onLeftPress,
  onRightPress,
  admin = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { isVenter, user } = useSelector((state: RootState) => state.user)
  const navigation = useNavigation<any>();
  const { getUnreadCount } = useNotifications();
  const [unreadCount, setUnreadCount] = React.useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUnread = async () => {
        try {
          const res = await getUnreadCount();
          if (res?.success) {
            setUnreadCount(res.unreadCount);
          }
        } catch (error) {
          console.log('Error fetching unread count:', error);
        }
      };
      fetchUnread();
    }, [])
  );

  React.useEffect(() => {
    // Listen for foreground FCM messages to update unread dot in real-time
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('FCM Message received in foreground:', remoteMessage);
      setUnreadCount((prev) => prev + 1);
    });

    return unsubscribe;
  }, []);

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: hp(2),
      paddingHorizontal: wp(5),
    },
    leftRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(3),
    },
    leftTextContainer: {
      justifyContent: 'center',
    },
    logoWrapper: {
      width: hp(5),
      height: hp(5),
      borderRadius: hp(999),
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: hp(4),
      height: hp(4),
      resizeMode: 'contain',
      alignSelf: 'center',
    },
    icon: {
      width: hp(4),
      height: hp(4),
      resizeMode: 'contain',
      alignSelf: 'center',
    },
    notiIcon: {
      width: hp(2.5),
      height: hp(2.5),
      resizeMode: 'contain',
      alignSelf: 'center',
    },
    leftLabel: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.2),
      color: theme.white60,
      marginBottom: hp(0.2),
    },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: admin ? hp(1.8) : hp(2.2),
      color: theme.white,
      marginBottom: hp(0.2),
    },
    subtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: admin ? hp(1.4) : hp(1.6),
      color: theme.white + "cc",
    },
    greeting: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.2),
      color: theme.white,
      marginBottom: hp(.5),
    },
    unreadBadge: {
      position: 'absolute',
      top: hp(0.2),
      right: wp(2),
      width: hp(1.2),
      height: hp(1.2),
      borderRadius: hp(0.6),
      backgroundColor: theme.red,
      borderWidth: 1,
      borderColor: theme.background,
    },
  });
  const name = user?.displayName ? user?.displayName : user?.email?.split("@")?.length > 0 ? user?.email?.split("@")[0] : "Unknown"


  return (
    <View style={styles.header}>
      <View style={styles.leftRow}>
        {leftIcon ? (
          admin ? (
            <TouchableOpacity onPress={onLeftPress}>
              <GlassView opacity={0.05} style={styles.logoWrapper}>
                <Image source={leftIcon} style={styles.icon} />
              </GlassView>
            </TouchableOpacity>
          ) : user?.role === 'venter' || user?.userType === 'venter' ? (
            <View >
              <Text style={styles.greeting}>{t('VenterHome.greeting', { name })}</Text>
              <Text style={styles.subtitle}>{t('VenterHome.subtitle')}</Text>
            </View>
          ) : (
            null
          )
        ) : (
          <View style={styles.logoWrapper} />
        )}
        {(leftLabel || title || subtitle) ? (
          <View style={styles.leftTextContainer}>
            {leftLabel ? <Text style={styles.leftLabel}>{leftLabel}</Text> : null}
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
      </View>

      {rightIcon && (
        <TouchableOpacity onPress={onRightPress}>
          <GlassView opacity={0.05} style={styles.logoWrapper}>
            <Image source={rightIcon} style={styles.notiIcon} />
            {unreadCount > 0 && <View style={styles.unreadBadge} />}
          </GlassView>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default HomeHeader;
