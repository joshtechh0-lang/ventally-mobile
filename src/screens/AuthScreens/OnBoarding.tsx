import React, { useRef, useState } from 'react'
import AuthWrapper from '../../wrapper/AuthWrapper'
import { Image, Text, View, FlatList, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { fontFamilies } from '../../utils/fontFamilies'
import { hp, wp, WINDOW_WIDTH } from '../../utils/size'
import { useTheme } from '../../theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { routes } from '../../navigation/routes'
import { chatIcon, mouseIcon } from '../../assets/icons'
import Button from '../../components/Button'
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';

type Role = 'none' | 'venter' | 'listener';

interface SlideItem {
  id: string;
  icon: string;
  title: string;
  body: string;
}

const VENTER_SLIDES: SlideItem[] = [
  {
    id: 'v1',
    icon: '🎙️',
    title: 'Talk as long as you need',
    body: 'Sessions are not time-limited. You talk, the clock runs — but you stay in control. You can end a call whenever you feel ready. Minutes are deducted from your wallet only for the time you actually spend talking.',
  },
  {
    id: 'v2',
    icon: '🔍',
    title: 'Find a Support Guide',
    body: 'Browse available Support Guides and tap "Connect" to start a session. When a Guide accepts, the call begins. If they\'re busy, you can request another Guide — no waiting in long queues.',
  },
  {
    id: 'v3',
    icon: '💳',
    title: 'Simple pay-as-you-go',
    body: 'Top up your wallet with any amount you like. Minutes are only deducted while you\'re on a live call. No subscriptions required — though membership plans give you better rates per minute.',
  },
  {
    id: 'v4',
    icon: '🔒',
    title: '100% anonymous',
    body: 'Your Support Guide never sees your real name, photo, or contact details. You can vent freely — this is a judgment-free space built for your privacy.',
  },
  {
    id: 'v5',
    icon: '🤝',
    title: 'Refer friends, earn credits',
    body: 'Share your referral link with friends. When they join and top up, you both get wallet credits. Find your referral link in your profile settings.',
  },
];

const LISTENER_SLIDES: SlideItem[] = [
  {
    id: 'l1',
    icon: '📲',
    title: 'How you receive calls',
    body: 'When a user wants to connect with a Support Guide, you get a call notification on your app. You choose to accept or decline — it\'s never assigned without your consent. You control when you\'re available by toggling your status.',
  },
  {
    id: 'l2',
    icon: '⏱️',
    title: 'Session length',
    body: 'There\'s no fixed session length — users talk as long as they need. You\'re compensated per minute for every minute the call is active. Longer sessions mean more earnings.',
  },
  {
    id: 'l3',
    icon: '💰',
    title: 'How you get paid',
    body: 'Your earnings accumulate in real time per session. Payouts are processed weekly via Stripe directly to your bank account. You can track your earnings and session history in your Support Guide dashboard.',
  },
  {
    id: 'l4',
    icon: '🌐',
    title: 'Affiliate & referral program',
    body: 'Share your unique affiliate link with other potential Support Guides. When someone signs up through your link and gets approved, you earn a bonus. You can track your referrals and affiliate earnings in your dashboard.',
  },
  {
    id: 'l5',
    icon: '🛡️',
    title: 'You\'re in safe hands',
    body: 'All users agree to community guidelines before they can call. Ventally monitors sessions for policy violations. If a user behaves inappropriately, you can end the call and report them instantly.',
  },
];

const OnBoarding = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [role, setRole] = useState<Role>('none');
  const flatListRef = useRef<FlatList>(null);
  const { t, i18n } = useTranslationWithUpdate();
  const [, forceUpdate] = React.useState(0);
  React.useEffect(() => {
    const handler = () => forceUpdate(n => n + 1);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  const styles = StyleSheet.create({
    container: { flex: 1, width: '100%' },
    // Intro screen
    introContainer: {
      flex: 1,
      paddingHorizontal: wp(5),
      justifyContent: 'space-between',
      paddingTop: hp(4),
      paddingBottom: hp(4),
    },
    iconContainer: {
      padding: hp(1.6),
      borderRadius: hp(3),
      overflow: 'hidden',
      backgroundColor: 'rgba(255,255,255, 0.05)',
      borderWidth: 1,
      alignSelf: 'center',
      borderColor: 'rgba(255,255,255,0.2)',
      marginBottom: hp(1.5),
    },
    appIcon: { height: hp(10), width: hp(10), borderRadius: hp(1.25) },
    appName: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(3.5),
      textAlign: 'center',
      color: theme.white,
      marginBottom: hp(0.5),
    },
    tagline: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.7),
      textAlign: 'center',
      color: 'rgba(255,255,255,0.6)',
      lineHeight: hp(2.4),
      marginBottom: hp(3),
    },
    roleSectionTitle: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.8),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(1.5),
    },
    roleRow: { flexDirection: 'row', gap: wp(3), marginBottom: hp(2) },
    roleCard: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      borderRadius: hp(2),
      padding: hp(2),
      alignItems: 'center',
    },
    roleCardActive: {
      borderColor: 'rgba(255,255,255,0.6)',
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    roleEmoji: { fontSize: hp(3), marginBottom: hp(0.8) },
    roleLabel: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.6),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(0.4),
    },
    roleDesc: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.3),
      color: 'rgba(255,255,255,0.5)',
      textAlign: 'center',
    },
    testimonialCard: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: hp(1.5),
      padding: hp(1.5),
      borderWidth: 0.5,
      borderColor: 'rgba(255,255,255,0.1)',
      marginBottom: hp(1),
    },
    testimonialQuote: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: hp(1.4),
      fontFamily: fontFamilies.normal,
      lineHeight: hp(2),
      marginBottom: hp(0.5),
    },
    testimonialName: {
      color: 'rgba(255,255,255,0.4)',
      fontSize: hp(1.3),
      fontFamily: fontFamilies.medium,
    },
    trustRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: wp(4),
      marginBottom: hp(1.5),
    },
    trustText: {
      color: 'rgba(255,255,255,0.4)',
      fontSize: hp(1.3),
      fontFamily: fontFamilies.normal,
    },
    // Role slides
    slideOuter: { flex: 1 },
    slideHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
      marginBottom: hp(1),
    },
    backBtn: {
      paddingRight: wp(3),
      paddingVertical: hp(0.5),
    },
    backText: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: hp(1.6),
      fontFamily: fontFamilies.normal,
    },
    slideRoleLabel: {
      flex: 1,
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.5),
      color: 'rgba(255,255,255,0.5)',
      textAlign: 'right',
    },
    slideItemContainer: {
      width: WINDOW_WIDTH,
      paddingHorizontal: wp(5),
      paddingTop: hp(3),
      flex: 1,
    },
    slideIconCircle: {
      width: hp(8),
      height: hp(8),
      borderRadius: hp(4),
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: hp(2.5),
    },
    slideEmoji: { fontSize: hp(3.5) },
    slideTitle: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.6),
      color: theme.white,
      lineHeight: hp(3.2),
      marginBottom: hp(1.5),
    },
    slideBody: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.7),
      color: 'rgba(255,255,255,0.75)',
      lineHeight: hp(2.6),
    },
    slideBottom: {
      paddingHorizontal: wp(5),
      paddingBottom: hp(4),
    },
    paginationRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: hp(0.8),
      marginBottom: hp(2),
    },
    dot: {
      width: hp(0.7),
      height: hp(0.7),
      borderRadius: hp(0.4),
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
    dotActive: {
      width: hp(2.2),
      height: hp(0.7),
      borderRadius: hp(0.4),
      backgroundColor: 'rgba(255,255,255,0.9)',
    },
    skipBtn: {
      alignItems: 'center',
      marginTop: hp(1.2),
    },
    skipText: {
      color: 'rgba(255,255,255,0.35)',
      fontSize: hp(1.4),
      fontFamily: fontFamilies.normal,
      textDecorationLine: 'underline',
    },
  });

  const slides = role === 'listener' ? LISTENER_SLIDES : VENTER_SLIDES;
  const isLastSlide = currentIndex === slides.length - 1;

  const handleScroll = (event: any) => {
    const idx = Math.round(event.nativeEvent.contentOffset.x / WINDOW_WIDTH);
    setCurrentIndex(idx);
  };

  const handleNext = () => {
    if (isLastSlide) {
      navigation.navigate(routes.signUp as never);
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleSelectRole = (selected: Role) => {
    setRole(selected);
    setCurrentIndex(0);
  };

  const handleBackToIntro = () => {
    setRole('none');
    setCurrentIndex(0);
  };

  if (role === 'none') {
    return (
      <AuthWrapper>
        <View style={styles.introContainer}>
          {/* Top: logo + name */}
          <View style={{ alignItems: 'center' }}>
            <View style={styles.iconContainer}>
              <Image source={chatIcon} style={styles.appIcon} />
            </View>
            <Text style={styles.appName}>VENTALLY</Text>
            <Text style={styles.tagline}>
              {"Anonymous emotional support\nwhenever you need it."}
            </Text>
          </View>

          {/* Role picker */}
          <View>
            <Text style={styles.roleSectionTitle}>I want to…</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleCard]}
                onPress={() => handleSelectRole('venter')}
                activeOpacity={0.8}
              >
                <Text style={styles.roleEmoji}>💬</Text>
                <Text style={styles.roleLabel}>Get Support</Text>
                <Text style={styles.roleDesc}>Talk to someone who listens</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleCard]}
                onPress={() => handleSelectRole('listener')}
                activeOpacity={0.8}
              >
                <Text style={styles.roleEmoji}>🎧</Text>
                <Text style={styles.roleLabel}>Become a Guide</Text>
                <Text style={styles.roleDesc}>Support others & earn</Text>
              </TouchableOpacity>
            </View>

            {/* Testimonials */}
            <View style={styles.testimonialCard}>
              <Text style={styles.testimonialQuote}>"I finally felt heard without being judged. This changed everything for me."</Text>
              <Text style={styles.testimonialName}>— Anonymous Venter</Text>
            </View>
            <View style={styles.testimonialCard}>
              <Text style={styles.testimonialQuote}>"Being a Support Guide has been one of the most rewarding things I've ever done."</Text>
              <Text style={styles.testimonialName}>— Support Guide, 3 months</Text>
            </View>

            <View style={styles.trustRow}>
              <Text style={styles.trustText}>🔒 Anonymous</Text>
              <Text style={styles.trustText}>🎧 Trained guides</Text>
              <Text style={styles.trustText}>✓ No real name</Text>
            </View>

            <TouchableOpacity
              style={{ alignItems: 'center', marginTop: hp(0.5) }}
              onPress={() => navigation.navigate(routes.logIn as never)}
            >
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.4), fontFamily: fontFamilies.normal }}>
                Already have an account? <Text style={{ textDecorationLine: 'underline' }}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </AuthWrapper>
    );
  }

  // Role-specific slides
  return (
    <AuthWrapper>
      <View style={styles.slideOuter}>
        {/* Header */}
        <View style={styles.slideHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBackToIntro}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.slideRoleLabel}>
            {role === 'venter' ? 'Getting Support' : 'Support Guide'}
          </Text>
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={slides}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          renderItem={({ item }) => (
            <View style={styles.slideItemContainer}>
              <View style={styles.slideIconCircle}>
                <Text style={styles.slideEmoji}>{item.icon}</Text>
              </View>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideBody}>{item.body}</Text>
            </View>
          )}
        />

        {/* Bottom nav */}
        <View style={styles.slideBottom}>
          <View style={styles.paginationRow}>
            {slides.map((_, i) => (
              <View key={i} style={i === currentIndex ? styles.dotActive : styles.dot} />
            ))}
          </View>

          <Button
            title={isLastSlide
              ? (role === 'listener' ? 'Apply to Become a Support Guide →' : 'Get Started →')
              : 'Next →'
            }
            onPress={handleNext}
            buttonStyle={{ width: '100%' }}
            titleStyle={{ fontSize: hp(1.6) }}
            glassStyles={{ width: '100%' }}
            leftIcon={undefined}
            iconStyle={undefined}
            disabled={false}
          />

          <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate(routes.signUp as never)}>
            <Text style={styles.skipText}>Skip intro</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthWrapper>
  );
};

export default OnBoarding;
