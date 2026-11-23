import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation, useRoute } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import GlassView from '../../components/GlassWrapper';
import Button from '../../components/Button';

interface Permission {
    id: string;
    label: string;
    enabled: boolean;
}

const AdminSelectPermissions = () => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const route = useRoute();

    // Get initial permissions from route params if editing
    const initialPermissions = (route.params as any)?.permissions || [];

    const [permissions, setPermissions] = useState<Permission[]>([
        { id: 'view', label: t('Admin.permissions.view'), enabled: initialPermissions.includes('view') },
        { id: 'edit', label: t('Admin.permissions.edit'), enabled: initialPermissions.includes('edit') },
        { id: 'delete', label: t('Admin.permissions.delete'), enabled: initialPermissions.includes('delete') },
        { id: 'suspend', label: t('Admin.permissions.suspend'), enabled: initialPermissions.includes('suspend') },
        { id: 'accessAdminPanel', label: t('Admin.permissions.accessAdminPanel'), enabled: initialPermissions.includes('accessAdminPanel') },
    ]);

    const togglePermission = (id: string) => {
        setPermissions(prev =>
            prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
        );
    };

    const selectAll = () => {
        setPermissions(prev => prev.map(p => ({ ...p, enabled: true })));
    };

    const deselectAll = () => {
        setPermissions(prev => prev.map(p => ({ ...p, enabled: false })));
    };

    const handleSave = () => {
        const selectedPermissions = permissions.filter(p => p.enabled).map(p => p.id);

        // Pass selected permissions back to the previous screen
        if ((route.params as any)?.onSave) {
            (route.params as any).onSave(selectedPermissions);
        }

        navigation.goBack();
    };

    const allSelected = permissions.every(p => p.enabled);
    const noneSelected = permissions.every(p => !p.enabled);

    return (
        <HomeWrapper>
            <ScreenHeader
                title={t('Admin.permissions.title')}
                onBackPress={() => navigation.goBack()}
            />
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.toggleRow}>
                    <TouchableOpacity
                        style={[styles.toggleButton, allSelected && styles.toggleButtonActive]}
                        onPress={selectAll}
                        disabled={allSelected}
                    >
                        <Text style={[styles.toggleText, allSelected && styles.toggleTextActive]}>
                            {t('Admin.permissions.selectAll')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, noneSelected && styles.toggleButtonActive]}
                        onPress={deselectAll}
                        disabled={noneSelected}
                    >
                        <Text style={[styles.toggleText, noneSelected && styles.toggleTextActive]}>
                            {t('Admin.permissions.deselectAll')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {permissions.map((permission) => (
                    <GlassView key={permission.id} glassStyles={styles.permissionCard}>
                        <View style={styles.permissionRow}>
                            <Text style={styles.permissionLabel}>{permission.label}</Text>
                            <Switch
                                value={permission.enabled}
                                onValueChange={() => togglePermission(permission.id)}
                                trackColor={{ false: theme.white20, true: theme.magenda }}
                                thumbColor={permission.enabled ? theme.white : theme.white60}
                                ios_backgroundColor={theme.white20}
                            />
                        </View>
                    </GlassView>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title={t('Admin.permissions.save')}
                    onPress={handleSave}
                    glassStyles={styles.saveButton}
                    buttonStyle={{}}
                    titleStyle={{}}
                    disabled={noneSelected}
                />
            </View>
        </HomeWrapper>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        paddingHorizontal: wp(5),
        paddingBottom: hp(15),
    },
    toggleRow: {
        flexDirection: 'row',
        gap: wp(3),
        marginBottom: hp(3),
    },
    toggleButton: {
        flex: 1,
        paddingVertical: hp(1.2),
        borderRadius: hp(2),
        borderWidth: 1,
        borderColor: theme.white20,
        backgroundColor: 'transparent',
        alignItems: 'center',
    },
    toggleButtonActive: {
        backgroundColor: theme.white10,
        borderColor: theme.white40,
    },
    toggleText: {
        fontFamily: fontFamilies.medium,
        fontSize: hp(1.6),
        color: theme.white60,
    },
    toggleTextActive: {
        color: theme.white,
    },
    permissionCard: {
        padding: wp(4),
        borderRadius: hp(2),
        marginBottom: hp(1.5),
    },
    permissionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    permissionLabel: {
        fontFamily: fontFamilies.medium,
        fontSize: hp(1.8),
        color: theme.white,
    },
    footer: {
        paddingHorizontal: wp(5),
        paddingBottom: hp(3),
    },
    saveButton: {
        width: '100%',
    },
});

export default AdminSelectPermissions;
