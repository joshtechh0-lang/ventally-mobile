import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../../wrapper/AuthWrapper';
import { hp, wp, alpha } from '../../../utils/size';
import { fontFamilies } from '../../../utils/fontFamilies';
import { useTheme } from '../../../theme';
import AuthStepsHeader from '../../../components/AuthStepsHeader';
import { routes } from '../../../navigation/routes';
import Button from '../../../components/Button';
import { upload } from '../../../assets/icons';
import GlassView from '../../../components/GlassWrapper';
import { useRoles } from '../../../api/apiHooks/useRoles';
import { useListenerVerification } from '../../../api/apiHooks/useListenerVerification';
import { setTokens } from '../../../api';
import { toastError } from '../../../utils/toast';
import { Loader } from '../../../components/Loader';
import { useDispatch } from 'react-redux';
import { setUser, setIsVenter } from '../../../store/slices/userSlice';
import ImagePicker from 'react-native-image-crop-picker';
import { GlassModal } from '../../../components';

// Try to import the document picker
let pick: any = null;
let isLibraryInstalled = false;

try {
  const documentPicker = require('@react-native-documents/picker');
  pick = documentPicker.pick;
  isLibraryInstalled = true;
} catch (error) {
  console.log('Document picker library not installed');
  isLibraryInstalled = false;
}

interface Document {
  id: number;
  document_name: string;
  document_type: string;
  document_url?: string;
  document_date: string;
}

