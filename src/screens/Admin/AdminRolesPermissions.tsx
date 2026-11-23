import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { fontFamilies } from '../../utils/fontFamilies';
import { routes } from '../../navigation/routes';
import GlassView from '../../components/GlassWrapper';
import { Button, Input } from '../../components';
import { searchIcon } from '../../assets/icons';
import { useAdmin } from '../../api/apiHooks/useAdmin';
import { SubAdmin } from '../../types/apiPayloadsTypes';
import { Loader } from '../../components/Loader';

const AdminRolesPermissions = () => {
    const { theme } = useTheme();
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const { getSubAdmins, deleteSubAdmin, updateSubAdminPermissions } = useAdmin();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSubAdmins = useCallback(async (isRefreshing = false) => {
        try {
            if (isRefreshing) setRefreshing(true);
            else setLoading(true);

            const response = await getSubAdmins();
            setSubAdmins(response.subAdmins || []);
        } catch (error) {
            console.error('Error fetching sub-admins:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [getSubAdmins]);

    useFocusEffect(
        useCallback(() => {
            fetchSubAdmins();
        }, [fetchSubAdmins])
    );

    const filteredAdmins = subAdmins.filter(admin =>
        admin.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const renderItem = ({ item }: { item: SubAdmin }) => {
        const permissionsCount = item.permissions ? Object.values(item.permissions).filter(Boolean).length : 0;
        const subtext = `${permissionsCount} permissions enabled`;
        const role = item.activeRole === 'sub_admin' ? 'Sub Admin' : 'Admin';

        return (
            <TouchableOpacity
                style={styles.itemRow}
                onPress={() => (navigation as any).navigate(routes.adminInternal, { screen: routes.adminSubAdminProfile, params: { subAdmin: item } })}
            >
                <TouchableOpacity
                    style={[styles.checkbox, selectedIds.includes(item.id) && { backgroundColor: theme.magenda }]}
                    onPress={() => toggleSelection(item.id)}
                >
                    {selectedIds.includes(item.id) && <View style={styles.checkboxInner} />}
                </TouchableOpacity>

                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.email}</Text>
                    <Text style={styles.itemSubtext}>{subtext}</Text>
                </View>

                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{role}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
        },
        searchWrapper: {
            borderRadius: hp(3),
            paddingHorizontal: wp(4),
            height: hp(5.5),
            justifyContent: 'center',
            marginBottom: hp(3),
        },
        searchInputContainer: {
            borderBottomWidth: 0,
            height: hp(5),
        },
        searchInput: {
            paddingRight: wp(8),
            fontSize: hp(1.8),
            color: theme.white,
        },
        listContent: {
            paddingBottom: hp(12),
        },
        itemRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: hp(1.5),
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.1)',
        },
        checkbox: {
            width: hp(2.2),
            height: hp(2.2),
            borderRadius: 4,
            borderWidth: 1,
            borderColor: theme.white60,
            justifyContent: 'center',
            alignItems: 'center',
        },
        checkboxInner: {
            width: hp(1),
            height: hp(1),
            backgroundColor: theme.white,
            borderRadius: 2,
        },
        itemInfo: {
            flex: 1,
            marginLeft: wp(4),
        },
        itemName: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.8),
            color: theme.white,
        },
        itemSubtext: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.4),
            color: theme.white + "cc",
            marginTop: 2,
        },
        roleBadge: {
            backgroundColor: 'rgba(255,255,255,0.15)',
            paddingHorizontal: wp(3),
            paddingVertical: 4,
            borderRadius: hp(2),
        },
        roleText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.4),
            color: theme.white + 'cc', // white70 fallback
        },
        footer: {
            position: 'absolute',
            bottom: hp(0),
            left: wp(5),
            right: wp(5),
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: wp(3)
        },
        actionButton: {
            flex: 1
        },
        actionButtonText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.6),
            color: theme.white,
        }
    });

    const handleRemove = async () => {
        if (selectedIds.length === 0) return;

        try {
            setLoading(true);
            await Promise.all(selectedIds.map(id => deleteSubAdmin(id)));
            setSelectedIds([]);
            fetchSubAdmins();
            (navigation as any).navigate(routes.adminInternal, {
                screen: routes.adminPermissionsUpdateSuccess,
                params: { type: 'removed' }
            });
        } catch (error) {
            console.error('Error removing sub-admins:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeRole = () => {
        if (selectedIds.length === 0) return;

        let initialPermissions: string[] = [];
        if (selectedIds.length === 1) {
            const admin = subAdmins.find(a => a.id === selectedIds[0]);
            if (admin) {
                initialPermissions = Object.keys(admin.permissions).filter(k => admin.permissions[k as keyof typeof admin.permissions]);
            }
        }

        (navigation as any).navigate(routes.adminInternal, {
            screen: routes.adminSelectPermissions,
            params: {
                permissions: initialPermissions,
                onSave: async (selectedPermissions: string[]) => {
                    try {
                        setLoading(true);
                        const permissionsObj = {
                            view: selectedPermissions.includes('view'),
                            edit: selectedPermissions.includes('edit'),
                            delete: selectedPermissions.includes('delete'),
                            suspend: selectedPermissions.includes('suspend'),
                            accessAdminPanel: selectedPermissions.includes('accessAdminPanel'),
                        };

                        await Promise.all(selectedIds.map(id =>
                            updateSubAdminPermissions(id, { permissions: permissionsObj })
                        ));

                        setSelectedIds([]);
                        fetchSubAdmins();
                        (navigation as any).navigate(routes.adminInternal, {
                            screen: routes.adminPermissionsUpdateSuccess,
                            params: { type: 'updated' }
                        });
                    } catch (error) {
                        console.error('Error updating permissions:', error);
                    } finally {
                        setLoading(false);
                    }
                }
            }
        });
    };

    return (
        <HomeWrapper>
            <ScreenHeader
                title={t('Admin.rolesPermissions.title')}
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />
            <View style={styles.container}>
                <GlassView glassStyles={styles.searchWrapper}>
                    <Input
                        placeholderTextColor={theme.white60}
                        placeholder={t('Admin.users.searchPlaceholder')}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        containerStyle={styles.searchInputContainer}
                        inputStyle={styles.searchInput}
                        noTitle
                        rightIcon={searchIcon}
                        inputContainerStyle={{ borderBottomWidth: 0 }}
                    />
                </GlassView>

                <FlatList
                    data={filteredAdmins}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onRefresh={() => fetchSubAdmins(true)}
                    refreshing={refreshing}
                />

                <View style={styles.footer}>

                    <Button
                        title={t('Admin.rolesPermissions.remove')}
                        glassStyles={styles.actionButton}
                        onPress={handleRemove}
                        disabled={selectedIds.length === 0 || loading}
                    />
                    <Button
                        borderedGlassButton
                        title={t('Admin.rolesPermissions.changeRole')}
                        glassStyles={styles.actionButton}
                        onPress={handleChangeRole}
                        disabled={selectedIds.length === 0 || loading}
                    />
                </View>
            </View>
            <Loader isVisible={loading} />
        </HomeWrapper>
    );
};

export default AdminRolesPermissions;
