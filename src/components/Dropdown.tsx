import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  TouchableWithoutFeedback,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { alpha, hp, wp } from '../utils/size';
import { fontFamilies } from '../utils/fontFamilies';
import { useTheme } from '../theme';
import { chevronIcon } from '../assets/icons';
import { getGlassColors } from '../utils/glassColors';
import { GlassWrapper } from '.';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  title?: string;
  placeholder: string;
  options: DropdownOption[];
  value: string;
  onSelect: (value: string) => void;
  containerStyle?: ViewStyle;
  placeholderStyle?: TextStyle;
  selectedTextStyle?: TextStyle;
  optionContainerStyle?: ViewStyle;
  optionTextStyle?: TextStyle;
  iconStyle?: ImageStyle;
  maxHeight?: number;
  percentage?: number;
  titleStyle?: TextStyle;
  subContainerStyle?: ViewStyle
}

const Dropdown: React.FC<DropdownProps> = ({
  title,
  titleStyle,
  placeholder,
  options,
  value,
  onSelect,
  containerStyle,
  placeholderStyle,
  selectedTextStyle,
  optionContainerStyle,
  optionTextStyle,
  iconStyle,
  maxHeight = hp(25),
  percentage = 20,
  subContainerStyle
}) => {
  const { theme, isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownLeft, setDropdownLeft] = useState(0);
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const containerRef = useRef<View>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const glassColors = getGlassColors(theme, isDark);

  const styles = StyleSheet.create({
    wrapper: {
      width: '100%',
    },
    container: {
      width: '100%',
      height: hp(6),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // paddingHorizontal: wp(4),
      overflow: 'hidden', borderBottomWidth: 1,
      borderBottomColor: `${theme.white}${alpha(percentage)}`,

    },
    title: {
      fontSize: hp(1.6),
      fontFamily: fontFamilies.medium,
      color: theme.white,
    },

    text: {
      color: theme.white60,
      fontSize: hp(1.6),
      fontFamily: fontFamilies.normal,
      flex: 1,
      zIndex: 1,
    },
    chevron: {
      width: hp(1.6),
      height: hp(1.6),
      resizeMode: 'contain',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    optionsContainer: {
      position: 'absolute',
      borderRadius: hp(1.2),
      borderWidth: 1,
      marginTop: hp(2),
      overflow: 'hidden',

      borderColor: `${theme.white}${alpha(20)}`,
    },
    option: {
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(4),
      borderBottomWidth: 1,
      borderBottomColor: `${theme.white}${alpha(20)}`,
    },
    selectedOption: {
      // backgroundColor: glassColors.glassSelected,
    },
    optionText: {
      fontSize: hp(1.3),
      fontFamily: fontFamilies.normal,
      color: theme.white,
    },
  });

  const toggleDropdown = () => {
    if (!isExpanded && containerRef.current) {
      containerRef.current.measure((_x, _y, width, height, pageX, pageY) => {
        setDropdownTop(pageY + height);
        setDropdownLeft(pageX);
        setDropdownWidth(width);
        setIsExpanded(true);
      });
    } else {
      setIsExpanded(false);
    }
  };

  const renderOption = ({ item }: { item: DropdownOption }) => (
    <TouchableOpacity
      style={[
        styles.option,
        item.value === value && styles.selectedOption,
      ]}
      onPress={() => {
        onSelect(item.value);
        setIsExpanded(false);
      }}
      activeOpacity={0.7}
    >
      <Text style={[styles.optionText, optionTextStyle]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.wrapper, containerStyle]} ref={containerRef}>
      {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
      <TouchableOpacity
        style={[styles.container, subContainerStyle]}
        onPress={toggleDropdown}
        activeOpacity={0.8}
      >


        <Text
          style={[
            styles.text,
            { color: selectedOption ? theme.white : theme.white60 },
            selectedOption ? selectedTextStyle : placeholderStyle,
          ]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>

        <Image
          source={chevronIcon}
          style={[
            styles.chevron,
            { transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] },

            // iconStyle,
          ]}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Modal
        visible={isExpanded}
        transparent
        animationType="fade"
        onRequestClose={() => setIsExpanded(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsExpanded(false)}>
          <View style={styles.modalOverlay}>


            <View
              style={[
                styles.optionsContainer,
                {
                  top: dropdownTop - hp(3),
                  left: dropdownLeft,
                  width: dropdownWidth,
                  maxHeight: maxHeight,
                  backgroundColor: theme.black,
                },
                optionContainerStyle,
              ]}
            >
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={renderOption}
                showsVerticalScrollIndicator={false}
                bounces={false}
              />
            </View>

          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default Dropdown;
