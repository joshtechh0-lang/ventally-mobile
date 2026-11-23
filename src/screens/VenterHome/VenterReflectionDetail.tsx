import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, WINDOW_HEIGHT, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import GlassWrapper from '../../components/GlassWrapper';
import { backIcon, trashIcon, tickIcon } from '../../assets/icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getKeyboardAvoidingViewProps } from '../../utils/keyboard';
import { Button, GlassModal } from '../../components';
import { useReflections } from '../../api/apiHooks/useReflections';
import { ActivityIndicator } from 'react-native';
import { ReflectionEntry } from '../../types/apiPayloadsTypes';

interface ReflectionRouteParams {
  reflection?: ReflectionEntry;
}

const VenterReflectionDetail = () => {
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

  const params = route.params as ReflectionRouteParams | undefined;
  const initialReflection = params?.reflection;
  const [reflectionText, setReflectionText] = useState(initialReflection?.reflection_text || '');

  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { updateReflection, deleteReflection } = useReflections();

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
  const styles = StyleSheet.create({
    content: {
      // flexGrow: 1,
      width: '100%',
      height: WINDOW_HEIGHT - hp(20),
      // // justifyContent: 'space-between',
      paddingHorizontal: wp(5),
      // paddingBottom: hp(4),
    },
    cardContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    reflectionCard: {
      paddingHorizontal: wp(6),
      paddingVertical: hp(4),
      borderRadius: hp(4),
    },
    reflectionText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(2),
      color: theme.white,
      textAlign: 'center',
      lineHeight: hp(3),
    },
    reflectionTextInput: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(2),
      color: theme.white,
      textAlign: 'center',
      lineHeight: hp(3),
      minHeight: hp(20),
      textAlignVertical: 'top',
    },
    editButton: {

    },
    editButtonText: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.6),
      color: theme.white,
    },
    deleteIcon: {
      width: hp(2.3),
      height: hp(2.3),
      tintColor: theme.white,
      resizeMode: 'contain',
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEdit = async () => {
    if (!initialReflection?.id || reflectionText.trim().length === 0) return;

    setLoading(true);
    try {
      await updateReflection(initialReflection.id, { reflection_text: reflectionText });
      setShowSuccessModal(true);
    } catch (error) {
      console.log('Error updating reflection:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = () => {
    setShowDeleteModal(true)
  }
  const rightDelete = (
    <TouchableOpacity onPress={handleDelete}>
      <Image source={trashIcon} style={styles.deleteIcon} />
    </TouchableOpacity>
  )

  return (
    <HomeWrapper>

      <ScreenHeader
        title={t('VenterHome.reflectionDetailTitle')}
        onBackPress={handleBack}
        rightComponent={rightDelete}
      />

      <KeyboardAwareScrollView
        {...getKeyboardAvoidingViewProps}
        contentContainerStyle={styles.content}>

        <View style={styles.cardContainer}>
          <GlassWrapper bordered style={styles.reflectionCard}>

            <TextInput
              style={styles.reflectionTextInput}
              value={reflectionText}
              onChangeText={setReflectionText}
              placeholder={t('VenterHome.reflectionPlaceholder')}
              placeholderTextColor={theme.white60}
              multiline
              autoFocus
            />

          </GlassWrapper>
        </View>

        <Button
          title={t('VenterHome.editReflection')}
          loading={loading}
          onPress={handleEdit}
          buttonStyle={styles.editButton}
          titleStyle={styles.editButtonText}
          disabled={loading || reflectionText.trim().length === 0}
          glassStyles={{}}
          leftIcon={undefined}
          iconStyle={undefined}
        // borderedGlassButton={isEditing}
        />
      </KeyboardAwareScrollView>

      {/* <View style={{
        paddingHorizontal: wp(5),
        flex: .5
      }}>

      </View> */}

      <GlassModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('VenterHome.deleteReflection')}
        message={t('VenterHome.deleteReflectionDescription')}
        primaryButtonText={t('VenterHome.delete')}
        secondaryButtonText={t('VenterHome.cancel')}
        onPrimaryPress={async () => {
          if (!initialReflection?.id) return;
          setLoading(true);
          try {
            await deleteReflection(initialReflection.id);
            setShowDeleteModal(false);
            navigation.goBack();
          } catch (error) {
            console.log('Error deleting reflection:', error);
          } finally {
            setLoading(false);
          }
        }}
        onSecondaryPress={() => setShowDeleteModal(false)}
      />

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

export default VenterReflectionDetail;

