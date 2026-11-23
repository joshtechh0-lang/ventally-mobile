import React from 'react';
import { View, Text, StyleSheet, Modal, Image, Pressable, ImageBackground, useColorScheme, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassWrapper from '../GlassWrapper';
import Button from '../Button';
import { authBg } from '../../assets/images';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getBackgroundImage } from '../../utils/backgrounds';

interface GlassModalProps {
  visible: boolean;
  onClose?: () => void;

  // Icon props
  icon?: any;
  iconStyle?: any;
  iconContainerStyle?: any;
  showIcon?: boolean;
  iconBorder?: boolean;
  // Content props
  title?: string;
  subtitle?: string;
  message?: string;
  titleStyle?: any;
  subtitleStyle?: any;
  messageStyle?: any;

  // Custom content
  children?: React.ReactNode;

  // Top-right slot (e.g. minimize button)
  headerRight?: React.ReactNode;

  // Button props
  showButtons?: boolean;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  tertiaryButtonText?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  onTertiaryPress?: () => void;
  primaryButtonStyle?: any;
  secondaryButtonStyle?: any;
  tertiaryButtonStyle?: any;
  primaryButtonDisabled?: boolean;
  secondaryButtonDisabled?: boolean;
  tertiaryButtonDisabled?: boolean;

  // Layout props
  modalStyle?: any;
  contentStyle?: any;
  overlayStyle?: any;
  glassStyle?: any;

  // Behavior props
  dismissOnOverlayPress?: boolean;
  dismissOnBackPress?: boolean;
  animationType?: 'none' | 'slide' | 'fade';

  // Size props
  width?: number;
  maxWidth?: number;
  minWidth?: number;
  height?: number;
  maxHeight?: number;
  minHeight?: number;
  bottomAttachedBtn?: boolean;
  showVerticalButtons?: boolean;
  // Positioning
  position?: 'center' | 'top' | 'bottom';
  marginTop?: number;
  marginBottom?: number;
}

