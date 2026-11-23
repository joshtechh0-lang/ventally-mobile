import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { hp, wp } from '../utils/size';

interface GlassViewProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  opacity?: number;
  radius?: number;
  glassStyles?: ViewStyle;
  blurAmount?: number;
  blurType?: 'light' | 'dark' | 'xlight' | 'regular';
  /** When true, shows all borders as solid (no gradients) */
  bordered?: boolean;
}

const GlassView: React.FC<GlassViewProps> = ({
  children,
  style,
  opacity = 0.01,
  radius = hp(3),
  glassStyles = {},
  blurAmount = 15,
  blurType = 'light',
  bordered = false,
}) => {
  // For iOS - use BlurView for real glass effect
  if (Platform.OS === 'ios') {
    return (
      <View
        style={[
          styles.wrapper,
          {
            borderRadius: radius,
            overflow: 'hidden',
            borderColor: 'rgba(255,255,255,0.5)',
            borderWidth: 0.01,
            ...(bordered && {
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }),
          },
          glassStyles,
          style,
        ]}
      >
        {/* Blur the content behind */}


        {/* Glass tint overlay */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              // backgroundColor: `rgba(255,255,255,${opacity})`,
            },
          ]}
        />

        {/* Borders - only render when NOT bordered (bordered uses native borderWidth) */}
        {!bordered && (
          <>
            {/* Top border - white */}
            <View
              style={[
                styles.topBorder,
                {
                  borderTopLeftRadius: radius,
                  borderTopRightRadius: radius,
                },
              ]}
            />

            {/* Bottom border - white */}
            <View
              style={[
                styles.bottomBorder,
                {
                  borderBottomLeftRadius: radius,
                  borderBottomRightRadius: radius,
                },
              ]}
            />

            {/* Left gradient border */}
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.leftBorder, { borderTopLeftRadius: radius, borderBottomLeftRadius: radius }]}
            />

            {/* Right gradient border */}
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.rightBorder, { borderTopRightRadius: radius, borderBottomRightRadius: radius }]}
            />
          </>
        )}

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  // For Android - simulate glass effect with backdrop
  return (
    <View
      style={[
        styles.wrapper,
        {
          borderRadius: radius,
          backgroundColor: `rgba(255,255,255,${opacity})`,
          overflow: 'hidden',
          ...(bordered && {
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
          }),
        },
        glassStyles,
        style,
      ]}
    >
      {/* Simulated blur backdrop */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: `rgba(255,255,255,${opacity * 1.5})`,
            borderRadius: radius,
          },
        ]}
      />

      {/* Borders - only render when NOT bordered (bordered uses native borderWidth) */}
      {!bordered && (
        <>
          {/* Top border - white */}
          <View
            style={[
              styles.topBorder,
              {
                borderTopLeftRadius: radius,
                borderTopRightRadius: radius,
              },
            ]}
          />

          {/* Bottom border - white */}
          <View
            style={[
              styles.bottomBorder,
              {
                borderBottomLeftRadius: radius,
                borderBottomRightRadius: radius,
              },
            ]}
          />

          {/* Left gradient border */}
          <LinearGradient
            colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.leftBorder, { borderTopLeftRadius: radius, borderBottomLeftRadius: radius }]}
          />

          {/* Right gradient border */}
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.rightBorder, { borderTopRightRadius: radius, borderBottomRightRadius: radius }]}
          />
        </>
      )}

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

export default GlassView;

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    backgroundColor: 'rgba(255 , 255 , 255 , 0.03)'
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.15,
    // shadowRadius: 12,
    // elevation: 5,
  },

  // Top border - white rgba(255,255,255,0.2)
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    zIndex: 2,
  },

  // Bottom border - white rgba(255,255,255,0.2)
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    zIndex: 2,
  },

  // Left gradient border
  leftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: wp(.5),
    zIndex: 2,
  },

  // Right gradient border
  rightBorder: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: wp(.5),
    zIndex: 2,
  },

  content: {
    zIndex: 1,
    alignSelf: 'stretch',
  },
});