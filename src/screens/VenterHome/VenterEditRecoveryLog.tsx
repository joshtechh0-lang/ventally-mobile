import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import Button from '../../components/Button';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getKeyboardAvoidingViewProps } from '../../utils/keyboard';
import { useRecovery } from '../../api/apiHooks/useRecovery';
import { Loader } from '../../components';
import { toastSuccess, toastError } from '../../utils/toast';

const VenterEditRecoveryLog = () => {
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
    const { startSobriety, logRelapse } = useRecovery();
    const { entry } = route.params as any || {};

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'track' | 'setback' | null>(entry?.event_type === 'sober' ? 'track' : entry?.event_type === 'relapse' ? 'setback' : null);
    const [notes, setNotes] = useState(entry?.notes || '');

    const handleBack = () => navigation.goBack();

    const handleUpdate = async () => {
        setLoading(true);
        try {
            if (status === 'track') {
                await startSobriety({
                    restart_date: entry?.event_date || new Date().toISOString(),
                    notes: notes,
                });
                toastSuccess({ text: t('VenterRecovery.editLog.successTrack') || 'Sobriety tracking updated' });
            } else if (status === 'setback') {
                await logRelapse({
                    relapse_date: new Date().toISOString(),
                    notes: notes,
                });
                toastSuccess({ text: t('VenterRecovery.editLog.successSetback') || 'Relapse logged' });
            }
            navigation.goBack();
        } catch (error: any) {
            console.error('[VenterEditRecoveryLog] error:', error);
            // toastError({ text: error?.message || t('Common.somethingWentWrong') });
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
            paddingVertical: hp(1.5),
            borderRadius: hp(3),
            borderWidth: 1,
            borderColor: theme.white + '30',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.white + '10',
        },
        toggleButtonActive: {
            borderColor: theme.white,
            backgroundColor: theme.white + '25',
        },
        toggleText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.6),
            color: theme.white,
        },
        label: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.8),
            color: theme.white,
            marginBottom: hp(1.5),
        },
        inputContainer: {
            minHeight: hp(10),
            borderRadius: hp(2),
            borderWidth: 1,
            borderColor: theme.white + '30',
            backgroundColor: theme.white + '05',
            paddingHorizontal: wp(2),
        },
        input: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white,
            textAlignVertical: 'top',
            flex: 1,
        },
        updateButtonContainer: {
            paddingHorizontal: wp(5),
            paddingBottom: hp(4),
        },
    });

    return (
        <HomeWrapper key={langKey}>
            <Loader isVisible={loading} />
            <ScreenHeader title={t('VenterRecovery.editLog.title')} onBackPress={handleBack} />
            <KeyboardAwareScrollView {...getKeyboardAvoidingViewProps} style={styles.content}>
                <Text style={styles.question}>{t('VenterRecovery.editLog.question')}</Text>

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

                <Text style={styles.label}>{t('VenterRecovery.editLog.notes')}</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder={status === 'setback' ? t('VenterRecovery.editLog.placeholderSetback') : t('VenterRecovery.editLog.placeholderTrack')}
                        placeholderTextColor={theme.white60}
                        multiline
                    />
                </View>
            </KeyboardAwareScrollView>

            <View style={styles.updateButtonContainer}>
                <Button
                    title={t('VenterRecovery.editLog.updateLog')}
                    onPress={handleUpdate}
                    disabled={!status}
                    buttonStyle={{}}
                    titleStyle={{}}
                    glassStyles={{}}
                />
            </View>
        </HomeWrapper>
    );
};

export default VenterEditRecoveryLog;
