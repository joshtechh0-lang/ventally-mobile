import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassWrapper from '../GlassWrapper';
import { chevronIcon } from '../../assets/icons';
import { useTranslation } from 'react-i18next';
import PulsingDot from './PulsingDot';

interface VenterMessagesChatEntryProps {
  name: string;
  lastMessage: string;
  timeAgo: string;
  icon?: any;
  onPress?: () => void;
  isActive?: boolean;
}

const VenterMessagesChatEntry: React.FC<VenterMessagesChatEntryProps> = ({
  name,
  lastMessage,
  timeAgo,
  icon,
  onPress,
  isActive,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = StyleSheet.create({
    container: {
      marginBottom: hp(1.5),
    },
    card: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.8),
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: hp(4.5),
      height: hp(4.5),
      borderRadius: hp(2.25),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(3),
      borderWidth: 1,
      borderColor: theme.white + '30',
    },
    icon: {
      width: hp(2.4),
      height: hp(2.4),
      // tintColor: theme.white,
      resizeMode: 'contain',
      alignSelf: "center"
    },
    content: {
      flex: 1,
    },
    name: {
      flex: 1,
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(0.3),
    },
    lastMessage: {
      flex: 1,
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + "cc",
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: "space-between",
      gap: wp(2),
    },
    timeAgoContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
      paddingRight: wp(2),
    },
    timeAgo: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white + "cc",
    },
    chevron: {
      width: hp(1.8),
      height: hp(1.8),
      tintColor: theme.white,
      resizeMode: 'contain',
      transform: [{ rotate: '-90deg' }],
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <GlassWrapper bordered>
        <View style={styles.card}>
          {icon && (
            <GlassWrapper style={styles.iconContainer}>
              <Image source={icon} style={styles.icon} />
            </GlassWrapper>
          )}
          <View style={styles.content}>
            <View style={styles.timeAgoContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>
                <Text style={styles.timeAgo} numberOfLines={1}>{isActive ? t('VenterMessages.chatEntry.active') : timeAgo}</Text>

                {isActive && (
                  <PulsingDot
                    size={hp(1)}
                    color={theme.success}
                    containerStyle={{ marginLeft: wp(1) }}
                  />
                )}
              </View>
            </View>
            <View style={styles.rightSection}>

              {<Text style={styles.lastMessage} numberOfLines={1}>
                {lastMessage || "--"}
              </Text>}

              <Image source={chevronIcon} style={styles.chevron} />

            </View>
          </View>

        </View>

      </GlassWrapper>
    </TouchableOpacity>
  );
};

export default VenterMessagesChatEntry;
