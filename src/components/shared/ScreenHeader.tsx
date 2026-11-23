import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { backIcon, notification as notificationIcon } from '../../assets/icons';
import GlassView from '../GlassWrapper';
import { routes } from '../../navigation/routes';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  containerStyle?: any;
  showNotificationButton?: boolean;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  showBackButton = true,
  rightComponent,
  containerStyle,
  showNotificationButton = false,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const styles = StyleSheet.create({
    container: {

      marginBottom: hp(2),
      paddingTop: hp(2),
      paddingHorizontal: wp(5),
    },

    headerRow: {
      width: "100%",

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: hp(1),
    },
    leftSection: {
      position: "absolute",
      top: 0,
      left: 0,
      flexDirection: 'row',
      // alignItems: 'center',
    },
    backButton: {
      width: hp(4),
      height: hp(4),
      justifyContent: "center",
      alignItems: "center"

    },
    backIcon: {
      width: hp(2),
      height: hp(2),
      tintColor: theme.white,
      resizeMode: "contain",
      alignSelf: "center"
    },
    // titleContainer: {
    //   flex: 1,
    //   alignItems: 'center',
    // },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      alignSelf: "center",
    },
    subtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + "cc",
      textAlign: 'center',
      // marginTop: hp(0.5),
    },
    rightSection: {
      position: "absolute",
      top: 0,
      right: 0,
    },
    notificationButton: {
      width: hp(4),
      height: hp(4),
      justifyContent: 'center',
      alignItems: 'center',
    },
    notificationIcon: {
      width: hp(2.2),
      height: hp(2.2),
      tintColor: theme.white,
      resizeMode: 'contain',
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.headerRow}>
        <View style={styles.leftSection}>
          {showBackButton && (
            <GlassView opacity={0.03}  >
              <TouchableOpacity style={styles.backButton} onPress={onBackPress ? onBackPress : () => navigation.goBack()}>

                <Image source={backIcon} style={styles.backIcon} />
              </TouchableOpacity>

            </GlassView>
          )}
        </View>

        {/* <View style={styles.titleContainer}> */}
        <Text style={styles.title}>{title}</Text>
        {/* </View> */}

        <View style={styles.rightSection}>
          {rightComponent ? (
            rightComponent
          ) : showNotificationButton ? (
            <GlassView>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => {
                  (navigation as any).navigate(routes.notifications);
                }}
              >
                <Image source={notificationIcon} style={styles.notificationIcon} />
              </TouchableOpacity>
            </GlassView>
          ) : null}
        </View>
      </View>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

export default ScreenHeader;