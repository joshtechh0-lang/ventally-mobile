import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import GlassView from '../../components/GlassWrapper';
import { routes } from '../../navigation/routes';
import Svg, { Circle } from 'react-native-svg';

interface RouteParams {
    daysSober?: number;
    soberStartDate?: string;
}

const CIRCLE_SIZE = hp(22);
const STROKE_WIDTH = hp(1);
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Circular arc progress drawing with SVG
 */
const CircularProgress = ({
    progress,
    daysSober,
    theme,
    t,
}: {
    progress: number;
    daysSober: number;
    theme: any;
    t: any;
}) => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - Math.min(progress, 1));

    return (
        <View key={langKey} style={{ alignItems: 'center', justifyContent: 'center', width: CIRCLE_SIZE, height: CIRCLE_SIZE }}>
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}>
                {/* Background track */}
                <Circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={RADIUS}
                    stroke={theme.white + "25"}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                />
                {/* Foreground progress arc */}
                <Circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={RADIUS}
                    stroke={theme.white + "70"}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                    strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation={-90}
                    origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
                />
            </Svg>
            {/* Center text */}
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{
                        fontFamily: fontFamilies.bold,
                        fontSize: hp(6.5),
                        color: 'rgba(255,255,255,0.9)',
                        lineHeight: hp(7),
                    }}>
                        {daysSober}
                    </Text>
                    <Text style={{
                        fontFamily: fontFamilies.normal,
                        fontSize: hp(1.6),
                        color: 'rgba(255,255,255,0.7)',
                        marginTop: hp(0.5),
                    }}>
                        {t('VenterRecovery.dashboard.daysSober')}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const VenterProgressSummary = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

    const { daysSober = 0, soberStartDate } = (route.params as RouteParams) || {};

    // Progress: cap milestone at 365 days for a full circle
    const MILESTONE = 365;
    const progress = daysSober / MILESTONE;

    const handleBack = () => navigation.goBack();
    const handleViewDetails = () => (navigation as any).navigate(routes.venterRecoveryDetails);

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(5),
            justifyContent: 'center',
        },
        card: {
            width: '100%',
            paddingTop: hp(4),
            paddingBottom: 0,
            // backgroundColor: 'rgba(0,0,0,0.25)',
            overflow: 'hidden',
        },
        cardTitle: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(2.4),
            color: theme.white,
            textAlign: 'center',
            marginBottom: hp(4),
        },
        circleWrapper: {
            alignItems: 'center',
            marginBottom: hp(4),
        },
        viewDetailsBtn: {
            borderTopWidth: 1,
            borderTopColor: theme.white20,
            paddingVertical: hp(2.2),
            alignItems: 'center',
            backgroundColor: theme.white20
        },
        viewDetailsTxt: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.8),
            color: theme.white,
        },
    });

    return (
        <HomeWrapper>
            <ScreenHeader
                title=""
                onBackPress={handleBack}
            />
            <View style={styles.content}>
                <GlassView bordered radius={hp(3)} glassStyles={styles.card}>
                    <Text style={styles.cardTitle}>
                        {t('VenterRecovery.progressSummary.title') || 'Progress Summary'}
                    </Text>

                    <View style={styles.circleWrapper}>
                        <CircularProgress
                            progress={progress}
                            daysSober={daysSober}
                            theme={theme}
                            t={t}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.viewDetailsBtn}
                        onPress={handleViewDetails}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.viewDetailsTxt}>
                            {t('VenterRecovery.progressSummary.viewDetails') || 'View Details'}
                        </Text>
                    </TouchableOpacity>
                </GlassView>
            </View>
        </HomeWrapper>
    );
};

export default VenterProgressSummary;
