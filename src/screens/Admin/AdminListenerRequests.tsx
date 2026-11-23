import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import GlassView from '../../components/GlassWrapper';
import { routes } from '../../navigation/routes';
import { chatIcon, tickIcon } from '../../assets/icons';
import { Button, GlassModal } from '../../components';
import { useAdmin } from '../../api/apiHooks/useAdmin';
import { Loader } from '../../components/Loader';
import { ListenerVerificationSubmission } from '../../types/apiPayloadsTypes';
import { toastError, toastSuccess } from '../../utils/toast';

const AdminListenerRequests = () => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const { getListenerVerifications, reviewListenerVerification } = useAdmin();

    const [requests, setRequests] = useState<ListenerVerificationSubmission[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [isRejected, setIsRejected] = useState(false);

    useEffect(() => {
        if (isApproved || isRejected) {
            const timer = setTimeout(() => {
                setIsApproved(false);
                setIsRejected(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isApproved, isRejected]);

    const fetchRequests = async (isRefreshing = false) => {
        if (isRefreshing) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await getListenerVerifications(50, 0, 'pending');
            if (response?.success) {
                setRequests(response.submissions || []);
            }
        } catch (error: any) {
            console.error('Error fetching listener requests:', error);
            toastError({ text: error?.message || t('Common.error') });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleReview = async (id: string, status: 'verified' | 'rejected') => {
        setLoading(true);
        try {
            const response = await reviewListenerVerification(id, {
                status,
                adminNotes: status === 'verified' ? 'Approved from list' : 'Rejected from list'
            });

            if (response?.success) {
                // Remove from local list or refresh
                setRequests(prev => prev.filter(req => req.id !== id));
                if (status === 'verified') {
                    setIsApproved(true);
                } else {
                    setIsRejected(true);
                }
            }
        } catch (error: any) {
            console.error(`Error ${status} request:`, error);
            toastError({ text: error?.message || t('Common.error') });
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchRequests();
        }, [])
    );

    const onRefresh = () => {
        fetchRequests(true);
    };

    const renderRequestItem = ({ item }: { item: ListenerVerificationSubmission }) => (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate(routes.adminReviewRequest, { submission: item })}
        >
            <GlassView bordered glassStyles={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.userInfo}>
                        <GlassView glassStyles={{
                            padding: hp(.5),
                            borderRadius: 999
                        }}>
                            <Image source={chatIcon} style={styles.avatar} resizeMode="contain" />
                        </GlassView>
                        <View>
                            <Text style={styles.email}>{item.listener_email || t('Common.unknown')}</Text>
                            <Text style={styles.details}>
                                {item?.gender_identity || item?.lgbtq_identity || "N/A" + "    " + item?.age_group ? item?.age_group?.toString() : "N/A"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.buttonRow}>
                        <Button
                            title={t('Admin.listenerRequests.reject')}
                            onPress={() => handleReview(item.id, 'rejected')}
                            glassStyles={styles.rejectButton}
                            borderedGlassButton
                        />
                        <Button
                            title={t('Admin.listenerRequests.approve')}
                            onPress={() => handleReview(item.id, 'verified')}
                            glassStyles={styles.approveButton}
                            titleStyle={styles.approveText}
                        />
                    </View>
                </View>
            </GlassView>
        </TouchableOpacity>
    );

    return (
        <HomeWrapper>
            <ScreenHeader
                title={t('Admin.listenerRequests.title')}
                onBackPress={() => navigation.goBack()}
            />
            <FlatList
                data={requests}
                renderItem={renderRequestItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.white}
                    />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>{t('Admin.listenerRequests.noRequests')}</Text>
                        </View>
                    ) : null
                }
            />
            <Loader isVisible={loading} />

            <GlassModal
                icon={tickIcon}
                iconBorder={false}
                glassStyle={{
                    backgroundColor: theme.black + "20"
                }}
                visible={isApproved}
                onClose={() => setIsApproved(false)}
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
                onClose={() => setIsRejected(false)}
                title={t('Admin.review.reject')}
                message={t('Admin.review.rejectionDescription')}
                showButtons={false}
            />
        </HomeWrapper>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    listContainer: {
        paddingHorizontal: wp(5),
        paddingBottom: hp(10),
        flexGrow: 1,
    },
    card: {
        padding: wp(4),
        borderRadius: hp(2.5),
        marginBottom: hp(2),
        backgroundColor: theme.black + "10"
    },
    cardContent: {
        gap: hp(2),
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3),
    },
    avatar: {
        width: hp(5),
        height: hp(5),
        borderRadius: hp(2.5),
        backgroundColor: theme.white10,
    },
    email: {
        fontFamily: fontFamilies.medium,
        fontSize: hp(1.8),
        color: theme.white,
    },
    details: {
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.4),
        color: theme.white + "cc",
    },
    buttonRow: {
        flexDirection: 'row',
        gap: wp(3),
    },
    approveButton: {
        flex: 1,
    },
    rejectButton: {
        flex: 1,
    },
    approveText: {
        fontFamily: fontFamilies.medium,
        fontSize: hp(1.6),
        color: theme.white,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: hp(20),
    },
    emptyText: {
        fontFamily: fontFamilies.medium,
        fontSize: hp(1.8),
        color: theme.white60,
    },
});

export default AdminListenerRequests;
