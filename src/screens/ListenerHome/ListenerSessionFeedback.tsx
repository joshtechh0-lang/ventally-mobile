import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    TextInput,
} from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import GlassWrapper from '../../components/GlassWrapper';
import Button from '../../components/Button';
import { happyIcon, neutralIcon, sadIcon, axiousIcon } from '../../assets/icons'; // Ensure icons exist
import { routes } from '../../navigation/routes';

// Mood emojis for feedback about call or chat
const MOOD_EMOJIS = [
    { key: 'veryHappy', icon: happyIcon },
    { key: 'neutral', icon: neutralIcon },
    { key: 'sad', icon: sadIcon },
    { key: 'verySad', icon: axiousIcon },
] as const;

const ListenerSessionFeedback = () => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const { theme } = useTheme();

    const [selectedMood, setSelectedMood] = useState<string>('happy');
    const styles = StyleSheet.create({
        content: {
            flex: 1,
        },
        scrollContent: {
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: "flex-end",
            paddingBottom: hp(5),
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
        moodRow: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: "center",
            gap: wp(3),
            marginBottom: hp(5),
        },
        moodButton: {
            width: hp(6),
            height: hp(6),
            borderRadius: hp(3.5),
            justifyContent: 'center',
            alignItems: 'center',
        },
        moodIcon: {
            width: hp(3),
            height: hp(3),
            tintColor: theme.white,
            resizeMode: 'contain',
            alignSelf: "center"
        },
        buttonsColumn: {
            gap: hp(1.5),
            width: '100%',
            marginTop: 'auto', // Push to bottom
        },
        glassContainer: {
            width: "100%",
            padding: hp(2),
        }
    });

    const handleNext = () => {
        (navigation as any).navigate(routes.listenerSessionRating);
    };

    const handleReport = () => {
        (navigation as any).navigate(routes.chatStack, { screen: routes.chatReport }); // Or specific listener report route
    };

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader
                title=""
                onBackPress={() => {
                  const parent = (navigation as any).getParent();
                  if (parent) {
                    parent.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{ name: routes.listenerHomeTab }],
                      })
                    );
                  } else {
                    (navigation as any).navigate(routes.listenerHomeTab);
                  }
                }}
                showBackButton
            />
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <GlassWrapper
                    glassStyles={{
                        // backgroundColor: theme.black + "10"
                    }}
                    style={{
                        height: hp(8),
                        width: hp(8),
                        borderRadius: hp(2.5),
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <Image source={happyIcon} style={[styles.moodIcon, {
                        height: hp(5),
                        width: hp(5),
                    }]} />
                </GlassWrapper>
                <Text style={styles.title}>{t('ListenerFeedback.title') || "How Was   Session?"}</Text>
                <Text style={styles.subtitle}>{t('ListenerFeedback.subtitle') || "Your feedback helps keep Ventally safe"}</Text>

                <View style={styles.glassContainer}>

                    {/* Mood emoji selector */}
                    <View style={styles.moodRow}>
                        {MOOD_EMOJIS.map((mood) => {
                            const isSelected = selectedMood === mood.key;
                            return (
                                <TouchableOpacity
                                    key={mood.key}
                                    onPress={() => setSelectedMood(mood.key)}
                                    activeOpacity={0.7}
                                >
                                    <GlassWrapper
                                        glassStyles={{
                                            backgroundColor: isSelected ? theme.white + "20" : theme.black + '40'
                                        }}
                                        style={styles.moodButton}
                                    >
                                        <Image source={mood.icon} style={styles.moodIcon} />
                                    </GlassWrapper>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonsColumn}>
                        <Button
                            title={t('Common.next') || "Next"}
                            onPress={handleNext}
                            buttonStyle={{}}
                            titleStyle={{}}
                            disabled={false}
                            glassStyles={{ width: '100%', backgroundColor: theme.white + "10" }}
                        />
                        <Button
                            title={t('Common.reportConcern') || "Report a Concern"}
                            onPress={handleReport}
                            buttonStyle={{}}
                            titleStyle={{}}
                            disabled={false}
                            glassStyles={{ width: '100%', backgroundColor: theme.black + "30" }}
                            borderedGlassButton
                        />
                    </View>
                </View>
            </ScrollView>
        </HomeWrapper>
    );
};

export default ListenerSessionFeedback;
