import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, WINDOW_WIDTH, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader, Button } from '../../components';
import GlassView from '../../components/GlassWrapper';
import { fontFamilies } from '../../utils/fontFamilies';
import { routes } from '../../navigation/routes';
import { calendarIcon, chevronIcon } from '../../assets/icons';
import { useMood } from '../../api/apiHooks/useMood';
import { Loader } from '../../components/Loader';
import { useFocusEffect } from '@react-navigation/native';
import { MoodEntry } from '../../types/apiPayloadsTypes';

type MoodLevel = 'Good' | 'Great' | 'Natural' | 'Low';

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

const VenterMonthlyMood = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { getMoodHistory } = useMood();

  const initial = useMemo(() => {
    const d = new Date();
    return { year: d.getFullYear(), monthIndex: d.getMonth(), day: d.getDate() };
  }, []);

  const [currentYear, setCurrentYear] = useState(initial.year);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(initial.monthIndex);
  const [selectedDay, setSelectedDay] = useState<number>(initial.day);
  const [moodByDay, setMoodByDay] = useState<Record<number, MoodEntry>>({});
  const [loading, setLoading] = useState(false);

  const fetchMonthlyMoods = async () => {
    setLoading(true);
    try {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const startDate = `${currentYear}-${pad(currentMonthIndex + 1)}-01`;
      const lastDay = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
      const endDate = `${currentYear}-${pad(currentMonthIndex + 1)}-${pad(lastDay)}`;

      const response = await getMoodHistory(100, 0, startDate, endDate);

      if (response?.moods) {
        const mapped: Record<number, MoodEntry> = {};
        response.moods.forEach(mood => {
          // logged_date represents the user's intended calendar date.
          // Extract only the date part (YYYY-MM-DD) to avoid UTC midnight
          // shifting to the previous day in negative UTC-offset timezones.
          const rawDate = mood.logged_date || mood.created_at || new Date().toISOString();
          const datePart = rawDate.split('T')[0]; // "2026-02-28"
          const [y, m, d] = datePart.split('-').map(Number);

          const localYear = y;
          const localMonth = m - 1; // JS months are 0-indexed
          const localDay = d;

          if (localYear === currentYear && localMonth === currentMonthIndex) {
            mapped[localDay] = mood;
          }
        });
        setMoodByDay(mapped);
      }
    } catch (error) {
      console.error('Error fetching monthly moods:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMonthlyMoods();
    }, [currentYear, currentMonthIndex])
  );

  const selectedEntry = moodByDay[selectedDay];
  const selectedMood = selectedEntry?.mood_type;
  const selectedNote = selectedEntry?.notes;

  const handleBack = () => navigation.goBack();

  const goPrevMonth = () => {
    const d = new Date(currentYear, currentMonthIndex, 1);
    d.setMonth(d.getMonth() - 1);
    setCurrentYear(d.getFullYear());
    setCurrentMonthIndex(d.getMonth());
  };

  const goNextMonth = () => {
    const d = new Date(currentYear, currentMonthIndex, 1);
    d.setMonth(d.getMonth() + 1);
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
      paddingTop: hp(2),
    },
    monthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: hp(1.5),
    },
    monthText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
    },
    monthBtn: {
      paddingHorizontal: wp(2),
      paddingVertical: hp(0.8),
      borderRadius: hp(1),
    },
    monthBtnText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.4),
      color: theme.white,
    },
    calendarCard: {
      paddingVertical: hp(1),
      paddingHorizontal: wp(2),
      backgroundColor: theme.black + "08",
      marginBottom: hp(2),
      justifyContent: "center",
      alignItems: "center"
    },
    dayLabelsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignSelf: 'center',
      gap: hp(.5),
    },
    dayLabel: {
      width: hp(5),
      height: hp(5),

      textAlign: 'center',
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
      color: theme.white,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignSelf: "center",
      gap: hp(.5)

    },
    cell: {
      width: hp(5),
      height: hp(5),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: hp(1),
      borderRadius: hp(999),
    },
    cellText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.4),
      color: theme.white,
    },
    moodPill: {
      justifyContent: "center",
      alignItems: "center",
      borderRadius: hp(999),
    },
    moodPillText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.2),
      color: theme.black,
    },
    selectedCard: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.4),
      backgroundColor: theme.black + "08",
      marginBottom: hp(2.5),
    },
    selectedDate: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white,
      marginBottom: hp(0.8),
    },
    selectedMoodText: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.2),
      color: theme.white,
      marginBottom: hp(0.6),
    },
    selectedNote: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.5),
      color: theme.white + "cc",
      lineHeight: hp(2.1),
    },
    iconStyles: {
      width: hp(2),
      height: hp(2),
      resizeMode: "contain",
      tintColor: theme.white + "cc",

    }
  });
  const getMoodColors = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'happy':
      case 'good':
      case 'great':
        return { bg: theme.moodHappyBG, text: theme.moodHappyText };
      case 'neutral':
      case 'natural':
        return { bg: theme.moodNeutralBG, text: theme.moodNeutralText };
      case 'sad':
      case 'low':
        return { bg: theme.moodSadBG, text: theme.moodSadText };
      case 'anxious':
        return { bg: theme.moodAnxiousBG, text: theme.moodAnxiousText };
      case 'mad':
        return { bg: theme.moodMadBG, text: theme.moodMadText };
      default:
        return { bg: theme.white + '20', text: theme.white };
    }
  };

  return (
    <HomeWrapper key={langKey}>
      <ScreenHeader title={t('VenterMoodMonthly.title')} onBackPress={handleBack} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <GlassView bordered radius={hp(1.8)} glassStyles={styles.calendarCard}>

          <View style={styles.monthRow}>
            <TouchableOpacity style={styles.monthBtn} onPress={goPrevMonth}>
              <Image source={chevronIcon} style={[styles.iconStyles, {
                transform: [{ rotate: '90deg' }]
              }]} />
            </TouchableOpacity>
            <View style={{ flexDirection: "row", alignItems: "center", gap: hp(1) }}>
              <Image source={calendarIcon} style={{ width: hp(1.5), height: hp(1.5), resizeMode: "contain", tintColor: theme.white }} />
              <Text style={styles.monthText}>{formatMonthYear(currentYear, currentMonthIndex)}</Text>
            </View>
            <TouchableOpacity style={styles.monthBtn} onPress={goNextMonth}>
              <Image source={chevronIcon} style={[styles.iconStyles, {
                transform: [{ rotate: '-90deg' }]
              }]} />
            </TouchableOpacity>
          </View>

          <View style={styles.dayLabelsRow}>
            {dayLabels.map((d) => (
              <Text key={d} style={styles.dayLabel}>
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((c, idx) => {
              if (!c.day) {
                return <View key={idx} style={styles.cell} />;
              }

              const now = new Date();
              const isToday =
                c.day === now.getDate() &&
                currentMonthIndex === now.getMonth() &&
                currentYear === now.getFullYear();

              const moodEntry = moodByDay[c.day];
              const mood = moodEntry?.mood_type?.toLowerCase();
              const isSelected = c.day === selectedDay;
              const moodColors = mood ? getMoodColors(mood) : null;

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.cell,
                    isToday && !isSelected && {
                      borderWidth: 2,
                      borderColor: theme.white,
                    },
                    mood && !isSelected && {
                      backgroundColor: moodColors?.bg,
                    },
                    isSelected && { backgroundColor: theme.selectedOption },
                  ]}
                  onPress={() => setSelectedDay(c.day!)}
                >
                  <View style={styles.moodPill}>
                    {(!mood || isSelected) && <Text style={[styles.cellText, isSelected && { color: theme.white, fontFamily: fontFamilies.semiBold }]}>{c.day}</Text>}
                    {mood && !isSelected ? (
                      <Text style={[styles.moodPillText, {
                        color: moodColors?.text
                      }]}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassView>

        <GlassView bordered radius={hp(1.8)} glassStyles={styles.selectedCard}>
          <Text style={styles.selectedDate}>
            {new Date(currentYear, currentMonthIndex, selectedDay).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.selectedMoodText}>{selectedMood || t('VenterMoodMonthly.noMood')}</Text>
          {selectedNote ? (
            <Text style={styles.selectedNote}>{selectedNote}</Text>
          ) : !selectedMood ? null : (
            <Text style={styles.selectedNote}>{t('VenterMoodMonthly.sampleNote')}</Text>
          )}
        </GlassView>


        <View style={{ height: hp(4) }} />
      </ScrollView>
      <Loader isVisible={loading} />
    </HomeWrapper>
  );
};

export default VenterMonthlyMood;
