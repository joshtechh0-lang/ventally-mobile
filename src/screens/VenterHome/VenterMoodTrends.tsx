import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
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
import MoodChart from '../../components/shared/MoodChart';
import Button from '../../components/Button';
import DatePickerModal from '../../components/shared/DatePickerModal';

import { useFocusEffect } from '@react-navigation/native';
import { useMood } from '../../api/apiHooks/useMood';
import { ActivityIndicator } from 'react-native';

const VenterMoodTrends = () => {
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

    const [activeTab, setActiveTab] = useState<'7' | '30' | 'custom'>('7');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [moodData, setMoodData] = useState<any[]>([]);
    const [variation, setVariation] = useState('');
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

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
                const formattedData = [
                    { label: 'Happy', value: breakdown.happy || 0 },
                    { label: 'Neutral', value: breakdown.neutral || 0 },
                    { label: 'Sad', value: breakdown.sad || 0 },
                    { label: 'Anxious', value: breakdown.anxious || 0 },
                    { label: 'Mad', value: breakdown.mad || 0 },
                ];
                setMoodData(formattedData);
                // setVariation(res.variation || 'Stable');
            }
        } catch (error) {
            console.log('Error fetching mood trends:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (activeTab === '7') {
                fetchStats(7);
            } else if (activeTab === '30') {
                fetchStats(30);
            }
        }, [activeTab])
    );

    const handleCustomSearch = () => {
        if (startDate && endDate) {
            // Replace / with - for standard parsing across platforms
            const sStr = startDate.trim().replace(/\//g, '-');
            const eStr = endDate.trim().replace(/\//g, '-');
            const s = new Date(sStr);
            const e = new Date(eStr);

            if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
                const diffTime = Math.abs(e.getTime() - s.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                fetchStats(diffDays);
            } else {
                console.log('Invalid date format provided');
            }
        }
    };

    const handleBack = () => navigation.goBack();
    const handleMoodVariation = () => (navigation as any).navigate(routes.venterMoodVariation);

    const moodStats = [
        { label: 'Happy', value: 3, height: hp(12) },
        { label: 'Neutral', value: 1, height: hp(4) },
        { label: 'Sad', value: 2, height: hp(8) },
        { label: 'Anxious', value: 1, height: hp(4) },
        { label: 'Mad', value: 1, height: hp(4) },
    ];

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
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
            height: hp(18),
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
        sectionTitle: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(2.2),
            color: theme.white,
            marginBottom: hp(2),
        },
        trendItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: wp(3),
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
            <ScreenHeader title={t('VenterJourney.moodTrends.title')} onBackPress={handleBack} />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === '7' && styles.activeTab]}
                        onPress={() => setActiveTab('7')}
                    >
                        <Text style={[styles.tabText, activeTab === '7' && styles.activeTabText]}>{t('VenterJourney.moodTrends.tabs.7days')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === '30' && styles.activeTab]}
                        onPress={() => setActiveTab('30')}
                    >
                        <Text style={[styles.tabText, activeTab === '30' && styles.activeTabText]}>{t('VenterJourney.moodTrends.tabs.30days')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'custom' && styles.activeTab]}
                        onPress={() => setActiveTab('custom')}
                    >
                        <Text style={[styles.tabText, activeTab === 'custom' && styles.activeTabText]}>{t('VenterJourney.moodTrends.tabs.custom')}</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'custom' && (
                    <View style={styles.datePickerRow}>
                        <View style={styles.dateInputContainer}>
                            <Text style={styles.dateLabel}>{t('VenterJourney.moodTrends.startDate')}</Text>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setShowStartPicker(true)}
                            >
                                <Text style={{ color: startDate ? theme.white : theme.white20 }}>
                                    {startDate || t('VenterJourney.moodTrends.placeholder')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.dateInputContainer}>
                            <Text style={styles.dateLabel}>{t('VenterJourney.moodTrends.endDate')}</Text>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setShowEndPicker(true)}
                            >
                                <Text style={{ color: endDate ? theme.white : theme.white20 }}>
                                    {endDate || t('VenterJourney.moodTrends.placeholder')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <DatePickerModal
                    visible={showStartPicker}
                    onClose={() => setShowStartPicker(false)}
                    onSelectDate={(date) => {
                        setStartDate(date);
                        setShowStartPicker(false);
                    }}
                    initialDate={startDate}
                    maxDate={new Date()}
                />

                <DatePickerModal
                    visible={showEndPicker}
                    onClose={() => setShowEndPicker(false)}
                    onSelectDate={(date) => {
                        setEndDate(date);
                        setShowEndPicker(false);
                    }}
                    initialDate={endDate}
                    maxDate={new Date()}
                    minDate={startDate ? new Date(startDate) : undefined}
                />

                {activeTab === 'custom' && (
                    <Button
                        title={t('Common.search')}
                        onPress={handleCustomSearch}
                        glassStyles={{ marginBottom: hp(4) }}
                        loading={loading}
                        borderedGlassButton={true}
                    />
                )}

                <View style={{ marginBottom: hp(3) }}>
                    {loading ? (
                        <View style={{ height: hp(25), justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={theme.primary} />
                        </View>
                    ) : (
                        <MoodChart data={moodData} title={t('VenterJourney.moodTrends.moodOverTime')} />
                    )}
                </View>

                <Text style={styles.sectionTitle}>{t('VenterJourney.moodTrends.trendBreakdown')}</Text>
                <TouchableOpacity onPress={handleMoodVariation}>
                    <GlassView bordered radius={hp(2)} glassStyles={{
                        backgroundColor: theme.black + "10",
                    }}>
                        <View style={styles.trendItem}>

                            <View style={styles.trendInfo}>
                                <Text style={styles.trendTitle}>{t('VenterJourney.moodVariation.title')}</Text>
                                <Text style={styles.trendValue}>{variation || t('VenterJourney.moodVariation.moderate')}</Text>
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

export default VenterMoodTrends;
