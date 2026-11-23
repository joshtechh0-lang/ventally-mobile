import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useSelector } from 'react-redux';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { Dropdown, ScreenHeader } from '../../components';
import SettingsContainer from '../../components/shared/SettingsContainer';
import SettingsItem from '../../components/shared/SettingsItem';
import GlassView from '../../components/GlassWrapper';
import { routes } from '../../navigation/routes';
import { RootState } from '../../store';
import { useNotifications } from '../../api/apiHooks/useNotifications';
import { NotificationSettings } from '../../types/apiPayloadsTypes';
import { ActivityIndicator, Modal } from 'react-native';

const NotificationsSettings = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const { isVenter } = useSelector((state: RootState) => state.user);

    const timeOptions = useMemo(() => {
        const amLabel = t('Time.am');
        const pmLabel = t('Time.pm');

        return Array.from({ length: 24 }, (_, hour) => {
            const displayHour = ((hour + 11) % 12) + 1;
            const periodLabel = hour < 12 ? amLabel : pmLabel;
            const periodValue = hour < 12 ? 'AM' : 'PM';

            const value = `${displayHour}:00 ${periodValue}`;
            return { label: `${displayHour}:00 ${periodLabel}`, value };
        });
    }, [t]);

    const [notifs, setNotifs] = useState({
        pauseAll: false,
        push: true,
        messages: true,
        call: true,
        reminder: true,
        sound: true,
        inAppAlert: true,
        listenerReplied: true,
        moodLog: true,
        reflectionLog: true,
        wellnessNudges: true,
        activityStatus: true,
        reminderTime: '12:00 AM',
    });
    const [remindAt, setRemindAt] = useState('12:00 AM');
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const { getSettings, updateSettings } = useNotifications();

    const convertToUTC = (timeStr: string) => {
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
        if (!utcStr) return '12:00 AM';
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
                console.log('response', response);
                if (response?.success && response.data) {
                    const s = response.data;
                    setNotifs(prev => ({
                        ...prev,
                        pauseAll: s.allNotifications === false,
                        messages: s.messageNotifications ?? true,
                        call: s.callNotifications ?? true,
                        reminder: s.reminderNotifications ?? true,
                        sound: s.soundVibration ?? true,
                        inAppAlert: s.inAppAlerts ?? true,
                        listenerReplied: s.listenerReplied ?? true,
                        moodLog: s.moodLog ?? true,
                        reflectionLog: s.reflectionLog ?? true,
                        wellnessNudges: s.wellnessNudges ?? true,
                        activityStatus: s.activityStatus ?? true,
                    }));
                    setRemindAt(convertToLocal(s.remindMeAtUtc));
                }
            } catch (error) {
                console.error('Failed to fetch notification settings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleBack = () => {
        navigation.goBack();
    };

    const syncSettings = async (updates: Partial<NotificationSettings>) => {
        setIsUpdating(true);
        try {
            const response = await updateSettings(updates);
            return response?.success;
        } catch (error) {
            console.error('Failed to update settings:', error);
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    const toggleNotif = async (key: keyof typeof notifs) => {
        let nextState;
        if (key === 'pauseAll') {
            const newValue = !notifs.pauseAll;
            if (newValue) {
                nextState = {
                    ...notifs,
                    pauseAll: true,
                    push: false,
                    messages: false,
                    call: false,
                    reminder: false,
                    sound: false,
                    inAppAlert: false,
                    listenerReplied: false,
                    moodLog: false,
                    reflectionLog: false,
                    wellnessNudges: false,
                    activityStatus: false,
                };
            } else {
                nextState = { ...notifs, pauseAll: false };
            }
        } else {
            nextState = { ...notifs, [key]: !notifs[key] };
        }

        // Prepare API sync
        const apiUpdates: any = {};
        if (key === 'pauseAll') {
            apiUpdates.allNotifications = !nextState.pauseAll;
        } else if (key === 'messages') {
            apiUpdates.messageNotifications = nextState.messages;
        } else if (key === 'call') {
            apiUpdates.callNotifications = nextState.call;
        } else if (key === 'reminder') {
            apiUpdates.reminderNotifications = nextState.reminder;
        } else if (key === 'sound') {
            apiUpdates.soundVibration = nextState.sound;
        } else if (key === 'inAppAlert') {
            apiUpdates.inAppAlerts = nextState.inAppAlert;
        }

        if (Object.keys(apiUpdates).length > 0) {
            const success = await syncSettings(apiUpdates);
            if (success) {
                setNotifs(nextState);
            }
        } else {
            // Local-only toggles (if any)
            setNotifs(nextState);
        }
    };

    const handleRemindTimeChange = async (time: string) => {
        const success = await syncSettings({ remindMeAtUtc: convertToUTC(time) });
        if (success) {
            setRemindAt(time);
        }
    };

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
        },
        pauseAllContainer: {
            paddingHorizontal: hp(1.5),

            marginBottom: hp(2),
            backgroundColor: theme.black + "30",

        },
        remindeDropdown: {
            width: wp(25),
        },
    });

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader
                onBackPress={handleBack}
                title={t('NotificationsSettings.title') || "Notifications"}
            />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: hp(50) }}>
                        <ActivityIndicator size="large" color={theme.primary} />
                    </View>
                ) : (
                    <>
                        <GlassView radius={hp(1.8)} bordered glassStyles={styles.pauseAllContainer}>
                            <SettingsItem
                                title={t('NotificationsSettings.pauseAll')}
                                type="toggle"
                                value={notifs.pauseAll}
                                onValueChange={() => toggleNotif('pauseAll')}
                            />
                        </GlassView>
                        {isVenter && (
                            <>
                                <GlassView radius={hp(1.8)} bordered glassStyles={styles.pauseAllContainer}>
                                    <SettingsItem
                                        title={t('NotificationsSettings.reminderMeAt')}
                                        value={remindAt}
                                        disabled={notifs.pauseAll}
                                        onValueChange={() => toggleNotif('reminder')}
                                        rightComponent={<Dropdown
                                            containerStyle={styles.remindeDropdown}
                                            subContainerStyle={{
                                                height: hp(3.5),
                                                borderBottomWidth: 0,


                                            }}
                                            options={timeOptions}
                                            onSelect={handleRemindTimeChange}
                                            placeholder={t('QuietHours.placeholder')}
                                            value={remindAt}

                                        />}
                                    />
                                </GlassView>
                                <GlassView radius={hp(1.8)} bordered glassStyles={styles.pauseAllContainer}>
                                    <SettingsItem
                                        title={t('NotificationsSettings.quietHours')}
                                        disabled={notifs.pauseAll}
                                        onPress={() => {
                                            (navigation as any).navigate(routes.quietHours);
                                        }}
                                    />
                                </GlassView>
                            </>
                        )}
                        <SettingsContainer>
                            <SettingsItem
                                title={t('NotificationsSettings.messages')}
                                type="toggle"
                                value={notifs.messages}
                                disabled={notifs.pauseAll}
                                onValueChange={() => toggleNotif('messages')}
                            />
                            <SettingsItem
                                title={t('NotificationsSettings.call')}
                                type="toggle"
                                value={notifs.call}
                                disabled={notifs.pauseAll}
                                onValueChange={() => toggleNotif('call')}
                            />
                            <SettingsItem
                                title={t('NotificationsSettings.reminder')}
                                type="toggle"
                                value={notifs.reminder}
                                disabled={notifs.pauseAll}
                                onValueChange={() => toggleNotif('reminder')}
                            />

                            {!isVenter && (
                                <SettingsItem
                                    title={t('NotificationsSettings.activityStatus')}
                                    type="toggle"
                                    value={notifs.activityStatus}
                                    disabled={notifs.pauseAll}
                                    onValueChange={() => toggleNotif('activityStatus')}
                                />
                            )}

                            <SettingsItem
                                title={t('NotificationsSettings.sound')}
                                type="toggle"
                                value={notifs.sound}
                                disabled={notifs.pauseAll}
                                onValueChange={() => toggleNotif('sound')}
                            />
                            <SettingsItem
                                title={t('NotificationsSettings.inAppAlert')}
                                type="toggle"
                                value={notifs.inAppAlert}
                                disabled={notifs.pauseAll}
                                onValueChange={() => toggleNotif('inAppAlert')}
                            />

                            {isVenter && (
                                <>
                                    <SettingsItem
                                        title={t('NotificationsSettings.listenerReplied')}
                                        type="toggle"
                                        value={notifs.listenerReplied}
                                        disabled={notifs.pauseAll}
                                        onValueChange={() => toggleNotif('listenerReplied')}
                                    />
                                    <SettingsItem
                                        title={t('NotificationsSettings.moodLog')}
                                        type="toggle"
                                        value={notifs.moodLog}
                                        disabled={notifs.pauseAll}
                                        onValueChange={() => toggleNotif('moodLog')}
                                    />
                                    <SettingsItem
                                        title={t('NotificationsSettings.reflectionLog')}
                                        type="toggle"
                                        value={notifs.reflectionLog}
                                        disabled={notifs.pauseAll}
                                        onValueChange={() => toggleNotif('reflectionLog')}
                                    />
                                    <SettingsItem
                                        title={t('NotificationsSettings.wellnessNudges')}
                                        type="toggle"
                                        value={notifs.wellnessNudges}
                                        disabled={notifs.pauseAll}
                                        onValueChange={() => toggleNotif('wellnessNudges')}
                                    />
                                </>
                            )}
                        </SettingsContainer>
                    </>
                )}
            </ScrollView>

            <Modal transparent visible={isUpdating} animationType="fade">
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <GlassView radius={hp(2)} bordered glassStyles={{ padding: hp(3) }}>
                        <ActivityIndicator size="large" color={theme.primary} />
                    </GlassView>
                </View>
            </Modal>
        </HomeWrapper>
    );
};

export default NotificationsSettings;
