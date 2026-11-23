import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp, WINDOW_HEIGHT } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import GlassWrapper from '../../components/GlassWrapper';
import Button from '../../components/Button';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getKeyboardAvoidingViewProps } from '../../utils/keyboard';
import GlassModal from '../../components/shared/GlassModal';
import { tickIcon } from '../../assets/icons';
import { useReflections } from '../../api/apiHooks/useReflections';
import { ActivityIndicator } from 'react-native';

const VenterAddReflection = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { theme } = useTheme();
  const { saveReflection } = useReflections();

  const isEditMode = Boolean((route.params as any)?.editMode);
  const existingReflection = (route.params as any)?.reflection;

  const [reflection, setReflection] = useState(existingReflection?.reflection_text || '');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

    const handleReflectionChange = (text: string) => {
      setReflection(text);
      try { AsyncStorage.setItem('reflection_draft', text); } catch {}
    };

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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    AsyncStorage.removeItem('reflection_draft').catch(() => {});
    if (reflection.trim().length === 0) return;

    setLoading(true);
    try {
      await saveReflection({ reflection_text: reflection });
      setShowSuccessModal(true);
    } catch (error) {
      console.log('Error saving reflection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const styles = StyleSheet.create({
    content: {
      width: '100%',
      height: WINDOW_HEIGHT - hp(20),
      paddingHorizontal: wp(5),
    },
    cardContainer: {
      flex: 1,
      paddingTop: hp(3),
      justifyContent: "center",

    },
    card: {
      paddingHorizontal: wp(6),
      paddingVertical: hp(3),
      borderRadius: hp(3),
      minHeight: hp(30),
    },
    label: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(2),
      textAlign: 'center',
    },
    textInput: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white,
      textAlignVertical: 'top',
      minHeight: hp(25),
      lineHeight: hp(2.8),
      textAlign: "center",
    },
    characterCount: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white60,
      textAlign: 'right',
      marginTop: hp(1),
    },
    buttonContainer: {
      paddingHorizontal: wp(5),
      paddingBottom: hp(3),
      gap: hp(2),
    },
  });

  const maxLength = 500;

  return (
    <HomeWrapper>
      <ScreenHeader
        title={isEditMode ? t('VenterHome.editReflection') : t('VenterHome.addReflection')}
        onBackPress={handleBack}
      />

      <KeyboardAwareScrollView
        {...getKeyboardAvoidingViewProps}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
        {reflection.length === 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(2), marginBottom: hp(2) }}>
            {[t("VenterHome.reflectionStarter1"), t("VenterHome.reflectionStarter2"), t("VenterHome.reflectionStarter3")].map((prompt) => (
              <TouchableOpacity
                key={prompt}
                onPress={() => setReflection(prompt)}
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: hp(3), paddingHorizontal: wp(3), paddingVertical: hp(0.8), borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)' }}
              >
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: hp(1.4), fontFamily: fontFamilies.normal }}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <TextInput
          style={styles.textInput}
          value={reflection}
          onChangeText={handleReflectionChange}
          placeholder={t('VenterHome.reflectionPlaceholder', 'What brought you here today? Take a moment to capture your thoughts...')}
          placeholderTextColor={theme.white60}
          multiline
          maxLength={maxLength}
          autoFocus
        />
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: hp(1.3), fontFamily: fontFamilies.normal, textAlign: 'right', marginTop: hp(1) }}>
          {reflection.length}/{maxLength}
        </Text>


        </View>
      </KeyboardAwareScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title={isEditMode ? t('VenterHome.editReflection') : t('VenterHome.saveReflection')}
          loading={loading}
          onPress={handleSave}
          buttonStyle={{}}
          titleStyle={{}}
          disabled={reflection.trim().length === 0 || loading}
          glassStyles={{}}
          leftIcon={undefined}
          iconStyle={{}}
        />
      </View>

      {/* Success Modal */}
      <GlassModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        icon={tickIcon}
        iconBorder={false}
        title={t('VenterHome.reflectionSuccess.title')}
        message={t('VenterHome.reflectionSuccess.message')}
        showButtons={false}
        dismissOnOverlayPress={false}
        dismissOnBackPress={false}
        animationType="fade"
      />
    </HomeWrapper>
  );
};

export default VenterAddReflection;
