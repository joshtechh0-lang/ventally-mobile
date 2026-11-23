import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { routes } from '../../navigation/routes';
import { userIcon, microphoneIcon, x, callIcon } from '../../assets/icons'; // check icons
import GlassView from '../../components/GlassWrapper';
import Button from '../../components/Button';
import { ScreenHeader } from '../../components';
import GlassModal from '../../components/shared/GlassModal'; // Assuming this exists

const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const ListenerActiveCall = () => {
    const { theme } = useTheme();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const navigation = useNavigation();

    const [seconds, setSeconds] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);
    const [showSessionEndedModal, setShowSessionEndedModal] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleEndCall = () => {
        setShowEndModal(true);
    };

    const confirmEndCall = () => {
        setShowEndModal(false);
        // Show Session Ended modal then navigate
        setShowSessionEndedModal(true); // You made a difference modal

        setTimeout(() => {
            setShowSessionEndedModal(false);
            (navigation as any).navigate(routes.listenerSessionFeedback);
        }, 2000);
    };

    const handleMute = () => {
        setIsMuted(!isMuted);
    };

    const handleCrisis = () => {
        // Navigate to crisis resources or show alert
        (navigation as any).navigate(routes.venterInternal, {
            screen: routes.venterCrisisWarning,
        });
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            paddingTop: hp(10),
        },
        avatarContainer: { // New style for active call avatar (transparent/glassy)
            width: hp(12),
            height: hp(12),
            borderRadius: hp(6),
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: hp(2),
            backgroundColor: theme.white + '10',
        },
        avatar: {
            width: hp(6),
            height: hp(6),
            tintColor: theme.white,
            resizeMode: 'contain',
        },
        callerName: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(2.4),
            color: theme.white,
            marginBottom: hp(0.5),
        },
        timerText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(2),
            // Design shows red for timer/status? Or maybe just "Call Ends" is red.
            // Let's keep it white/red based on status.
            color: theme.white,
            marginBottom: hp(4),
        },

        controlsContainer: {
            position: 'absolute',
            bottom: hp(5),
            width: wp(90),
            height: hp(25),
            backgroundColor: theme.black + '40', // Darker glass
            borderRadius: hp(3),
            flexDirection: 'row',
            justifyContent: 'space-around', // Changed to space-around to fit 3 items
            alignItems: 'center',
            paddingHorizontal: wp(5),
        },

        controlButton: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        iconCircle: {
            width: hp(7),
            height: hp(7),
            borderRadius: hp(3.5),
            backgroundColor: theme.white + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: hp(1),
        },
        controlLabel: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.6),
            color: theme.white,
        },
        icon: {
            width: hp(3),
            height: hp(3),
            tintColor: theme.white,
            resizeMode: 'contain',
        },
        endButtonCircle: {
            backgroundColor: theme.white + '20', // Keep consistent or make red? Design shows standard glass for wrapper?
            // Actually design shows Red circle for "Decline" in incoming, 
            // Active call showing "End" in grey glass circle, "Crisis" in Red.
        },
        crisisButtonCircle: {
            backgroundColor: theme.red,
            width: hp(8),
            height: hp(8), // Slightly larger?
            borderRadius: hp(4),
        },
        crisisIcon: {
            width: hp(3.5),
            height: hp(3.5),
            tintColor: theme.white,
            transform: [{ rotate: '45deg' }] // X rotated to +? Or use plus icon? Design shows '+'
        }

    });

    return (
        <HomeWrapper>
            <ScreenHeader
                onBackPress={() => navigation.goBack()} // Minimizes call?
                title=""
                showBackButton
            />
            <View style={styles.container}>
                <View style={styles.avatarContainer}>
                    <Text style={{ fontSize: hp(4), color: theme.white, fontFamily: fontFamilies.semiBold }}>V</Text>
                </View>
                <Text style={styles.callerName}>01:34</Text>
                <Text style={[styles.timerText, { fontSize: hp(1.8), opacity: 0.8 }]}>{t('ListenerActiveCall.connecting')}</Text>

                {/* Controls Card */}
                <GlassView glassStyles={styles.controlsContainer} opacity={0.1}>

                    {/* Mute */}
                    <Pressable style={styles.controlButton} onPress={handleMute}>
                        <View style={styles.iconCircle}>
                            <Image source={microphoneIcon} style={[styles.icon, isMuted && { tintColor: theme.red }]} />
                        </View>
                        <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                    </Pressable>

                    {/* Crisis (Center, Red) */}
                    <Pressable style={styles.controlButton} onPress={handleCrisis}>
                        <View style={[styles.iconCircle, styles.crisisButtonCircle]}>
                            {/* Using 'x' rotated for plus, or find plus icon. Design shows '+' */}
                            <Text style={{ fontSize: hp(4), color: theme.white, marginTop: -4 }}>+</Text>
                        </View>
                        <Text style={styles.controlLabel}>Crisis</Text>
                    </Pressable>

                    {/* End Call */}
                    <Pressable style={styles.controlButton} onPress={handleEndCall}>
                        <View style={[styles.iconCircle]}>
                            <Image source={x} style={styles.icon} />
                        </View>
                        <Text style={styles.controlLabel}>End</Text>
                    </Pressable>

                </GlassView>

                {/* End Call Modal */}
                <GlassModal
                    visible={showEndModal}
                    onClose={() => setShowEndModal(false)}
                    title="End Session?"
                    message="Are you sure you want to end this session?"
                    primaryButtonText="Yes"
                    secondaryButtonText="No"
                    onPrimaryPress={confirmEndCall}
                    onSecondaryPress={() => setShowEndModal(false)}
                />

                {/* Session Ended Modal */}
                <GlassModal
                    visible={showSessionEndedModal}
                    onClose={() => { }}
                    title="Session Ended"
                    message="Thanks for being here. You made a difference."
                    showButtons={false}
                    dismissOnOverlayPress={false}
                    dismissOnBackPress={false}
                />
            </View>
        </HomeWrapper>
    );
};

export default ListenerActiveCall;
