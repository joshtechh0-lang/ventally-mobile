import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassWrapper from '../GlassWrapper';
import { notification as notificationIcon } from '../../assets/icons';

export interface NotificationCardProps {
  title: string;
  message: string;
  time: string;
  unread?: boolean;
  onPress?: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  message,
  time,
  unread,
  onPress,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: hp(1.5),
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.8),
      borderRadius: hp(3),
    },
    iconContainer: {
      width: hp(4.5),
      height: hp(4.5),
      borderRadius: hp(2.25),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(3),
      borderWidth: 1,
      borderColor: theme.white20,
    },
    icon: {
      width: hp(2.4),
      height: hp(2.4),
      tintColor: theme.white,
      resizeMode: 'contain',
      alignSelf: 'center',
    },
    content: {
      flex: 1,
    },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(0.5),
    },
    message: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.5),
      color: theme.white + "cc",
    },
    time: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.4),
      color: theme.white,
      marginLeft: wp(3),
    },
    unreadDot: {
      width: hp(1),
      height: hp(1),
      borderRadius: hp(0.5),
      backgroundColor: theme.primary,
      position: 'absolute',
      right: wp(4),
      top: hp(1.8),
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <GlassWrapper bordered>
        <View style={styles.card}>
          {unread && <View style={styles.unreadDot} />}
          <GlassWrapper style={styles.iconContainer}>
            <Image source={notificationIcon} style={styles.icon} />
          </GlassWrapper>
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text numberOfLines={1} style={styles.message}>
              {message}
            </Text>
          </View>
          <Text style={styles.time}>{time}</Text>
        </View>
      </GlassWrapper>
    </TouchableOpacity>
  );
};

export default NotificationCard;
