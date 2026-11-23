import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextStyle, StyleProp, ViewStyle, Image, ActivityIndicator } from 'react-native';
import { hp, wp } from '../utils/size';
import { fontFamilies } from '../utils/fontFamilies';
import { useTheme } from '../theme';
import { glassStyles } from '../utils/glassStylees';
import GlassView from './GlassWrapper';

const Button = ({ title, onPress, buttonStyle, iconStyle, titleStyle, disabled = false, glassStyles, leftIcon, iconElement, borderedGlassButton = false, stacked = false, loading = false }: {
  title: string, onPress: () => void,
  buttonStyle?: StyleProp<ViewStyle>,
  titleStyle?: StyleProp<TextStyle>,
  disabled?: boolean,
  glassStyles?: StyleProp<ViewStyle>
  leftIcon?: any,
  iconStyle?: any,
  iconElement?: React.ReactNode,
  borderedGlassButton?: boolean,
  stacked?: boolean,
  loading?: boolean
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.6),
      color: theme.white,
    },
    icon: {
      height: hp(2.5),
      width: hp(2.5),
      resizeMode: "contain",
    },
    stackedIcon: {
      height: hp(3),
      width: hp(3),
      resizeMode: "contain",
    },
    stackedTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.5),
      color: theme.white,
      marginTop: hp(0.6),
    },
  });
  // Merge default height with glassStyles; flex or explicit width in glassStyles take precedence
  const glassStyleObj = glassStyles as any || {};
  const hasFlexOrWidth = glassStyleObj.flex !== undefined || glassStyleObj.width !== undefined;
  const mergedGlassStyle: ViewStyle = {
    height: hp(5),
    ...(hasFlexOrWidth ? {} : { width: '100%' }),
    ...glassStyleObj,
  };

  const isStacked = stacked && (leftIcon || iconElement || title);

  return (
    <GlassView bordered={borderedGlassButton} glassStyles={mergedGlassStyle}>
      <TouchableOpacity
        style={[{
          height: hp(4.5),
          width: '100%',
          flexDirection: isStacked ? 'column' : 'row',
          gap: isStacked ? 0 : wp(2),
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: hp(999),
          overflow: 'hidden',
          paddingHorizontal: wp(4),
        }, isStacked && { height: undefined, minHeight: hp(4.5), paddingVertical: hp(1.2), paddingHorizontal: wp(3) }, buttonStyle]}
        onPress={onPress}
        disabled={disabled}
      >
        {loading ? <ActivityIndicator size="small" color={theme.white} /> : (
          <>
            {iconElement ?? (leftIcon ? <Image source={leftIcon} style={[isStacked ? styles.stackedIcon : styles.icon, iconStyle]} /> : null)}
            {title ? <Text style={[isStacked ? styles.stackedTitle : styles.title, titleStyle]}>{title}</Text> : null}
          </>
        )}
      </TouchableOpacity>
    </GlassView>
  );
};

export default Button;
