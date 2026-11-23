import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { hp, wp } from '../utils/size';
import { fontFamilies } from '../utils/fontFamilies';
import { useTheme } from '../theme';
import { chevronIcon } from '../assets/icons';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionItemProps {
  title: string;
  description?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  containerStyle?: any;
  headerStyle?: any;
  titleStyle?: any;
  contentStyle?: any;
  descriptionStyle?: any;
  showChevron?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  description,
  isExpanded = false,
  onToggle,
  containerStyle,
  headerStyle,
  titleStyle,
  contentStyle,
  descriptionStyle,
  showChevron = true,
  disabled = false,
  children,
}) => {
  const { theme } = useTheme();
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  // Update rotation animation when isExpanded changes
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotateAnim]);

  const handleToggle = () => {
    if (disabled || !onToggle) return;

    // Configure layout animation for smooth expand/collapse
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });

    onToggle();
  };

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const styles = StyleSheet.create({
    container: {
      overflow: 'hidden',
      marginBottom: hp(1),

    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // padding: wp(4),
      minHeight: hp(6),

    },
    headerDisabled: {
      opacity: 0.6,
    },
    title: {
      flex: 1,
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
      marginRight: wp(2),
      lineHeight: hp(2.8),
    },
    chevronContainer: {
      width: hp(3),
      height: hp(3),
      justifyContent: 'center',
      alignItems: 'center',
    },
    chevron: {
      width: hp(1.8),
      height: hp(1.8),
      tintColor: theme.white,
      resizeMode: 'contain',
    },
    content: {
      // paddingHorizontal: wp(4),
      // paddingBottom: wp(1),
      paddingTop: 0,
    },
    description: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + "90",
      lineHeight: hp(2.3),
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[styles.header, disabled && styles.headerDisabled, headerStyle]}
        onPress={handleToggle}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {showChevron && (
          <View style={styles.chevronContainer}>
            <Animated.View
              style={{
                transform: [{ rotate: chevronRotation }],
              }}
            >
              <Image source={chevronIcon} style={styles.chevron} />
            </Animated.View>
          </View>
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={[styles.content, contentStyle]}>
          {description ? (
            <Text style={[styles.description, descriptionStyle]}>{description}</Text>
          ) : (
            children
          )}
        </View>
      )}
    </View>
  );
};

export default AccordionItem;