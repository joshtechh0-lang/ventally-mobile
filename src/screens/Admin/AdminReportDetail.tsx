import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation, useRoute } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import GlassView from '../../components/GlassWrapper';
import Button from '../../components/Button';
import { routes } from '../../navigation/routes';
import { useAdmin } from '../../api/apiHooks/useAdmin';
import { AdminReport } from '../../types/apiPayloadsTypes';
import { Loader } from '../../components/Loader';
import { toastError } from '../../utils/toast';
import { useState, useEffect } from 'react';

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const AdminReportDetail = () => {
    const { theme } = useTheme();
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const route = useRoute();
    const styles = getStyles(theme);
    const { getReportDetails } = useAdmin();

    const { report: initialReport } = route.params as { report: AdminReport };
    const [report, setReport] = useState<AdminReport>(initialReport);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchReportDetail = async () => {
            setLoading(true);
            try {
                const response = await getReportDetails(initialReport.id);
                if (response?.report) {
                    console?.log('---_-__-_--_-___---__>', response?.report)
                    setReport(response.report);
                }
            } catch (error: any) {
                console.error('Error fetching report detail:', error);
                toastError({ text: error?.message || t('Common.error') });
            } finally {
                setLoading(false);
            }
        };

        fetchReportDetail();
    }, [initialReport.id]);

    const metadata = [
        { label: t('Admin.moderation.reportDetail.reportedBy'), value: report.reporter_email || 'N/A' },
        { label: t('Admin.moderation.reportDetail.reportedTo'), value: report.reported_email || 'N/A' },
        { label: t('Admin.moderation.reportDetail.issue'), value: report.reason || 'N/A' },
        { label: t('Admin.moderation.reportDetail.date'), value: formatDate(report.created_at) },
        { label: t('Admin.moderation.reportDetail.service'), value: report.sessionType || 'N/A' },

    ];

    return (
        <HomeWrapper>
            <ScreenHeader
                title={t('Admin.moderation.reportDetail.title')}
                onBackPress={() => navigation.goBack()}
            />
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('Admin.moderation.reportDetail.title')}</Text>
                </View>

                {metadata.map((item, index) => (
                    <View key={index} style={styles.infoRow}>
                        <Text style={styles.label}>{item.label} : </Text>
                        <Text style={styles.value}>{item.value}</Text>
                    </View>
                ))}
                <View style={[styles.infoCol]}>
                    <Text style={styles.label}>{t('Admin.moderation.reportDetail.description')} :</Text>
                    <Text style={[styles.value, { marginTop: hp(2), width: '100%' }]}>{report.description}</Text>
                </View>

                <View style={styles.footer}>
                    <Button
                        title={t('Admin.moderation.reportDetail.viewChatDetail')}
                        onPress={() => (navigation as any).navigate(routes.adminInternal, {
                            screen: routes.adminViewChat,
                            params: { sessionId: report, headerRight: false }
                        })}
                        glassStyles={styles.actionButton}
                        buttonStyle={{}}
                        titleStyle={{}}
                        disabled={false}
                    />
                    <Button
                        title={t('Admin.moderation.reportDetail.takeAction')}
                        onPress={() => (navigation as any).navigate(routes.adminInternal, {
                            screen: routes.adminTakeAction,
                            params: { report }
                        })}
                        glassStyles={styles.actionButton}
                        titleStyle={{}}
                        disabled={false}
                    />
                </View>
            </ScrollView>
            <Loader isVisible={loading} />
        </HomeWrapper>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        paddingHorizontal: wp(6),
        paddingTop: hp(2),
        paddingBottom: hp(10),
    },
    sectionHeader: {
        marginBottom: hp(3),
    },
    sectionTitle: {
        fontFamily: fontFamilies.bold,
        fontSize: hp(2.2),
        color: theme.white,
    },
    infoRow: {
        flex: 1,
        overflow: 'hidden',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: hp(2),
        gap: wp(2),
    },
    infoCol: {
        // flexDirection: 'row',
        // justifyContent: 'space-between',
        // alignItems: 'center',
        marginBottom: hp(2),
    },
    label: {
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.8),
        color: theme.white,
    },
    value: {
        fontFamily: fontFamilies.medium,
        fontSize: hp(1.8),
        color: theme.white + "cc",
        width: '45%'
    },
    footer: {
        gap: hp(1),
        marginTop: hp(30), // Push to bottom
    },
    actionButton: {
        width: '100%',
    },
});

export default AdminReportDetail;
