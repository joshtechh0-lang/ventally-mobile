import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassWrapper from '../GlassWrapper';
import { backIcon, chevronIcon } from '../../assets/icons';

interface VenterReflectionCardProps {
  date: string;
  text: string;
  onPress: () => void;
}

const VenterReflectionCard: React.FC<VenterReflectionCardProps> = ({
  date,
  text,
  onPress,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    card: {
      borderRadius: hp(1.5),
      marginBottom: hp(2),
      backgroundColor: theme.black + "20",
    },
    cardContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: hp(1.5),
    },
    textContainer: {
      flex: 1,
      marginRight: wp(3),
    },
    date: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(0.8),
    },
    reflectionText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + "cc",
      lineHeight: hp(2.2),
    },
    chevron: {
      width: hp(2),
      height: hp(2),
      tintColor: theme.white,
      resizeMode: 'contain',
      transform: [{ rotate: '-90deg' }],
    },
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <GlassWrapper bordered glassStyles={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Text style={styles.date}>{date}</Text>
            <Text style={styles.reflectionText} numberOfLines={2}>
              {text}
            </Text>
          </View>
          <Image source={chevronIcon} style={styles.chevron} />
        </View>
      </GlassWrapper>
    </TouchableOpacity>
  );
};

export default VenterReflectionCard;
