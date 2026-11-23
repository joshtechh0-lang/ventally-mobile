import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, TextInput, Image } from 'react-native';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import { happyIcon, neutralIcon, sadIcon, axiousIcon, tickIcon, madIcon } from '../../assets/icons';
import ScreenHeader from '../../components/shared/ScreenHeader';
import MoodSelector from '../../components/shared/MoodSelector';
import Button from '../../components/Button';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { GlassWrapper } from '../../components';
import { fontFamilies } from '../../utils/fontFamilies';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getKeyboardAwareScrollViewProps } from '../../utils/keyboard';
import { routes } from '../../navigation/routes';
import GlassModal from '../../components/shared/GlassModal';
import { useMood } from '../../api/apiHooks/useMood';
import { toastError, toastSuccess } from '../../utils/toast';
import { Loader } from '../../components/Loader';

const VenterMoodLog = ({ route }: any) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { getTodayMood, logMood, updateTodayMood } = useMood();

  const [isEditMode, setIsEditMode] = useState(Boolean((route.params as any)?.editMode));
  const editItem = (route.params as any)?.item as
    | { mood?: string; note?: string; categories?: string[] }
    | undefined;
  const initialMood = ((route.params as any)?.selectedMood as string) ?? null;
  console?.log('----__-__-_>' , route?.params)
  const [selectedMood, setSelectedMood] = useState<string | null>(initialMood);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    const checkTodayMood = async () => {
      console?.log('----__-__-_>' , initialMood)
      // If we are already in edit mode from params, don't check again
      if (isEditMode) return;

      setLoading(true);
      try {
        const response = await getTodayMood();
        if (response?.mood) {
          setIsEditMode(true);
          if (!initialMood) {
            // setSelectedMood(response.mood.mood_type?.toLowerCase() || null);
            setSelectedMood(initialMood);
          }
          // setSelectedCategory();
          setNotes(response.mood.notes || '');
        } else {
          // if (__DEV__ && !initialMood) {
          //   setNotes("test notes")
          //   setSelectedMood("happy")
          //   setSelectedCategory("work")
          // }
        }
      } catch (error) {
        console.log('Error checking today mood:', error);
        // if (__DEV__ && !initialMood) {
        //   setNotes("test notes")
        //   setSelectedMood("happy")
        //   setSelectedCategory("work")
        // }
      } finally {
        setLoading(false);
      }
    };

    checkTodayMood();
  }, []);

  useEffect(() => {
    if (!isEditMode || !editItem) return;
    if (editItem?.mood && !initialMood) {
      setSelectedMood(initialMood || editItem.mood.toLowerCase());
    }
    if (editItem?.categories && Array.isArray(editItem.categories) && editItem.categories.length > 0) {
      setSelectedCategory(editItem.categories[0]);
    }
    if (typeof editItem?.note === 'string') {
      setNotes(editItem.note);
    }
  }, [editItem, isEditMode]);

  // Auto-dismiss success modal after 3 seconds
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
        navigation.goBack();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, navigation]);
  const moodOptions = [
    { id: 'happy', icon: happyIcon, label: t('VenterHome.moods.happy') },
    { id: 'neutral', icon: neutralIcon, label: t('VenterHome.moods.neutral') },
    { id: 'sad', icon: sadIcon, label: t('VenterHome.moods.sad') },
    { id: 'anxious', icon: axiousIcon, label: t('VenterHome.moods.anxious') },
    { id: 'mad', icon: madIcon, label: t('VenterHome.moods.mad') },
  ];

  const categoryOptions = [
    { id: 'work', label: t('VenterMoodLog.categories.work') },
    { id: 'family', label: t('VenterMoodLog.categories.family') },
    { id: 'health', label: t('VenterMoodLog.categories.health') },
    { id: 'unknown', label: t('VenterMoodLog.categories.unknown') },
  ];

  const handleMoodSelect = (moodId: string) => {
    // Handle deselection (empty string) by setting to null
    setSelectedMood(moodId === '' ? null : moodId);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(prev => (prev === categoryId ? null : categoryId));
  };

  const handleLogMood = async () => {
    if (!selectedMood) {
      toastError({ text: t('VenterMoodLog.errors.selectMoodAndCategory') });
      return;
    }
    if (submittingRef.current) return;

    // Get the selected category or default to "unknown"
    const category = selectedCategory || 'unknown';

    submittingRef.current = true;
    try {
      if (isEditMode) {
        // Update existing mood
        const response = await updateTodayMood({
          mood_type: selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1),
          category: category.charAt(0).toUpperCase() + category.slice(1),
          notes: notes.trim(),
        });

        if (response) {
          // toastSuccess({ text: t('VenterMoodLog.success.updated') || 'Mood updated successfully' });
          setShowSuccessModal(true);
        }
      } else {
        // Log new mood
        const response = await logMood({
          mood_type: selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1),
          category: category.charAt(0).toUpperCase() + category.slice(1),
          notes: notes.trim(),
        });

        if (response) {
          toastSuccess({ text: t('VenterMoodLog.success.logged') || 'Mood logged successfully' });
          setShowSuccessModal(true);
        }
      }
    } catch (error: any) {
      console.error('Mood log error:', error);
      // Handle specific error cases
      if (error?.statusCode === 409) {
        toastError({ text: 'You have already logged your mood for today. You can update it instead.' });
      } else if (error?.statusCode === 403) {
        toastError({ text: 'Only venter profiles can log moods' });
      } else {
        toastError({ text: error?.error || 'Failed to log mood. Please try again.' });
      }
    } finally {
      submittingRef.current = false;
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const styles = StyleSheet.create({
    content: {
      width: "100%",
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: wp(5),

      paddingBottom: hp(20),
    },
    section: {

      marginVertical: hp(4),
      gap: hp(5)
    },
    buttonContainer: {
      // position: 'absolute',
      // bottom: hp(4),
      // left: wp(5),
      // right: wp(5),
      paddingHorizontal: wp(5),
      paddingBottom: hp(3),
      gap: hp(2),
    },
    title: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(2),
      color: theme.white,
      marginBottom: hp(2),
      textAlign: 'center',
    },
    categoriesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: wp(2.5),
      // justifyContent: 'center',x
      marginBottom: hp(2)
    },
    categoryItem: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(1),
      borderRadius: hp(999),
    },
    categoryText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
    },
    textInput: {
      height: hp(10),
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      textAlignVertical: 'top',





    },
  });
  const isSelected = (categoryId: string) => {
    return selectedCategory === categoryId;
  };
  return (
    <HomeWrapper>
      <View style={{
        width: "100%"
      }}>
        <ScreenHeader
          title={isEditMode ? t('VenterMoodLog.editTitle') : t('VenterMoodLog.title')}
          subtitle={t('VenterMoodLog.subtitle')}
          onBackPress={handleBackPress}
        />

      </View>

      <KeyboardAwareScrollView
        {...getKeyboardAwareScrollViewProps()}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mood Selection */}
        <View style={styles.section}>
          <MoodSelector
            moodOptions={moodOptions}
            selectedMood={selectedMood}
            onMoodSelect={handleMoodSelect}
            title=""
          />

          <GlassWrapper bordered style={{
            padding: hp(2)
          }}>

            <Text style={styles.title}>{t('VenterMoodLog.whatsGoingOn')} </Text>
            <View style={styles.categoriesContainer}>
              {categoryOptions.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <GlassWrapper
                    bordered
                    opacity={isSelected(category.id) ? 0.4 : 0.01}
                    style={StyleSheet.flatten([
                      styles.categoryItem,
                      isSelected(category.id) && {
                        backgroundColor: theme.moodHappyBG,
                        borderColor: theme.moodHappyBG,
                      },
                    ])}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        isSelected(category.id) && { color: theme.moodHappyText },
                      ]}
                    >
                      {category.label}
                    </Text>
                  </GlassWrapper>
                </TouchableOpacity>
              ))}
            </View>
            <GlassWrapper bordered style={{
              backgroundColor: theme.white + "10",
              borderRadius: hp(2),
              paddingHorizontal: hp(1)
            }}>

              <TextInput

                style={styles.textInput}
                value={notes}
                onChangeText={setNotes}
                placeholder={t('VenterMoodLog.notesPlaceholder')}
                placeholderTextColor={theme.white + "cc"}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </GlassWrapper>
          </GlassWrapper>

        </View>

        {/* Category Selection */}

        {/* Notes Input */}

        {/* Action Buttons */}
        <View style={[styles.buttonContainer, { paddingHorizontal: 0 }]}>
          <Button
            title={isEditMode ? t('VenterMoodLog.updateMoodLog') : t('VenterMoodLog.logMood')}
            onPress={handleLogMood}
            buttonStyle={{}}
            titleStyle={{}}
            disabled={!selectedMood || loading}
            glassStyles={{}}
            leftIcon={undefined}
            iconStyle={{}}
          // borderedGlassButton={true}
          />
          <Button
            title={t('VenterMoodLog.cancel')}
            onPress={handleCancel}
            buttonStyle={{}}
            titleStyle={{}}
            disabled={loading}
            glassStyles={{}}
            leftIcon={undefined}
            iconStyle={{}}
          // borderedGlassButton={false}
          />
        </View>
      </KeyboardAwareScrollView>

      {/* Success Modal */}
      <GlassModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        icon={tickIcon}
        iconBorder={false}
        title={t('VenterMoodLog.success.title')}
        message={t('VenterMoodLog.success.message')}
        showButtons={false}
        dismissOnOverlayPress={false}
        dismissOnBackPress={false}
        animationType="fade"
      />

      {/* Loading Indicator */}
      <Loader isVisible={loading} />
    </HomeWrapper>
  );
};

export default VenterMoodLog;