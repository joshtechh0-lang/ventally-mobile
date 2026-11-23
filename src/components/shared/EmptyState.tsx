import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType, ViewStyle } from 'react-native';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import { fontFamilies } from '../../utils/fontFamilies';
import { emptyIcon } from '../../assets/icons';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: any;
    iconStyle?: any;
    containerStyle?: ViewStyle;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon = emptyIcon,
    iconStyle,
    containerStyle
}) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: wp(10),
            // marginTop: hp(10), // Removed margin to be more flexible, let parent handle layout or use containerStyle
        },
        emptyIcon: {
            width: hp(4),
            height: hp(4),
            tintColor: theme.white,
            marginBottom: hp(1),
        },
        emptyTitle: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(2.2),
            color: theme.white,
            marginBottom: hp(1),
            textAlign: 'center',
        },
        emptySubtitle: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + "90",
            textAlign: 'center',
            lineHeight: hp(2.4),
        },
    });

    return (
        <View style={[styles.emptyContainer, containerStyle]}>
            <Image
                source={icon}
                style={[styles.emptyIcon, iconStyle]}
                resizeMode="contain"
            />
            {/* <Text style={styles.emptyTitle}>{title}</Text> */}
            <Text style={styles.emptySubtitle}>{description}</Text>
        </View>
    );
};

export default EmptyState;
