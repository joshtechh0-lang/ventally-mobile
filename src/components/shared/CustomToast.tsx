import React, { useState, useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    View,
    Dimensions,
    Platform,
    Keyboard,
} from 'react-native';
import { ToastService, ToastOptions } from '../../utils/ToastService';
import { useTheme } from '../../theme';
import { fontFamilies } from '../../utils/fontFamilies';
import { hp, wp } from '../../utils/size';
import GlassView from '../GlassWrapper';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

const CustomToast = () => {
    const { theme } = useTheme();
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'success' | 'error' | 'info'>('info');
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const subscription = ToastService.subscribe((options: ToastOptions) => {
            setMessage(options.message);
            setType(options.type || 'info');
            show(options.duration || 3000);
        });

        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const kbdShowSub = Keyboard.addListener(showEvent, (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const kbdHideSub = Keyboard.addListener(hideEvent, () => {
            setKeyboardHeight(0);
        });

        return () => {
            subscription.remove();
            kbdShowSub.remove();
            kbdHideSub.remove();
        };
    }, []);

    const show = (duration: number) => {
        setVisible(true);
        Animated.sequence([
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.delay(duration),
            Animated.timing(animatedValue, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setVisible(false);
        });
    };

    if (!visible) return null;

    const translateY = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [hp(10), 0],
    });

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return '#C2AEBF'; // Matching user's existing success toast color
            case 'error':
                return '#C89AA1'; // Matching user's existing error toast color
            default:
                return 'rgba(255, 255, 255, 0.1)';
        }
    };

    return (
        <View style={[styles.container, { bottom: hp(5) + keyboardHeight }]} pointerEvents="none">
            <Animated.View
                style={[
                    styles.toastWrapper,
                    {
                        transform: [{ translateY }],
                        opacity,
                    },
                ]}
            >
                <GlassView
                    bordered
                    style={StyleSheet.flatten([
                        styles.toastContent,
                        { backgroundColor: getBackgroundColor() },
                    ])}
                >
                    <Text numberOfLines={2} style={[styles.text, { color: theme.white }]}>
                        {message}
                    </Text>
                </GlassView>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: hp(5),
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
    },
    toastWrapper: {
        width: 'auto',
        maxWidth: "90%",
    },
    toastContent: {
        paddingVertical: hp(.5),
        paddingHorizontal: wp(5),
        borderRadius: hp(1.5),
        alignItems: 'center',
        justifyContent: 'center',
        // minHeight: hp(4),
    },
    text: {
        fontFamily: fontFamilies.medium,
        fontSize: hp(1.6),
        // lineHeight: hp(2.5),
        textAlign: 'center',
        marginBottom: hp(.45),
    },
});

export default CustomToast;
