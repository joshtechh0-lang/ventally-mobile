import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { fontFamilies } from '../../utils/fontFamilies';
import { hp, wp } from '../../utils/size';
import { chevronIcon } from '../../assets/icons';

export interface SettingsItemProps {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    type?: 'link' | 'toggle' | 'info';
    value?: string | boolean;
    onValueChange?: (value: boolean) => void;
    showChevron?: boolean;
    leftIcon?: any;
    style?: ViewStyle;
    titleStyle?: any;
    rightComponent?: any;
    leftIconStyle?: any;
    disabled?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
    title,
    subtitle,
    onPress,
    type = 'link',
    value,
    onValueChange,
    showChevron = true,
    leftIcon,
    style,
    titleStyle,
    rightComponent,
    leftIconStyle,
    disabled
}) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: hp(1.5),
            // borderBottomWidth: 1,
            // borderBottomColor: theme.white + '10', // Optional separator
        },
        content: {
            flex: 1,
            marginLeft: leftIcon ? wp(3) : 0,
        },
        title: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.8),
            color: theme.white,
            marginBottom: subtitle ? hp(0.5) : 0,
        },
        subtitle: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.4),
            color: theme.white60,
        },
        value: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.6),
            color: theme.white60,
            marginRight: wp(2),
        },
        chevron: {
            width: hp(2),
            height: hp(2),
            tintColor: theme.white60,
        },
        icon: {
            width: hp(2.5),
            height: hp(2.5),
            tintColor: theme.white,
        },
    });

    const renderRightContent = () => {
        switch (type) {
            case 'toggle':
                return (
                    <Switch
                        value={value as boolean}
                        onValueChange={onValueChange}
                        trackColor={{ false: theme.white + '20', true: theme.magenda }}
                        thumbColor={theme.white}
                        ios_backgroundColor={theme.white + '20'}
                    />
                );
            case 'info':
                return null;
            case 'link':
            default:
                return (
                    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {typeof value === 'string' && <Text style={styles.value}>{value}</Text>}
                        {showChevron ? (
                            <Image source={chevronIcon} style={[styles.chevron, { transform: [{ rotate: '-90deg' }] }]} resizeMode="contain" />
                        ) : null}
                    </Pressable>
                );
        }
    };

    const Component = type === 'toggle' ? View : TouchableOpacity;

    return (
        <Component
            style={[styles.container, style, disabled && { opacity: 0.5 }]}
            onPress={type !== 'toggle' ? onPress : undefined}
            activeOpacity={0.7}
            disabled={disabled || type === 'toggle'}
        >
            {leftIcon && <Image source={leftIcon} style={[styles.icon, leftIconStyle]} resizeMode="contain" />}

            <View style={styles.content}>
                <Text style={[styles.title, titleStyle]}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>

            {rightComponent || renderRightContent()}
        </Component>
    );
};

export default SettingsItem;
