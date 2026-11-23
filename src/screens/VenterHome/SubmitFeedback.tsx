import React, { useState } from 'react';
import { View, Text, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { GlassModal, ScreenHeader } from '../../components';
import Button from '../../components/Button';
import Input from '../../components/Input';
import SuccessModal from '../../components/shared/SuccessModal';
import { tickIcon } from '../../assets/icons';
import GlassView from '../../components/GlassWrapper';
import { getKeyboardAwareScrollViewProps, getKeyboardAwareContentStyle } from '../../utils/keyboard';
import { useSupport } from '../../api/apiHooks/useSupport';
import { toastError } from '../../utils/toast';

const SubmitFeedback = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const { submitFeedback } = useSupport();
    const [feedback, setFeedback] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleSubmit = async () => {
        if (!feedback.trim()) return;
        Keyboard.dismiss();
        setLoading(true);
        try {
            await submitFeedback({ rating: 5, comment: feedback });
            setShowSuccess(true);
        } catch (error: any) {
            console.error('[SubmitFeedback] Error submitting feedback', error);
            toastError({ text: error?.message || t('Common.somethingWentWrong') });
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        navigation.goBack();
    };

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
        },
        description: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + 'cc',
            marginBottom: hp(3),
            lineHeight: hp(2.2),
        },
        inputLabel: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.8),
            color: theme.white,
            marginBottom: hp(1),
        },
        buttonContainer: {
            marginBottom: hp(4),
            marginTop: 'auto',
        }
    });

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader
                onBackPress={handleBack}
                title={t('Feedback.title') || "Feedback"}
            />

            <KeyboardAwareScrollView
                {...getKeyboardAwareScrollViewProps()}
                contentContainerStyle={[styles.content, getKeyboardAwareContentStyle()]}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.description}>
                            {t('Feedback.description')}
                        </Text>

                        <GlassView bordered glassStyles={{
                            backgroundColor: theme.black + "20",
                            padding: hp(2)
                        }}>
                            <Input
                                placeholderTextColor={theme.white + "cc"}
                                placeholder={t('Feedback.placeholder')}
                                isPlaceholderVisible={true}
                                value={feedback}
                                onChangeText={setFeedback}
                                multiline
                                numberOfLines={4}
                                inputContainerStyle={{ height: hp(10), borderBottomWidth: 0, }}
                                containerStyle={{ alignItems: 'flex-start', }}
                                inputStyle={{ height: '100%', textAlignVertical: 'top' }}
                            />
                        </GlassView>


                        <View style={styles.buttonContainer}>
                            <Button
                                title={t('Feedback.submit') || "Submit Feedback"}
                                onPress={handleSubmit}
                                glassStyles={{ width: '100%' }}
                                disabled={loading || !feedback.trim()}
                                buttonStyle={{ width: '100%' }}
                                titleStyle={{ color: theme.white }}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAwareScrollView>

            <GlassModal
                icon={tickIcon}
                glassStyle={{ backgroundColor: theme.black + "20" }}
                iconBorder={false}
                visible={showSuccess}
                showButtons={false}
                onClose={handleSuccessClose}
                title={t('Feedback.successTitle')}
                message={t('Feedback.successMessage') || "Your feedback has been submitted."}
            />
        </HomeWrapper>
    );
};

export default SubmitFeedback;
