import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation, useRoute } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import GlassView from '../../components/GlassWrapper';
import Button from '../../components/Button';
import { useAdmin } from '../../api/apiHooks/useAdmin';
import { Loader } from '../../components/Loader';
import { toastError, toastSuccess } from '../../utils/toast';
import { routes } from '../../navigation/routes';
import { SubAdmin } from '../../types/apiPayloadsTypes';

const AdminSubAdminProfile = () => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const route = useRoute();
    const { subAdmin } = route.params as { subAdmin: SubAdmin };
    const { getSubAdminDetail, updateSubAdminPermissions } = useAdmin();

    const [subAdminData, setSubAdminData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const response = await getSubAdminDetail(subAdmin.id);
                if (response?.subAdmin) {
                    setSubAdminData(response.subAdmin);
                }
            } catch (error: any) {
                console.error('Error fetching sub-admin detail:', error);
                toastError({ text: error?.message || t('Common.error') });
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [subAdmin.id]);

    const togglePermission = (key: string) => {
        if (!subAdminData) return;
        setSubAdminData((prev: any) => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [key]: !prev.permissions[key as keyof typeof prev.permissions]
            }
        }));
    };

    const handleUpdate = async () => {
        if (!subAdminData) return;
        setLoading(true);
        try {
            await updateSubAdminPermissions(subAdmin.id, {
                permissions: subAdminData.permissions
            });
            toastSuccess({ text: t('Admin.success.permissionsUpdated') || 'Permissions updated successfully' });
            navigation.goBack();
        } catch (error: any) {
            console.error('Error updating permissions:', error);
            toastError({ text: error?.message || t('Common.error') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <HomeWrapper>
            <ScreenHeader
                title={t('Admin.rolesPermissions.profile.title')}
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <GlassView bordered glassStyles={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <Text style={styles.emailText}>{subAdminData?.email || subAdmin.email}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: (subAdminData?.status || subAdmin.status) === 'active' ? theme.primary + '40' : (subAdminData?.status || subAdmin.status) === 'suspended' ? theme.magenda + '40' : theme.white20 }]}>
                            <Text style={styles.statusText}>{t(`Admin.status.${subAdminData?.status || subAdmin.status}`)}</Text>
                        </View>
                    </View>
                    <Text style={styles.infoText}>ID: {subAdminData?.id || subAdmin.id}</Text>
                    <Text style={styles.infoText}>{t('Admin.users.card.role')}: {subAdminData?.userType || subAdmin.userType}</Text>
                </GlassView>

                {subAdminData?.permissions && (
                    <GlassView bordered glassStyles={styles.permissionsCard}>
                        <Text style={styles.sectionTitle}>{t('Admin.rolesPermissions.profile.permissions')}</Text>

                        {Object.entries(subAdminData.permissions).map(([key, value]) => (
                            <View key={key} style={styles.permissionRow}>
                                <Text style={styles.permissionText}>
                                    {t(`Admin.permissions.${key}`)}
                                </Text>
                                <Switch
                                    value={value as boolean}
                                    onValueChange={() => togglePermission(key)}
                                    trackColor={{ false: theme.white20, true: theme.primary }}
                                    thumbColor={theme.white}
                                    ios_backgroundColor={theme.white20}
                                />
                            </View>
                        ))}
                    </GlassView>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title={t('Admin.rolesPermissions.update')}
                    onPress={handleUpdate}
                    buttonStyle={{}}
                    titleStyle={{}}
                    disabled={false}
                    glassStyles={styles.updateButton}
                />
            </View>
            <Loader isVisible={loading} />
        </HomeWrapper>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        paddingHorizontal: wp(5),
        paddingBottom: hp(15),
    },
    profileCard: {
        padding: wp(6),
        borderRadius: hp(2.5),
        marginBottom: hp(3),
    },
    emailText: {
        fontFamily: fontFamilies.bold,
        fontSize: hp(2.2),
        color: theme.white,
        flex: 1,
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(0.5),
    },
    statusBadge: {
        backgroundColor: theme.white + '20',
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.4),
        borderRadius: hp(2),
    },
    statusText: {
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.2),
        color: theme.white,
    },
    infoText: {
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.8),
        color: theme.white + 'cc',
        marginBottom: hp(0.5),
    },
    permissionsCard: {
        padding: wp(6),
        borderRadius: hp(4),
        marginBottom: hp(3),
    },
    sectionTitle: {
        fontFamily: fontFamilies.medium,
        fontSize: hp(2.2),
        color: theme.white,
        textAlign: 'center',
        marginBottom: hp(3),
    },
    permissionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(3),
    },
    permissionText: {
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.8),
        color: theme.white,
    },
    footer: {
        paddingHorizontal: wp(5),
        paddingBottom: hp(5),
    },
    updateButton: {
        width: '100%',
    },
});

export default AdminSubAdminProfile;
