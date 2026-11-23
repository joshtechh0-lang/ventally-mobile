import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable, ActivityIndicator } from 'react-native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassWrapper from '../GlassWrapper';
import { chatSingleIcon } from '../../assets/icons';

interface VenterMessagesStartChatCardProps {
  title: string;
  subtitle: string;
  icon?: any;
  onPress?: () => void;
  loading?: boolean;
}

const VenterMessagesStartChatCard: React.FC<VenterMessagesStartChatCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  loading = false,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    card: {
      paddingHorizontal: wp(5),
      paddingVertical: hp(2.5),
    },
    iconContainer: {
      width: hp(7),
      height: hp(7),
      borderRadius: hp(3.5),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(4),
    },
    icon: {
      width: hp(3),
      height: hp(3),
      tintColor: theme.white,
      resizeMode: 'contain',
      alignSelf: "center"
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2.2),
      color: theme.white,
      marginBottom: hp(0.5),
    },
    subtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + "90",
    },
  });



  return <GlassWrapper opacity={0.07} style={loading ? { ...styles.card, opacity: 0.7 } : styles.card} radius={hp(1.5)}>
    <Pressable onPress={onPress} disabled={loading} style={styles.container}>

      {icon && <GlassWrapper style={styles.iconContainer} opacity={0.09}>

        {loading ? (
          <ActivityIndicator size="small" color={theme.white} />
        ) : (
          <Image source={icon} style={styles.icon} />
        )}


      </GlassWrapper>}

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  </GlassWrapper>;
};

export default VenterMessagesStartChatCard;