const GlassModal: React.FC<GlassModalProps> = ({
  visible,
  onClose,
  iconBorder = true,
  // Icon props
  icon,
  iconStyle,
  iconContainerStyle,
  showIcon = true,

  // Content props
  title,
  subtitle,
  message,
  titleStyle,
  subtitleStyle,
  messageStyle,

  // Custom content
  children,
  headerRight,

  // Button props
  showButtons = true,
  primaryButtonText,
  secondaryButtonText,
  tertiaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
  onTertiaryPress,
  primaryButtonStyle,
  secondaryButtonStyle,
  tertiaryButtonStyle,
  primaryButtonDisabled = false,
  secondaryButtonDisabled = false,
  tertiaryButtonDisabled = false,
  bottomAttachedBtn = false,
  showVerticalButtons = false,
  // Layout props
  modalStyle,
  contentStyle,
  overlayStyle,
  glassStyle,

  // Behavior props
  dismissOnOverlayPress = true,
  dismissOnBackPress = true,
  animationType = 'fade',

  // Size props
  width,
  maxWidth = wp(95),
  minWidth = wp(95),
  height,
  maxHeight,
  minHeight,

  // Positioning
  position = 'center',
  marginTop = 0,
  marginBottom = 0,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const selectedBackgroundId = useSelector((state: RootState) => state?.app?.selectedBackgroundId);
  const customBackgrounds = useSelector((state: RootState) => state?.app?.customBackgrounds);

  const effectivePrimaryButtonText = primaryButtonText ?? t('Common.accept');
  const effectiveSecondaryButtonText = secondaryButtonText === undefined ? t('Common.cancel') : secondaryButtonText;

  const handleOverlayPress = () => {
    if (dismissOnOverlayPress && onClose) {
      onClose();
    }
  };

  const handlePrimaryPress = () => {
    if (onPrimaryPress) {
      onPrimaryPress();
    } else if (onClose) {
      onClose();
    }
  };

  const handleSecondaryPress = () => {
    if (onSecondaryPress) {
      onSecondaryPress();
    } else if (onClose) {
      onClose();
    }
  };

  const handleTertiaryPress = () => {
    if (onTertiaryPress) {
      onTertiaryPress();
    } else if (onClose) {
      onClose();
    }
  };

  const getPositionStyle = (): any => {
    switch (position) {
      case 'top':
        return { justifyContent: 'flex-start' as const, paddingTop: hp(10) + marginTop };
      case 'bottom':
        return { justifyContent: 'flex-end' as const, paddingBottom: hp(10) + marginBottom };
      default:
        return { justifyContent: 'center' as const };
    }
  };

  const getContentSize = () => {
    const sizeStyle: any = {};

    if (width) sizeStyle.width = width;
    if (maxWidth) sizeStyle.maxWidth = maxWidth;
    if (minWidth) sizeStyle.minWidth = minWidth;
    if (height) sizeStyle.height = height;
    if (maxHeight) sizeStyle.maxHeight = maxHeight;
    if (minHeight) sizeStyle.minHeight = minHeight;

    return sizeStyle;
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      alignItems: 'center',
      ...getPositionStyle(),
    } as any,
    modalContainer: {
      alignItems: 'center',
      paddingHorizontal: wp(5),
      ...getContentSize(),
    },
    content: {
      padding: wp(6),
      alignItems: 'center',
      width: '100%',
      height: 'auto',
    },
    iconContainer: {
      width: hp(6),
      height: hp(6),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: hp(3),
      alignSelf: "center",

    },
    icon: {
      width: hp(4),
      height: hp(4),
      tintColor: theme.white,
      resizeMode: "contain",
      alignSelf: "center"
    },
    title: {
      fontFamily: fontFamilies.medium
      ,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(1),
    },
    subtitle: {
      fontFamily: fontFamilies.medium,
      lineHeight: hp(2.5),
      fontSize: hp(1.8),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(2),
    },
    message: {
      fontFamily: fontFamilies.normal,
      lineHeight: hp(2.5),
      fontSize: hp(1.6),
      color: theme.white + "99",
      textAlign: 'center',
      marginBottom: hp(2),
    },
    customContent: {
      width: '100%',
      marginBottom: hp(3),
    },
    buttonsContainer: {
      width: '100%',
      gap: wp(3),
      minHeight: hp(5.5),
    },
    buttonsVertical: {
      flexDirection: 'column',
    },
    buttonsHorizontal: {
      flexDirection: 'row',
    },
    singleButtonContainer: {
      width: '100%',
      marginTop: hp(2),
      minHeight: hp(5.5),
    },
    button: {
      flex: 1,
    },
    singleButton: {
      width: '100%',
    },
    imageBackground: {
      flex: 1,
    },
    bottomAttachedButton: {
      height: hp(5.5),
      width: '100%',
    },
    bottomAttachedGlass: {
      height: hp(5.8),

      borderTopRightRadius: hp(0),
      borderTopLeftRadius: hp(0),
      borderBottomRightRadius: hp(2.8),
      borderBottomLeftRadius: hp(2.8),
      backgroundColor: theme.white + '10',
      width: '100%',
    },
  });
  const systemColorScheme = useColorScheme();

  const darkTheme = systemColorScheme === 'dark' ? true : false;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={dismissOnBackPress ? onClose : undefined}
      style={[modalStyle, {

      }]}
    >
      <ImageBackground
        source={getBackgroundImage(selectedBackgroundId, customBackgrounds)}

        style={[styles.overlay, overlayStyle]}
      >
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.overlay

        }} />
        <StatusBar translucent backgroundColor="transparent" barStyle={theme.background === '#000000' ? 'light-content' : 'dark-content'} />

        {/* Overlay: only this layer closes on press; modal content is a sibling so button taps work */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleOverlayPress} />
        <View style={styles.modalContainer} pointerEvents="box-none">
          <GlassWrapper bordered style={[styles.content, contentStyle, { position: 'relative' }] as any} glassStyles={StyleSheet.flatten([{
            backgroundColor: theme.black + '10',

            ...glassStyle,

          }, bottomAttachedBtn && {
            borderBottomRightRadius: hp(0),
            borderBottomLeftRadius: hp(0),
            borderTopRightRadius: hp(2),
            borderTopLeftRadius: hp(2),
            borderBottomWidth: 0,
          },])}>
            {/* Top-right header slot */}
            {headerRight && (
              <View style={{ position: 'absolute', top: wp(3), right: wp(3), zIndex: 10 }}>
                {headerRight}
              </View>
            )}

            {/* Icon */}
            {showIcon && icon && (
              <GlassWrapper bordered={iconBorder} glassStyles={[styles.iconContainer, iconContainerStyle] as any}>
                <Image source={icon} style={[styles.icon, iconStyle]} />
              </GlassWrapper>
            )}

            {/* Title */}
            {title && (
              <Text style={[styles.title, titleStyle]}>{title}</Text>
            )}

            {/* Subtitle */}
            {subtitle && (
              <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
            )}

            {/* Message */}
            {message && (
              <Text style={[styles.message, messageStyle]}>{message}</Text>
            )}

            {/* Custom Content */}
            {children && (
              <View style={styles.customContent}>
                {children}
              </View>
            )}

            {/* Buttons */}
            {showButtons && !bottomAttachedBtn && (
              <>
                {/* Single button */}
                {!effectiveSecondaryButtonText && (
                  <View style={styles.singleButtonContainer}>
                    <Button
                      title={effectivePrimaryButtonText}
                      onPress={handlePrimaryPress}
                      buttonStyle={styles.singleButton}
                      titleStyle={{ color: '#FFFFFF' }}
                      disabled={primaryButtonDisabled}
                      glassStyles={{ height: hp(5), width: '100%' }}
                      leftIcon={undefined}
                      iconStyle={{}}
                      borderedGlassButton={true}
                    />
                  </View>
                )}

                {/* Two buttons – vertical (stacked) */}
                {effectiveSecondaryButtonText && showVerticalButtons && (
                  <View style={[styles.buttonsContainer, styles.buttonsVertical]}>
                    <Button
                      title={effectivePrimaryButtonText}
                      onPress={handlePrimaryPress}

                      titleStyle={{ color: '#FFFFFF' }}
                      disabled={primaryButtonDisabled}
                      glassStyles={{ width: '100%', backgroundColor: theme.black + '20', ...primaryButtonStyle }}
                      leftIcon={undefined}
                      iconStyle={{}}
                    // borderedGlassButton={true}
                    />

                    <Button
                      title={effectiveSecondaryButtonText}
                      onPress={handleSecondaryPress}

                      titleStyle={{ color: '#FFFFFF' }}
                      disabled={secondaryButtonDisabled}
                      glassStyles={{
                        width: '100%',

                        ...secondaryButtonStyle
                      }}
                      leftIcon={undefined}
                      iconStyle={{}}
                      borderedGlassButton={true}
                    />

                  </View>
                )}

                {/* Two buttons – horizontal (side by side) */}
                {effectiveSecondaryButtonText && !showVerticalButtons && (
                  <View style={[styles.buttonsContainer, styles.buttonsHorizontal]}>


                    <Button
                      title={effectiveSecondaryButtonText}
                      onPress={handleSecondaryPress}
                      titleStyle={{ color: '#FFFFFF' }}
                      disabled={secondaryButtonDisabled}
                      glassStyles={{ height: hp(5), flex: 1, backgroundColor: theme.white + '13', borderWidth: 0, ...secondaryButtonStyle }}
                      leftIcon={undefined}
                      iconStyle={{}}
                      borderedGlassButton={true}
                    />
                    <Button
                      title={effectivePrimaryButtonText}
                      onPress={handlePrimaryPress}

                      titleStyle={{ color: '#FFFFFF' }}
                      disabled={primaryButtonDisabled}
                      glassStyles={{ height: hp(5), flex: 1, backgroundColor: theme.black + '20', ...primaryButtonStyle }}
                      leftIcon={undefined}
                      iconStyle={{}}
                      borderedGlassButton={true}
                    />
                  </View>
                )}
              </>
            )}
          </GlassWrapper>
          {bottomAttachedBtn && <Button
            title={effectivePrimaryButtonText}
            onPress={handlePrimaryPress}
            buttonStyle={styles.bottomAttachedButton}
            disabled={primaryButtonDisabled}
            glassStyles={styles.bottomAttachedGlass}
            leftIcon={undefined}
            iconStyle={{}}
            titleStyle={{ fontSize: hp(1.8) }}
            borderedGlassButton={true}
          />}
        </View>

      </ImageBackground>
    </Modal>
  );
};

export default GlassModal;