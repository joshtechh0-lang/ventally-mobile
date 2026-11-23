import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { hp } from '../../utils/size';

interface PulsingDotProps {
    size?: number;
    color?: string;
    containerStyle?: any;
}

const PulsingDot: React.FC<PulsingDotProps> = ({
    size = hp(1),
    color = '#4ADE80', // Default green
    containerStyle
}) => {
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [pulseAnim]);

    const pulseScale = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2.5],
    });

    const pulseOpacity = pulseAnim.interpolate({
        inputRange: [0, 0.1, 1],
        outputRange: [0, 0.4, 0],
    });

    const styles = StyleSheet.create({
        container: {
            alignItems: 'center',
            justifyContent: 'center',
            width: size * 2.5,
            height: size * 2.5,
        },
        dot: {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            zIndex: 2,
        },
        pulse: {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            zIndex: 1,
        },
    });

    return (
        <View style={[styles.container, containerStyle]}>
            <Animated.View
                style={[
                    styles.pulse,
                    {
                        transform: [{ scale: pulseScale }],
                        opacity: pulseOpacity,
                    },
                ]}
            />
            <View style={styles.dot} />
        </View>
    );
};

export default PulsingDot;
