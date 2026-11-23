import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import GlassView from '../../components/GlassWrapper';
import { chevronIcon } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import Button from '../../components/Button';
import SettingsContainer from '../../components/shared/SettingsContainer';

import { useFocusEffect } from '@react-navigation/native';
import { useMood } from '../../api/apiHooks/useMood';
import { useChat } from '../../api/apiHooks/useChat';
import { useCalls } from '../../api/apiHooks/useCalls';
import { ActivityIndicator } from 'react-native';

const VenterJourneyDashboard = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const { getMoodStats } = useMood();
    const { getConversations } = useChat();
    const { getCalls } = useCalls();

    const [loading, setLoading] = React.useState(true);
    const [statsData, setStatsData] = React.useState({
        moodEntries: 0,
        recoveryDays: 0,
        chatsStarted: 0,
        callsStarted: 0,
    });

    useFocusEffect(
        React.useCallback(() => {
            const fetchDashboardData = async () => {
                try {
                    setLoading(true);
                    const [moodRes, chatRes, callRes] = await Promise.all([
                        getMoodStats(365),
                        getConversations(undefined, 1, 0),
                        getCalls(1, 0),
                    ]);

                    setStatsData({
                        moodEntries: moodRes?.total_entries || 0,
                        recoveryDays: moodRes?.streaks?.longest || 0,
                        chatsStarted: chatRes?.total || chatRes?.pagination?.total || 0,
                        callsStarted: callRes?.count || 0,
                    });
                } catch (error) {
                    console.log('Error fetching journey stats:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchDashboardData();
        }, [])
    );

    const stats = [
        { label: t('VenterJourney.stats.moodEntries'), value: `${statsData.moodEntries} ${t('VenterJourney.stats.entries') || 'entries'}` },
        { label: t('VenterJourney.stats.recoveryLog'), value: `${statsData.recoveryDays} ${t('VenterJourney.stats.days') || 'days'}` },
        { label: t('VenterJourney.stats.chatsStarted'), value: `${statsData.chatsStarted} ${t('VenterJourney.stats.chats') || 'Chats'}` },
        { label: t('VenterJourney.stats.callsStarted'), value: `${statsData.callsStarted} ${t('VenterJourney.stats.calls') || 'Calls'}` },
    ];

    const handleBack = () => navigation.goBack();
    const handleViewTrends = () => (navigation as any).navigate(routes.venterMoodTrends);
    const handleMoodVariation = () => (navigation as any).navigate(routes.venterMoodVariation);

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
        },
        statsCard: {
            padding: wp(4),
            backgroundColor: theme.black + '10',
            marginBottom: hp(4),
            gap: hp(2.5),
        },
        statRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: hp(1.25),
        },
        statLabel: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.6),
            color: theme.white,
        },
        statValue: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + "cc",
        },
        sectionTitle: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(2),
            color: theme.white,
            marginBottom: hp(2),
            marginTop: hp(2),
        },
        trendItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: wp(4),
            paddingVertical: hp(1),
            backgroundColor: theme.black + '10',
            marginBottom: hp(1.5),
        },
        trendInfo: {
            flex: 1,
        },
        trendTitle: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.8),
            color: theme.white,
        },
        trendValue: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.4),
            color: theme.white + "cc",
            marginTop: hp(0.5),
        },
        chevron: {
            width: hp(2),
            height: hp(2),
            tintColor: theme.white,
            transform: [{ rotate: '-90deg' }],
        },
    });

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader title={t('VenterJourney.title')} onBackPress={handleBack} />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <SettingsContainer >
                    {loading ? (
                        <View style={{ paddingVertical: hp(2), alignItems: 'center' }}>
                            <ActivityIndicator size="small" color={theme.white} />
                        </View>
                    ) : (
                        stats.map((stat, index) => (
                            <View key={index} style={styles.statRow}>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                                <Text style={styles.statValue}>
                                    {stat.value}
                                </Text>
                            </View>
                        ))
                    )}
                </SettingsContainer>

                <Button
                    title={t('VenterJourney.viewTrends')}
                    onPress={handleViewTrends}
                    buttonStyle={{}}
                    titleStyle={{}}
                    disabled={false}
                    glassStyles={{
                        backgroundColor: theme.white + "10",
                        borderColor: "transparent",
                    }}
                    borderedGlassButton
                />

                <Text style={styles.sectionTitle}>{t('VenterJourney.viewTrends')}</Text>

                <TouchableOpacity onPress={handleMoodVariation}>
                    <GlassView bordered radius={hp(2)} glassStyles={{
                        backgroundColor: theme.black + "10",
                    }}>
                        <View style={styles.trendItem}>

                            <View style={styles.trendInfo}>
                                <Text style={styles.trendTitle}>{t('VenterJourney.moodVariation.title')}</Text>
                                <Text style={styles.trendValue}>{t('VenterJourney.moodVariation.moderate')}</Text>
                            </View>
                            <Image source={chevronIcon} style={styles.chevron} />
                        </View>

                    </GlassView>
                </TouchableOpacity>

                <View style={{ height: hp(5) }} />
            </ScrollView>
        </HomeWrapper>
    );
};

export default VenterJourneyDashboard;
