import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';

interface LegalDocProps {
    titleKey?: string;
    contentKey?: string;
    defaultTitle?: string;
    defaultContent?: string;
}

const LegalDocViewer = (props: any) => { // Using any for route params flexibility
    const { theme } = useTheme();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const navigation = useNavigation();
    const route = useRoute();

    // Props might come from route params or direct props if mapped
    const params = route.params as LegalDocProps || {};
    const title = params.defaultTitle || t(params.titleKey || 'Legal.title');
    const content = params.defaultContent || t(params.contentKey || 'Legal.content'); // Content should likely be a long string or array of sections

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: wp(5),
        },
        scrollContent: {
            paddingTop: hp(2),
            paddingBottom: hp(5),
        },
        meta: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6), // Min 1.6
            color: theme.white + "70",
            marginBottom: hp(2),
        },
        contentText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.7), // Within range 1.6 - 2
            color: theme.white,
            lineHeight: hp(2.4),
            marginBottom: hp(2),
        },
        sectionTitle: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.9), // Max 2
            color: theme.white,
            marginTop: hp(2),
            marginBottom: hp(1),
        }
    });

    // Mock content if translation missing for dev
    const mockContent = content === 'Legal.content' ? `
Effective Date: August 11, 2025

Contact: info @ventally.co

Ventally("we," "our," or "us") is committed to protecting your privacy and keeping your personal information secure.This policy explains what we collect, why we collect it, and how we use and protect it.By using our website, app, or services, you agree to this Privacy Policy.

1. Information We Collect
We may collect the following types of information:

a.Information You Provide
• Account details(name, email, phone number if provided)
• Subscription / payment information(processed securely by our payment provider - we never store full card details)
• Profile information for listener / venter matching(age range, language preference, availability, demographics)
• Communications(messages, feedback, customer support requests)

b.Information Collected Automatically
• Device details(IP address, operating system, browser type)
    ` : content;

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader
                title={title}
                onBackPress={() => navigation.goBack()}
                showBackButton
            />
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/*  Render content safely */}
                <Text style={styles.contentText}>{mockContent}</Text>
            </ScrollView>
        </HomeWrapper>
    );
};

export default LegalDocViewer;
