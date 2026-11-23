import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import GlassView from '../../components/GlassWrapper';
import { calendarIcon, calenderIcon2, recoveryIcon } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import Button from '../../components/Button';
import SettingsContainer from '../../components/shared/SettingsContainer';
import EmptyState from '../../components/shared/EmptyState';
import { useRecovery } from '../../api/apiHooks/useRecovery';
import { SobrietyStatus, SobrietyEvent } from '../../types/apiPayloadsTypes';
import { Loader } from '../../components';
import { useFocusEffect } from '@react-navigation/native';
import { toastError } from '../../utils/toast';
import Svg, { Circle } from 'react-native-svg';

// --- SVG progress arc constants ---
const CIRCLE_SIZE = hp(22);
const STROKE_WIDTH = hp(1);
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MILESTONE = 365;

const VenterRecoveryDashboard = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const recovery = useRecovery();

    const [loading, setLoading] = React.useState(false);
    const [sobrietyStatus, setSobrietyStatus] = React.useState<SobrietyStatus | null>(null);
    const [history, setHistory] = React.useState<SobrietyEvent[]>([]);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            const [statusRes, historyRes] = await Promise.all([
                recovery.getSobrietyStatus(),
                recovery.getSobrietyHistory(5, 0)
            ]);

            if (statusRes?.status) {
                setSobrietyStatus(statusRes.status);
            }
            if (historyRes?.events) {
                setHistory(historyRes.events);
            }
        } catch (error: any) {
            console.error('[VenterRecoveryDashboard] Error fetching data:', error);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const handleBack = () => navigation.goBack();
    const handleCalendar = () => (navigation as any).navigate(routes.venterRecoveryCalendar);
    const handleLogProgress = () => (navigation as any).navigate(routes.venterLogProgress);
    const handleProgressCirclePress = () => (
        navigation as any
    ).navigate(routes.venterProgressSummary, {
        daysSober: sobrietyStatus?.days_sober ?? 0,
        soberStartDate: sobrietyStatus?.sober_start_date,
    });

    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(5),
        },
        progressContainer: {
            alignItems: 'center',
            marginTop: hp(4),
            marginBottom: hp(4),
        },
        circle: {
            width: hp(22),
            height: hp(22),
            borderRadius: hp(11),
            borderWidth: hp(0.8),
            borderColor: theme.white + '30',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        },
        activeArc: {
            position: 'absolute',
            width: hp(22),
            height: hp(22),
            borderRadius: hp(11),
            borderWidth: hp(0.8),
            borderColor: theme.white + "30",
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            transform: [{ rotate: '45deg' }],
        },
        progressText: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(6),
            color: theme.white,
        },
        progressLabel: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white,
            marginTop: hp(-1),
        },

        statsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',

        },
        statItem: {
            width: "33%",
            paddingVertical: hp(1.5),
            alignItems: 'center',
            borderRightWidth: hp(.1),
            borderRightColor: theme.white60,
        },
        statValue: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.8),
            color: theme.white + "cc",
        },
        statLabel: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.4),
            color: theme.white + "cc",

            marginTop: hp(0.5),
        },
        sectionTitle: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(2),
            color: theme.white,
            marginBottom: hp(2),
        },
        entryCard: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            // paddingHorizontal: wp(4),
            paddingVertical: hp(1),
            marginBottom: hp(1.5),
        },
        entryDate: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.6),
            color: theme.white,
        },
        entryStatus: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + "cc",
            flex: 1,
            textAlign: 'right',
            marginLeft: wp(4),
        },
    });
    const MILESTONE = 365;
    const progress = sobrietyStatus?.days_sober ? sobrietyStatus?.days_sober / MILESTONE : 0;
    return (
        <HomeWrapper key={langKey}>
            <Loader isVisible={loading} />
            <ScreenHeader
                title={t('VenterRecovery.dashboard.title')}
                onBackPress={handleBack}
                rightComponent={
                    <TouchableOpacity onPress={handleCalendar}>
                        <Image source={calenderIcon2} style={{ width: hp(2.5), height: hp(2.5), tintColor: theme.white }} />
                    </TouchableOpacity>
                }
            />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.progressContainer}>
                    <TouchableOpacity onPress={handleProgressCirclePress} activeOpacity={0.8}>
                        <View style={{ alignItems: 'center', justifyContent: 'center', width: CIRCLE_SIZE, height: CIRCLE_SIZE }}>
                            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}>
                                {/* Background track */}
                                <Circle
                                    cx={CIRCLE_SIZE / 2}
                                    cy={CIRCLE_SIZE / 2}
                                    r={RADIUS}
                                    stroke={theme.white + "25"}
                                    strokeWidth={STROKE_WIDTH}
                                    fill="none"
                                />
                                {/* Foreground progress arc */}
                                <Circle
                                    cx={CIRCLE_SIZE / 2}
                                    cy={CIRCLE_SIZE / 2}
                                    r={RADIUS}
                                    stroke={theme.white + "70"}
                                    strokeWidth={STROKE_WIDTH}
                                    fill="none"
                                    strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                                    strokeDashoffset={CIRCUMFERENCE * (1 - Math.min(progress, 1))}
                                    strokeLinecap="round"
                                    rotation={-90}
                                    origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
                                />
                            </Svg>
                            {/* Center text */}
                            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{
                                        fontFamily: fontFamilies.bold,
                                        fontSize: hp(6.5),
                                        color: 'rgba(255,255,255,0.9)',
                                        lineHeight: hp(7),
                                    }}>
                                        {sobrietyStatus?.days_sober ?? 0}
                                    </Text>
                                    <Text style={{
                                        fontFamily: fontFamilies.normal,
                                        fontSize: hp(1.6),
                                        color: 'rgba(255,255,255,0.7)',
                                        marginTop: hp(0.5),
                                    }}>
                                        {t('VenterRecovery.dashboard.daysSober')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>


                {/* <View style={styles.logButton}> */}
                <Button
                    title={t('VenterRecovery.dashboard.logProgress')}
                    onPress={handleLogProgress}
                    titleStyle={{}}
                    disabled={false}
                    glassStyles={{
                        marginBottom: hp(4),
                        width: wp(50),
                        alignSelf: "center",
                        backgroundColor: theme.white + "10",
                        borderWidth: 0
                    }}
                    borderedGlassButton
                />
                {/* </View> */}

                <GlassView bordered glassStyles={{
                    backgroundColor: theme.white + "10",
                }} style={{
                    marginBottom: hp(4),

                }}>
                    <View style={styles.statsRow}>


                        <View style={styles.statItem}>
                            <Text style={styles.statValue} numberOfLines={1}>
                                {sobrietyStatus?.notes || '--'}
                            </Text>
                            <Text style={styles.statLabel}>{t('VenterRecovery.dashboard.stats.reflections')}</Text>
                        </ View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {sobrietyStatus?.days_sober != null ? `${sobrietyStatus.days_sober}d` : '--'}
                            </Text>
                            <Text style={styles.statLabel}>{t('VenterRecovery.dashboard.stats.end')}</Text>
                        </View>
                        <View style={[styles.statItem, {
                            borderRightWidth: 0
                        }]}>
                            <Text style={styles.statValue}>{sobrietyStatus?.achievements?.filter(a => a.achieved).length ?? 0}</Text>
                            <Text style={styles.statLabel}>{t('VenterRecovery.dashboard.stats.achievements')}</Text>
                        </View>
                    </View>

                </GlassView>

                <Text style={styles.sectionTitle}>{t('VenterRecovery.dashboard.recentEntries')}</Text>
                {history.length === 0 ? (
                    <EmptyState
                        title=""
                        description={t('VenterRecovery.dashboard.noentries')}
                    />
                ) : (
                    <SettingsContainer>
                        {history.map((entry, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.entryCard}
                                onPress={() => (navigation as any).navigate(routes.venterRecoveryDetails, { entry })}
                            >
                                <Text style={styles.entryDate}>{formatEventDate(entry.event_date)}</Text>
                                <Text style={styles.entryStatus}>
                                    {entry.event_type.charAt(0).toUpperCase() + entry.event_type.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </SettingsContainer>
                )}

                <View style={{ height: hp(5) }} />
            </ScrollView>
        </HomeWrapper>
    );
};

export default VenterRecoveryDashboard;
