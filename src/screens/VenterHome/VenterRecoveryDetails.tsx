import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import GlassView from '../../components/GlassWrapper';
import { tickIcon, recoveryIcon } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import { SobrietyEvent } from '../../types/apiPayloadsTypes';

const VenterRecoveryDetails = () => {
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
    const entry = (route.params as any)?.entry as SobrietyEvent;

    const handleBack = () => navigation.goBack();
    const handleEdit = () => (navigation as any).navigate(routes.venterEditRecoveryLog, { entry });

    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    };

    const isRelapse = entry?.event_type === 'relapse';

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(5),
            alignItems: 'center',
        },
        tickContainer: {
            width: hp(7),
            height: hp(7),
            borderRadius: hp(5),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.white + '10',

        },
        tickIcon: {
            width: hp(4),
            height: hp(4),
            tintColor: theme.white,
            alignSelf: "center"
        },
        dateText: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(2.2),
            color: theme.white,
            marginBottom: hp(4),
        },
        infoCard: {
            width: '100%',
            padding: wp(4),
            backgroundColor: theme.black + '10',
        },
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: hp(2),
            borderBottomColor: theme.white + '10',
            borderBottomWidth: 1,
            paddingBottom: hp(2),
        },
        statusLabel: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.8),
            color: theme.white,
        },
        editButton: {
            paddingHorizontal: wp(3),
            paddingVertical: hp(0.8),
            borderRadius: hp(2),
            backgroundColor: theme.white + '15',
        },
        editButtonText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.4),
            color: theme.white + "cc",
        },
        noteText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white60,
            lineHeight: hp(2.4),
        },
        tickMainCon: {
            padding: hp(3),
            backgroundColor: theme.black + '10',
            borderRadius: hp(9999),
            marginTop: hp(6),
            marginBottom: hp(4),
        }
    });

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader title={t('VenterRecovery.details.title')} onBackPress={handleBack} />
            <View style={styles.content}>
                <View style={styles.tickMainCon}>

                    <GlassView glassStyles={{ ...styles.tickContainer, ...(isRelapse && { backgroundColor: theme.red + '20' }) }}>
                        <Image
                            source={isRelapse ? recoveryIcon : tickIcon}
                            style={[styles.tickIcon, isRelapse && { tintColor: theme.red }]}
                        />
                    </GlassView>
                </View>

                <Text style={styles.dateText}>{entry ? formatEventDate(entry.event_date) : t('VenterRecovery.details.sampleDate')}</Text>

                <GlassView bordered radius={hp(2)} style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={[styles.statusLabel, isRelapse && { color: theme.red }]}>
                            {entry?.event_type ? entry.event_type.charAt(0).toUpperCase() + entry.event_type.slice(1) : t('VenterRecovery.details.sober')}
                        </Text>
                        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                            <Text style={styles.editButtonText}>{t('VenterRecovery.details.editLog')}</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.noteText}>
                        {entry?.notes || t('VenterRecovery.details.noNotes')}
                    </Text>
                    {entry?.restart_date && (
                        <Text style={[styles.noteText, { marginTop: hp(1) }]}>
                            {t('VenterRecovery.details.restartAt') || 'Restarted at'}: {formatEventDate(entry.restart_date)}
                        </Text>
                    )}
                </GlassView>
            </View>
        </HomeWrapper>
    );
};

export default VenterRecoveryDetails;
