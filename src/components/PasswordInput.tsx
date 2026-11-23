import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, StyleProp, TextStyle, ViewStyle, Image } from 'react-native';
import { hp, wp } from '../utils/size';
import { fontFamilies } from '../utils/fontFamilies';
import { useTheme } from '../theme';
import { getGlassColors } from '../utils/glassColors';
import { hexToRgba } from '../utils/glassColors';
import { alpha } from '../utils/size';
import { eyeOff, eyeOpen } from '../assets/icons';

interface PasswordInputProps {
  containerStyle?: StyleProp<ViewStyle>;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  showHint?: boolean;
  hintText?: string;
  percentage?: number;
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  noTitle?: boolean;
  inputContainerStyle?: any;
  error?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  containerStyle,
  placeholder,
  value,
  onChangeText,
  showHint = false,
  hintText = 'At least 8 characters',
  percentage = 20,
  title,
  titleStyle,
  inputContainerStyle,
  noTitle = false,
  error,
}) => {

  const { theme, isDark } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const glassColors = getGlassColors(theme, isDark);

  const styles = StyleSheet.create({
    wrapper: {
      width: '100%',
    },

    container: {
      width: '100%',
      height: hp(6),
      justifyContent: 'center',
      overflow: 'hidden',
      borderBottomWidth: 1,
      borderBottomColor: `${theme.white}${alpha(percentage)}`,
    },

    input: {
      width: "100%",
      // paddingHorizontal: wp(4),
      paddingRight: wp(12),
      fontSize: hp(1.4),
      fontFamily: fontFamilies.normal,
      zIndex: 1,
      color: theme.white,
    },

    eyeButton: {
      position: 'absolute',
      right: wp(0),
      zIndex: 2,
      padding: wp(2),
    },

    eyeIcon: {
      width: hp(2.5),
      height: hp(2.5),
      tintColor: theme.white + "cc",
      resizeMode: 'contain',
    },

    hintText: {
      fontSize: hp(1.3),
      fontFamily: fontFamilies.normal,
      marginTop: hp(.5),
      color: theme.white + "90",
      marginBottom: hp(1.5),

    },
    title: {
      fontSize: hp(1.7),
      fontFamily: fontFamilies.semiBold,
      color: theme.white,
      marginBottom: hp(0.5)

    },
    errorText: {
      fontSize: hp(1.2),
      fontFamily: fontFamilies.normal,
      marginTop: hp(-0.5),
      marginLeft: wp(2.5),
      color: theme.error,
      marginBottom: hp(1.5),
    },
  });

  return (
    <View style={styles.wrapper}>
      {!noTitle && title && <Text style={[styles.title, titleStyle]}>{title}</Text>}

      <View style={[styles.container, containerStyle, inputContainerStyle, showHint && {
        marginBottom: hp(.5),
      }]}>

        {/* Top highlight */}

        {/* Inner glass layer */}

        {/* Input field */}
        <TextInput
          style={styles.input}
          placeholder={""}
          placeholderTextColor={glassColors.glassPlaceholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!isPasswordVisible}
        />

        {/* Eye icon toggle */}
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          activeOpacity={0.7}
        >
          <Image style={styles.eyeIcon} source={!isPasswordVisible ? eyeOpen : eyeOff} />
        </TouchableOpacity>
      </View>

      {/* Password hint */}
      {showHint && !error && (
        <Text style={styles.hintText}>
          {hintText}
        </Text>
      )}

      {/* Error message */}
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default PasswordInput;
