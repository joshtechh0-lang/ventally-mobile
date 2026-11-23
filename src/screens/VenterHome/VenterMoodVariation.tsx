import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import GlassView from '../../components/GlassWrapper';
import Button from '../../components/Button';
import { chevronIcon, happyIcon, neutralIcon, sadIcon, axiousIcon, madIcon } from '../../assets/icons';
import MoodChart from '../../components/shared/MoodChart';
import { useMood } from '../../api/apiHooks/useMood';
import DatePickerModal from '../../components/shared/DatePickerModal';

const VenterMoodVariation = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const { getMoodStats, getMoodHistory } = useMood();

    const [loading, setLoading] = useState(true);
    const [moodData, setMoodData] = useState<any[]>([]);
    const [variation, setVariation] = useState('');
    const [moodHistory, setMoodHistory] = useState<Record<number, any>>({});
    const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const fetchStats = async (days: number) => {
        try {
            setLoading(true);
            const res = await getMoodStats(days);
            if (res) {
                const breakdown = {
                    happy: parseInt(res.mood_distribution.find(m => m.mood_type.toLowerCase() === 'happy')?.count || '0'),
                    neutral: parseInt(res.mood_distribution.find(m => m.mood_type.toLowerCase() === 'neutral')?.count || '0'),
                    sad: parseInt(res.mood_distribution.find(m => m.mood_type.toLowerCase() === 'sad')?.count || '0'),
                    anxious: parseInt(res.mood_distribution.find(m => m.mood_type.toLowerCase() === 'anxious')?.count || '0'),
                    mad: parseInt(res.mood_distribution.find(m => m.mood_type.toLowerCase() === 'mad')?.count || '0'),
                };
                setMoodData([
                    { label: 'Happy', value: breakdown.happy || 0 },
                    { label: 'Neutral', value: breakdown.neutral || 0 },
                    { label: 'Sad', value: breakdown.sad || 0 },
                    { label: 'Anxious', value: breakdown.anxious || 0 },
                    { label: 'Mad', value: breakdown.mad || 0 },
                ]);
                // For now variation is not in response, using a default or calculating
                setVariation('Moderate');
            }
        } catch (error) {
            console.log('Error fetching mood variation stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (month: number, year: number) => {
        try {
            const pad = (n: number) => n.toString().padStart(2, '0');
            const start = `${year}-${pad(month + 1)}-01`;
            const lastDay = new Date(year, month + 1, 0).getDate();
            const end = `${year}-${pad(month + 1)}-${pad(lastDay)}`;

            const res = await getMoodHistory(100, 0, start, end);
            if (res && res.moods) {
                const historyMap: Record<number, any> = {};
                res.moods.forEach(mood => {
                    let date: Date;
                    if (mood.updated_at) {
                        const dateOnly = mood.logged_date.substring(0, 10);
                        const [y, m, d] = dateOnly.split('-').map(Number);
                        date = new Date(y, m - 1, d);
                    } else {
                        // Use created_at as the source of truth for the exact moment it was logged
                        const rawTarget = mood.updated_at || new Date().toISOString();
                        const formattedDate = rawTarget.replace(' ', 'T');
                        const utcString = formattedDate.endsWith('Z') ? formattedDate : formattedDate + 'Z';
                        const utcDate = new Date(utcString);

                        const localYear = utcDate.getFullYear();
                        const localMonth = utcDate.getMonth();
                        const localDay = utcDate.getDate();
                        date = new Date(localYear, localMonth, localDay);
                    }
                    if (date.getMonth() === month && date.getFullYear() === year) {
                        historyMap[date.getDate()] = mood.mood_type.toLowerCase();
                    }
                });
                setMoodHistory(historyMap);
            }
        } catch (error) {
            console.log('Error fetching mood history for calendar:', error);
        }
    };

    const handleBack = () => navigation.goBack();

    const goPrevMonth = () => {
        if (currentMonthIndex === 0) {
            setCurrentMonthIndex(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonthIndex(prev => prev - 1);
        }
    };

    const goNextMonth = () => {
        const today = new Date();
        const viewingDate = new Date(currentYear, currentMonthIndex, 1);
        const nextMonth = new Date(currentYear, currentMonthIndex + 1, 1);

        if (nextMonth > today && (nextMonth.getMonth() !== today.getMonth() || nextMonth.getFullYear() !== today.getFullYear())) {
            // Already at current month or beyond
            return;
        }

        if (currentMonthIndex === 11) {
            setCurrentMonthIndex(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonthIndex(prev => prev + 1);
        }
    };

    const isNextMonthDisabled = useMemo(() => {
        const today = new Date();
        return currentYear > today.getFullYear() || (currentYear === today.getFullYear() && currentMonthIndex >= today.getMonth());
    }, [currentYear, currentMonthIndex]);

    const goPrevYear = () => {
        setCurrentYear(prev => prev - 1);
    };

    const goNextYear = () => {
        setCurrentYear(prev => prev + 1);
    };

    const formatMonthYear = (year: number, monthIdx: number) => {
        const months = t('Common.months', { returnObjects: true }) as string[];
        return `${months[monthIdx]} ${year}`;
    };


    useFocusEffect(
        React.useCallback(() => {
            fetchStats(30);
            fetchHistory(currentMonthIndex, currentYear);
        }, [currentMonthIndex, currentYear])
    );

    const moodIconsByDay: Record<string, any> = {
        happy: happyIcon,
        neutral: neutralIcon,
        sad: sadIcon,
        anxious: axiousIcon,
        mad: madIcon,
    };

    const days = useMemo(() => {
        const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 (Sun) to 6 (Sat)

        // Adjust for Sun-Sat labels matching `getDay()` directly
        const startOffset = firstDayOfMonth;

        const arr = [];
        for (let i = 0; i < startOffset; i++) arr.push({ day: null });
        for (let d = 1; d <= daysInMonth; d++) arr.push({ day: d });

        return arr;
    }, [currentMonthIndex, currentYear]);

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
        },
        variationCard: {
            padding: wp(4),
            marginBottom: hp(4),
        },
        variationLabel: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(2),
            color: theme.white,
            marginBottom: hp(1),
        },
        variationValue: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white60,
        },
        chartCard: {
            padding: wp(4),
            backgroundColor: theme.black + '15',
            marginBottom: hp(4),
        },
        chartTitle: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.8),
            color: theme.white,
            marginBottom: hp(4),
        },
        chartContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            height: hp(15),
            paddingHorizontal: wp(2),
        },
        barWrapper: {
            alignItems: 'center',
            width: wp(15),
        },
        barValue: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.4),
            color: theme.white60,
            marginBottom: hp(1),
        },
        bar: {
            width: wp(6),
            backgroundColor: theme.white + '30',
            borderRadius: hp(1),
        },
        barLabel: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.2),
            color: theme.white60,
            marginTop: hp(1.5),
        },
        calendarCard: {
            padding: wp(4),
            backgroundColor: theme.black + '15',
            marginBottom: hp(4),
        },
        calendarHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: hp(3),
        },
        monthTitle: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.8),
            color: theme.white,
        },
        navIcons: {
            flexDirection: 'row',
            // gap: wp(4),
        },
        navIconWrapper: {

            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: wp(2),

        },
        navIcon: {
            width: hp(2.5),
            height: hp(2.5),
            tintColor: theme.white,
            resizeMode: "contain"
        },
        dayLabelsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: hp(2),
        },
        dayLabelText: {
            width: `${100 / 7}%`,
            textAlign: 'center',
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.2),
            color: theme.white60,
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
        },
        cell: {
            width: `${100 / 7.1}%`,
            height: hp(6),
            alignItems: 'center',
            justifyContent: 'flex-start',
            marginBottom: hp(2),

        },
        moodIcon: {
            width: hp(2.5),
            height: hp(2.5),
            resizeMode: 'contain',
            tintColor: theme.white,
        },
        dayText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.4),
            color: theme.white,
        },
        iconWrapper: {
            height: hp(3.5),
            width: hp(3.5),
            alignItems: 'center',
            justifyContent: 'center',
            padding: hp(.5),
            backgroundColor: theme.white + "10",
            borderRadius: hp(.3)
        },
        tabContainer: {
            flexDirection: 'row',
            backgroundColor: theme.white + '10',
            borderRadius: hp(3),
            padding: hp(0.5),
            marginBottom: hp(4),
        },
        tab: {
            flex: 1,
            paddingVertical: hp(1.2),
            alignItems: 'center',
            borderRadius: hp(2.5),
        },
        activeTab: {
            backgroundColor: theme.white + '20',
        },
        tabText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.6),
            color: theme.white60,
        },
        activeTabText: {
            color: theme.white,
        },
        datePickerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: hp(4),
        },
        dateInputContainer: {
            width: wp(42),
        },
        dateLabel: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.6),
            color: theme.white,
            marginBottom: hp(1),
        },
        input: {
            backgroundColor: theme.white + '10',
            borderRadius: hp(2),
            paddingHorizontal: wp(4),
            paddingVertical: hp(1.5),
            color: theme.white,
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.4),
            borderWidth: 1,
            borderColor: theme.white + '20',
        },
        headerSection: {
            marginBottom: hp(2),
        },
        variationHeading: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(2),
            color: theme.white,
        },
        variationSubHeading: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + "cc",
            marginTop: hp(0.5),
        },
    });

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader title={t('VenterJourney.moodVariation.title')} onBackPress={handleBack} />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.headerSection}>
                    <Text style={styles.variationHeading}>{t('VenterJourney.moodVariation.heading', 'Variation Level')}</Text>
                    <Text style={styles.variationSubHeading}>{variation || t('VenterJourney.moodVariation.moderate', 'Moderate')}</Text>
                </View>



                <View style={{ marginBottom: hp(3) }}>
                    {loading ? (
                        <View style={{ height: hp(25), justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={theme.primary} />
                        </View>
                    ) : (
                        <MoodChart data={moodData} title={t('VenterJourney.moodTrends.moodOverTime')} />
                    )}
                </View>


                <GlassView bordered radius={hp(2)} style={styles.calendarCard}>
                    <View style={styles.calendarHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.monthTitle}>{formatMonthYear(currentYear, currentMonthIndex)}</Text>
                            {/* <TouchableOpacity style={styles.navIconWrapper} >
                                <Image source={chevronIcon} style={[styles.navIcon, { transform: [{ rotate: '-90deg' }] }]} />
                            </TouchableOpacity> */}
                        </View>
                        <View style={styles.navIcons}>
                            {/* Year Prev */}
                            {/* <TouchableOpacity onPress={goPrevYear}>
                                <Image source={chevronIcon} style={[styles.navIcon, { transform: [{ rotate: '90deg' }], opacity: 0.5 }]} />
                            </TouchableOpacity> */}
                            {/* Month Prev */}
                            <TouchableOpacity style={styles.navIconWrapper} onPress={goPrevMonth}>
                                <Image source={chevronIcon} style={[styles.navIcon, { transform: [{ rotate: '90deg' }] }]} />
                            </TouchableOpacity>
                            {/* Month Next */}
                            <TouchableOpacity
                                style={styles.navIconWrapper}
                                onPress={goNextMonth}
                                disabled={isNextMonthDisabled}
                            >
                                <Image source={chevronIcon} style={[styles.navIcon, { transform: [{ rotate: '-90deg' }], opacity: isNextMonthDisabled ? 0.3 : 1 }]} />
                            </TouchableOpacity>
                            {/* Year Next */}
                            {/* <TouchableOpacity onPress={goNextYear}>
                                <Image source={chevronIcon} style={[styles.navIcon, { transform: [{ rotate: '-90deg' }], opacity: 0.5 }]} />
                            </TouchableOpacity> */}
                        </View>
                    </View>

                    <View style={styles.dayLabelsRow}>
                        {(t('Common.days', { returnObjects: true }) as string[]).map((l) => (
                            <Text key={l} style={styles.dayLabelText}>{l}</Text>
                        ))}
                    </View>

                    <View style={styles.grid}>
                        {days.map((item, idx) => {
                            const today = new Date();
                            const isFuture = item.day && new Date(currentYear, currentMonthIndex, item.day) > today;

                            return (
                                <View key={idx} style={[styles.cell, isFuture ? { opacity: 0.3 } : null]}>
                                    <View style={styles.iconWrapper}>
                                        {item.day && moodHistory[item.day] && <Image source={moodIconsByDay[moodHistory[item.day]]} style={styles.moodIcon} />}
                                    </View>
                                    <Text style={styles.dayText}>{item.day || ''}</Text>
                                </View>
                            );
                        })}
                    </View>
                </GlassView>

                <View style={{ height: hp(5) }} />
            </ScrollView>
        </HomeWrapper>
    );
};

export default VenterMoodVariation;
