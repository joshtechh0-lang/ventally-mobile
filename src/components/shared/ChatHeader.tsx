import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { backIcon, moreIcon } from '../../assets/icons';
import GlassView from '../GlassWrapper';
import Button from '../Button';

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  // Crisis button props
  showCrisisButton?: boolean;
  crisisButtonText?: string;
  onCrisisPress?: () => void;
  // Options menu props
  showOptionsMenu?: boolean;
  onOptionsPress?: () => void;
  onReportPress?: () => void;
  onEndChatPress?: () => void;
  // Custom right component (takes precedence over crisis/options)
  rightComponent?: React.ReactNode;
  containerStyle?: any;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  showBackButton = true,
  showCrisisButton = false,
  crisisButtonText,
  onCrisisPress,
  showOptionsMenu = false,
  onOptionsPress,
  onReportPress,
  onEndChatPress,
  rightComponent,
  containerStyle,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const crisisLabel = crisisButtonText ?? t('ChatHeader.crisis');
  const [optionsMenuVisible, setOptionsMenuVisible] = useState(false);

  const handleOptionsButtonPress = () => {
    setOptionsMenuVisible(prev => !prev);
    onOptionsPress?.();
  };

  const handleCloseMenu = () => setOptionsMenuVisible(false);
  const handleReport = () => {
    handleCloseMenu();
    onReportPress?.();
  };
  const handleEndChat = () => {
    handleCloseMenu();
    onEndChatPress?.();
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: hp(2),
      paddingHorizontal: wp(5),
    },
    headerRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: hp(1),
    },
    leftSection: {
      flex: 1,

      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(4),
      // minWidth: hp(4),
    },
    backButton: {
      width: hp(4),
      height: hp(4),

      justifyContent: 'center',
      alignItems: 'center',
    },
    backIcon: {
      width: hp(2),
      height: hp(2),
      tintColor: theme.white,
      resizeMode: 'contain',
      alignSelf: 'center',
    },
    titleContainer: {
      alignItems: 'center',
      // paddingHorizontal: wp(2),
    },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      lineHeight: hp(2.8),
    },
    subtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white + '80',
      textAlign: 'center',
      marginTop: hp(0.3),
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
      minWidth: hp(4),
    },
    crisisButton: {
      width: "auto",
      borderRadius: hp(7),
      backgroundColor: theme.red,
      justifyContent: 'center',
      alignItems: 'center',
    },
    crisisButtonText: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.3),
      color: theme.white,
    },
    optionsButton: {
      width: hp(4),
      height: hp(4),
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionsIcon: {
      width: hp(2),
      height: hp(2),
      tintColor: theme.white,
      resizeMode: 'contain',
      transform: [{ rotate: '90deg' }]
    },
    optionsDots: {
      flexDirection: 'column',
      gap: hp(0.2),
    },
    dot: {
      width: hp(0.4),
      height: hp(0.4),
      borderRadius: hp(0.2),
      backgroundColor: theme.white,
    },
    // Options popup menu
    overlay: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    popupAnchor: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? hp(10) : hp(6),
      // backgroundColor: 'red',
      right: wp(5),
      alignItems: 'flex-end',
      minWidth: wp(40),
    },
    popupArrow: {
      width: 0,
      height: 0,
      left: "75%",
      borderLeftWidth: hp(0.8),
      borderRightWidth: hp(0.8),
      borderTopWidth: hp(0.8),
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: theme.white + "40",
      // marginRight: wp(4),
    },
    popup: {
      backgroundColor: theme.optionsBg,
      borderRadius: hp(1.5),
      paddingVertical: hp(0.5),
      minWidth: wp(35),
      marginTop: hp(1)

    },
    popupOption: {
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(4),
    },
    popupOptionText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
    },
    popupDivider: {
      height: 1,
      backgroundColor: theme.white + '30',
      marginHorizontal: wp(2),
    },
  });

  const renderRightSection = () => {
    if (rightComponent) {
      return rightComponent;
    }

    const elements: React.ReactNode[] = [];

    if (showCrisisButton) {
      elements.push(
        <Button
          title={crisisLabel}
          onPress={onCrisisPress || (() => { })}
          buttonStyle={styles.crisisButton}
          titleStyle={{}}
          disabled={false}
          glassStyles={styles.crisisButton}
          leftIcon={undefined}
          iconStyle={{}}
          borderedGlassButton={true}
        />
      );
    }

    if (showOptionsMenu) {
      elements.push(
        <TouchableOpacity
          key="options"
          style={styles.optionsButton}
          onPress={handleOptionsButtonPress}
          activeOpacity={0.8}
        >
          <Image source={moreIcon} style={styles.optionsIcon} />
        </TouchableOpacity>
      );
    }

    return elements.length > 0 ? <>{elements}</> : null;
  };

  return (
    <>
      <View style={[styles.container, containerStyle]}>
        <View style={styles.headerRow}>
          <View style={styles.leftSection}>
            {showBackButton && (
              <GlassView opacity={0.03}>
                <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
                  <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>
              </GlassView>
            )}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>

          <View style={styles.rightSection}>{renderRightSection()}</View>
        </View>
      </View>

      {showOptionsMenu && (
        <Modal
          visible={optionsMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={handleCloseMenu}
        >
          <Pressable style={styles.overlay} onPress={handleCloseMenu}>
            <TouchableOpacity
              style={styles.popupAnchor}
              activeOpacity={1}
              onPress={() => { }}
            >
              <View style={{}}>
                {/* <View style={styles.popupArrow} /> */}
                <View style={styles.popup}>
                  <TouchableOpacity
                    style={styles.popupOption}
                    onPress={handleReport}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.popupOptionText}>{t('ChatHeader.report')}</Text>
                  </TouchableOpacity>
                  <View style={styles.popupDivider} />
                  <TouchableOpacity
                    style={styles.popupOption}
                    onPress={handleEndChat}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.popupOptionText}>{t('ChatHeader.endChat')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Pressable>
        </Modal>
      )}
    </>
  );
};

export default ChatHeader;
