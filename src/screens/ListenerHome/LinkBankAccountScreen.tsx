import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Platform, ActivityIndicator, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassView from '../../components/GlassWrapper';
import Button from '../../components/Button';
import { bankIcon } from '../../assets/icons';
import { apiInstance } from '../../api';
import { toastError } from '../../utils/toast';
import { WebView } from 'react-native-webview';

// Countries where Stripe Connect (payouts) is supported
const STRIPE_SUPPORTED_COUNTRIES = [
    { code: 'AU', name: 'Australia' },
    { code: 'AT', name: 'Austria' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BR', name: 'Brazil' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'CA', name: 'Canada' },
    { code: 'HR', name: 'Croatia' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'DK', name: 'Denmark' },
    { code: 'EE', name: 'Estonia' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GR', name: 'Greece' },
    { code: 'HU', name: 'Hungary' },
    { code: 'IN', name: 'India' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IT', name: 'Italy' },
    { code: 'JP', name: 'Japan' },
    { code: 'KE', name: 'Kenya' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'MT', name: 'Malta' },
    { code: 'MX', name: 'Mexico' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'NO', name: 'Norway' },
    { code: 'PL', name: 'Poland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'RO', name: 'Romania' },
    { code: 'SG', name: 'Singapore' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'ES', name: 'Spain' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'TH', name: 'Thailand' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'US', name: 'United States' },
];

const SUPPORT_EMAIL = 'support@ventally.co';

const LinkBankAccountScreen = () => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
    const [langKey, setLangKey] = React.useState(i18n.language);
    React.useEffect(() => {
        const handler = () => setLangKey(i18n.language);
        i18n.on('languageChanged', handler);
        return () => i18n.off('languageChanged', handler);
    }, [i18n]);
    const { theme } = useTheme();
    const [url, setUrl] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [showPicker, setShowPicker] = useState(false);
    const [countryNotSupported, setCountryNotSupported] = useState(false);

    const isSupported = STRIPE_SUPPORTED_COUNTRIES.some(c => c.code === selectedCountry);
    const selectedCountryName = STRIPE_SUPPORTED_COUNTRIES.find(c => c.code === selectedCountry)?.name;

    const handleSelectCountry = (code: string) => {
        setSelectedCountry(code);
        setShowPicker(false);
        setCountryNotSupported(false);
    };

    const handleContinue = async () => {
        if (!selectedCountry) {
            toastError({ text: 'Please select your country first.' });
            return;
        }
        if (!isSupported) {
            setCountryNotSupported(true);
            return;
        }
        try {
            setLoading(true);
            const res = await apiInstance.post('earnings/bank-account/link', {
                platform: Platform.OS,
                country: selectedCountry,
            });
            console.log(res);
            const onboardingUrl = res?.data?.bankLink?.onboardingUrl;
            if (onboardingUrl) {
                setUrl(onboardingUrl);
            } else {
                toastError({ text: 'Could not get onboarding link. Please try again.' });
            }
        } catch (err: any) {
            console.log(err);
            toastError({ text: err?.response?.data?.message || err?.message || 'Something went wrong' });
        } finally {
            setLoading(false);
        }
    };

    const handleContactSupport = () => {
        Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=International%20Payout%20Setup&body=Hi%2C%20I%27m%20an%20approved%20listener%20in%20${encodeURIComponent(selectedCountryName || selectedCountry)}%20and%20need%20help%20setting%20up%20my%20payouts.`);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: wp(5),
        },
        card: {
            width: '100%',
            padding: hp(3),
            backgroundColor: theme.black + '40',
            borderRadius: hp(3),
            marginTop: hp(2),
        },
        iconContainer: {
            width: hp(8),
            height: hp(8),
            borderRadius: hp(1.5),
            backgroundColor: theme.white + '10',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: hp(2),
            alignSelf: 'center',
        },
        bankIcon: {
            width: hp(4),
            height: hp(4),
            tintColor: theme.white,
            resizeMode: 'contain',
            alignSelf: 'center',
        },
        title: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(2.2),
            color: theme.white,
            marginBottom: hp(0.5),
            textAlign: 'center',
        },
        subtitle: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + 'AA',
            textAlign: 'center',
            marginBottom: hp(2.5),
            lineHeight: hp(2.2),
        },
        countryPickerBtn: {
            width: '100%',
            borderWidth: 1,
            borderColor: theme.white + '30',
            borderRadius: hp(1.5),
            paddingHorizontal: wp(4),
            paddingVertical: hp(1.8),
            marginBottom: hp(2),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.white + '10',
        },
        countryPickerText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.7),
            color: theme.white,
        },
        countryPickerPlaceholder: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.7),
            color: theme.white + '55',
        },
        dropdownContainer: {
            width: '100%',
            maxHeight: hp(30),
            borderWidth: 1,
            borderColor: theme.white + '20',
            borderRadius: hp(1.5),
            backgroundColor: '#1a1a2e',
            marginBottom: hp(2),
            overflow: 'hidden',
        },
        countryItem: {
            paddingHorizontal: wp(4),
            paddingVertical: hp(1.4),
            borderBottomWidth: 1,
            borderBottomColor: theme.white + '10',
        },
        countryItemText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.7),
            color: theme.white,
        },
        footerText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.5),
            color: theme.white + '55',
            textAlign: 'center',
            marginTop: hp(2),
            lineHeight: hp(2.1),
        },
        unsupportedCard: {
            width: '100%',
            padding: hp(2.5),
            backgroundColor: 'rgba(234,179,8,0.08)',
            borderRadius: hp(2),
            borderWidth: 1,
            borderColor: 'rgba(234,179,8,0.25)',
            marginBottom: hp(2),
        },
        unsupportedTitle: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(1.9),
            color: theme.white,
            marginBottom: hp(0.8),
        },
        unsupportedBody: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + 'BB',
            lineHeight: hp(2.3),
            marginBottom: hp(1.5),
        },
        contactLink: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.6),
            color: '#60a5fa',
            textDecorationLine: 'underline',
        },
    });

    if (url) {
        return (
            <HomeWrapper key={langKey}>
                <ScreenHeader
                    title=""
                    onBackPress={() => setUrl('')}
                    showBackButton
                />
                <WebView
                    source={{ uri: url }}
                    style={{ flex: 1 }}
                    startInLoadingState
                    originWhitelist={['*']}
                    setSupportMultipleWindows={false}
                    javaScriptEnabled
                    domStorageEnabled
                    onShouldStartLoadWithRequest={() => true}
                    renderLoading={() => (
                        <View style={{ position: 'absolute', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={theme.white} />
                        </View>
                    )}
                    onNavigationStateChange={(navState) => {
                        if (navState.url.includes('success') || navState.url.includes('return')) {
                            setUrl('');
                            navigation.goBack();
                        }
                    }}
                />
            </HomeWrapper>
        );
    }

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader
                title=""
                onBackPress={() => navigation.goBack()}
                showBackButton
            />
            <ScrollView contentContainerStyle={[styles.container, { paddingBottom: hp(6) }]} showsVerticalScrollIndicator={false}>
                <GlassView bordered glassStyles={styles.card}>
                    <View style={styles.iconContainer}>
                        <Image source={bankIcon} style={styles.bankIcon} />
                    </View>
                    <Text style={styles.title}>{t('Listener.linkBank.title') || 'Link Bank Account'}</Text>
                    <Text style={styles.subtitle}>Select your country to set up your payout account via Stripe.</Text>

                    {/* Country selector */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.countryPickerBtn}
                        onPress={() => setShowPicker(v => !v)}
                    >
                        <Text style={selectedCountry ? styles.countryPickerText : styles.countryPickerPlaceholder}>
                            {selectedCountryName || 'Select your country…'}
                        </Text>
                        <Text style={{ color: theme.white + '80', fontSize: hp(1.6) }}>{showPicker ? '▲' : '▼'}</Text>
                    </TouchableOpacity>

                    {showPicker && (
                        <ScrollView style={styles.dropdownContainer} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                            {STRIPE_SUPPORTED_COUNTRIES.map(c => (
                                <TouchableOpacity
                                    key={c.code}
                                    style={[styles.countryItem, selectedCountry === c.code && { backgroundColor: theme.white + '15' }]}
                                    onPress={() => handleSelectCountry(c.code)}
                                >
                                    <Text style={styles.countryItemText}>{c.name}</Text>
                                </TouchableOpacity>
                            ))}
                            {/* Not listed option */}
                            <TouchableOpacity
                                style={styles.countryItem}
                                onPress={() => { setSelectedCountry('__other__'); setShowPicker(false); setCountryNotSupported(true); }}
                            >
                                <Text style={[styles.countryItemText, { color: '#fbbf24' }]}>My country is not listed</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}

                    {/* Unsupported country notice */}
                    {(countryNotSupported || selectedCountry === '__other__') && (
                        <View style={styles.unsupportedCard}>
                            <Text style={styles.unsupportedTitle}>⚠️ Stripe not available in your region</Text>
                            <Text style={styles.unsupportedBody}>
                                Unfortunately, Stripe payouts are not yet supported in your country. You can still use the app and accept sessions — we'll work with you on a manual payout arrangement.
                                {'\n\n'}Please email us and we'll get you set up:
                            </Text>
                            <TouchableOpacity onPress={handleContactSupport}>
                                <Text style={styles.contactLink}>{SUPPORT_EMAIL}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Continue button — only shown when a valid supported country is selected */}
                    {selectedCountry && selectedCountry !== '__other__' && !countryNotSupported && (
                        <Button
                            title={loading ? 'Setting up…' : t('Common.continue')}
                            onPress={handleContinue}
                            glassStyles={{ width: '100%' }}
                            buttonStyle={{ width: '100%' }}
                            titleStyle={{}}
                            disabled={loading}
                        />
                    )}

                    {!selectedCountry && (
                        <Button
                            title={t('Common.continue')}
                            onPress={handleContinue}
                            glassStyles={{ width: '100%' }}
                            buttonStyle={{ width: '100%' }}
                            titleStyle={{}}
                            disabled={false}
                        />
                    )}

                    <Text style={styles.footerText}>
                        {t('Listener.linkBank.footer') || 'You will be redirected to Stripe to securely link your bank account.'}
                    </Text>
                </GlassView>
            </ScrollView>
        </HomeWrapper>
    );
};

export default LinkBankAccountScreen;
