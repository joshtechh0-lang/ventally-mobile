import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import Button from '../../components/Button';
import { useVerifyPass } from '../../hooks/useVerifyPass';

// ---------------------------------------------------------------------------
// SUCCESS URL DETECTION
// The WebView detects when VerifyPass redirects to our callback URL.
// After detection, we poll the status endpoint since the webhook is async.
// ---------------------------------------------------------------------------
const VERIFYPASS_SUCCESS_URL_PREFIX = 'https://api.ventally.co/api/v1/verify-pass/callback';
// Fallback URL used if the /url endpoint is unreachable
const VERIFYPASS_VERIFY_URL_FALLBACK = 'https://verifypass.com/auth/1c6225a415';

// Community type display names
const COMMUNITY_LABELS: Record<string, string> = {
  student: 'Student',
  teacher: 'Teacher / Educator',
  military: 'Active Military',
  veteran: 'Veteran',
  healthcare: 'Healthcare Worker',
  nonprofit: 'Non-Profit Employee',
};

function formatCommunityType(type: string | null): string {
  if (!type) return 'Community Member';
  return COMMUNITY_LABELS[type.toLowerCase()] ?? type;
}

const VerifyPassScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { status, verifyUrl, loading, error, fetchStatus, fetchVerifyUrl, confirmVerification } =
    useVerifyPass();

  const [webviewVisible, setWebviewVisible] = useState(false);
  const [webviewUrl, setWebviewUrl] = useState<string | null>(null);
  const [webviewLoading, setWebviewLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const handledRef = useRef(false);

  // Load status when screen mounts
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleStartVerification = useCallback(async () => {
    handledRef.current = false;
    setHasAttempted(true);
    // Try fetching the URL from backend; fall back to the known static URL
    const url = (await fetchVerifyUrl()) ?? VERIFYPASS_VERIFY_URL_FALLBACK;
    setWebviewUrl(url);
    setWebviewVisible(true);
  }, [fetchVerifyUrl]);

  const handleCloseWebview = useCallback(() => {
    setWebviewVisible(false);
    setWebviewUrl(null);
    setWebviewLoading(true);
    handledRef.current = false;
  }, []);

  const pollForVerification = useCallback(async () => {
    // Poll status up to 10 times (20 seconds) waiting for the webhook to fire
    setConfirming(true);
    let attempts = 0;
    const maxAttempts = 10;
    const interval = 2000;

    const check = async (): Promise<void> => {
      await fetchStatus();
      attempts++;
      // fetchStatus updates the `status` state — check via a fresh fetch
      const result = await fetchStatus();
      if (result?.isVerified) {
        setConfirming(false);
        Alert.alert(
          '🎉 Verification Complete!',
          "You've been verified as a community member and qualify for a 20% discount on all sessions.",
          [{ text: 'Great!', style: 'default' }],
        );
        return;
      }
      if (attempts < maxAttempts) {
        setTimeout(check, interval);
      } else {
        setConfirming(false);
        Alert.alert(
          'Verification Submitted',
          "Your verification is being processed. Check back in a few minutes — your discount will be applied automatically once confirmed.",
          [{ text: 'OK', style: 'default' }],
        );
      }
    };

    setTimeout(check, interval); // First check after 2s
  }, [fetchStatus]);

  const handleNavigationStateChange = useCallback(
    async (navState: WebViewNavigation) => {
      const { url } = navState;
      if (!url || handledRef.current) return;

      // Detect when VerifyPass redirects back to our callback URL
      if (url.startsWith(VERIFYPASS_SUCCESS_URL_PREFIX)) {
        handledRef.current = true;
        setWebviewVisible(false);
        // Webhook handles the actual verification — poll until it lands
        pollForVerification();
      }
    },
    [pollForVerification],
  );

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: wp(4),
      padding: wp(5),
      marginBottom: hp(2.5),
    },
    cardTitle: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2),
      color: theme.white,
      marginBottom: hp(1),
    },
    cardBody: {
      fontFamily: fontFamilies.regular,
      fontSize: hp(1.8),
      color: theme.textSecondary,
      lineHeight: hp(2.8),
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1E4D2B',
      borderRadius: wp(2),
      paddingVertical: hp(0.6),
      paddingHorizontal: wp(3),
      alignSelf: 'flex-start',
      marginTop: hp(1),
    },
    badgeText: {
      fontFamily: fontFamilies.semiBold ?? fontFamilies.bold,
      fontSize: hp(1.7),
      color: '#4ADE80',
    },
    discountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: hp(1.5),
    },
    discountLabel: {
      fontFamily: fontFamilies.regular,
      fontSize: hp(1.8),
      color: theme.textSecondary,
      flex: 1,
    },
    discountValue: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2),
      color: theme.text,
    },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: hp(1),
    },
    benefitBullet: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(1.8),
      color: theme.textSecondary,
      marginRight: wp(2),
      marginTop: hp(0.1),
    },
    benefitText: {
      fontFamily: fontFamilies.regular,
      fontSize: hp(1.8),
      color: theme.textSecondary,
      flex: 1,
      lineHeight: hp(2.8),
    },
    button: {
      backgroundColor: theme.primary,
      borderRadius: wp(3),
      paddingVertical: hp(1.8),
      alignItems: 'center',
      marginTop: hp(1),
    },
    buttonText: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2),
      color: theme.white,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    errorText: {
      fontFamily: fontFamilies.regular,
      fontSize: hp(1.8),
      color: '#EF4444',
      textAlign: 'center',
      marginTop: hp(1),
    },
    // WebView modal
    modalContainer: {
      flex: 1,
      backgroundColor: '#000',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: wp(4),
      paddingTop: hp(6),
      paddingBottom: hp(1.5),
      backgroundColor: theme.surface,
    },
    modalTitle: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2),
      color: theme.text,
    },
    modalClose: {
      fontFamily: fontFamilies.regular,
      fontSize: hp(1.8),
      color: theme.primary,
      paddingVertical: hp(0.5),
      paddingHorizontal: wp(2),
    },
    webviewLoaderOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
  });

  // ---- Loading / error state ----
  if (loading && !status) {
    return (
      <HomeWrapper>
        <ScreenHeader onBackPress={() => navigation.goBack()} title="Community Discount" />
        <View style={[styles.content, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </HomeWrapper>
    );
  }

  const isVerified = status?.isVerified ?? false;

  return (
    <HomeWrapper>
      <ScreenHeader onBackPress={() => navigation.goBack()} title="Community Discount" />

      <View style={styles.content}>
        {/* Status card */}
        {isVerified ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Verification Status</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✓ Verified</Text>
            </View>
            <Text style={[styles.cardBody, { marginTop: hp(1.2) }]}>
              You are verified as a{' '}
              <Text style={{ fontFamily: fontFamilies.bold }}>
                {formatCommunityType(status?.communityType ?? null)}
              </Text>
              .
            </Text>
            <View style={styles.discountRow}>
              <Text style={styles.discountLabel}>Your community discount</Text>
              <Text style={styles.discountValue}>20% off</Text>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Community Discount — 20% Off</Text>
            <Text style={styles.cardBody}>
              Verify your community status to unlock a 20% discount on all Ventally sessions.
              Qualifying communities:
            </Text>
            {['Students', 'Teachers & Educators', 'Active Military', 'Veterans', 'Healthcare Workers', 'Non-Profit Employees'].map(
              (item) => (
                <View key={item} style={styles.benefitRow}>
                  <Text style={styles.benefitBullet}>•</Text>
                  <Text style={styles.benefitText}>{item}</Text>
                </View>
              ),
            )}
          </View>
        )}

        {/* How it works card (always visible) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How It Works</Text>
          {[
            'Tap "Verify My Status" below.',
            'Complete the short verification form in the secure window.',
            'Return here — your discount is applied automatically.',
          ].map((step, i) => (
            <View key={i} style={styles.benefitRow}>
              <Text style={styles.benefitBullet}>{i + 1}.</Text>
              <Text style={styles.benefitText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Error — only show after a verification attempt, not on initial status load */}
        {!!error && !webviewVisible && !confirming && hasAttempted && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* CTA */}
        <Button
          title={confirming ? '' : isVerified ? 'Done' : 'Verify My Status'}
          onPress={isVerified ? () => navigation.goBack() : handleStartVerification}
          disabled={loading || confirming}
          loading={confirming}
        />
      </View>

      {/* VerifyPass WebView Modal */}
      <Modal
        visible={webviewVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseWebview}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Community Verification</Text>
            <TouchableOpacity onPress={handleCloseWebview}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {!!webviewUrl && (
            <WebView
              source={{ uri: webviewUrl }}
              onNavigationStateChange={handleNavigationStateChange}
              onLoadStart={() => setWebviewLoading(true)}
              onLoadEnd={() => setWebviewLoading(false)}
              onError={() => {
                setWebviewLoading(false);
                Alert.alert('Error', 'The verification page failed to load. Please try again.');
                handleCloseWebview();
              }}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
            />
          )}

          {webviewLoading && (
            <View style={styles.webviewLoaderOverlay}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          )}
        </View>
      </Modal>
    </HomeWrapper>
  );
};

export default VerifyPassScreen;
