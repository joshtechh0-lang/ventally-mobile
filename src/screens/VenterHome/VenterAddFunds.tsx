import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    Platform,
    TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { routes } from '../../navigation/routes';
import { usePayments } from '../../api';
import apiInstance from '../../api/apiInstance';
import { ScreenHeader } from '../../components';
import { WebView } from 'react-native-webview';
import { useStripe } from '@stripe/stripe-react-native';
import { toastError, toastSuccess } from '../../utils/toast';

// Pay-as-you-go top-up packs (one-time purchases)
const PAYG_PACKS = [
    {
        id: 'voice_top_up',
        label: '15 voice minutes',
        sublabel: '$0.69/min · ~15 minutes of support',
        price: 19.99,
    },
    {
        id: 'text_top_up',
        label: '50 chat messages',
        sublabel: '$0.39/min · text at your own pace',
        price: 14.99,
    },
    {
        id: 'support_boost',
        label: 'Voice + chat bundle',
        sublabel: '30 min + 50 messages · best value',
        price: 34.99,
        badge: 'Best value',
    },
];

const VenterAddFunds = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { createCheckoutSession } = usePayments();
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const [selectedPlan, setSelectedPlan] = useState<typeof PAYG_PACKS[0] | null>(null);
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState('');

    // Promo code state
    const [promoCode, setPromoCode] = useState('');
    const [promoValidating, setPromoValidating] = useState(false);
    const [appliedPromo, setAppliedPromo] = useState<{
        code: string;
        discountType: string;
        discountValue: number;
        freeMinutes: number | null;
    } | null>(null);
    const [promoError, setPromoError] = useState('');

    const handleApplyPromo = async () => {
        const trimmed = promoCode.trim().toUpperCase();
        if (!trimmed) {
            setPromoError('Please enter a promo code');
            return;
        }
        setPromoError('');
        setAppliedPromo(null);
        setPromoValidating(true);
        try {
            const res: any = await apiInstance.post('promo/validate', { code: trimmed });
            if (res?.valid) {
                setAppliedPromo({
                    code: res.promo.code,
                    discountType: res.promo.discountType,
                    discountValue: res.promo.discountValue,
                    freeMinutes: res.promo.freeMinutes ?? null,
                });
                toastSuccess({ text: 'Promo code applied!', theme });
            } else {
                setPromoError(res?.error || 'Invalid or expired promo code');
            }
        } catch (err: any) {
            setPromoError(err?.message || 'Invalid or expired promo code');
        } finally {
            setPromoValidating(false);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoCode('');
        setPromoError('');
    };

    const handleConfirm = async () => {
        if (!selectedPlan) {
            toastError({ text: 'Please select a pack', theme });
            return;
        }
        try {
            setLoading(true);
            if (Platform.OS === 'ios') {
                const intentRes: any = await apiInstance.post('payments/top-up-intent', {
                    packType: selectedPlan?.id,
                    ...(appliedPromo ? { promoCode: appliedPromo.code } : {}),
                });
                const clientSecret = intentRes?.clientSecret || intentRes?.data?.clientSecret;
                if (!clientSecret) {
                    toastError({ text: 'Failed to initialize payment. Please try again.', theme });
                    return;
                }
                const { error: initError } = await initPaymentSheet({
                    paymentIntentClientSecret: clientSecret,
                    merchantDisplayName: 'Ventally',
                    allowsDelayedPaymentMethods: false,
                });
                if (initError) {
                    toastError({ text: initError.message, theme });
                    return;
                }
                const { error: presentError } = await presentPaymentSheet();
                if (presentError) {
                    if (presentError.code !== 'Canceled') {
                        toastError({ text: presentError.message, theme });
                    }
                    return;
                }
                toastSuccess({ text: 'Payment successful! Credits will appear in your wallet shortly.', theme });
                (navigation as any).navigate(routes.venterWallet);
            } else {
                const res = await createCheckoutSession({
                    packType: selectedPlan?.id,
                    ...(appliedPromo ? { promoCode: appliedPromo.code } : {}),
                });
                if (!res?.url) {
                    toastError({ text: 'Failed to create checkout session. Please try again.', theme });
                    return;
                }
                setUrl(res.url);
            }
        } catch (err: any) {
            toastError({ text: err?.message || 'Something went wrong. Please try again.', theme });
        } finally {
            setLoading(false);
        }
    };

    const handleWebViewNavigationStateChange = async (urlData: any) => {
        const { url: navUrl } = urlData;
        if (navUrl === 'https://api.ventally.co/api/v1/billing/success') {
            setUrl('');
            toastSuccess({ text: 'Payment under review will be visible in your wallet when approved', theme });
            navigation?.goBack();
        }
    };

    const s = StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingBottom: hp(5),
        },
        // Option cards
        optionCard: {
            borderRadius: hp(2),
            padding: hp(2.2),
            marginBottom: hp(2),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        optionIcon: {
            width: hp(5.5),
            height: hp(5.5),
            borderRadius: hp(1.4),
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: wp(3.5),
        },
        optionEmoji: {
            fontSize: hp(2.8),
        },
        optionInfo: {
            flex: 1,
        },
        optionTitle: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(1.85),
            color: theme.white,
            marginBottom: hp(0.3),
        },
        optionDesc: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.5),
            color: 'rgba(255,255,255,0.6)',
        },
        optionTag: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(1.35),
            marginTop: hp(0.4),
        },
        chevron: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(2),
            color: 'rgba(255,255,255,0.3)',
            marginLeft: wp(2),
        },
        // PAYG section
        paygTitle: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(1.85),
            color: theme.white,
            marginBottom: hp(0.4),
        },
        paygDesc: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.5),
            color: 'rgba(255,255,255,0.55)',
            marginBottom: hp(1.2),
        },
        paygRates: {
            flexDirection: 'row',
            gap: wp(3),
            marginBottom: hp(1.5),
        },
        paygRate: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.4),
            color: 'rgba(255,255,255,0.45)',
        },
        saveCardBtn: {
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: hp(999),
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
            paddingVertical: hp(1.5),
            alignItems: 'center',
            marginBottom: hp(2),
        },
        saveCardBtnText: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(1.7),
            color: theme.white,
        },
        packLabel: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.35),
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            marginBottom: hp(1),
        },
        packCard: {
            borderRadius: hp(1.8),
            borderWidth: 1,
            padding: hp(1.8),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: hp(1.2),
        },
        packInfo: {
            flex: 1,
            marginRight: wp(2),
        },
        packNameRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: wp(2),
            marginBottom: hp(0.3),
        },
        packName: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(1.7),
            color: theme.white,
        },
        packBadge: {
            backgroundColor: 'rgba(124,58,237,0.25)',
            borderRadius: hp(999),
            paddingHorizontal: wp(2.5),
            paddingVertical: hp(0.2),
        },
        packBadgeText: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(1.3),
            color: '#a78bfa',
        },
        packSub: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.4),
            color: 'rgba(255,255,255,0.45)',
        },
        packPrice: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(2),
            color: '#a855f7',
        },
        // Confirm button
        confirmBtn: {
            backgroundColor: 'rgba(124,58,237,0.75)',
            borderRadius: hp(999),
            paddingVertical: hp(1.9),
            alignItems: 'center',
            marginTop: hp(1),
            marginBottom: hp(2),
        },
        confirmBtnText: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(1.85),
            color: theme.white,
        },
        // Promo
        promoSection: {
            marginTop: hp(0.5),
            marginBottom: hp(2),
        },
        promoRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: wp(2),
        },
        promoInput: {
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: hp(999),
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.18)',
            paddingHorizontal: wp(4),
            paddingVertical: hp(1.3),
            color: theme.white,
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
        },
        promoApplyBtn: {
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: hp(999),
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.25)',
            paddingHorizontal: wp(4.5),
            paddingVertical: hp(1.3),
        },
        promoApplyText: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(1.6),
            color: theme.white,
        },
        promoApplied: {
            backgroundColor: 'rgba(76,175,80,0.12)',
            borderRadius: hp(1.4),
            borderWidth: 1,
            borderColor: 'rgba(76,175,80,0.3)',
            padding: hp(1.4),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: hp(1),
        },
        promoAppliedText: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(1.55),
            color: '#4caf50',
            flex: 1,
        },
        promoRemove: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.4),
            color: 'rgba(255,255,255,0.4)',
        },
        promoError: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.45),
            color: '#ef4444',
            marginTop: hp(0.7),
        },
        // Divider
        dividerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: hp(2.5),
            gap: wp(3),
        },
        dividerLine: {
            flex: 1,
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.1)',
        },
        dividerText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.4),
            color: 'rgba(255,255,255,0.3)',
        },
    });

    // WebView checkout (Android)
    if (url) {
        return (
            <HomeWrapper>
                <ScreenHeader title="Checkout" onBack={() => setUrl('')} />
                <WebView
                    source={{ uri: url }}
                    onNavigationStateChange={handleWebViewNavigationStateChange}
                    style={{ flex: 1 }}
                />
            </HomeWrapper>
        );
    }

    return (
        <HomeWrapper>
            <ScreenHeader title="Start a session" onBack={() => (navigation as any).goBack()} />
            <ScrollView
                contentContainerStyle={s.container}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Option 1 — Free with ads */}
                <TouchableOpacity
                    style={[s.optionCard, { backgroundColor: 'rgba(76,175,80,0.1)', borderWidth: 1.5, borderColor: 'rgba(76,175,80,0.3)' }]}
                    onPress={() => (navigation as any).navigate(routes.venterInternal, { screen: routes.venterWatchAds })}
                    activeOpacity={0.8}
                >
                    <View style={[s.optionIcon, { backgroundColor: 'rgba(76,175,80,0.2)' }]}>
                        <Text style={s.optionEmoji}>▶</Text>
                    </View>
                    <View style={s.optionInfo}>
                        <Text style={s.optionTitle}>Free with ads</Text>
                        <Text style={s.optionDesc}>Watch 3 short ads — earn 5 voice minutes or 20 chat messages</Text>
                        <Text style={[s.optionTag, { color: '#4caf50' }]}>No payment needed · resets daily</Text>
                    </View>
                    <Text style={s.chevron}>›</Text>
                </TouchableOpacity>

                {/* Option 2 — Pay as you go */}
                <View style={{ marginBottom: hp(1) }}>
                    <Text style={s.paygTitle}>Pay as you go</Text>
                    <Text style={s.paygDesc}>Save a card and get billed only for the time you use.</Text>
                    <View style={s.paygRates}>
                        <Text style={s.paygRate}>📞 $0.69/min voice</Text>
                        <Text style={s.paygRate}>·</Text>
                        <Text style={s.paygRate}>💬 $0.39/min chat</Text>
                    </View>

                    <TouchableOpacity
                        style={s.saveCardBtn}
                        onPress={() => (navigation as any).navigate(routes.addPaymentMethod, { from: 'VenterAddFunds' })}
                        activeOpacity={0.75}
                    >
                        <Text style={s.saveCardBtnText}>💳  Save a payment method</Text>
                    </TouchableOpacity>

                    {/* One-time packs */}
                    <Text style={s.packLabel}>Or buy a pack upfront</Text>
                    {PAYG_PACKS.map(pack => {
                        const isSelected = selectedPlan?.id === pack.id;
                        return (
                            <TouchableOpacity
                                key={pack.id}
                                style={[
                                    s.packCard,
                                    isSelected
                                        ? { backgroundColor: 'rgba(124,58,237,0.15)', borderColor: 'rgba(167,139,250,0.4)' }
                                        : { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
                                ]}
                                onPress={() => setSelectedPlan(pack)}
                                activeOpacity={0.8}
                            >
                                <View style={s.packInfo}>
                                    <View style={s.packNameRow}>
                                        <Text style={s.packName}>{pack.label}</Text>
                                        {pack.badge && (
                                            <View style={s.packBadge}>
                                                <Text style={s.packBadgeText}>{pack.badge}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={s.packSub}>{pack.sublabel}</Text>
                                </View>
                                <Text style={s.packPrice}>${pack.price.toFixed(2)}</Text>
                            </TouchableOpacity>
                        );
                    })}

                    {/* Promo code */}
                    {selectedPlan && (
                        <View style={s.promoSection}>
                            {!appliedPromo ? (
                                <>
                                    <View style={s.promoRow}>
                                        <TextInput
                                            style={s.promoInput}
                                            placeholder="Promo code"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={promoCode}
                                            onChangeText={text => { setPromoCode(text); setPromoError(''); }}
                                            autoCapitalize="characters"
                                            returnKeyType="done"
                                        />
                                        <TouchableOpacity
                                            style={s.promoApplyBtn}
                                            onPress={handleApplyPromo}
                                            disabled={promoValidating}
                                            activeOpacity={0.75}
                                        >
                                            {promoValidating
                                                ? <ActivityIndicator size="small" color={theme.white} />
                                                : <Text style={s.promoApplyText}>Apply</Text>
                                            }
                                        </TouchableOpacity>
                                    </View>
                                    {promoError ? <Text style={s.promoError}>{promoError}</Text> : null}
                                </>
                            ) : (
                                <View style={s.promoApplied}>
                                    <Text style={s.promoAppliedText}>
                                        ✓ {appliedPromo.code}
                                        {appliedPromo.freeMinutes
                                            ? ` · +${appliedPromo.freeMinutes} free minutes`
                                            : ` · ${appliedPromo.discountValue}% off`}
                                    </Text>
                                    <TouchableOpacity onPress={handleRemovePromo}>
                                        <Text style={s.promoRemove}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}

                    {selectedPlan && (
                        <TouchableOpacity
                            style={s.confirmBtn}
                            onPress={handleConfirm}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading
                                ? <ActivityIndicator color={theme.white} />
                                : <Text style={s.confirmBtnText}>
                                    Buy {selectedPlan.label} — ${selectedPlan.price.toFixed(2)}
                                  </Text>
                            }
                        </TouchableOpacity>
                    )}
                </View>

                {/* Divider */}
                <View style={s.dividerRow}>
                    <View style={s.dividerLine} />
                    <Text style={s.dividerText}>OR</Text>
                    <View style={s.dividerLine} />
                </View>

                {/* Option 3 — Membership */}
                <TouchableOpacity
                    style={[s.optionCard, { backgroundColor: 'rgba(124,58,237,0.12)', borderWidth: 1.5, borderColor: 'rgba(167,139,250,0.3)' }]}
                    onPress={() => (navigation as any).navigate(routes.venterUpgradePlan)}
                    activeOpacity={0.8}
                >
                    <View style={[s.optionIcon, { backgroundColor: 'rgba(124,58,237,0.2)' }]}>
                        <Text style={s.optionEmoji}>👑</Text>
                    </View>
                    <View style={s.optionInfo}>
                        <Text style={s.optionTitle}>Membership</Text>
                        <Text style={s.optionDesc}>60 ad-free minutes every month. Unused minutes roll over.</Text>
                        <Text style={[s.optionTag, { color: '#a855f7' }]}>From $20/mo · subscribe anytime</Text>
                    </View>
                    <Text style={s.chevron}>›</Text>
                </TouchableOpacity>
            </ScrollView>
        </HomeWrapper>
    );
};

export default VenterAddFunds;
