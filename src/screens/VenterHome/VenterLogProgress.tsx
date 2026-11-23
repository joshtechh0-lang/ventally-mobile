import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { GlassModal, ScreenHeader } from '../../components';
import Button from '../../components/Button';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getKeyboardAvoidingViewProps } from '../../utils/keyboard';
import { starBorderedIcon, streakIcon } from '../../assets/icons';
import { useRecovery } from '../../api/apiHooks/useRecovery';
import { Loader } from '../../components';
import { toastError, toastSuccess } from '../../utils/toast';

const VenterLogProgress = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

    const [status, setStatus] = useState<'track' | 'setback' | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const recovery = useRecovery();

    const handleBack = () => navigation.goBack();


    const handleSave = async () => {
        if (!status) return;
        setLoading(true);
        try {
            if (status === 'track') {
                await recovery.startSobriety({
                    restart_date: new Date().toISOString(),
                    notes: notes || "",
                });
            } else {
                await recovery.logRelapse({
                    relapse_date: new Date().toISOString(),
                    notes: notes || "",
                });
            }
            // Set loading false first, then show modal to prevent iOS layout freeze
            setLoading(false);
            toastSuccess({ text: t('VenterRecovery.logProgress.success') || 'Recovery logged successfully' });
            navigation.goBack();
         
        } catch (error: any) {
            console.error('[VenterLogProgress] Error saving:', error);
            toastError({ text: error?.message || t('Common.somethingWentWrong') });
        } finally {
            setLoading(false);

        }
    };

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(5),
        },
        question: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(2.2),
            color: theme.white,
            textAlign: 'center',
            marginTop: hp(6),
            marginBottom: hp(4),
        },
        toggleRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: hp(4),
        },
        toggleButton: {
            width: wp(42),
            paddingVertical: hp(1),
            borderRadius: hp(3),
            borderWidth: 1,
            borderColor: theme.white + '30',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.black + '10',
        },
        toggleButtonActive: {
            borderColor: "transparent",
            backgroundColor: theme.white + '10',
        },
        toggleText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.6),
            color: theme.white,
            marginBottom: hp(0.4)
        },
        label: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.8),
            color: theme.white,
            marginBottom: hp(1.5),
        },
        inputContainer: {
            minHeight: hp(8),
            borderRadius: hp(1),
            borderWidth: 1,
            borderColor: theme.white + '30',
            backgroundColor: theme.black + '10',
            paddingHorizontal: wp(4),
        },
        input: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white,
            textAlignVertical: 'top',
            flex: 1,
        },
        saveButtonContainer: {
            paddingHorizontal: wp(5),
            paddingBottom: hp(4),
        },
    });

    return (
        <HomeWrapper key={langKey}>

            <ScreenHeader title="" onBackPress={handleBack} />
            <KeyboardAwareScrollView {...getKeyboardAvoidingViewProps} style={styles.content}>
                <Text style={styles.question}>{t('VenterRecovery.logProgress.question')}</Text>

                <View style={styles.toggleRow}>
                    <TouchableOpacity
                        style={[styles.toggleButton, status === 'track' && styles.toggleButtonActive]}
                        onPress={() => setStatus('track')}
                    >
                        <Text style={styles.toggleText}>{t('VenterRecovery.logProgress.track')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, status === 'setback' && styles.toggleButtonActive]}
                        onPress={() => setStatus('setback')}
                    >
                        <Text style={styles.toggleText}>{t('VenterRecovery.logProgress.setback')}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>{t('VenterRecovery.logProgress.notes')}</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={notes}
                        onChangeText={setNotes}

                        placeholder={t('VenterRecovery.logProgress.placeholder')
                        }
                        placeholderTextColor={theme.white + "cc"}
                        multiline
                    />
                </View>
            </KeyboardAwareScrollView>

            <View style={styles.saveButtonContainer}>
                <Button
                    title={t('VenterRecovery.logProgress.saveEntry')}
                    onPress={handleSave}
                    disabled={!status || loading}
                    buttonStyle={{}}
                    titleStyle={{}}
                    glassStyles={{}}
                />
            </View>
            {/* <GlassModal
                iconBorder={false}
                primaryButtonText={t('VenterRecovery.logProgress.ok')}
                // secondaryButtonText={t('VenterRecovery.logProgress.viewBadges')}
                icon={starBorderedIcon}
                showVerticalButtons
                visible={achievementModalVisible}
                onClose={() => setAchievementModalVisible(false)}
                title={t('VenterRecovery.logProgress.achievement')}
                message={t('VenterRecovery.logProgress.achievementMessage', { days: 1, dayLabel: 1 > 1 ? 'days' : 'day' })}
                onPrimaryPress={handleViewBadges}
                bottomAttachedBtn
            // onSecondaryPress={handleOk}
            /> */}
            {/* <GlassModal
                iconBorder={false}
                primaryButtonText={t('VenterRecovery.logProgress.logactivity')}
                icon={streakIcon}
                showVerticalButtons
                visible={showBadgeModal}
                onClose={() => setShowBadgeModal(false)}
                title={t('VenterRecovery.logProgress.streakTitle')}
                message={t('VenterRecovery.logProgress.streakMessage')}
                onSecondaryPress={handleOk}
                bottomAttachedBtn
            /> */}
            <Loader isVisible={loading} />
        </HomeWrapper>
    );
};

export default VenterLogProgress;
