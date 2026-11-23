import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    ScrollView,
    Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassWrapper from '../GlassWrapper';
import { chevronIcon, x } from '../../assets/icons';

interface DatePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectDate: (date: string) => void;
    initialDate?: string; // YYYY-MM-DD
    minDate?: Date;
    maxDate?: Date;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
    visible,
    onClose,
    onSelectDate,
    initialDate,
    minDate,
    maxDate,
}) => {
    const { theme } = useTheme();
    const { t } = useTranslation();

    const [currentDate, setCurrentDate] = useState(initialDate ? new Date(initialDate) : new Date());
    const [viewMode, setViewMode] = useState<'calendar' | 'month' | 'year'>('calendar');

    const [month, setMonth] = useState(currentDate.getMonth());
    const [year, setYear] = useState(currentDate.getFullYear());
    const [selectedDay, setSelectedDay] = useState<number | null>(currentDate.getDate());

    useEffect(() => {
        if (visible && initialDate) {
            const d = new Date(initialDate);
            if (!isNaN(d.getTime())) {
                setMonth(d.getMonth());
                setYear(d.getFullYear());
                setSelectedDay(d.getDate());
            }
        }
    }, [visible, initialDate]);

    const monthNames = [
        t('Common.months.january', 'January'),
        t('Common.months.february', 'February'),
        t('Common.months.march', 'March'),
        t('Common.months.april', 'April'),
        t('Common.months.may', 'May'),
        t('Common.months.june', 'June'),
        t('Common.months.july', 'July'),
        t('Common.months.august', 'August'),
        t('Common.months.september', 'September'),
        t('Common.months.october', 'October'),
        t('Common.months.november', 'November'),
        t('Common.months.december', 'December'),
    ];

    const weekdayShort = [
        t('Common.daysShort.sun', 'S'),
        t('Common.daysShort.mon', 'M'),
        t('Common.daysShort.tue', 'T'),
        t('Common.daysShort.wed', 'W'),
        t('Common.daysShort.thu', 'T'),
        t('Common.daysShort.fri', 'F'),
        t('Common.daysShort.sat', 'S'),
    ];

    const buildMonthDays = (y: number, m: number) => {
        const firstDay = new Date(y, m, 1);
        const startWeekday = firstDay.getDay(); // 0-6
        const daysInMonth = new Date(y, m + 1, 0).getDate();

        const weeks = [];
        let currentWeek = new Array(startWeekday).fill(null);

        for (let d = 1; d <= daysInMonth; d++) {
            currentWeek.push(d);
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }
        if (currentWeek.length) {
            while (currentWeek.length < 7) currentWeek.push(null);
            weeks.push(currentWeek);
        }
        return weeks;
    };

    const isMonthOutOfRange = (checkYear: number, checkMonth: number) => {
        if (minDate) {
            const minYear = minDate.getFullYear();
            const minMonth = minDate.getMonth();
            if (checkYear < minYear || (checkYear === minYear && checkMonth < minMonth)) return true;
        }
        if (maxDate) {
            const maxYear = maxDate.getFullYear();
            const maxMonth = maxDate.getMonth();
            if (checkYear > maxYear || (checkYear === maxYear && checkMonth > maxMonth)) return true;
        }
        return false;
    };

    const isDateOutOfRange = (day: number) => {
        const selectedDate = new Date(year, month, day);
        if (minDate && selectedDate < minDate) return true;
        if (maxDate && selectedDate > maxDate) return true;
        return false;
    };

    const handlePrevMonth = () => {
        const newMonth = month === 0 ? 11 : month - 1;
        const newYear = month === 0 ? year - 1 : year;
        if (isMonthOutOfRange(newYear, newMonth)) return;

        if (month === 0) {
            setMonth(11);
            setYear(prev => prev - 1);
        } else {
            setMonth(prev => prev - 1);
        }
        setSelectedDay(null);
    };

    const handleNextMonth = () => {
        const newMonth = month === 11 ? 0 : month + 1;
        const newYear = month === 11 ? year + 1 : year;
        if (isMonthOutOfRange(newYear, newMonth)) return;

        if (month === 11) {
            setMonth(0);
            setYear(prev => prev + 1);
        } else {
            setMonth(prev => prev + 1);
        }
        setSelectedDay(null);
    };

    const handleMonthSelect = (idx: number) => {
        if (isMonthOutOfRange(year, idx)) return;
        setMonth(idx);
        setViewMode('calendar');
    };

    const handleYearSelect = (y: number) => {
        setYear(y);
        // If current month is out of range for the new year, adjust it
        if (isMonthOutOfRange(y, month)) {
            if (maxDate && y === maxDate.getFullYear() && month > maxDate.getMonth()) {
                setMonth(maxDate.getMonth());
            } else if (minDate && y === minDate.getFullYear() && month < minDate.getMonth()) {
                setMonth(minDate.getMonth());
            }
        }
        setViewMode('calendar');
    };

    const handleDateSelect = (day: number) => {
        if (isDateOutOfRange(day)) return;
        setSelectedDay(day);
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        onSelectDate(`${year}-${mm}-${dd}`);
    };

    const generateYears = () => {
        const curYear = new Date().getFullYear();
        const years = [];
        // Show from 10 years ago to 10 years in future
        for (let i = curYear - 10; i <= curYear + 10; i++) {
            years.push(i);
        }
        return years;
    };

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.black + "50",
            justifyContent: 'center',
            alignItems: 'center',
        },
        container: {
            width: wp(90),
            padding: wp(4),
            backgroundColor: theme.black,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: hp(2),
        },
        title: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(2),
            color: theme.white,
        },
        closeBtn: {
            padding: wp(2),
        },
        closeIcon: {
            width: hp(2),
            height: hp(2),
            tintColor: theme.white,
        },
        calendarHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: hp(2),
        },
        monthYearContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        monthYearText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.8),
            color: theme.white,
        },
        navContainer: {
            flexDirection: 'row',
            gap: wp(4),
        },
        navIcon: {
            width: hp(2),
            height: hp(2),
            tintColor: theme.white,
        },
        weekdayRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: hp(1),
        },
        weekdayLabel: {
            width: wp(10),
            textAlign: 'center',
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.4),
            color: theme.white60,
        },
        grid: {
            width: '100%',
        },
        weekRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: hp(0.5),
        },
        dayCell: {
            width: wp(10),
            height: hp(5),
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: hp(1),
        },
        selectedDay: {
            backgroundColor: theme.magenda,
        },
        disabledDay: {
            opacity: 0.2,
        },
        dayText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white,
        },
        selectedDayText: {
            fontFamily: fontFamilies.bold,
            color: theme.white,
        },
        pickerGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        pickerItem: {
            width: '30%',
            paddingVertical: hp(1.5),
            alignItems: 'center',
            marginVertical: hp(0.5),
            borderRadius: hp(1),
            backgroundColor: theme.white + '10',
        },
        selectedPickerItem: {
            backgroundColor: theme.primary,
        },
        pickerItemText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.6),
            color: theme.white,
        },
        yearScroll: {
            maxHeight: hp(40),
        }
    });

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable onPress={(e) => e.stopPropagation()}>
                    <GlassWrapper bordered glassStyles={styles.container}>
                        <View style={styles.header}>
                            <Text style={styles.title}>{t('Common.selectDate', 'Select Date')}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Image source={x} style={styles.closeIcon} />
                            </TouchableOpacity>
                        </View>

                        {viewMode === 'calendar' && (
                            <View>
                                <View style={styles.calendarHeader}>
                                    <TouchableOpacity style={styles.monthYearContainer} onPress={() => setViewMode('month')}>
                                        <Text style={styles.monthYearText}>{monthNames[month]} {year}</Text>
                                        <Image source={chevronIcon} style={[styles.navIcon, { transform: [{ rotate: '-90deg' }], marginLeft: wp(2), width: hp(1.5), height: hp(1.5) }]} />
                                    </TouchableOpacity>
                                    <View style={styles.navContainer}>
                                        <TouchableOpacity onPress={handlePrevMonth} disabled={isMonthOutOfRange(year, month - 1)}>
                                            <Image source={chevronIcon} style={[styles.navIcon, { transform: [{ rotate: '90deg' }], opacity: isMonthOutOfRange(year, month - 1) ? 0.3 : 1 }]} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleNextMonth} disabled={isMonthOutOfRange(year, month + 1)}>
                                            <Image source={chevronIcon} style={[styles.navIcon, { transform: [{ rotate: '-90deg' }], opacity: isMonthOutOfRange(year, month + 1) ? 0.3 : 1 }]} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.weekdayRow}>
                                    {weekdayShort.map((day, idx) => (
                                        <Text key={idx} style={styles.weekdayLabel}>{day}</Text>
                                    ))}
                                </View>

                                <View style={styles.grid}>
                                    {buildMonthDays(year, month).map((week, wi) => (
                                        <View key={wi} style={styles.weekRow}>
                                            {week.map((day, di) => {
                                                if (!day) return <View key={di} style={styles.dayCell} />;
                                                const isSelected = day === selectedDay;
                                                const disabled = isDateOutOfRange(day);
                                                return (
                                                    <TouchableOpacity
                                                        key={di}
                                                        style={[styles.dayCell, isSelected && styles.selectedDay, disabled && styles.disabledDay]}
                                                        onPress={() => handleDateSelect(day)}
                                                        disabled={disabled}
                                                    >
                                                        <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {viewMode === 'month' && (
                            <View>
                                <TouchableOpacity onPress={() => setViewMode('calendar')} style={{ marginBottom: hp(2) }}>
                                    <Text style={[styles.monthYearText, { color: theme.primary }]}>{t('Common.back', '< Back')}</Text>
                                </TouchableOpacity>
                                <View style={styles.pickerGrid}>
                                    {monthNames.map((name, idx) => {
                                        const disabled = isMonthOutOfRange(year, idx);
                                        const isSelected = month === idx;
                                        return (
                                            <TouchableOpacity
                                                key={idx}
                                                style={[styles.pickerItem, isSelected && styles.selectedPickerItem, disabled && styles.disabledDay]}
                                                onPress={() => handleMonthSelect(idx)}
                                                disabled={disabled}
                                            >
                                                <Text style={styles.pickerItemText}>{name.substring(0, 3)}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                                <TouchableOpacity onPress={() => setViewMode('year')} style={{ marginTop: hp(2), alignItems: 'center' }}>
                                    <Text style={styles.monthYearText}>{year} <Image source={chevronIcon} style={[styles.navIcon, { transform: [{ rotate: '-90deg' }], width: hp(1.5), height: hp(1.5) }]} /></Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {viewMode === 'year' && (
                            <View>
                                <TouchableOpacity onPress={() => setViewMode('month')} style={{ marginBottom: hp(2) }}>
                                    <Text style={[styles.monthYearText, { color: theme.primary }]}>{t('Common.back', '< Back')}</Text>
                                </TouchableOpacity>
                                <ScrollView style={styles.yearScroll} contentContainerStyle={styles.pickerGrid}>
                                    {generateYears().map((y) => {
                                        const isSelected = year === y;
                                        return (
                                            <TouchableOpacity
                                                key={y}
                                                style={[styles.pickerItem, { width: '45%' }, isSelected && styles.selectedPickerItem]}
                                                onPress={() => handleYearSelect(y)}
                                            >
                                                <Text style={styles.pickerItemText}>{y}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        )}
                    </GlassWrapper>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default DatePickerModal;
