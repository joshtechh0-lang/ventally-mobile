import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import Button from '../../components/Button';
import apiInstance from '../../api/apiInstance';
import { toastSuccess, toastError } from '../../utils/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AffiliateStats {
  total_clicks: number;
  total_conversions: number;
  total_earnings: number;
  commission_value: number;
  commission_type: 'percentage' | 'flat';
  status: 'active' | 'pending' | 'suspended';
}

interface OtherPlatform {
  platform: string;
  link: string;
}

interface ApplicationForm {
  name: string;
  email: string;
  website: string;
  reason: string;
  instagram_link: string;
  tiktok_link: string;
  facebook_link: string;
  x_link: string;
  other_platforms: OtherPlatform[];
}

const OTHER_PLATFORM_OPTIONS = [
  'YouTube',
  'LinkedIn',
  'Pinterest',
  'Snapchat',
  'Twitch',
  'Reddit',
  'Telegram',
  'Discord',
  'Podcast',
  'Blog / Website',
  'Other',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AFFILIATE_BASE_URL = 'https://ventally.app/signup?ref=';

const formatEarnings = (value: number) =>
  `$${value.toFixed(2)}`;

const statusColor = (status: AffiliateStats['status'], theme: any) => {
  if (status === 'active') return theme.success;
  if (status === 'suspended') return theme.red;
  return theme.yellow;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  theme,
}: {
  label: string;
  value: string | number;
  theme: any;
}) => (
  <View
    style={[
      styles.statCard,
      { backgroundColor: theme.primary + '18', borderColor: theme.primary + '44' },
    ]}
  >
    <Text style={[styles.statValue, { color: theme.white }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: theme.white60 }]}>{label}</Text>
  </View>
);

// ─── Main screen ─────────────────────────────────────────────────────────────

const AffiliateScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Application status: null = never applied, 'pending' = under review, 'approved' = accepted, 'rejected' = rejected
  const [applicationStatus, setApplicationStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

  // Apply form state
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ApplicationForm>({
    name: '',
    email: '',
    website: '',
    reason: '',
    instagram_link: '',
    tiktok_link: '',
    facebook_link: '',
    x_link: '',
    other_platforms: [],
  });

  // Dropdown state for "Other Platforms" picker
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTargetIndex, setPickerTargetIndex] = useState<number | null>(null);

  // ── Load profile to see if user already has a code, and check application status ──
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, statusRes] = await Promise.allSettled([
        apiInstance.get('user/profile'),
        apiInstance.get('affiliates/application/status'),
      ]);

      if (profileRes.status === 'fulfilled') {
        const code: string | null = profileRes.value.data?.user?.affiliate_code ?? null;
        setAffiliateCode(code);
      } else {
        toastError('Failed to load profile');
      }

      if (statusRes.status === 'fulfilled') {
        const appStatus = statusRes.value.data?.data?.status ?? null;
        setApplicationStatus(appStatus);
      }
      // If status fetch fails, just leave applicationStatus as null — non-fatal
    } catch (err: any) {
      toastError(err?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load stats once we have a code ──────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await apiInstance.get('affiliates/my-stats');
      setStats(res.data?.data ?? res.data);
    } catch (err: any) {
      toastError(err?.error || 'Failed to load affiliate stats');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (affiliateCode) {
      fetchStats();
    }
  }, [affiliateCode, fetchStats]);

  // ── Other platforms helpers ──────────────────────────────────────────────
  const addOtherPlatform = () => {
    setForm(f => ({
      ...f,
      other_platforms: [...f.other_platforms, { platform: '', link: '' }],
    }));
  };

  const removeOtherPlatform = (index: number) => {
    setForm(f => ({
      ...f,
      other_platforms: f.other_platforms.filter((_, i) => i !== index),
    }));
  };

  const updateOtherPlatform = (index: number, field: keyof OtherPlatform, value: string) => {
    setForm(f => {
      const updated = [...f.other_platforms];
      updated[index] = { ...updated[index], [field]: value };
      return { ...f, other_platforms: updated };
    });
  };

  const openPlatformPicker = (index: number) => {
    setPickerTargetIndex(index);
    setPickerVisible(true);
  };

  const selectPlatform = (platform: string) => {
    if (pickerTargetIndex !== null) {
      updateOtherPlatform(pickerTargetIndex, 'platform', platform);
    }
    setPickerVisible(false);
    setPickerTargetIndex(null);
  };

  // ── Apply ────────────────────────────────────────────────────────────────
  const handleApply = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.reason.trim()) {
      toastError('Please fill in all required fields');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        website: form.website.trim(),
        reason: form.reason.trim(),
        instagram_link: form.instagram_link.trim() || null,
        tiktok_link: form.tiktok_link.trim() || null,
        facebook_link: form.facebook_link.trim() || null,
        x_link: form.x_link.trim() || null,
        other_platforms: form.other_platforms
          .filter(p => p.platform)
          .map(p => ({ platform: p.platform, link: p.link.trim() })),
      };
      await apiInstance.post('affiliates/application', payload);
      setApplicationStatus('pending');
    } catch (err: any) {
      toastError(err?.error || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Copy ─────────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    if (!affiliateCode) return;
    const link = `${AFFILIATE_BASE_URL}${affiliateCode}`;
    try {
      await Share.share(
        { message: link, title: 'My Ventally Affiliate Link' },
        { dialogTitle: 'Copy or share your affiliate link' },
      );
    } catch {
      // User cancelled — no-op
    }
  };

  // ── Share ────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (!affiliateCode) return;
    const link = `${AFFILIATE_BASE_URL}${affiliateCode}`;
    try {
      await Share.share({
        message: `Earn money by referring friends to Ventally — the peer support app. Sign up via my affiliate link and we both benefit!\n\n${link}`,
        title: 'Ventally Affiliate Link',
      });
    } catch {
      // User cancelled — no-op
    }
  };

  // ── Styles (depend on theme) ─────────────────────────────────────────────
  const s = StyleSheet.create({
    scroll: {
      flex: 1,
    },
    centeredContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: hp(10),
    },
    section: {
      marginBottom: hp(3),
    },
    sectionTitle: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.9),
      color: theme.white,
      marginBottom: hp(1.5),
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: hp(2),
      padding: wp(4),
      borderWidth: 1,
      borderColor: theme.white + '18',
    },
    linkBox: {
      backgroundColor: theme.primary + '18',
      borderRadius: hp(1.5),
      padding: wp(4),
      borderWidth: 1,
      borderColor: theme.primary + '44',
      marginBottom: hp(2),
    },
    linkLabel: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.3),
      color: theme.white60,
      marginBottom: hp(0.5),
    },
    linkText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
      color: theme.white,
    },
    statsRow: {
      flexDirection: 'row',
      gap: wp(3),
      marginBottom: hp(2),
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
    },
    statusDot: {
      width: hp(1),
      height: hp(1),
      borderRadius: hp(0.5),
    },
    statusText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.5),
      textTransform: 'capitalize',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: wp(3),
    },
    btn: {
      flex: 1,
      paddingVertical: hp(1.5),
      borderRadius: hp(1.5),
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnPrimary: {
      backgroundColor: theme.primary,
    },
    btnOutline: {
      borderWidth: 1,
      borderColor: theme.primary,
    },
    btnTextPrimary: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.6),
      color: theme.white,
    },
    btnTextOutline: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.6),
      color: theme.primary,
    },
    input: {
      backgroundColor: theme.surface,
      borderRadius: hp(1.5),
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.2),
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      borderWidth: 1,
      borderColor: theme.white + '18',
      marginBottom: hp(1.5),
    },
    inputMultiline: {
      minHeight: hp(10),
      textAlignVertical: 'top',
    },
    inputLabel: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white60,
      marginBottom: hp(0.5),
    },
    hint: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white60,
      lineHeight: hp(2.2),
      marginBottom: hp(2),
    },
    commissionBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.primary + '22',
      borderRadius: hp(1),
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.5),
      marginBottom: hp(2),
    },
    commissionText: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.5),
      color: theme.primary,
    },
    // ── Social media ────────────────────────────────────────────────────
    sectionDivider: {
      height: 1,
      backgroundColor: theme.white + '12',
      marginVertical: hp(2),
    },
    platformRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(3),
      marginBottom: hp(1.5),
    },
    platformIcon: {
      width: hp(4.5),
      height: hp(4.5),
      borderRadius: hp(1.2),
      alignItems: 'center',
      justifyContent: 'center',
    },
    platformLabel: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
      color: theme.white,
      width: wp(22),
    },
    followersInput: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: hp(1.2),
      paddingHorizontal: wp(3),
      paddingVertical: hp(1),
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      borderWidth: 1,
      borderColor: theme.white + '18',
    },
    followersUnit: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.3),
      color: theme.white60,
      width: wp(10),
    },
    otherPlatformCard: {
      backgroundColor: theme.surface,
      borderRadius: hp(1.5),
      padding: wp(3.5),
      borderWidth: 1,
      borderColor: theme.white + '12',
      marginBottom: hp(1.5),
    },
    otherPlatformRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
      marginBottom: hp(1),
    },
    platformPicker: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.background,
      borderRadius: hp(1.2),
      paddingHorizontal: wp(3),
      paddingVertical: hp(1.1),
      borderWidth: 1,
      borderColor: theme.white + '18',
    },
    platformPickerText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
    },
    platformPickerPlaceholder: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + '40',
    },
    chevron: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white60,
    },
    removeBtn: {
      width: hp(3.5),
      height: hp(3.5),
      borderRadius: hp(1.8),
      backgroundColor: theme.white + '12',
      alignItems: 'center',
      justifyContent: 'center',
    },
    removeBtnText: {
      color: theme.white60,
      fontSize: hp(1.8),
      lineHeight: hp(2),
    },
    linkInput: {
      backgroundColor: theme.background,
      borderRadius: hp(1.2),
      paddingHorizontal: wp(3),
      paddingVertical: hp(1.1),
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.5),
      color: theme.white,
      borderWidth: 1,
      borderColor: theme.white + '12',
    },
    addPlatformBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
      paddingVertical: hp(1.2),
      paddingHorizontal: wp(3),
      borderRadius: hp(1.2),
      borderWidth: 1,
      borderColor: theme.primary + '55',
      borderStyle: 'dashed',
      alignSelf: 'flex-start',
      marginTop: hp(0.5),
    },
    addPlatformText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.5),
      color: theme.primary,
    },
    // ── Pending / submitted state ───────────────────────────────────────
    pendingContainer: {
      flex: 1,
      alignItems: 'center',
      paddingTop: hp(6),
      paddingHorizontal: wp(4),
      paddingBottom: hp(4),
    },
    pendingIconCircle: {
      width: hp(10),
      height: hp(10),
      borderRadius: hp(5),
      backgroundColor: theme.primary + '22',
      borderWidth: 2,
      borderColor: theme.primary + '55',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: hp(3),
    },
    pendingIcon: {
      fontSize: hp(4),
    },
    pendingTitle: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.4),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(1.5),
    },
    pendingSubtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.7),
      color: theme.white + 'AA',
      textAlign: 'center',
      lineHeight: hp(2.6),
      marginBottom: hp(4),
    },
    pendingInfoCard: {
      width: '100%',
      backgroundColor: theme.surface,
      borderRadius: hp(2),
      padding: wp(4),
      borderWidth: 1,
      borderColor: theme.white + '18',
      gap: hp(1.5),
    },
    pendingInfoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: wp(3),
    },
    pendingInfoBullet: {
      fontSize: hp(1.5),
      color: theme.primary,
      marginTop: hp(0.2),
    },
    pendingInfoText: {
      flex: 1,
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + 'BB',
      lineHeight: hp(2.4),
    },
    // ── Picker modal ────────────────────────────────────────────────────
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: hp(2.5),
      borderTopRightRadius: hp(2.5),
      paddingTop: hp(1),
      paddingBottom: hp(4),
      maxHeight: hp(55),
    },
    modalHandle: {
      width: wp(10),
      height: hp(0.5),
      backgroundColor: theme.white + '30',
      borderRadius: hp(0.25),
      alignSelf: 'center',
      marginBottom: hp(2),
    },
    modalTitle: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.8),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(1.5),
    },
    modalOption: {
      paddingVertical: hp(1.6),
      paddingHorizontal: wp(6),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    modalOptionText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.7),
      color: theme.white,
    },
    modalOptionSelected: {
      color: theme.primary,
      fontFamily: fontFamilies.semiBold,
    },
  });

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <HomeWrapper>
        <ScreenHeader title="Affiliate Program" onBackPress={() => navigation.goBack()} />
        <View style={s.centeredContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.white60, fontFamily: fontFamilies.normal, fontSize: hp(1.6), marginTop: hp(2) }}>
            Loading your affiliate info…
          </Text>
        </View>
      </HomeWrapper>
    );
  }

  return (
    <HomeWrapper>
      <ScreenHeader title="Affiliate Program" onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: wp(5), paddingTop: hp(1), paddingBottom: insets.bottom + hp(4) }}
        showsVerticalScrollIndicator={false}
      >
        {applicationStatus === 'pending' && !affiliateCode ? (
          /* ─── PENDING REVIEW ─────────────────────────────────────────── */
          <View style={s.pendingContainer}>
            <View style={s.pendingIconCircle}>
              <Text style={s.pendingIcon}>⏳</Text>
            </View>
            <Text style={s.pendingTitle}>Application Under Review</Text>
            <Text style={s.pendingSubtitle}>
              Your affiliate application has been submitted successfully. Our team will review it and get back to you within 2–3 business days.
            </Text>
            <View style={s.pendingInfoCard}>
              <View style={s.pendingInfoRow}>
                <Text style={s.pendingInfoBullet}>•</Text>
                <Text style={s.pendingInfoText}>You'll receive an email notification once your application is approved.</Text>
              </View>
              <View style={s.pendingInfoRow}>
                <Text style={s.pendingInfoBullet}>•</Text>
                <Text style={s.pendingInfoText}>Once approved, your affiliate dashboard and unique referral link will appear here.</Text>
              </View>
              <View style={s.pendingInfoRow}>
                <Text style={s.pendingInfoBullet}>•</Text>
                <Text style={s.pendingInfoText}>Questions? Contact us at support@ventally.app</Text>
              </View>
            </View>
          </View>
        ) : affiliateCode ? (
          /* ─── DASHBOARD ─────────────────────────────────────────────── */
          <>
            {/* Affiliate link */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Your Affiliate Link</Text>
              <View style={s.linkBox}>
                <Text style={s.linkLabel}>Share this link to earn commissions</Text>
                <Text style={s.linkText} numberOfLines={1}>
                  {AFFILIATE_BASE_URL}{affiliateCode}
                </Text>
              </View>
              <View style={s.buttonRow}>
                <Button
                  title="Copy Link"
                  onPress={handleCopy}
                  glassStyles={{ flex: 1 }}
                />
                <Button
                  title="Share"
                  onPress={handleShare}
                  glassStyles={{ flex: 1 }}
                  borderedGlassButton
                />
              </View>
            </View>

            {/* Stats */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Performance</Text>
              {statsLoading ? (
                <ActivityIndicator color={theme.primary} style={{ marginTop: hp(2) }} />
              ) : stats ? (
                <>
                  {/* Status + Commission */}
                  <View style={[s.card, { marginBottom: hp(2) }]}>
                    <View style={s.statusRow}>
                      <View
                        style={[
                          s.statusDot,
                          { backgroundColor: statusColor(stats.status, theme) },
                        ]}
                      />
                      <Text style={[s.statusText, { color: statusColor(stats.status, theme) }]}>
                        {stats.status}
                      </Text>
                    </View>

                    {/* Commission badge */}
                    <View style={[s.commissionBadge, { marginTop: hp(1.5) }]}>
                      <Text style={s.commissionText}>
                        {stats.commission_type === 'percentage'
                          ? `${stats.commission_value}% commission`
                          : `$${stats.commission_value} per conversion`}
                      </Text>
                    </View>
                  </View>

                  {/* Stat cards */}
                  <View style={s.statsRow}>
                    <StatCard label="Clicks" value={stats.total_clicks} theme={theme} />
                    <StatCard
                      label="Conversions"
                      value={stats.total_conversions}
                      theme={theme}
                    />
                  </View>
                  <View style={s.statsRow}>
                    <StatCard
                      label="Total Earnings"
                      value={formatEarnings(stats.total_earnings)}
                      theme={theme}
                    />
                  </View>

                  {/* Reward breakdown */}
                  <View style={{ marginTop: hp(1) }}>
                    <Text style={{ color: theme.white, fontFamily: fontFamilies.medium, fontSize: hp(1.6), marginBottom: hp(1) }}>Reward Breakdown</Text>
                    <View style={{ flexDirection: 'row', gap: wp(2), marginBottom: hp(1) }}>
                      {[
                        { label: 'Pending', value: stats.pending_rewards ?? 0, color: '#FCD34D' },
                        { label: 'Approved', value: stats.approved_rewards ?? 0, color: '#60A5FA' },
                        { label: 'Paid Out', value: stats.paid_rewards ?? 0, color: '#4CAF50' },
                      ].map(item => (
                        <View key={item.label} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: hp(1), padding: hp(1), alignItems: 'center' }}>
                          <Text style={{ color: item.color, fontSize: hp(2), fontFamily: fontFamilies.bold }}>{item.value}</Text>
                          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.2), fontFamily: fontFamilies.normal }}>{item.label}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={{ backgroundColor: 'rgba(76,175,80,0.12)', borderRadius: hp(1), padding: hp(1.5), borderWidth: 0.5, borderColor: 'rgba(76,175,80,0.3)' }}>
                      <Text style={{ color: 'rgba(76,175,80,0.9)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>
                        💰 Each approved referral earns you a <Text style={{ fontFamily: fontFamilies.medium }}>$3 credit</Text> added to your wallet.
                      </Text>
                    </View>
                  </View>
                </>
              ) : null}
            </View>
          </>
        ) : (
          /* ─── APPLICATION FORM ──────────────────────────────────────── */
          <>
            <View style={s.section}>
              <Text style={s.sectionTitle}>Become an Affiliate</Text>
              <Text style={s.hint}>
                Earn commissions by referring new users to Ventally. Fill out the form
                below and our team will review your application.
              </Text>
            </View>

            <View style={s.section}>
              <Text style={s.inputLabel}>Full Name *</Text>
              <TextInput
                style={s.input}
                placeholder="Your name"
                placeholderTextColor={theme.white + '40'}
                value={form.name}
                onChangeText={v => setForm(f => ({ ...f, name: v }))}
                autoCapitalize="words"
              />

              <Text style={s.inputLabel}>Email Address *</Text>
              <TextInput
                style={s.input}
                placeholder="your@email.com"
                placeholderTextColor={theme.white + '40'}
                value={form.email}
                onChangeText={v => setForm(f => ({ ...f, email: v }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={s.inputLabel}>Website (optional)</Text>
              <TextInput
                style={s.input}
                placeholder="https://yourwebsite.com"
                placeholderTextColor={theme.white + '40'}
                value={form.website}
                onChangeText={v => setForm(f => ({ ...f, website: v }))}
                autoCapitalize="none"
                keyboardType="url"
              />

              <Text style={s.inputLabel}>Why do you want to become an affiliate? *</Text>
              <TextInput
                style={[s.input, s.inputMultiline]}
                placeholder="Tell us about your audience and how you'd promote Ventally…"
                placeholderTextColor={theme.white + '40'}
                value={form.reason}
                onChangeText={v => setForm(f => ({ ...f, reason: v }))}
                multiline
                numberOfLines={4}
              />

              {/* ── Social Media Platforms ───────────────────────────── */}
              <View style={s.sectionDivider} />
              <Text style={[s.sectionTitle, { marginBottom: hp(0.5) }]}>Social Media</Text>
              <Text style={[s.hint, { marginBottom: hp(2) }]}>
                Optional — share your profile links so we can see your reach.
              </Text>

              {/* Fixed platforms */}
              {[
                { key: 'instagram_link' as const, label: 'Instagram', color: '#E1306C', emoji: '📸', placeholder: 'instagram.com/yourprofile' },
                { key: 'tiktok_link' as const,    label: 'TikTok',    color: '#FF0050', emoji: '🎵', placeholder: 'tiktok.com/@yourprofile' },
                { key: 'facebook_link' as const,  label: 'Facebook',  color: '#1877F2', emoji: '👥', placeholder: 'facebook.com/yourprofile' },
                { key: 'x_link' as const,         label: 'X',         color: '#ffffff', emoji: '𝕏', placeholder: 'x.com/yourprofile' },
              ].map(({ key, label, color, emoji, placeholder }) => (
                <View key={key} style={s.platformRow}>
                  <View style={[s.platformIcon, { backgroundColor: color + '22', borderWidth: 1, borderColor: color + '44' }]}>
                    <Text style={{ fontSize: hp(1.8), color: label === 'X' ? '#ffffff' : undefined }}>{emoji}</Text>
                  </View>
                  <Text style={s.platformLabel}>{label}</Text>
                  <TextInput
                    style={[s.followersInput, { flex: 1 }]}
                    placeholder={placeholder}
                    placeholderTextColor={theme.white + '30'}
                    value={form[key]}
                    onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              ))}

              {/* Other platforms */}
              <View style={{ marginTop: hp(1) }}>
                <Text style={[s.inputLabel, { marginBottom: hp(1.2) }]}>Other Platforms</Text>

                {form.other_platforms.map((entry, idx) => (
                  <View key={idx} style={s.otherPlatformCard}>
                    <View style={s.otherPlatformRow}>
                      {/* Platform picker */}
                      <TouchableOpacity
                        style={s.platformPicker}
                        onPress={() => openPlatformPicker(idx)}
                        activeOpacity={0.7}
                      >
                        <Text style={entry.platform ? s.platformPickerText : s.platformPickerPlaceholder}>
                          {entry.platform || 'Select platform'}
                        </Text>
                        <Text style={s.chevron}>▾</Text>
                      </TouchableOpacity>
                      {/* Remove button */}
                      <TouchableOpacity
                        style={s.removeBtn}
                        onPress={() => removeOtherPlatform(idx)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={s.removeBtnText}>×</Text>
                      </TouchableOpacity>
                    </View>
                    {/* Link input */}
                    <TextInput
                      style={s.linkInput}
                      placeholder="Profile link (optional)"
                      placeholderTextColor={theme.white + '30'}
                      value={entry.link}
                      onChangeText={v => updateOtherPlatform(idx, 'link', v)}
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                  </View>
                ))}

                <TouchableOpacity style={s.addPlatformBtn} onPress={addOtherPlatform} activeOpacity={0.7}>
                  <Text style={{ color: theme.primary, fontSize: hp(1.8) }}>+</Text>
                  <Text style={s.addPlatformText}>Add platform</Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Submit Application"
                onPress={handleApply}
                disabled={submitting}
                loading={submitting}
                glassStyles={{ marginTop: hp(2.5) }}
              />

              {/* Platform picker modal */}
              {pickerVisible && <Modal
                visible={pickerVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setPickerVisible(false)}
              >
                <TouchableOpacity
                  style={s.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setPickerVisible(false)}
                >
                  <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                    <View style={s.modalSheet}>
                      <View style={s.modalHandle} />
                      <Text style={s.modalTitle}>Select Platform</Text>
                      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                        {OTHER_PLATFORM_OPTIONS.map(option => {
                          const currentVal = pickerTargetIndex !== null
                            ? form.other_platforms[pickerTargetIndex]?.platform
                            : '';
                          const isSelected = currentVal === option;
                          return (
                            <TouchableOpacity
                              key={option}
                              style={s.modalOption}
                              onPress={() => selectPlatform(option)}
                              activeOpacity={0.7}
                            >
                              <Text style={[s.modalOptionText, isSelected && s.modalOptionSelected]}>
                                {option}
                              </Text>
                              {isSelected && (
                                <Text style={{ color: theme.primary, fontSize: hp(1.6) }}>✓</Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  </TouchableOpacity>
                </TouchableOpacity>
              </Modal>}
            </View>
          </>
        )}

      </ScrollView>
    </HomeWrapper>
  );
};

// ─── Static styles (not theme-dependent) ─────────────────────────────────────
const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    borderRadius: hp(1.5),
    padding: wp(4),
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontFamily: fontFamilies.bold,
    fontSize: hp(2.4),
    marginBottom: hp(0.4),
  },
  statLabel: {
    fontFamily: fontFamilies.normal,
    fontSize: hp(1.3),
  },
});

export default AffiliateScreen;
