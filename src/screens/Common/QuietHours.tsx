import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader, Input, Button, GlassModal, Dropdown, Loader } from '../../components';
import GlassView from '../../components/GlassWrapper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getKeyboardAwareContentStyle, getKeyboardAwareScrollViewProps } from '../../utils/keyboard';
import { tickIcon } from '../../assets/icons';
import { fontFamilies } from '../../utils/fontFamilies';
import { useNotifications } from '../../api/apiHooks/useNotifications';
import { ActivityIndicator, Modal } from 'react-native';

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 === 0 ? 12 : i % 12;
  const ampm = i < 12 ? 'AM' : 'PM';
  const displayTime = `${hour}:00 ${ampm}`;
  // Keep value in HH:mm format for easier conversion/tracking if needed, 
  // but for consistency with previous screen I'll use display format as value for now
  return { label: displayTime, value: displayTime };
});

const QuietHours = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [addedQuietHours, setAddedQuietHours] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { getSettings, updateSettings } = useNotifications();

  const convertToUTC = (timeStr: string) => {
    if (!timeStr) return '';
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    const utcHours = date.getUTCHours().toString().padStart(2, '0');
    const utcMinutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${utcHours}:${utcMinutes}`;
  };

  const convertToLocal = (utcStr: string) => {
    if (!utcStr) return '';
    const [hours, minutes] = utcStr.split(':').map(Number);
    const date = new Date();
    date.setUTCHours(hours, minutes, 0, 0);

    let localHours = date.getHours();
    const localMinutes = date.getMinutes().toString().padStart(2, '0');
    const period = localHours >= 12 ? 'PM' : 'AM';
    localHours = localHours % 12 || 12;
    return `${localHours}:${localMinutes} ${period}`;
  };

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        if (response?.success && response.data) {
          const s = response.data;
          setStartTime(convertToLocal(s.quietHoursStartUtc));
          setEndTime(convertToLocal(s.quietHoursEndUtc));
        }
      } catch (error) {
        console.error('Failed to fetch quiet hours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  React.useEffect(() => {
    if (addedQuietHours) {
      const timer = setTimeout(() => {
        setAddedQuietHours(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [addedQuietHours]);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const payload = {
        quietHoursStartUtc: convertToUTC(startTime),
        quietHoursEndUtc: convertToUTC(endTime),
      };
      const response = await updateSettings(payload);
      if (response?.success) {
        setAddedQuietHours(true);
      }
    } catch (error) {
      console.error('Failed to save quiet hours:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    description: {
      color: theme.white + "cc",
      fontSize: hp(1.8),
      lineHeight: hp(2.2),
      marginBottom: hp(3),
      fontFamily: fontFamilies.normal,
    },
    fieldTitle: {
      color: theme.white,
      fontSize: hp(1.8),
      marginBottom: hp(1.5),
      fontFamily: fontFamilies.medium,
    },
    dropdownWrapper: {
      marginBottom: hp(2.5),
      backgroundColor: theme.black + '20',
      paddingHorizontal: wp(4),
    },
    dropdownSubContainer: {
      borderBottomWidth: 0,
      height: hp(6),
    },
    selectedText: {
      color: theme.white,
      fontSize: hp(1.7),
      fontFamily: fontFamilies.normal,
    },
    placeholderText: {
      color: theme.white60,
      fontSize: hp(1.7),
      fontFamily: fontFamilies.normal,
    },
    buttonGlass: {
      marginTop: hp(6),
    },
    buttonTitle: {
      color: theme.white,
    },
  });

  return (
    <HomeWrapper>
      <ScreenHeader title={t('QuietHours.title')} onBackPress={handleBack} />
      <KeyboardAwareScrollView
        {...getKeyboardAwareScrollViewProps()}
        contentContainerStyle={[getKeyboardAwareContentStyle(), {
          paddingHorizontal: wp(5),
          paddingTop: hp(2)
        }]}

      >
        <Text style={styles.description}>{t('QuietHours.description')}</Text>

        <Text style={styles.fieldTitle}>{t('QuietHours.startTime')}</Text>
        <GlassView bordered radius={hp(999)} glassStyles={styles.dropdownWrapper}>
          <Dropdown
            options={timeOptions}
            value={startTime}
            onSelect={setStartTime}
            placeholder={t('QuietHours.placeholder')}
            subContainerStyle={styles.dropdownSubContainer}
            selectedTextStyle={styles.selectedText}
            placeholderStyle={styles.placeholderText}
          />
        </GlassView>

        <Text style={styles.fieldTitle}>{t('QuietHours.endTime')}</Text>
        <GlassView bordered radius={hp(999)} glassStyles={styles.dropdownWrapper}>
          <Dropdown
            options={timeOptions}
            value={endTime}
            onSelect={setEndTime}
            placeholder={t('QuietHours.placeholder')}
            subContainerStyle={styles.dropdownSubContainer}
            selectedTextStyle={styles.selectedText}
            placeholderStyle={styles.placeholderText}
          />
        </GlassView>
        <View style={{ flex: 1 }} />
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginBottom: hp(4) }} />
        ) : (
          <Button
            title={t('QuietHours.addButton')}
            onPress={handleSave}
            disabled={!startTime || !endTime}
            buttonStyle={{}}
            titleStyle={styles.buttonTitle}
            glassStyles={styles.buttonGlass}
          />
        )}
      </KeyboardAwareScrollView>
      <GlassModal
        showButtons={false}
        glassStyle={{
          backgroundColor: theme.black + "30",
        }}
        title={t('QuietHours.addedTitle')}
        message={t('QuietHours.addedDescription')}
        icon={tickIcon}
        iconBorder={false}
        visible={addedQuietHours}
        onClose={() => setAddedQuietHours(false)}
      />
      <Loader isVisible={isUpdating} />
    </HomeWrapper>
  );
};

export default QuietHours;
