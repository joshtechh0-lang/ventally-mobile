import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { alpha, hp, wp } from '../utils/size';
import { useTheme } from '../theme';
import { getGlassColors } from '../utils/glassColors';
import { appleIcon, googleIcon } from '../assets/icons';

interface SocialButtonProps {
  icon: string;
  onPress: () => void;
}

const SocialButton: React.FC<SocialButtonProps> = ({ icon, onPress }) => {
  const { theme, isDark } = useTheme();
  const glassColors = getGlassColors(theme, isDark);

  const styles = StyleSheet.create({
    container: {
      width: hp(7.2),
      height: hp(4.2),
      borderRadius: hp(444),
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',

      // Glass base
      // backgroundColor: glassColors.glassBase,

      // Glass border
      borderWidth: 1,
      borderColor: `${theme.white}${alpha(20)}`,


    },



    icon: {
      width: hp(2.6),
      height: hp(2.6),
      zIndex: 1,
      resizeMode: 'contain',
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Top highlight */}
      {/* <View style={styles.highlight} /> */}

      {/* Inner glass layer */}
      {/* <View style={styles.innerGlass} /> */}

      {/* Icon */}
      {/* <Text style={styles.icon}>{icon}</Text> */}
      <Image style={styles.icon} source={icon === 'apple' ? appleIcon : googleIcon} />
    </TouchableOpacity>
  );
};

export default SocialButton;
