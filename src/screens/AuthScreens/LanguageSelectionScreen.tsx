import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useDispatch, useSelector } from 'react-redux';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import { routes } from '../../navigation/routes';
import i18n from '../../locales/i18n';
import GlassView from '../../components/GlassWrapper';
import { setPreferredLanguage } from '../../store/slices/appSlice';
import type { PreferredLanguage } from '../../store/slices/appSlice';
import { RootState } from '../../store';
import apiInstance from '../../api/apiInstance';
import { Loader } from '../../components/Loader';
import {
  english1,
  english2,
  english3,
  spanish1,
  spanish2,
  spanish3,
  portuguese1,
  portuguese2,
  portuguese3,
  french1,
  french2,
  french3,
} from '../../assets/icons';
import { ScreenHeader } from '../../components';
import { setUser } from '../../store/slices/userSlice';

interface LanguageOption {
  id: string;
  name: string;
  flags: any[];
}

const LanguageSelectionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFromSettings = (route.params as any)?.isFromSettings;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const storedLanguage = useSelector((state: RootState) => state.app.preferredLanguage);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(storedLanguage);
  const { user } = useSelector((state: RootState) => state.user)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (storedLanguage) {
      setSelectedLanguage(storedLanguage);
    }
  }, [storedLanguage]);

  const languages: LanguageOption[] = [
    {
      id: 'en',
      name: t('LanguageSelection.languages.english'),
      flags: [english1, english2, english3],
    },
    {
      id: 'pt',
      name: t('LanguageSelection.languages.portuguese'),
      flags: [portuguese1, portuguese2, portuguese3],
    },
    {
      id: 'fr',
      name: t('LanguageSelection.languages.french'),
      flags: [french1, french2, french3],
    },
    {
      id: 'es',
      name: t('LanguageSelection.languages.spanish'),
      flags: [spanish1, spanish2, spanish3],
    },
  ];

  const handleLanguageSelect = (languageId: string) => {
    setSelectedLanguage(languageId);
  };

  const handleStart = async (languageId: string) => {
    setLoading(true);
    try {
      dispatch(setPreferredLanguage(languageId as PreferredLanguage));
      dispatch(setUser({...user} as any))
      await i18n.changeLanguage(languageId);

      // Update preferred language on the backend
      await apiInstance.put('auth/profile', {
        preferredLanguage: languageId,
      });

      if (isFromSettings) {
        navigation.goBack();
      } else {
        navigation.navigate(routes.termsAndConditions as never);
      }
    } catch (error) {
      console.error('Language change error:', error);
      // Even if API fails, we still want to change the local language and navigate
      if (isFromSettings) {
        navigation.goBack();
      } else {
        navigation.navigate(routes.termsAndConditions as never);
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(4),
      justifyContent: "center",
      alignItems: "center"
    },
    header: {
      marginBottom: hp(4),
      width: "100%"
    },
    greeting: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.5),
      color: theme.white,
      marginBottom: hp(0.5),
      // textAlign: "left"
    },
    subtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white + "cc",
      opacity: 0.9,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: hp(4),
      alignSelf: 'center'
    },
    card: {
      width: wp(42),
      borderRadius: hp(2),
      paddingVertical: hp(3),
      paddingHorizontal: wp(4),
      marginBottom: hp(2.5),
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedCard: {
      borderWidth: hp(0.15),
      borderColor: theme.white + '40',
    },
    languageName: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.9),
      color: theme.white,
      marginBottom: hp(2),
      textAlign: 'center',
    },
    flagsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: hp(2.5),
      gap: wp(2),
    },
    flag: {
      width: hp(4.5),
      height: hp(4.5),
      borderRadius: hp(2.25),
      resizeMode: 'cover',
    },
    startButtonWrapper: {
      width: '100%',
      marginTop: hp(1),
    },
  });
  const name = user?.displayName ? user?.displayName : user?.email?.split("@")?.length > 0 ? user?.email?.split("@")[0] : "Unknown"

  return (
    <AuthWrapper key={langKey}>
      <Loader isVisible={loading} />
      <View style={{ width: "100%" }}>
        <ScreenHeader title="" />

      </View>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{t('LanguageSelection.greeting')} {name}</Text>
          <Text style={styles.subtitle}>{t('LanguageSelection.subtitle')}</Text>
        </View>

        {/* Language Grid */}
        <View style={styles.grid}>
          {languages.map((language) => {
            const isSelected = selectedLanguage === language.id;
            return (
              <GlassView
                key={language.id}
                style={StyleSheet.flatten([
                  styles.card,
                  isSelected && styles.selectedCard,
                ])}
                radius={hp(2)}
              >
                <TouchableOpacity
                  style={{ width: '100%', alignItems: 'center' }}
                  onPress={() => handleLanguageSelect(language.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.languageName}>{language.name}</Text>

                  <View style={styles.flagsContainer}>
                    {language.flags.map((flag, index) => (
                      <Image
                        key={index}
                        source={flag}
                        style={styles.flag}
                        resizeMode="cover"
                      />
                    ))}
                  </View>

                  <View style={styles.startButtonWrapper}>
                    <Button
                      title={t('Common.start')}
                      onPress={() => {
                        handleLanguageSelect(language.id);
                        // Navigate after selection
                        handleStart(language.id);
                      }}
                      buttonStyle={{
                        height: hp(3.5),
                      }}
                      titleStyle={{
                        fontSize: hp(1.6),
                        fontFamily: fontFamilies.medium,
                      }}
                      disabled={loading}
                      glassStyles={{
                        height: hp(4),

                        width: '100%',
                      }}
                    />
                  </View>
                </TouchableOpacity>
              </GlassView>
            );
          })}
        </View>
      </ScrollView>
    </AuthWrapper>
  );
};

export default LanguageSelectionScreen;
