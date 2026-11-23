import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import AuthStepsHeader from '../../components/AuthStepsHeader';
import { routes } from '../../navigation/routes';

const STEPS = [
  { number: '①', label: 'Register & verify email', time: '3 min' },
  { number: '②', label: 'Complete your profile', time: '5 min' },
  { number: '③', label: 'Sign agreements', time: '2 min' },
  { number: '④', label: 'Complete training modules', time: '2 hrs' },
  { number: '⑤', label: 'Submit for review', time: '1 min' },
  { number: '⑥', label: 'Get approved & go live', time: '24–48h' },
];

const HOW_IT_WORKS = [
  {
    icon: '📲',
    title: 'You receive incoming call requests',
    body: 'When a user wants to connect, you get a notification. You choose to accept or decline — calls are never assigned without your consent. Toggle your availability status anytime.',
  },
  {
    icon: '⏱️',
    title: 'Sessions run as long as the user needs',
    body: 'There\'s no fixed session length. Longer sessions = more earnings. You\'re compensated per minute for every active minute on the call.',
  },
  {
    icon: '💰',
    title: 'Weekly payouts via Stripe',
    body: 'Your earnings accumulate per session and are paid out weekly directly to your bank account via Stripe. Track your earnings, session count, and payout history in your dashboard.',
  },
  {
    icon: '🤝',
    title: 'Affiliate & referral bonuses',
    body: 'Share your unique affiliate link with other potential Support Guides. When someone signs up through your link and gets approved, you earn a referral bonus. Track all referrals in your dashboard.',
  },
];

const ListenerWhatToExpect = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: wp(5), paddingTop: hp(2) },
    title: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.4),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(0.5),
    },
    subtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.7),
      color: 'rgba(255,255,255,0.7)',
      textAlign: 'center',
      marginBottom: hp(0.5),
    },
    timeEstimate: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: 'rgba(255,255,255,0.4)',
      textAlign: 'center',
      marginBottom: hp(2.5),
    },
    benefitsRow: { flexDirection: 'row', gap: wp(3), marginBottom: hp(2.5) },
    benefitCard: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: hp(1.5),
      padding: hp(1.5),
      alignItems: 'center',
    },
    benefitIcon: { fontSize: hp(2.5), marginBottom: hp(0.5) },
    benefitLabel: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.3),
      color: 'rgba(255,255,255,0.7)',
      textAlign: 'center',
    },
    sectionTitle: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(1.5),
      marginTop: hp(0.5),
    },
    howCard: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: hp(1.5),
      padding: hp(1.8),
      marginBottom: hp(1.2),
      borderWidth: 0.5,
      borderColor: 'rgba(255,255,255,0.08)',
    },
    howCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2.5),
      marginBottom: hp(0.6),
    },
    howIcon: { fontSize: hp(2.2) },
    howTitle: {
      flex: 1,
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.6),
      color: theme.white,
    },
    howBody: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.5),
      color: 'rgba(255,255,255,0.6)',
      lineHeight: hp(2.2),
    },
    divider: {
      height: 0.5,
      backgroundColor: 'rgba(255,255,255,0.1)',
      marginVertical: hp(2),
    },
    stepCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: hp(1.5),
      padding: hp(1.5),
      marginBottom: hp(1),
      gap: wp(3),
    },
    stepNumber: { fontSize: hp(2), color: theme.white },
    stepLabel: {
      flex: 1,
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.5),
      color: theme.white,
    },
    stepTime: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.3),
      color: 'rgba(255,255,255,0.4)',
    },
    approvalCard: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: hp(1.5),
      padding: hp(2),
      marginTop: hp(1),
      marginBottom: hp(2.5),
    },
    approvalText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.5),
      color: 'rgba(255,255,255,0.7)',
      lineHeight: hp(2.2),
    },
    continueButtonContainer: { paddingBottom: hp(4) },
  });

  return (
    <AuthWrapper>
      <View style={styles.container}>
        <AuthStepsHeader handleBack={() => navigation.goBack()} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Become a Support Guide</Text>
          <Text style={styles.subtitle}>Help others. Earn. Make a difference.</Text>
          <Text style={styles.timeEstimate}>Setup takes ~10 minutes + 24-48h approval</Text>

          {/* Benefits */}
          <View style={styles.benefitsRow}>
            {[
              { icon: '💰', label: 'Weekly payouts' },
              { icon: '🕐', label: 'Flexible hours' },
              { icon: '🌍', label: 'Work remotely' },
            ].map((b) => (
              <View key={b.label} style={styles.benefitCard}>
                <Text style={styles.benefitIcon}>{b.icon}</Text>
                <Text style={styles.benefitLabel}>{b.label}</Text>
              </View>
            ))}
          </View>

          {/* How it actually works */}
          <Text style={styles.sectionTitle}>How it works</Text>
          {HOW_IT_WORKS.map((item) => (
            <View key={item.icon} style={styles.howCard}>
              <View style={styles.howCardHeader}>
                <Text style={styles.howIcon}>{item.icon}</Text>
                <Text style={styles.howTitle}>{item.title}</Text>
              </View>
              <Text style={styles.howBody}>{item.body}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          {/* Application steps */}
          <Text style={styles.sectionTitle}>Application process</Text>
          {STEPS.map((step) => (
            <View key={step.number} style={styles.stepCard}>
              <Text style={styles.stepNumber}>{step.number}</Text>
              <Text style={styles.stepLabel}>{step.label}</Text>
              <Text style={styles.stepTime}>{step.time}</Text>
            </View>
          ))}

          {/* Approval info */}
          <View style={styles.approvalCard}>
            <Text style={styles.approvalText}>
              📋 After submitting, our team reviews your application within 24-48 hours. You'll receive an email with your approval status. No formal experience required — just empathy, reliability, and completing the training.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.continueButtonContainer}>
          <Button
            title="Apply to Become a Support Guide →"
            onPress={() => (navigation as any).navigate(routes.signUp, { userType: 'listener' })}
            leftIcon={undefined}
            iconStyle={undefined}
          />
        </View>
      </View>
    </AuthWrapper>
  );
};

export default ListenerWhatToExpect;
