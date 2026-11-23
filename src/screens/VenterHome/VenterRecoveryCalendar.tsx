import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import GlassView from '../../components/GlassWrapper';
import { fontFamilies } from '../../utils/fontFamilies';
import { calendarIcon, chevronIcon } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import { useRecovery } from '../../api/apiHooks/useRecovery';
import { SobrietyEvent } from '../../types/apiPayloadsTypes';
import { useFocusEffect } from '@react-navigation/native';
import { Loader } from '../../components';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, monthIndex: number) {
    return new Date(year, monthIndex + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, monthIndex: number) {
    return new Date(year, monthIndex, 1).getDay();
}

function formatMonthYear(year: number, monthIndex: number) {
    return new Date(year, monthIndex, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function formatDate(year: number, monthIndex: number, day: number) {
    const date = new Date(year, monthIndex, day);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

const VenterRecoveryCalendar = () => {
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

    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<SobrietyEvent[]>([]);

    const d = new Date();
    const [currentYear, setCurrentYear] = useState(d.getFullYear());
    const [currentMonthIndex, setCurrentMonthIndex] = useState(d.getMonth());

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await recovery.getSobrietyHistory(100, 0);
            if (res?.events) {
                setHistory(res.events);
            }
        } catch (error) {
            console.error('[VenterRecoveryCalendar] Error fetching history:', error);
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

    const eventByDate = useMemo(() => {
        const map: Record<string, SobrietyEvent> = {};
        history.forEach(event => {
            const date = new Date(event.event_date);
            const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            map[dateKey] = event;
        });
        return map;
    }, [history]);

    const getDayEvent = (day: number) => {
        const dateKey = `${currentYear}-${currentMonthIndex}-${day}`;
        return eventByDate[dateKey];
    };

    const handleBack = () => navigation.goBack();

    const handleDayPress = (day: number) => {
        const event = getDayEvent(day);
        if (event) {
            (navigation as any).navigate(routes.venterRecoveryDetails, { entry: event });
        } else {
            // If no event, maybe navigate to log progress for that day?
            // For now, just a placeholder or do nothing if no log
            // (navigation as any).navigate(routes.venterLogProgress, { date: new Date(currentYear, currentMonthIndex, day) });
        }
    };

    const goPrevMonth = () => {
        const d = new Date(currentYear, currentMonthIndex - 1, 1);
        setCurrentYear(d.getFullYear());
        setCurrentMonthIndex(d.getMonth());
    };

    const goNextMonth = () => {
        const d = new Date(currentYear, currentMonthIndex + 1, 1);
        setCurrentYear(d.getFullYear());
        setCurrentMonthIndex(d.getMonth());
    };

    const daysInMonth = getDaysInMonth(currentYear, currentMonthIndex);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonthIndex);

    const cells = useMemo(() => {
        const arr: Array<{ day?: number }> = [];
        for (let i = 0; i < firstDay; i++) arr.push({});
        for (let d = 1; d <= daysInMonth; d++) arr.push({ day: d });
        while (arr.length % 7 !== 0) arr.push({});
        return arr;
    }, [daysInMonth, firstDay]);

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(5),
        },
        monthRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: wp(4),
            marginTop: hp(2),
            marginBottom: hp(3),
        },
        monthText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(2),
            color: theme.white,
        },
        navIcon: {
            width: hp(2),
            height: hp(2),
            tintColor: theme.white,
        },
        calendarCard: {
            paddingVertical: hp(2),
            paddingHorizontal: wp(2),
            backgroundColor: theme.black + '15',
        },
        dayLabelsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: hp(2),
        },
        dayLabel: {
            width: wp(12),
            textAlign: 'center',
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.6),
            color: theme.white,
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        cell: {
            width: wp(12),
            height: wp(12),
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: hp(1),
        },
        cellInner: {
            width: hp(4),
            height: hp(4),
            borderRadius: hp(2),
            alignItems: 'center',
            justifyContent: 'center',
        },
        cellText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white,
        },
        selectedInner: {
            backgroundColor: theme.yellow, // Sample color for specific selection or current day
        },
        trackInner: {
            backgroundColor: theme.green,
        },
        setbackInner: {
            backgroundColor: theme.red,
        },
        monthContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: wp(2),
        },
        calendarIcon: {
            width: hp(2),
            height: hp(2),
            tintColor: theme.white,
        },
    });

    return (
        <HomeWrapper key={langKey}>
            <Loader isVisible={loading} />
            <ScreenHeader title={t('VenterRecovery.calendar.title')} onBackPress={handleBack} />
            <ScrollView style={styles.content}>
                <GlassView bordered radius={hp(2)} style={styles.calendarCard}>

                    <View style={styles.monthRow}>
                        <TouchableOpacity onPress={goPrevMonth}>
                            <Image source={chevronIcon} style={[styles.navIcon, { transform: [{ rotate: '90deg' }] }]} />
                        </TouchableOpacity>
                        <View style={styles.monthContainer}>
                            <Image source={calendarIcon} style={styles.calendarIcon} />
                            <Text style={styles.monthText}>{formatMonthYear(currentYear, currentMonthIndex)}</Text>
                        </View>
                        <TouchableOpacity onPress={goNextMonth}>
                            <Image source={chevronIcon} style={[styles.navIcon, { transform: [{ rotate: '-90deg' }] }]} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dayLabelsRow}>
                        {(t('Common.days', { returnObjects: true }) as string[]).map((d) => (
                            <Text key={d} style={styles.dayLabel}>{d}</Text>
                        ))}
                    </View>
                    <View style={styles.grid}>
                        {cells.map((c, idx) => {
                            const event = c.day ? getDayEvent(c.day) : null;
                            const isRelapse = event?.event_type === 'relapse';
                            const isSober = event?.event_type === 'sober';
                            const isToday = c.day === d.getDate() && currentMonthIndex === d.getMonth() && currentYear === d.getFullYear();

                            return (
                                <View key={idx} style={styles.cell}>
                                    {c.day ? (
                                        <TouchableOpacity
                                            style={[
                                                styles.cellInner,
                                                isSober && styles.trackInner,
                                                isRelapse && styles.setbackInner,
                                                isToday && styles.selectedInner
                                            ]}
                                            onPress={() => handleDayPress(c.day!)}
                                        >
                                            <Text style={styles.cellText}>{c.day}</Text>
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            );
                        })}
                    </View>
                </GlassView>
            </ScrollView>
        </HomeWrapper>
    );
};

export default VenterRecoveryCalendar;
