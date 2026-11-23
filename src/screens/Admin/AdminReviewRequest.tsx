import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation, useRoute } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import GlassView from '../../components/GlassWrapper';
import { chatIcon, pdfIcon, tickIcon } from '../../assets/icons';
import Button from '../../components/Button';
import { GlassModal } from '../../components';
import { useAdmin } from '../../api/apiHooks/useAdmin';
import { Loader } from '../../components/Loader';
import { toastError, toastSuccess } from '../../utils/toast';
import { ListenerVerificationSubmission } from '../../types/apiPayloadsTypes';

const AdminReviewRequest = () => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const route = useRoute();
    const { submission: initialSubmission } = route.params as { submission: ListenerVerificationSubmission };
    const { reviewListenerVerification, getListenerVerificationDetail } = useAdmin();

    const [submission, setSubmission] = useState<ListenerVerificationSubmission>(initialSubmission);
    const [loading, setLoading] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [isRejected, setIsRejected] = useState(false);

    React.useEffect(() => {
        if (isApproved || isRejected) {
            const timer = setTimeout(() => {
                setIsApproved(false);
                setIsRejected(false);
                navigation.goBack();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isApproved, isRejected]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await getListenerVerificationDetail(initialSubmission.id);
            if (response?.success) {
                setSubmission(response.submission);
            }
        } catch (error: any) {
            console.error('Error fetching submission detail:', error);
            // Optionally toast error, but we have the initial data from params as fallback
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchDetail();
    }, []);

    // Filter out internal metadata/empty values for display
    const listenerInfo = [
        { label: t('EditProfile.gender'), value: 'N/A' }, // Gender not in verification object directly, usually in user profile
        { label: t('Admin.subAdminProfile.email'), value: submission.listener_email || 'N/A' },
        { label: t('Common.createdAt'), value: submission.created_at ? new Date(submission.created_at).toLocaleDateString() : 'N/A' },
    ];

    const handleReview = async (status: 'verified' | 'rejected') => {
        setLoading(true);
        try {
            const response = await reviewListenerVerification(submission.id, {
                status,
                adminNotes: status === 'verified' ? 'Approved by admin' : 'Rejected by admin'
            });

            if (response?.success) {
                if (status === 'verified') {
                    setIsApproved(true);
                } else {
                    setIsRejected(true);
                }
            }
        } catch (error: any) {
            console.error(`Error ${status} verification:`, error);
            toastError({ text: error?.message || t('Common.error') });
        } finally {
            setLoading(false);
        }
    };

    const handleDocPress = (url?: string) => {
        if (url) {
            Linking.openURL(url).catch(err => {
                console.error("Couldn't load page", err);
                toastError({ text: t('Common.error') });
            });
        }
    };

    return (
        <HomeWrapper>
            <ScreenHeader
                title={t('Admin.review.title')}
                onBackPress={() => navigation.goBack()}
            />
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.headerInfo}>
                    <GlassView glassStyles={{
                        padding: hp(.5),
                        borderRadius: 999
                    }}>
                        <Image source={chatIcon} style={styles.avatar} resizeMode="contain" />
                    </GlassView>
                    <View>
                        <Text style={styles.email}>{submission.listener_email}</Text>
                        <Text style={styles.subtitle}>
                            {submission?.gender_identity || submission?.lgbtq_identity || "N/A" + "    " + submission?.age_group ? submission?.age_group?.toString() : "N/A"}
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>{t('Admin.userDetail.listenerInfo')}</Text>
                <View style={styles.infoGrid}>
                    {listenerInfo.map((info, index) => (
                        <View key={index} style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{info.label}</Text>
                            <Text style={styles.infoValue}>{info.value}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>{t('Admin.review.verificationDocs')}</Text>
                {submission.document_url || submission.file_url ? (
                    <TouchableOpacity onPress={() => handleDocPress(submission.document_url || submission.file_url)}>
                        <GlassView glassStyles={styles.docCard}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(3) }}>
                                <Image source={pdfIcon} style={styles.pdfIcon} />
                                <View>
                                    <Text style={styles.docName}>{submission.original_file_name || 'Verification Document'}</Text>
                                    <Text style={styles.docSize}>{submission.file_size_bytes ? `${Math.round(submission.file_size_bytes / 1024)} KB` : ''}</Text>
                                </View>
                            </View>
                        </GlassView>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.infoLabel}>{t('Common.noData')}</Text>
                )}
            </ScrollView>

            <View style={styles.bottomButtons}>
                <Button
                    title={t('Admin.listenerRequests.reject')}
                    onPress={() => handleReview('rejected')}
                    glassStyles={styles.rejectButton}
                    borderedGlassButton
                />
                <Button
                    title={t('Admin.listenerRequests.approve')}
                    glassStyles={styles.approveButton}
                    onPress={() => handleReview('verified')}
                />
            </View>

            <GlassModal
                icon={tickIcon}
                iconBorder={false}
                glassStyle={{
                    backgroundColor: theme.black + "20"
                }}
                visible={isApproved}
                onClose={() => {
                    setIsApproved(false);
                    navigation.goBack();
                }}
                title={t('Admin.review.approved')}
                message={t('Admin.review.approvedMessage')}
                showButtons={false}

            />

            <GlassModal
                icon={tickIcon}
                iconBorder={false}
                glassStyle={{
                    backgroundColor: theme.black + "20"
                }}
                visible={isRejected}
                onClose={() => {
                    setIsRejected(false);
                    navigation.goBack();
                }}
                title={t('Admin.review.reject')}
                message={t('Admin.review.rejectionDescription')}
                showButtons={false}
            />

            <Loader isVisible={loading} />
        </HomeWrapper>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        paddingHorizontal: wp(5),
        paddingBottom: hp(15),
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(4),
        marginBottom: hp(4),
    },
    avatar: {
        width: hp(6),
        height: hp(6),
        borderRadius: hp(3),
        backgroundColor: theme.white10,
    },
    email: {
        fontFamily: fontFamilies.semiBold,
        fontSize: hp(2),
        color: theme.white,
    },
    subtitle: {
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.6),
        color: theme.white60,
    },
    sectionTitle: {
        fontFamily: fontFamilies.bold,
        fontSize: hp(2),
        color: theme.white,
        marginBottom: hp(2),
        marginTop: hp(1),
    },
    infoGrid: {
        marginBottom: hp(4),
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: hp(1),
    },
    infoLabel: {
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.6),
        color: theme.white,
    },
    infoValue: {
        fontFamily: fontFamilies.medium,
        fontSize: hp(1.6),
        color: theme.white + "cc",
    },
    docCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(4),
        borderRadius: hp(1.5),
        marginBottom: hp(1.5),
    },
    docName: {
        fontFamily: fontFamilies.medium,
        fontSize: hp(1.6),
        color: theme.white,
    },
    docSize: {
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.4),
        color: theme.white60,
    },
    bottomButtons: {
        flexDirection: 'row',
        gap: wp(3),
        marginBottom: hp(4),
        paddingHorizontal: wp(5),
    },
    approveButton: {
        flex: 1,
    },
    rejectButton: {
        flex: 1,
    },
    pdfIcon: {
        width: hp(4),
        height: hp(4),
        borderRadius: hp(0.8),
    }
});

export default AdminReviewRequest;
