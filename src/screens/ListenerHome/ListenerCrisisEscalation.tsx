import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { Button, ScreenHeader } from '../../components';
import { endCall } from '../../store/slices/callSlice';
import { routes } from '../../navigation/routes';

const ListenerCrisisEscalation = () => {
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const { theme } = useTheme();
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const handleEscalate = () => {
        dispatch(endCall());
        navigation.navigate(routes.listenerHomeTab as never);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: wp(5),
            justifyContent: 'center',
            alignItems: 'center',
        },
        circleContainer: {
            width: hp(25),
            height: hp(25),
            borderRadius: hp(12.5),
            backgroundColor: theme.white + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: hp(5),
        },
        circleText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(8),
            color: theme.white,
        },
        title: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(2.5),
            color: theme.white,
            textAlign: 'center',
            marginBottom: hp(1),
        },
        subtitle: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + '80',
            textAlign: 'center',
            marginBottom: hp(8),
        },
        button: {
            width: '100%',
            position: 'absolute',
            bottom: hp(5),
        },
    });

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader
                title=""
                onBackPress={() => navigation.goBack()}
                showBackButton
            />
            <View style={styles.container}>
                <View style={styles.circleContainer}>
                    <Text style={styles.circleText}>{t('Crisis.prompt988Title')}</Text>
                </View>

                <Text style={styles.title}>{t('Crisis.prompt988Message').split('\n')[0]}</Text>
                <Text style={styles.subtitle}>{t('Crisis.prompt988Message').split('\n')[2]}</Text>

                <View style={styles.button}>
                    <Button
                        title="Escalate"
                        onPress={handleEscalate}
                        glassStyles={{ width: '100%' }}
                    />
                </View>
            </View>
        </HomeWrapper>
    );
};

export default ListenerCrisisEscalation;
