import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, StyleProp, ViewStyle, TextStyle, Image, ImageSourcePropType, Pressable, ImageStyle } from 'react-native';
import { alpha, hp, wp } from '../utils/size';
import { fontFamilies } from '../utils/fontFamilies';
import { useTheme } from '../theme';
import { getGlassColors } from '../utils/glassColors';

interface InputProps extends TextInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  title?: string;
  noTitle?: boolean;
  leftIcon?: ImageSourcePropType;
  leftIconStyle?: StyleProp<ImageStyle>;
  rightIcon?: ImageSourcePropType;
  rightIconStyle?: StyleProp<ImageStyle>;
  rightIconPress?: () => void;
  rightText?: string;
  error?: string;
  percentage?: number;
  titleStyle?: StyleProp<TextStyle>;
  isPlaceholderVisible?: boolean;
}

const Input: React.FC<InputProps> = ({
  containerStyle,
  inputContainerStyle,
  inputStyle,
  title,
  noTitle,
  leftIcon,
  leftIconStyle,
  rightIcon,
  rightIconStyle,
  rightIconPress,
  rightText,
  error,
  placeholderTextColor,
  percentage = 20,
  titleStyle,
  isPlaceholderVisible,
  placeholder,
  ...textInputProps
}) => {
  const { theme, isDark } = useTheme();
  const glassColors = getGlassColors(theme, isDark);

  const styles = StyleSheet.create({
    title: {
      fontSize: hp(1.7),
      fontFamily: fontFamilies.semiBold,
      color: theme.white,
      marginBottom: hp(0.5)
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: wp(2),
      width: '100%',
      height: hp(5),
      justifyContent: 'center',
      overflow: 'hidden',
      borderBottomWidth: 1,
      borderBottomColor: theme.white60,
    },

    input: {
      // paddingHorizontal: wp(2),
      paddingRight: wp(12),
      fontSize: hp(1.6),
      fontFamily: fontFamilies.normal,
      zIndex: 1,
      color: theme.white,
      flex: 1,
    },
    leftIcon: {
      width: hp(2),
      height: hp(2),
      marginRight: wp(3),
      marginLeft: wp(3),
    },
    rightIcon: {
      width: hp(2),
      height: hp(2),

      marginHorizontal: wp(2),
      tintColor: theme.white,
      resizeMode: "contain",
    },
    rightText: {
      fontSize: hp(1.3),
      fontFamily: fontFamilies.normal,
      marginLeft: wp(2),
      color: theme.textSecondary,
    },
    errorText: {
      fontSize: hp(1.2),
      fontFamily: fontFamilies.normal,
      marginTop: hp(-0.5),
      marginLeft: wp(2.5),
      marginBottom: hp(1),
      color: theme.error,
    },
  });

  return (
    <View style={[containerStyle]}>
      {!noTitle && title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
      <View style={[styles.container, inputContainerStyle]}>
        {leftIcon && (
          <Image source={leftIcon} style={[styles.leftIcon, leftIconStyle]} />
        )}
        <TextInput
          {...textInputProps}
          placeholder={isPlaceholderVisible ? placeholder : ''}
          style={[styles.input, inputStyle]}
          placeholderTextColor={placeholderTextColor || theme.white60}
        />
        {rightIcon && (
          <Pressable onPress={rightIconPress}  >
            <Image source={rightIcon} style={[styles.rightIcon, rightIconStyle]} />
          </Pressable>
        )}
        {rightText && <Text style={styles.rightText}>{rightText}</Text>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default Input;
