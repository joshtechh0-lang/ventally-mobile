import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, Pressable, Linking } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import { fontFamilies } from '../../utils/fontFamilies';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import AccordionItem from '../../components/AccordionItem';
import GlassView from '../../components/GlassWrapper';
import SwipeableTabs from '../../components/SwipeableTabs';
import SettingsContainer from '../../components/shared/SettingsContainer';
import SettingsItem from '../../components/shared/SettingsItem';
import { routes } from '../../navigation/routes';
import {
    instaIcon,
    twitterIcon,
    tiktokIcon,
    fbIcon,
    mailIcon,
    websiteIcon,
    appealIcon
} from '../../assets/icons';

const ContactUs = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

    const tabs = useMemo(() => ['faq', 'contact'], []);

    const faqItems = useMemo(
        () => (t('FAQ.items', { returnObjects: true }) as any[]) || [], // eslint-disable-next-line react-hooks/exhaustive-deps
        [t]
    );

    const handleBack = () => {
        navigation.goBack();
    };

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingTop: hp(2),
        },
        tabWrapper: {
            flex: 1,
            paddingHorizontal: wp(5),
        },
        titleBlock: {
            alignItems: 'center',
            marginBottom: hp(2),
            paddingHorizontal: wp(6),
        },
        screenTitle: {
            fontSize: hp(2.2),
            color: theme.white,
            fontFamily: fontFamilies.semiBold,
            marginBottom: hp(1),
        },
        text: {
            fontSize: hp(1.6),
            color: theme.white,
            textAlign: 'center',
            lineHeight: hp(2.3),
            fontFamily: fontFamilies.normal,
        },
        screenSubtitle: {
            fontSize: hp(1.6),
            color: theme.white + '90',
            textAlign: 'center',
            lineHeight: hp(2.3),
            fontFamily: fontFamilies.normal,
        },
        faqCard: {
            paddingHorizontal: wp(4),
            paddingVertical: hp(1.2),
            backgroundColor: theme.black + '20',
            marginBottom: hp(1.5),
        },
        socialCard: {
            paddingHorizontal: wp(3),
            paddingVertical: hp(1),
            borderRadius: hp(2),
            marginBottom: hp(1.5)
        },
    });

    const renderFaq = useCallback(
        () => (
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.titleBlock}>
                    <Text style={styles.screenTitle}>{t('Contact.faq') || 'FAQ'}</Text>
                    <Text style={styles.screenSubtitle}>
                        {t('FAQ.subtitle')}
                    </Text>
                </View>

                {faqItems.map((item, index) => (
                    <GlassView key={`faq-${index}`} bordered radius={hp(1.8)} glassStyles={styles.faqCard}>
                        <AccordionItem
                            title={item.title}
                            description={item.description}
                            isExpanded={expandedIndex === index}
                            onToggle={() => setExpandedIndex((prev) => (prev === index ? null : index))}
                            containerStyle={{ marginBottom: 0 }}
                            // headerStyle={{ paddingVertical: hp(0.5) }}
                            contentStyle={{ paddingBottom: hp(1.2) }}
                        />
                    </GlassView>
                ))}

                {/* <View style={{ height: hp(3) }} /> */}
            </ScrollView>
        ),
        [expandedIndex, faqItems, styles, t]
    );

    const renderContact = useCallback(
        () => (
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.titleBlock}>
                    <Text style={styles.screenTitle}>{t('Contact.title') || 'Contact Us'}</Text>
                    <Text style={styles.screenSubtitle}>
                        {t('FAQ.subtitle')}
                    </Text>
                </View>
                {/* <SettingsContainer> */}
                <GlassView bordered glassStyles={{ marginBottom: hp(2.5), width: "auto", alignSelf: "center", height: hp(10), justifyContent: "center", alignItems: "center", padding: hp(2) }} >
                    <Pressable onPress={() => Linking.openURL('mailto:info@ventally.co')}>

                        <Image source={mailIcon} style={{ width: hp(3), height: hp(3), resizeMode: "contain", alignSelf: "center" }} />
                        <Text style={styles.text}>
                            {t('Contact.email')}
                        </Text>
                    </Pressable>
                </GlassView>


                <GlassView bordered glassStyles={styles.socialCard} >

                    <SettingsItem
                        title={t('Contact.website') || "Visit Website"}
                        leftIcon={websiteIcon}
                        onPress={() => Linking.openURL('https://ventally.co/')}
                        type='info'
                    />
                </GlassView>
                <GlassView bordered glassStyles={styles.socialCard} >
                    <SettingsItem
                        type='info'
                        title={t('Contact.facebook') || "Facebook"}
                        leftIcon={fbIcon}
                        onPress={() => Linking.openURL('https://www.facebook.com/share/1DBvLkRmW4/?mibextid=wwXIfr')}
                    />
                </GlassView>
                <GlassView bordered glassStyles={styles.socialCard} >
                    <SettingsItem
                        type='info'
                        title={t('Contact.instagram') || "Instagram"}
                        leftIcon={instaIcon}
                        onPress={() => Linking.openURL('https://www.instagram.com/ventally.co?igsh=bDBxaW42MzdmaTZn')}
                    />
                </GlassView>
                <GlassView bordered glassStyles={styles.socialCard} >
                    <SettingsItem
                        type='info'
                        title={t('Contact.twitter') || "Twitter (X)"}
                        leftIcon={twitterIcon}
                        onPress={() => Linking.openURL('https://x.com/ventallyco')}
                    />
                </GlassView>
                <GlassView bordered glassStyles={styles.socialCard} >

                    <SettingsItem
                        type='info'

                        title={t('Contact.tiktok') || "TikTok"}
                        leftIcon={tiktokIcon}
                        onPress={() => Linking.openURL('https://www.tiktok.com/@ventallyco?_r=1&_t=ZP-943pBMEKx1r')}
                    />
                </GlassView>
                <GlassView bordered glassStyles={styles.socialCard} >
                    <SettingsItem
                        type='info'
                        title={t('Contact.appeal') || "Appeal"}
                        leftIcon={appealIcon}
                        onPress={() => navigation.navigate(routes.appeal as never)}
                    />
                </GlassView>
                {/* </SettingsContainer> */}
                < View style={{ height: hp(3) }} />
            </ScrollView >
        ),
        [t]
    );

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader
                onBackPress={handleBack}
                title={t('Contact.title') || "Contact Us"}
            />
            <View style={styles.content}>
                <View style={styles.tabWrapper}>
                    <SwipeableTabs
                        tabs={tabs}
                        paddingHorizontal={wp(5)}
                        getLabel={(tabKey: string) => {
                            if (tabKey === 'faq') return t('Contact.faq') || 'FAQ';
                            return t('Contact.title') || 'Contact Us';
                        }}
                        renderContent={(tabKey: string) => {
                            if (tabKey === 'faq') return renderFaq();
                            return renderContact();
                        }}
                    />
                </View>
            </View>
        </HomeWrapper>
    );
};

export default ContactUs;
