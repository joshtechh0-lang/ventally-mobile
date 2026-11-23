import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassWrapper from '../GlassWrapper';
import { chevronIcon } from '../../assets/icons';

interface VenterCallEntryProps {
  name: string;
  lastCall: string;
  timeAgo: string;
  icon?: any;
  onPress?: () => void;
}

const VenterCallEntry: React.FC<VenterCallEntryProps> = ({
  name,
  lastCall,
  timeAgo,
  icon,
  onPress,
}) => {
  const { theme } = useTheme();

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
      tintColor: theme.white,
      resizeMode: 'contain',
      alignSelf: 'center',
    },
    content: {
      flex: 1,
    },
    name: {
      flex: 1,
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(0.3),
    },
    timeAgo: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + '90',
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
    },
    timeAgoContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
      paddingRight: wp(2),
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
      <GlassWrapper bordered glassStyles={{
        backgroundColor: theme.black + '10',
      }}>
        <View style={styles.card}>
          {icon && (
            <GlassWrapper style={styles.iconContainer}>
              <Image source={icon} style={styles.icon} />
            </GlassWrapper>
          )}
          <View style={styles.content}>
            <View style={styles.timeAgoContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
            
            </View>
            <Text style={styles.timeAgo} numberOfLines={1}>
            {timeAgo}

            </Text>
          </View>
          
        </View>
      </GlassWrapper>
    </TouchableOpacity>
  );
};

export default VenterCallEntry;
