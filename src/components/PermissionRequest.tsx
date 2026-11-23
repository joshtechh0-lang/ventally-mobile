import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType, TouchableOpacity, ActivityIndicator } from 'react-native';
import { alpha, hp, wp } from '../utils/size';
import { fontFamilies } from '../utils/fontFamilies';
import { useTheme } from '../theme';
import { getGlassColors } from '../utils/glassColors';

interface PermissionRequestProps {
  icon: ImageSourcePropType;
  title: string;
  description: string;
  buttonText: string;
  onAllow: () => void;
  privacyText?: string;
  // New optional props for finding screen
  showLoading?: boolean;
  timer?: number; // Timer in seconds
  onTimerComplete?: () => void;
  // Optional skip action — when provided, renders a secondary "Skip" button
  onSkip?: () => void;
  skipText?: string;
}

const PermissionRequest: React.FC<PermissionRequestProps> = ({
  icon,
  title,
  description,
  buttonText,
  onAllow,
  privacyText = 'Your audio is private and encrypted',
  showLoading = false,
  timer,
  onTimerComplete,
  onSkip,
  skipText = 'Skip for now',
}) => {
  const { theme, isDark } = useTheme();
  const glassColors = getGlassColors(theme, isDark);
  const [timeRemaining, setTimeRemaining] = useState(timer || 0);

  // Timer effect
  useEffect(() => {
    if (timer && timer > 0) {
      setTimeRemaining(timer);
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            if (onTimerComplete) {
              onTimerComplete();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer, onTimerComplete]);

  // Format timer as MM:SS
  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: wp(6),
    },
    dialog: {
      width: '100%',
      // maxWidth: wp(90),
      borderRadius: hp(3),
      paddingVertical: hp(2),
      paddingHorizontal: wp(4),
      alignItems: 'center',
      borderWidth: 1,
      borderBottomWidth: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      borderColor: `${theme.white}${alpha(20)}`,
      shadowColor: theme.background,

    },
    iconContainer: {
      marginBottom: hp(3),
    },
    icon: {
      width: hp(4),
      height: hp(4),
      tintColor: theme.white,
      resizeMode: 'contain',
    },
    title: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(1.5),
    },
    description: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.5),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(4),
      lineHeight: hp(2.4),
      opacity: 0.9,
    },
    buttonContainer: {
      width: '100%',
      marginBottom: hp(2),
    },
    privacyText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + "cc",
      textAlign: 'center',
      marginTop: hp(3),
    },
    buttonText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white,
    },
    button: {
      width: '100%',
      height: hp(5.5),
      borderWidth: hp(.1),
      borderColor: `${theme.white}${alpha(20)}`,
      backgroundColor: `${theme.white}${alpha(6)}`,

      borderBottomLeftRadius: hp(3),
      borderBottomRightRadius: hp(3),
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingContainer: {
      marginBottom: hp(3),
      alignItems: 'center',
    },
    timerText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      marginTop: hp(2),
    },
    skipButton: {
      marginTop: hp(2),
      paddingVertical: hp(1),
      paddingHorizontal: wp(4),
      alignSelf: 'center',
    },
    skipText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      opacity: 0.7,
      textDecorationLine: 'underline',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.dialog}>
        {showLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.white} />
          </View>
        ) : (
          <View style={styles.iconContainer}>
            <Image source={icon} style={styles.icon} resizeMode="contain" />
          </View>
        )}

        <Text style={styles.title}>{title}</Text>

        <Text style={styles.description}>{description}</Text>

        {/* <View style={styles.buttonContainer}> */}

        {/* </View> */}
      </View>
      <TouchableOpacity
        onPress={onAllow}
        style={styles.button}

      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
      {timer && timer > 0 && (
        <Text style={styles.timerText}>{formatTimer(timeRemaining)}</Text>
      )}
      {onSkip && (
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>{skipText}</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.privacyText}>{privacyText}</Text>
    </View>
  );
};

export default PermissionRequest;
