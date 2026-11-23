import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader, Button } from '../../components';
import SettingsItem from '../../components/shared/SettingsItem';
import GlassView from '../../components/GlassWrapper';
import { fontFamilies } from '../../utils/fontFamilies';
import { routes } from '../../navigation/routes';
import { calendarIcon, calenderIcon2 } from '../../assets/icons';
import { useMood } from '../../api/apiHooks/useMood';
import { useFocusEffect } from '@react-navigation/native';
import { Loader } from '../../components/Loader';
import EmptyState from '../../components/shared/EmptyState';

const VenterMoods = () => {
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

  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const fetchRecentMoods = async () => {
    setLoading(true);
    try {
      const response = await getMoodHistory(5, 0);
      if (response?.moods) {
        setItems(response.moods);
      }
    } catch (error) {
      console.error('Error fetching recent moods:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchRecentMoods();
    }, [])
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    sectionTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(1.2),
      marginTop: hp(1.5),
    },
    card: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(1),
      backgroundColor: theme.black + '20',
      marginBottom: hp(1.5),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(1.2),
    },
    rowText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.7),
      color: theme.white,
    },
    rowRight: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.7),
      color: theme.white,
    },
    footer: {
      marginTop: hp(4),
      marginBottom: hp(2),
    },
  });

  return (
    <HomeWrapper key={langKey}>
      <ScreenHeader title={t('VenterYourMood.title')} onBackPress={handleBack}
        rightComponent={
          <TouchableOpacity onPress={() => {
            (navigation as any).navigate(routes.venterMonthlyMood);
          }}>
            <Image source={calenderIcon2} style={{ width: hp(2.5), height: hp(2.5), resizeMode: "contain", tintColor: theme.white }} />
          </TouchableOpacity>
        }
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <GlassView bordered radius={hp(1.8)} glassStyles={styles.card}>
          <SettingsItem
            title={t('VenterYourMood.todaysMood')}
            onPress={() => {
              (navigation as any).navigate(routes.venterMoodLog);
            }}
          />
        </GlassView>

        <Text style={styles.sectionTitle}>{t('VenterYourMood.recentMoods')}</Text>
        <GlassView bordered radius={hp(1.8)} glassStyles={styles.card}>

          <FlatList
            data={items}
            renderItem={({ item, index }) => (
              <View key={item.id || index} style={[styles.row, index < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.white + '15' }]}>
                <Text style={styles.rowText}>{formatDate(item.logged_date || item.created_at)}</Text>
                <Text style={styles.rowRight}>{item.mood_type}</Text>
              </View>
            )}
            keyExtractor={(item, index) => item.id || index.toString()}
            ListEmptyComponent={() => {
              return loading ? <Loader isVisible={loading} /> : <EmptyState
                title={t('VenterMoodHistory.noMoods')}
                description={t('VenterMoodHistory.noMoodsDescription')}

              />
            }}
          />

        </GlassView>
        <View style={{ flex: 1 }} />
        <View style={styles.footer}>
          <Button
            title={t('VenterYourMood.moodHistory')}
            onPress={() => {
              (navigation as any).navigate(routes.venterMoodHistory);
            }}
            disabled={false}
            buttonStyle={{}}
            titleStyle={{}}
            glassStyles={{}}
          />
        </View>
      </ScrollView>
      {/* <Loader isVisible={loading} /> */}
    </HomeWrapper>
  );
};

export default VenterMoods;
