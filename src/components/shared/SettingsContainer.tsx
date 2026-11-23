import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable } from 'react-native';
import GlassWrapper from '../GlassWrapper';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import Button from '../Button';
import { logout } from '../../store/slices/userSlice';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { routes } from '../../navigation/routes';

interface SettingsContainerProps {
    children: ReactNode;
    style?: ViewStyle;
    glassStyle?: ViewStyle;
}

const SettingsContainer: React.FC<SettingsContainerProps> = ({
    children,
    style,
    glassStyle,
}) => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const styles = StyleSheet.create({
        container: {
            width: '100%',
            marginBottom: hp(2),
        },
        glass: {
            paddingHorizontal: wp(4),
            paddingVertical: hp(1),
            borderRadius: hp(2),
            width: '100%',
            backgroundColor: theme.black + '20', // Slightly darker background for the container
            borderWidth: 1,
            borderColor: theme.white + '15',
        },
        separator: {
            height: 1,
            backgroundColor: theme.white + '20',
            width: '100%',
        },
    });

    // Add separators between children
    const childrenArray = React.Children.toArray(children);
    const childrenWithSeparators = childrenArray.map((child, index) => (
        <React.Fragment key={index}>
            {child}
            {index < childrenArray.length - 1 && <View style={styles.separator} />}
        </React.Fragment>
    ));

    return (
            <View style={[styles.container, style] as any}>
            <GlassWrapper
                bordered={true}
          // @ts-ignore
                glassStyles={[styles.glass, glassStyle]}
            >
                {childrenWithSeparators}

            </GlassWrapper>

        </View>
    );
};

export default SettingsContainer;
