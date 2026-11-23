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

const AdminPermissionsUpdateSuccess = () => {
    const { theme } = useTheme();
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const route = useRoute();
    const { type }: any = route.params || {};

    const isRemoved = type === 'removed';
    const title = isRemoved ? t('Admin.rolesPermissions.success.adminRemoved') : t('Admin.rolesPermissions.success.roleUpdate');
    const subtitle = isRemoved ? t('Admin.rolesPermissions.success.adminRemovedSub') : t('Admin.rolesPermissions.success.roleUpdateSub');

    React.useEffect(() => {
        const timer = setTimeout(() => {
            handleBack();
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleBack = () => {
        (navigation as any).navigate(routes.adminInternal, { screen: routes.adminRolesPermissions });
    };

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
            backgroundColor: theme.black + '10',

        },
        iconContainer: {
            width: hp(8),
            height: hp(8),
            borderRadius: hp(4),
            backgroundColor: theme.white + '10',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: hp(3),
            alignSelf: 'center',
        },
        icon: {
            width: hp(4),
            height: hp(4),
            tintColor: theme.white,
            resizeMode: "contain",
            alignSelf: "center",
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
                    <GlassView style={styles.iconContainer}>
                        <Image source={tickIcon} style={styles.icon} resizeMode="contain" />
                    </GlassView>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </GlassView>


            </View>
        </HomeWrapper>
    );
};

export default AdminPermissionsUpdateSuccess;
