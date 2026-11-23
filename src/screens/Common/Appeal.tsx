import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Pressable, Modal } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { alpha, hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader, Input, Button } from '../../components';
import GlassView from '../../components/GlassWrapper';
import GlassModal from '../../components/shared/GlassModal';
import { chatIcon, userIcon, x, tickIcon } from '../../assets/icons';
import { fontFamilies } from '../../utils/fontFamilies';
import { useSupport } from '../../api/apiHooks/useSupport';
import { toastError } from '../../utils/toast';
import { Loader } from '../../components/Loader';

let pick: any = null;
let isLibraryInstalled = false;

try {
  const documentPicker = require('@react-native-documents/picker');
  pick = documentPicker.pick;
  isLibraryInstalled = true;
} catch (error) {
  isLibraryInstalled = false;
}

const Appeal = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [reportId, setReportId] = useState('');
  const [summary, setSummary] = useState('');
  const [pickedFile, setPickedFile] = useState<{ name?: string; uri?: string; type?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { submitListenerAppeal } = useSupport();

  // Auto-dismiss success modal after 3 seconds and navigate back
  React.useEffect(() => {
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

  const handleSubmit = async () => {
    if (!emailOrPhone.trim()) {
      toastError({ text: t('Common.emailRequired') || 'Email/Phone is required' });
      return;
    }
    if (!summary.trim()) {
      toastError({ text: t('Common.summaryRequired') || 'Summary is required' });
      return;
    }
    if (!pickedFile?.uri) {
      toastError({ text: t('Common.documentRequired') || 'Please attach a document (PDF, DOC, or DOCX)' });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+\d\s\-()]{7,}$/;
    if (!emailRegex.test(emailOrPhone.trim()) && !phoneRegex.test(emailOrPhone.trim())) {
      toastError({ text: t('Common.invalidEmail') || 'Please enter a valid email address or phone number' });
      return;
    }

    setLoading(true);
    try {
      await submitListenerAppeal({
        contact: emailOrPhone.trim(),
        reportId: reportId.trim(),
        summary: summary.trim(),
        document: {
          uri: pickedFile.uri,
          name: pickedFile.name || `document_${Date.now()}`,
          type: pickedFile.type || 'application/pdf',
        },
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('[Appeal] Error submitting listener appeal', error);
      toastError({ text: error?.message || t('Common.somethingWentWrong') });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSelection = async () => {

    if (!isLibraryInstalled) {
      Alert.alert(
        'Library Not Installed',
        'The document picker library is not installed. Please install @react-native-documents/picker to use this feature.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsUploading(true);
      const [pickResult] = await pick({
        mode: 'open',
        type: ['application/pdf'],
        allowsMultipleSelection: false,
        allowsEditing: false,
      });

      setPickedFile({
        name: pickResult?.name,
        uri: pickResult?.uri,
        type: pickResult?.type,
      });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        const message = (err as any)?.message;
        if (typeof message === 'string' && message.toLowerCase().includes('cancel')) return;
      }
      toastError({ text: t('Common.failed') || `Failed to pick document` });
    } finally {
      setIsUploading(false);
    }
  };

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(1),
    },
    headerIconWrap: {
      alignSelf: 'center',

      marginBottom: hp(1.5),
      width: hp(6),
      height: hp(6),
      borderRadius: hp(1.5),
      backgroundColor: theme.white + '10',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.white + '20',
    },
    headerIcon: {
      width: hp(5),
      height: hp(5),

      resizeMode: 'contain',
    },
    subtitle: {
      color: theme.white + "cc",
      fontSize: hp(1.6),
      lineHeight: hp(2.2),
      textAlign: 'center',
      marginBottom: hp(3),
      // paddingHorizontal: wp(6),
      fontFamily: fontFamilies.normal,
    },
    fieldTitle: {
      color: theme.white,
      fontSize: hp(1.8),
      marginBottom: hp(1),
      marginTop: hp(0.8),
      fontFamily: fontFamilies.medium,
    },
    inputWrapper: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(0.2),
      marginBottom: hp(2.2),
      backgroundColor: theme.black + '1',
    },
    input: {
      paddingRight: 0,
      color: theme.white,
    },
    inputContainer: {
      borderBottomWidth: 0,
      height: hp(5.5),
    },
    summaryInputContainer: {
      borderBottomWidth: 0,
      height: hp(10),
      alignItems: 'flex-start',
      paddingTop: hp(1.2),
    },
    uploadBox: {
      // height: hp(12),

      justifyContent: 'center',
      alignItems: 'center',
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: theme.white + '40',
      backgroundColor: theme.white + '18',
      marginBottom: hp(1),
      padding: hp(2),
    },
    uploadTitle: {
      color: theme.white + "cc",
      fontSize: hp(1.6),
      textAlign: 'center',
      marginTop: hp(1.2),
      lineHeight: hp(2.2),
      fontFamily: fontFamilies.normal,
    },
    uploadedFile: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: wp(3),
      backgroundColor: `${theme.white}${alpha(10)}`,
      borderRadius: hp(1),
      // marginBottom: hp(2),
      // marginTop: hp(1),
    },
    uploadedFileName: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.5),
      color: theme.white,
      flex: 1,
    },
    buttonTitle: {
      color: theme.white,
    },
    buttonGlass: {
      marginTop: hp(3),
      marginBottom: hp(2),
    },
    closeIcon: {
      width: hp(2),
      height: hp(2),
      resizeMode: 'contain',
    },
    closeIconCon: {
      width: hp(3),
      height: hp(3),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.white + '18',
      borderRadius: hp(999),
    },
    uploadIcon: {
      width: hp(2),
      height: hp(2),
      resizeMode: 'contain',
      alignSelf: 'center',
    },
    uploadIconCon: {
      width: hp(4),
      height: hp(4),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.white + '10',
      borderRadius: hp(999),
      alignSelf: 'center',
    },
    title: {
      fontSize: hp(2.3),
      fontFamily: fontFamilies.medium,
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(1),
    },
    modalOption: {
      width: '100%',
      paddingVertical: hp(2),
      borderBottomWidth: 1,
      borderColor: theme.white + '20',
      alignItems: 'center',
    },
    modalOptionText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
    },
  });

  return (
    <HomeWrapper>
      <Loader isVisible={loading || isUploading} />
      <ScreenHeader title={""} onBackPress={handleBack} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>
          {t('Appeal.title')}
        </Text>
        <Text style={styles.subtitle}>{t('Appeal.subtitle')}</Text>

        <Text style={styles.fieldTitle}>{t('Appeal.emailOrPhone')}</Text>
        <GlassView bordered radius={hp(999)} glassStyles={styles.inputWrapper}>
          <Input
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            placeholder={t('Appeal.emailOrPhonePlaceholder')}
            placeholderTextColor={theme.white60}
            noTitle
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
          />
        </GlassView>

        <Text style={styles.fieldTitle}>{t('Appeal.reportId')}</Text>
        <GlassView bordered radius={hp(999)} glassStyles={styles.inputWrapper}>
          <Input
            value={reportId}
            onChangeText={setReportId}
            placeholder={t('Appeal.reportIdPlaceholder')}
            placeholderTextColor={theme.white60}
            noTitle
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
          />
        </GlassView>

        <Text style={styles.fieldTitle}>{t('Appeal.summary')}</Text>
        <GlassView bordered radius={hp(2)} glassStyles={styles.inputWrapper}>
          <Input
            value={summary}
            onChangeText={setSummary}
            placeholder={t('Appeal.summaryPlaceholder')}
            placeholderTextColor={theme.white60}
            noTitle
            inputStyle={styles.input}
            inputContainerStyle={styles.summaryInputContainer}
            multiline
            textAlignVertical="top"
          />
        </GlassView>

        <Text style={styles.fieldTitle}>{t('Appeal.letterUpload')}</Text>
        <GlassView bordered radius={hp(2)} glassStyles={styles.uploadBox}>
          <TouchableOpacity onPress={handleDocumentSelection} disabled={isUploading}>
            <GlassView glassStyles={styles.uploadIconCon}>
              <Image source={userIcon} style={styles.uploadIcon} />
            </GlassView>
            <Text style={styles.uploadTitle}>
              {t('Appeal.uploadHint', { defaultValue: 'Tap to attach a PDF file' })}
            </Text>
          </TouchableOpacity>
        </GlassView>
        {pickedFile?.name && (
          <View style={styles.uploadedFile}>
            <Text style={styles.uploadedFileName}>
              {pickedFile.name}
            </Text>
            <Pressable style={styles.closeIconCon} onPress={() => setPickedFile(null)}>
              <Image source={x} style={styles.closeIcon} />
            </Pressable>
          </View>
        )}
        <Button
          title={t('Appeal.submit')}
          onPress={handleSubmit}
          disabled={loading}
          buttonStyle={{}}
          titleStyle={styles.buttonTitle}
          glassStyles={styles.buttonGlass}
        />

      </ScrollView>

      {/* Success Modal */}
      <GlassModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        icon={tickIcon}
        iconBorder={false}
        title={t('Appeal.successModalTitle', 'Appeal Submitted')}
        message={t('Appeal.successModalMessage', 'Your appeal has been successfully submitted and is under review.')}
        showButtons={false}
        dismissOnOverlayPress={false}
        dismissOnBackPress={false}
        animationType="fade"
      />

    </HomeWrapper>
  );
};

export default Appeal;
