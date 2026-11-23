import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader, Button } from '../../components';
import GlassView from '../../components/GlassWrapper';
import { fontFamilies } from '../../utils/fontFamilies';
import { routes } from '../../navigation/routes';
import { useMood } from '../../api/apiHooks/useMood';
import { toastError, toastSuccess } from '../../utils/toast';
import { Loader } from '../../components/Loader';
import { trashIcon } from '../../assets/icons';

const VenterMoodDetails = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { deleteMood } = useMood();

  const [loading, setLoading] = React.useState(false);

  const item = (route.params as any)?.item as {
    id: string;
    mood?: string;
    note?: string;
    time?: string;
    category?: string;
    fullData?: any;
  };

  const handleBack = () => navigation.goBack();

  const handleDelete = async () => {
    if (!item?.id) return;

    setLoading(true);
    try {
      const response = await deleteMood(item.id);
      if (response) {
        toastSuccess({ text: t('VenterMoodDetails.deleteSuccess') || 'Mood deleted successfully' });
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Delete mood error:', error);
      toastError({ text: error?.error || 'Failed to delete mood' });
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    card: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.5),
      backgroundColor: theme.black + '10',
      marginBottom: hp(3),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp(1),
    },
    label: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white,
    },
    value: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white,
    },
    note: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + "90",
      lineHeight: hp(2.1),
      marginTop: hp(1),
    },
  });

  return (
    <HomeWrapper key={langKey}>
      <ScreenHeader
        title={t('VenterMoodDetails.title')}
        onBackPress={handleBack}
        rightComponent={
          <TouchableOpacity onPress={
            handleDelete
          }>
            <Image source={trashIcon} style={{ width: hp(2.5), height: hp(2.5), tintColor: theme.white, resizeMode: "contain" }} />
          </TouchableOpacity>
        }
      />
      <View style={styles.content}>
        <GlassView bordered radius={hp(1.8)} glassStyles={styles.card}>
          <View style={[styles.row, {
            // justifyContent:"center"
          }]}>

            <View style={{ flexDirection: "row", gap: wp(3) }}>
              <Text style={styles.label}>{t('VenterMoodDetails.mood')}</Text>
              <Text style={styles.value}>{item?.mood || '-'}</Text>

            </View>

            <Text style={styles.value}>{item?.time || '-'}</Text>
          </View>

          <View style={[styles.row, { marginBottom: hp(1) }]}>
            <Text style={styles.label}>{t('VenterMoodLog.whatsGoingOn')}</Text>
            <Text style={styles.value}>{item?.category || '-'}</Text>
          </View>

          <View>
            <Text style={styles.label}>{t('VenterMoodDetails.note')}
              <Text style={styles.note}>{" " + item?.note || '-'}</Text>
            </Text>
          </View>
        </GlassView>

        <Button
          title={t('VenterMoodDetails.editEntry')}
          onPress={() => {
            // Check if it's today's mood (approximate check by logged_date or if it's from Home)
            // But we'll let the user decide. Usually only today's mood is editable via API.
            // @ts-ignore
            navigation.navigate(routes.venterMoodLog, {
              editMode: true,
              item: {
                mood: item.mood,
                note: item.note,
                categories: item.category ? [item.category.toLowerCase()] : [],
              }
            });
          }}
          disabled={loading}
          buttonStyle={{ marginBottom: hp(2) }}
          titleStyle={{}}
          glassStyles={{}}
          borderedGlassButton={true}
        />


      </View>
      <Loader isVisible={loading} />
    </HomeWrapper>
  );
};

export default VenterMoodDetails;
