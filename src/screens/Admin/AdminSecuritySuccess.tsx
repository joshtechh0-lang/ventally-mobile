import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation, useRoute } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { Button } from '../../components';
import { fontFamilies } from '../../utils/fontFamilies';
import { routes } from '../../navigation/routes';
import GlassView from '../../components/GlassWrapper';
import { tickIcon } from '../../assets/icons';

const AdminSecuritySuccess = () => {
    const { theme } = useTheme();
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const route = useRoute();
    const { title, subtitle }: any = route.params || {};

    const handleBackToSettings = () => {
        (navigation as any).navigate(routes.adminInternal, { screen: routes.adminSettings });
    };

    React.useEffect(() => {
        const timer = setTimeout(() => {
            handleBackToSettings();
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: wp(10),
        },
        successCard: {
            width: '100%',
            paddingVertical: hp(5),
            paddingHorizontal: wp(8),
            borderRadius: hp(3),
            alignItems: 'center',
            backgroundColor: theme.black + '40',
        },
        iconContainer: {
            width: hp(8),
            height: hp(8),
            borderRadius: hp(4),
            backgroundColor: theme.white + '10',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: hp(3),
            borderWidth: 1,
            borderColor: theme.white + '20',
        },
        icon: {
            width: hp(4),
            height: hp(4),
            tintColor: theme.white,
        },
        title: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(2.5),
            color: theme.white,
            marginBottom: hp(1),
            textAlign: 'center',
        },
        subtitle: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white60,
            textAlign: 'center',
            lineHeight: hp(2.2),
        },
        footer: {
            position: 'absolute',
            bottom: hp(5),
            width: wp(90),
        }
    });

    return (
        <HomeWrapper>
            <View style={styles.container}>
                <GlassView bordered glassStyles={styles.successCard}>
                    <View style={styles.iconContainer}>
                        <Image source={tickIcon} style={styles.icon} resizeMode="contain" />
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </GlassView>

                <View style={styles.footer}>
                    <Button
                        title={t('Common.done') || "Done"}
                        onPress={handleBackToSettings}
                        buttonStyle={{}}
                        titleStyle={{}}
                        disabled={false}
                        glassStyles={{}}
                    />
                </View>
            </View>
        </HomeWrapper>
    );
};

export default AdminSecuritySuccess;
