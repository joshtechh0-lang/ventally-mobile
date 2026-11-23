import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import Button from '../../components/Button';
import apiInstance from '../../api/apiInstance';
import { toastSuccess, toastError } from '../../utils/toast';

interface ReferralStats {
  referralCode: string;
  totalReferred: number;
  pendingRewards: number;
  earnedRewards: number; // in minutes or credits
  referrals: ReferralEntry[];
}

interface ReferralEntry {
  id: string;
  referredUser: string;
  status: 'pending' | 'completed';
  rewardGranted: boolean;
  createdAt: string;
}

const ReferralScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats | null>(null);

  const fetchReferralData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiInstance.get('referrals/my-stats');
      setStats(res.data?.data ?? res.data);
    } catch (err: any) {
      toastError(err?.error || 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const getShareCaption = (code: string) =>
    `💜 I use Ventally to talk to a real person whenever I need support — anonymously.\n\nSign up with my code and we both get 5 free minutes:\n\n🔑 Code: ${code}\n🔗 Link: https://ventally.app/signup?ref=${code}\n\n📱 App Store: https://apps.apple.com/app/ventally/id6737272195\n🤖 Play Store: https://play.google.com/store/apps/details?id=com.ventally`;

  const handleShare = async () => {
    if (!stats?.referralCode) return;
    const message = getShareCaption(stats.referralCode);
    try {
      await Share.share({
        message,
        title: 'Join Ventally — get 5 free minutes',
      });
    } catch (err) {
      // User cancelled share — no-op
    }
  };

  const handleCopyCode = async () => {
    if (!stats?.referralCode) return;
    try {
      await Share.share(
        {
          message: stats.referralCode,
          title: 'My Ventally Referral Code',
        },
        { dialogTitle: 'Copy or share your referral code' },
      );
    } catch {
      // User cancelled — no-op
    }
  };

  const styles = StyleSheet.create({
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
      paddingBottom: hp(4),
      gap: hp(2),
    },
    heroCard: {
      backgroundColor: theme.green + '44',
      borderRadius: wp(4),
      borderWidth: 1,
      borderColor: theme.green + '88',
      padding: wp(5),
      alignItems: 'center',
      gap: hp(1.5),
    },
    heroEmoji: {
      fontSize: hp(5),
    },
    heroTitle: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.4),
      color: theme.white,
      textAlign: 'center',
    },
    heroSubtitle: {
      fontFamily: fontFamilies.regular,
      fontSize: hp(1.7),
      color: theme.white + 'BB',
      textAlign: 'center',
      lineHeight: hp(2.6),
    },
    codeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: wp(3),
      borderWidth: 1,
      borderColor: theme.white + '22',
      overflow: 'hidden',
      marginTop: hp(0.5),
    },
    codeText: {
      flex: 1,
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.4),
      color: theme.white,
      letterSpacing: 3,
      textAlign: 'center',
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(4),
    },
    copyBtn: {
      backgroundColor: theme.green,
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    copyBtnText: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.6),
      color: theme.white,
    },
    shareBtn: {
      backgroundColor: theme.primary,
      borderRadius: wp(3),
      paddingVertical: hp(1.8),
      alignItems: 'center',
    },
    shareBtnText: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.8),
      color: theme.white,
    },
    statsRow: {
      flexDirection: 'row',
      gap: wp(3),
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: wp(3),
      borderWidth: 1,
      borderColor: theme.white + '15',
      padding: wp(4),
      alignItems: 'center',
      gap: hp(0.5),
    },
    statNumber: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(3),
      color: theme.white,
    },
    statLabel: {
      fontFamily: fontFamilies.regular,
      fontSize: hp(1.5),
      color: theme.white + 'AA',
      textAlign: 'center',
    },
    sectionTitle: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.9),
      color: theme.white,
      marginBottom: hp(0.5),
    },
    howItWorksCard: {
      backgroundColor: theme.surface,
      borderRadius: wp(3),
      borderWidth: 1,
      borderColor: theme.white + '15',
      padding: wp(4),
      gap: hp(1.5),
    },
    howStep: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: wp(3),
    },
    stepBadge: {
      width: wp(7),
      height: wp(7),
      borderRadius: wp(3.5),
      backgroundColor: theme.green + '55',
      borderWidth: 1,
      borderColor: theme.green + 'AA',
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepBadgeText: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(1.6),
      color: theme.yellow,
    },
    stepText: {
      flex: 1,
      fontFamily: fontFamilies.regular,
      fontSize: hp(1.7),
      color: theme.white + 'CC',
      lineHeight: hp(2.5),
    },
    referralList: {
      gap: hp(1),
    },
    referralItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: wp(3),
      borderWidth: 1,
      borderColor: theme.white + '15',
      padding: wp(4),
      gap: wp(3),
    },
    referralAvatar: {
      width: wp(10),
      height: wp(10),
      borderRadius: wp(5),
      backgroundColor: theme.green + '55',
      justifyContent: 'center',
      alignItems: 'center',
    },
    referralAvatarText: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2),
      color: theme.yellow,
    },
    referralInfo: {
      flex: 1,
    },
    referralName: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.7),
      color: theme.white,
    },
    referralDate: {
      fontFamily: fontFamilies.regular,
      fontSize: hp(1.5),
      color: theme.white + '66',
      marginTop: hp(0.3),
    },
    statusBadge: {
      paddingHorizontal: wp(2.5),
      paddingVertical: hp(0.4),
      borderRadius: wp(2),
    },
    statusText: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.4),
    },
    emptyText: {
      fontFamily: fontFamilies.regular,
      fontSize: hp(1.7),
      color: theme.white + '66',
      textAlign: 'center',
      paddingVertical: hp(3),
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: hp(10),
    },
  });

  if (loading) {
    return (
      <HomeWrapper>
        <ScreenHeader
          title="Referrals"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loader}>
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
      </HomeWrapper>
    );
  }

  const referralCode = stats?.referralCode ?? '------';
  const totalReferred = stats?.totalReferred ?? 0;
  const earnedRewards = stats?.earnedRewards ?? 0;

  return (
    <HomeWrapper>
      <ScreenHeader
        title="Referrals"
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Shareable referral graphic card */}
        <LinearGradient
          colors={['#1a0a3a', '#0f0620', '#100030']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: wp(5),
            borderWidth: 1,
            borderColor: 'rgba(167,139,250,0.25)',
            marginBottom: hp(2),
            overflow: 'hidden',
          }}
        >
          {/* Top accent bar */}
          <LinearGradient
            colors={['#7c3aed', '#a855f7', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: hp(0.5) }}
          />
          <View style={{ paddingHorizontal: wp(6), paddingVertical: hp(3.5), alignItems: 'center' }}>
            {/* Logo row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2), marginBottom: hp(2.5) }}>
              <View style={{ width: hp(4), height: hp(4), borderRadius: hp(1), backgroundColor: 'rgba(124,58,237,0.6)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: hp(2) }}>💜</Text>
              </View>
              <Text style={{ color: 'white', fontSize: hp(2.2), fontFamily: fontFamilies.bold, letterSpacing: -0.5 }}>ventally</Text>
            </View>
            {/* You're invited */}
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.3), fontFamily: fontFamilies.semiBold, letterSpacing: 2, textTransform: 'uppercase', marginBottom: hp(0.8) }}>
              You're invited
            </Text>
            <Text style={{ color: 'white', fontSize: hp(2.3), fontFamily: fontFamilies.bold, textAlign: 'center', marginBottom: hp(0.8) }}>
              Talk to someone who cares.
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: hp(1.6), fontFamily: fontFamilies.normal, textAlign: 'center', lineHeight: hp(2.4), marginBottom: hp(2.5) }}>
              Anonymous peer support, available whenever you need it.{'\n'}
              Sign up with my code and we both get{' '}
              <Text style={{ color: 'white', fontFamily: fontFamilies.semiBold }}>5 free minutes</Text>.
            </Text>
            {/* Code badge */}
            <View style={{
              backgroundColor: 'rgba(124,58,237,0.2)',
              borderWidth: 1.5,
              borderColor: 'rgba(167,139,250,0.4)',
              borderRadius: wp(4),
              paddingHorizontal: wp(8),
              paddingVertical: hp(1.5),
              alignItems: 'center',
              marginBottom: hp(1.5),
            }}>
              <Text style={{ color: 'rgba(167,139,250,0.7)', fontSize: hp(1.2), fontFamily: fontFamilies.semiBold, letterSpacing: 2, marginBottom: hp(0.3) }}>
                REFERRAL CODE
              </Text>
              <Text style={{ color: 'white', fontSize: hp(3.2), fontFamily: fontFamilies.bold, letterSpacing: 6 }}>
                {referralCode}
              </Text>
            </View>
            {/* Link */}
            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>
              ventally.app/signup?ref={referralCode}
            </Text>
          </View>
        </LinearGradient>

        {/* Copy + Share actions */}
        <View style={{ flexDirection: 'row', gap: wp(3), marginBottom: hp(2) }}>
          <TouchableOpacity
            onPress={handleCopyCode}
            style={{ flex: 1, backgroundColor: 'rgba(124,58,237,0.2)', borderRadius: wp(3), borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)', paddingVertical: hp(1.8), alignItems: 'center' }}
          >
            <Text style={{ color: 'rgba(167,139,250,1)', fontFamily: fontFamilies.semiBold, fontSize: hp(1.7) }}>📋 Copy Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={{ flex: 1, backgroundColor: 'rgba(167,139,250,0.15)', borderRadius: wp(3), borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)', paddingVertical: hp(1.8), alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontFamily: fontFamilies.semiBold, fontSize: hp(1.7) }}>📤 Share</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalReferred}</Text>
            <Text style={styles.statLabel}>Friends Referred</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{earnedRewards}</Text>
            <Text style={styles.statLabel}>Minutes Earned</Text>
          </View>
        </View>

        {/* How it works */}
        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.howItWorksCard}>
          {[
            'Share your unique referral code with friends or family',
            'They sign up using your code — they get a discount on their first session',
            'Once they complete their first session, you both receive free minutes',
          ].map((step, i) => (
            <View key={i} style={styles.howStep}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Referral history */}
        <Text style={styles.sectionTitle}>Your Referrals</Text>
        {!stats?.referrals?.length ? (
          <Text style={styles.emptyText}>No referrals yet — share your code to get started!</Text>
        ) : (
          <View style={styles.referralList}>
            {stats.referrals.map((ref) => {
              const isCompleted = ref.status === 'completed';
              return (
                <View key={ref.id} style={styles.referralItem}>
                  <View style={styles.referralAvatar}>
                    <Text style={styles.referralAvatarText}>
                      {(ref.referredUser?.[0] || '?').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.referralInfo}>
                    <Text style={styles.referralName}>{ref.referredUser || 'Anonymous'}</Text>
                    <Text style={styles.referralDate}>
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isCompleted
                          ? (theme.success ?? '#22c55e') + '22'
                          : '#f59e0b22',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: isCompleted
                            ? theme.success ?? '#22c55e'
                            : '#f59e0b',
                        },
                      ]}
                    >
                      {isCompleted ? 'Rewarded' : 'Pending'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </HomeWrapper>
  );
};

export default ReferralScreen;
