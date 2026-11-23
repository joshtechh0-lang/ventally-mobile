import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { hp, wp } from '../utils/size';
import { fontFamilies } from '../utils/fontFamilies';
import { useTheme } from '../theme';
import { tickIcon } from '../assets/icons';

interface CheckboxProps {
    label?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    containerStyle?: any;
    labelStyle?: any;
    error?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
    label,
    checked,
    onChange,
    containerStyle,
    labelStyle,
    error,
}) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.container, containerStyle]}
            onPress={() => onChange(!checked)}
            activeOpacity={0.7}
        >
            <View
                style={[
                    styles.checkbox,
                    {
                        borderColor: error ? '#FF5252' : theme.white + '60',
                        backgroundColor: checked ? theme.white : 'transparent',
                    },
                ]}
            >
                {checked && (
                    <Image
                        source={tickIcon}
                        style={[styles.tick, { tintColor: '#000' }]}
                    />
                )}
            </View>
            {label && (
                <Text style={[styles.label, { color: theme.white }, labelStyle]}>
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: hp(1),
    },
    checkbox: {
        width: hp(2.4),
        height: hp(2.4),
        borderRadius: hp(0.5),
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
    },
    tick: {
        width: hp(1.4),
        height: hp(1.4),
        resizeMode: 'contain',
    },
    label: {
        flex: 1,
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.6),
        lineHeight: hp(2.2),
    },
});

export default Checkbox;
