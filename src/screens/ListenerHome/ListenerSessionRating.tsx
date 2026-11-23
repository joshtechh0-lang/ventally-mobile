import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { useNavigation, CommonActions , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import GlassWrapper from '../../components/GlassWrapper';
import Button from '../../components/Button';
import { star, starFilled } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import GlassModal from '../../components/shared/GlassModal'; // Reusing for Earnings Logged? Or creating separate screen? User showed a modal-like card.
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiInstance } from '../../api';
import { toastError } from '../../utils/toast';
const ListenerSessionRating = () => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [starRating, setStarRating] = useState<number>(0);
    const [showEarningsModal, setShowEarningsModal] = useState(false);
    const session = useSelector((state: RootState) => state.session);
    const styles = StyleSheet.create({
        content: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: hp(3)
        },

        title: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(2.2),
            color: theme.white,
            textAlign: 'center',
            marginBottom: hp(1),
        },
        subtitle: {

            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + "90",
            textAlign: 'center',
            marginBottom: hp(5.5),
        },
        glassContainer: {
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            paddingTop: hp(2),
            // height: "100%",
            backgroundColor: theme.black + "10",
            borderBottomWidth: 0,

        },
        starRow: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: wp(2),
            marginBottom: hp(5),
        },
        starButton: {
            padding: wp(1),
        },
        starIcon: {
            width: hp(3.5),
            height: hp(3.5),
            tintColor: theme.white,
            resizeMode: 'contain',
        },
        buttonsColumn: {
            gap: hp(1.5),
            width: '100%',
            marginTop: 'auto',
        },
        bottomAttachedButton: {
            width: '100%',
        },
        bottomAttachedGlass: {
            borderTopRightRadius: hp(0),
            borderTopLeftRadius: hp(0),
            borderBottomRightRadius: hp(2),
            borderBottomLeftRadius: hp(2),
            backgroundColor: theme.white + '10',
            width: '100%',
        },
    });

    const navigateHome = () => {
        (navigation as any).dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: routes.listenerHomeTab }],
            }),
        );
    };


    const handleSubmit = async () => {
        const payload = {
            sessionType: session.sessionType,
            sessionId: session?.sessionId,
            revieweeId: session?.venterId,
            rating: starRating,
            comment: ""
        }
        console?.log('--------------------------->>Payload', JSON?.stringify(payload, null, 2));
        try {
            setIsLoading(true);
            const res: any = await apiInstance.post('reviews', payload)
            console?.log('--------------------------->>Res', res);
            if (res?.success) {
                setShowEarningsModal(true);
                setTimeout(() => {
                    setShowEarningsModal(false);
                    navigateHome();
                }, 2000);
            }

        } catch (err: any) {
            console?.log('--------------------------->>Err', err);
            toastError({ text: err?.error })
        } finally {
            setIsLoading(false);
        }

        // setShowThankYou(true);
    };

    const handleSkip = () => {
        setShowEarningsModal(true);
        setTimeout(() => {
            setShowEarningsModal(false);
            navigateHome();
        }, 2000);
    };

    return (
        <HomeWrapper key={langKey}>

            <View
                style={styles.content}
            >
                <GlassWrapper bordered style={styles.glassContainer}>
                    <View style={{ paddingHorizontal: hp(2) }}>
                        <Text style={styles.title}>{t('ListenerRating.title') || "Rate Your Session"}</Text>
                        <Text style={styles.subtitle}>{t('ListenerRating.subtitle') || "How did this session support you?"}</Text>
                        <Text style={[styles.subtitle, { opacity: 0.7, marginTop: hp(1), fontSize: hp(1.4) }]}>{t('ListenerRating.guidedSub') || "Guided, moderated experience"}</Text>
                    </View>

                    {/* Star rating */}
                    <View style={styles.starRow}>
                        {[1, 2, 3, 4, 5].map((index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.starButton}
                                onPress={() => setStarRating(index)}
                                activeOpacity={0.7}
                            >
                                <Image
                                    source={index <= starRating ? starFilled : star}
                                    style={styles.starIcon}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Buttons */}

                    <Button
                        title={starRating > 0 ? t('Common.submit') || "Submit" : t('Common.skip') || "Skip"}
                        onPress={starRating > 0 ? handleSubmit : handleSkip}
                        buttonStyle={styles.bottomAttachedButton}
                        glassStyles={styles.bottomAttachedGlass}
                        titleStyle={{ fontSize: hp(1.8) }}
                        borderedGlassButton={true}
                        disabled={isLoading}
                    />

                </GlassWrapper>
            </View >

            {/* Earnings Modal (Mocked as GlassModal for now, can be custom) */}
            < GlassModal
                visible={showEarningsModal}
                title={t('ListenerRating.earningsLogged') || 'Session recorded'}
                message={t('ListenerRating.earningsLoggedSub') || 'This support session has been recorded in your account.'}
                onClose={() => { }}
                showButtons={false}
                dismissOnOverlayPress={false}
                dismissOnBackPress={false}
            />

        </HomeWrapper >
    );
};

export default ListenerSessionRating;
