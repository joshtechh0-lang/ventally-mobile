import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getKeyboardAwareScrollViewProps, getKeyboardAwareContentStyle } from '../../utils/keyboard';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation, useRoute } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import GlassView from '../../components/GlassWrapper';
import Button from '../../components/Button';
import { GlassModal } from '../../components';
import { tickIcon } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import { useAdmin } from '../../api/apiHooks/useAdmin';
import { AdminReport } from '../../types/apiPayloadsTypes';
import { toastError } from '../../utils/toast';
import { Loader } from '../../components/Loader';

const AdminTakeAction = () => {
    const { theme } = useTheme();
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const route = useRoute();
    const styles = getStyles(theme);
    const { report } = route.params as { report: AdminReport };

    const { adminSuspendUser, adminBulkDeleteUsers, updateReportStatus } = useAdmin();

    const [notes, setNotes] = useState('');
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    React.useEffect(() => {
        if (showSuccessModal) {
            const timer = setTimeout(() => {
                handleSuccessClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessModal]);

    const actions = [
        { id: 'warning', label: t('Admin.moderation.action.warning') },
        { id: 'tempSuspend', label: t('Admin.moderation.action.tempSuspend') },
        { id: 'deleteUser', label: t('Admin.moderation.action.deleteUser') },
        { id: 'noAction', label: t('Admin.moderation.action.noAction') },
    ];

    const handleCloseIssue = async () => {
        if (!selectedAction || !report) return;

        setIsSubmitting(true);
        try {
            // 1. Take action against the reported user if necessary
            if (selectedAction === 'tempSuspend') {
                await adminSuspendUser(report.reportedId, { suspended: true });
            } else if (selectedAction === 'deleteUser') {
                await adminBulkDeleteUsers({ userIds: [report.reportedId] });
            }
            // "warning" or "noAction" don't trigger extra backend user actions directly here

            // 2. Resolve the report issue with admin notes
            await updateReportStatus(report.id, {
                status: 'resolved',
                adminNotes: notes,
            });

            setShowSuccessModal(true);
        } catch (error: any) {
            console.error('Action Error:', error);
            toastError({ text: error?.message || t('Common.error') });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        (navigation as any).navigate(routes.adminReports);
    };

    return (
        <HomeWrapper>
            <ScreenHeader
                title={t('Admin.moderation.action.title')}
                onBackPress={() => navigation.goBack()}
            />
            <KeyboardAwareScrollView
                {...getKeyboardAwareScrollViewProps()}
                contentContainerStyle={[styles.container, getKeyboardAwareContentStyle()]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.description}> {t("Admin.moderation.action.description")}</Text>

                <Text style={styles.sectionLabel}>{t('Admin.moderation.action.adminNotes')}</Text>
                <GlassView bordered glassStyles={styles.notesContainer}>
                    <TextInput
                        style={styles.notesInput}
                        // placeholder={t('Admin.moderation.action.adminNotesPlaceholder')}
                        placeholderTextColor={theme.white60}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        textAlignVertical="top"
                    />
                </GlassView>

                <Text style={styles.sectionLabel}>{t('Admin.moderation.action.selectAction')}</Text>
                {actions.map((action) => (
                    <TouchableOpacity
                        key={action.id}
                        activeOpacity={0.7}
                        onPress={() => setSelectedAction(action.id)}
                    >
                        <GlassView

                            glassStyles={StyleSheet.flatten([
                                styles.actionButton,
                                selectedAction === action.id && styles.selectedAction
                            ])}
                        >
                            <Text style={styles.actionText}>{action.label}</Text>
                        </GlassView>
                    </TouchableOpacity>
                ))}
                <View style={{ flex: 1 }} />
                {/* <View style={styles.footer}> */}
                <Button
                    title={t('Admin.moderation.action.closeIssue')}
                    onPress={handleCloseIssue}
                    glassStyles={styles.closeButton}
                    buttonStyle={{}}
                    titleStyle={{}}
                    disabled={!selectedAction}
                />
                {/* </View> */}
            </KeyboardAwareScrollView>

            <GlassModal
                icon={tickIcon}
                iconBorder={false}
                visible={showSuccessModal}
                onClose={handleSuccessClose}
                title={t('Admin.success.issueClosed')}
                message={t('Admin.success.issueClosedMessage')}
                showButtons={false}
            />

            <Loader isVisible={isSubmitting} />
        </HomeWrapper>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        paddingHorizontal: wp(6),
        paddingTop: hp(2),
        paddingBottom: hp(10),
    },
    description: {
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.6),
        color: theme.white + "cc",
        marginBottom: hp(3),
    },
    sectionLabel: {
        fontFamily: fontFamilies.semiBold,
        fontSize: hp(1.8),
        color: theme.white,
        marginBottom: hp(1.5),
    },
    notesContainer: {
        // height: hp(6),
        borderRadius: hp(3),
        paddingHorizontal: wp(4),
        // paddingVertical: hp(1),nsbchsb
        marginBottom: hp(4),
        backgroundColor: theme.black + '05',
    },
    notesInput: {
        // flex: 1,
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.6),
        color: theme.white,
    },
    actionButton: {
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        alignItems: 'center',
        borderRadius: hp(5),
        marginBottom: hp(1.5),
        backgroundColor: theme.white + '05',
    },
    selectedAction: {
        backgroundColor: theme.white + '20',
        borderColor: theme.white + '66', // white40 fallback
    },
    actionText: {
        fontFamily: fontFamilies.medium,
        fontSize: hp(1.8),
        color: theme.white,
        alignSelf: "center"
    },
    footer: {
        marginTop: hp(4),
    },
    closeButton: {
        width: '100%',
    },
});

export default AdminTakeAction;