const ListenerVerification = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accountTypeChanging } = (route.params as any) || {};
  const theme = useTheme().theme;
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const dispatch = useDispatch();
  const { updateAvailableRoles, switchRole } = useRoles();
  const { submitVerification } = useListenerVerification();
  const [document, setDocument] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showPickerModal, setShowPickerModal] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleImageSelection = async () => {

    try {
      setIsUploading(true);
      const image = await ImagePicker.openPicker({
        mediaType: 'photo',
        cropping: false,
      });

      if (!image?.path) return;

      const newDoc = {
        uri: image.path,
        name: (image as any)?.filename || `image_${Date.now()}.jpg`,
        type: image.mime || 'image/jpeg',
      };

      setDocument(newDoc);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as any).code === 'E_PICKER_CANCELLED'
      ) {
        return;
      }
      toastError({ text: t('Common.failed') || `Failed to pick image`, theme });
    } finally {
      setIsUploading(false);
      setShowPickerModal(false);
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
        mode: "open",
        // type: ["application/pdf", "image/jpeg", "image/png"],
        allowsMultipleSelection: false,
        allowsEditing: false,
      });

      console.log("pickResult", pickResult);

      const newDoc = {
        uri: pickResult?.uri,
        name: pickResult?.name || 'document',
        type: pickResult?.type || 'application/pdf',
      };

      setDocument(newDoc);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        const message = (err as any)?.message;
        if (typeof message === 'string' && message.toLowerCase().includes('cancel')) {
          return;
        }
        toastError({ text: t('Common.failed') || `Failed to pick document `, theme });
      }
    } finally {
      setIsUploading(false);
      setShowPickerModal(false);
    }
  };

  const handleSubmit = async () => {
    if (!document) {
      toastError({ text: t("Common.pleaseUploadDocument"), theme })
      return;
    }

    setLoading(true);
    try {
      // 1. Upload the document

      if (accountTypeChanging) {
        const response = await updateAvailableRoles({
          rolesToAdd: ['listener'],
          rolesToRemove: [],
        });

        if (response) {
          // Silent switch to listener role
          const switchRes = await switchRole({ targetRole: 'listener' });

          if (switchRes && switchRes.tokens) {
            await setTokens(switchRes.tokens.accessToken, switchRes.tokens.refreshToken);

            // Update Redux state silently
            if (switchRes.user) {
              const updatedUser = {
                ...switchRes.user,
                role: switchRes.user.activeRole?.toLowerCase() || 'listener'
              };
              dispatch(setUser(updatedUser as any));
              dispatch(setIsVenter(false));
            }
            await submitVerification(document);

          }
            (navigation as any).replace(routes.verificationInProgress as never);

          return;
        }
      } else {
        // Standard flow for new signups
        await submitVerification(document);

        console.log('Submitting document:', document);
        setShowCelebration(true);
    (navigation as any).replace(routes.verificationInProgress as never);
      }
    } catch (error: any) {
      const errorMsg = error?.message || error?.error || '';
      if (typeof errorMsg === 'string' && errorMsg.includes('pending verification document')) {
        setShowCelebration(true);
      } else {
        toastError({ text: errorMsg || t('Common.failed'), theme });
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: wp(6),
    },
    dialog: {
      width: '100%',
      borderRadius: hp(3),
      paddingVertical: hp(4),
      paddingHorizontal: wp(6),
      alignItems: 'center',
      borderBottomWidth: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      backgroundColor: theme.black + "30"
    },
    title: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(1.3),
    },
    description: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.5),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(2),
      lineHeight: hp(2.2),
      opacity: 0.9,
    },
    uploadSection: {
      width: '100%',
      marginBottom: hp(3),
    },
    uploadTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(1),
    },
    uploadSubtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.5),
      color: theme.white + '80',
      marginBottom: hp(3),
    },

    uploadButtonPressed: {
      backgroundColor: `${theme.white}${alpha(15)}`,
    },


    uploadedFile: {
      padding: wp(3),
      backgroundColor: `${theme.white}${alpha(10)}`,
      borderRadius: hp(1),
      marginBottom: hp(3),
      marginTop: hp(2),
    },
    uploadedFileName: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.5),
      color: theme.white,
    },
    infoList: {
      width: '100%',
      alignItems: 'flex-start',
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: hp(.5),
    },
    bullet: {
      width: hp(0.6),
      height: hp(0.6),
      borderRadius: hp(0.3),
      backgroundColor: theme.white,
      marginRight: wp(2),
      marginTop: hp(0.8),
    },
    infoText: {
      flex: 1,
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.5),
      color: theme.white + '90',
    },
    submitButton: {
      width: '100%',
      height: hp(6),
      borderWidth: hp(0.1),
      borderTopWidth: hp(0.1),
      borderColor: `${theme.white}${alpha(15)}`,
      backgroundColor: theme.white + "10",
      borderBottomLeftRadius: hp(3),
      borderBottomRightRadius: hp(3),
      justifyContent: 'center',
      alignItems: 'center',
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    submitButtonText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
      color: theme.white,
    },
    libraryStatus: {
      marginTop: hp(2),
      padding: wp(3),
      backgroundColor: isLibraryInstalled ? `${theme.white}${alpha(10)}` : `#ff4444${alpha(20)}`,
      borderRadius: hp(1),
    },
    libraryStatusText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.2),
      color: isLibraryInstalled ? theme.white + '80' : '#ff6666',
      textAlign: 'center',
    },
    footertext: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      lineHeight: hp(2),
      color: theme.white + "80",
      marginVertical: hp(3),
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.black + '80',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: wp(5),
    },
    modalContent: {
      width: '100%',
      padding: hp(3),
      borderRadius: hp(3),
      backgroundColor: theme.black,
      alignItems: 'center',
    },
    modalTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2),
      color: theme.white,
      marginBottom: hp(3),
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
    modalCancelOption: {
      borderBottomWidth: 0,
      marginTop: hp(1),
    },
    modalCancelText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.red,
    },
  });

  const infoItems = [
    t('ListenerVerification.info1'),
    t('ListenerVerification.info2'),
    t('ListenerVerification.info3'),
    t('ListenerVerification.info4'),
  ];

  return (
    <AuthWrapper key={langKey}>
      <Loader isVisible={loading} />
      <View style={{ width: "100%", paddingHorizontal: wp(5), paddingTop: hp(5) }}>
        <AuthStepsHeader
          handleBack={handleBack}
          title=""
          glassyTitle={false}
        />
      </View>
      <View style={styles.container}>
        {/* Header */}



        <GlassView bordered glassStyles={styles.dialog}>
          <Text style={styles.title}>{t('ListenerVerification.title')}</Text>

          <Text style={styles.description}>
            {t('ListenerVerification.description')}
          </Text>

          <View style={styles.uploadSection}>
            <Text style={styles.uploadTitle}>
              {t('ListenerVerification.uploadTitle')}
            </Text>
            <Text style={styles.uploadSubtitle}>
              {t('ListenerVerification.uploadSubtitle')}
            </Text>


            <Button
              title={t('ListenerVerification.uploadButton')}
              disabled={isUploading}
              onPress={() => setShowPickerModal(true)}

              leftIcon={upload}
            />
            {document && (
              <View style={styles.uploadedFile}>
                <Text style={styles.uploadedFileName}>
                  {document.name}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.infoList}>
            {infoItems.map((item, index) => (
              <View key={index} style={styles.infoItem}>
                <View style={styles.bullet} />
                <Text style={styles.infoText}>{item}</Text>
              </View>
            ))}
          </View>
        </GlassView>

        <TouchableOpacity
          style={[styles.submitButton,]}
          onPress={handleSubmit}
        // disabled={!document}
        >
          <Text style={styles.submitButtonText}>
            {t('ListenerVerification.submit')}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footertext}>
          {t('ListenerVerification.footertext')}
        </Text>
      </View>
      <GlassModal
        bottomAttachedBtn
        primaryButtonText={t('Common.cancel') || 'Upload an Image'}
        onPrimaryPress={() => setShowPickerModal(false)}

        showButtons={false} visible={showPickerModal} onClose={() => setShowPickerModal(false)}>
        {/* <GlassView bordered glassStyles={styles.modalContent}> */}
        {/* <Text style={styles.modalTitle}>{t('ListenerVerification.selectSource') || 'Select Document Source'}</Text> */}

        <TouchableOpacity style={styles.modalOption} onPress={handleImageSelection}>
          <Text style={styles.modalOptionText}>{t('ListenerVerification.pickImage') || 'Upload an Image'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modalOption} onPress={handleDocumentSelection}>
          <Text style={styles.modalOptionText}>{t('ListenerVerification.pickDocument') || 'Upload a Document'}</Text>
        </TouchableOpacity>


        {/* </GlassView> */}
      </GlassModal>

      {/* <Modal visible={showPickerModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
         
        </View>
      </Modal> */}

    </AuthWrapper>
  );
};

export default ListenerVerification;