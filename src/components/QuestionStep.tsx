import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { hp, wp } from '../utils/size';
import { fontFamilies } from '../utils/fontFamilies';
import { useTheme } from '../theme';
import Button from './Button';
import AuthStepsHeader from './AuthStepsHeader';
import { AdvancedBubblePatternLayout } from './BubblePattern';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface QuestionOption {
    id: string;
    label: string;
    labelKey?: string; // Translation key for label
    isPrimary?: boolean; // If true, button will be larger and more prominent
}

interface QuestionStepProps {
    step: number;
    totalSteps: number;
    title: string;
    titleKey?: string; // Translation key for title
    options: QuestionOption[];
    selectedValue?: string;
    onSelect: (value: string) => void;
    onContinue?: () => void;
    onSkip: () => void;
    onBack: () => void;
    continueButtonText?: string;
    skipButtonText?: string;
}

const QuestionStep: React.FC<QuestionStepProps> = ({
    step,
    totalSteps,
    title,
    titleKey,
    options,
    selectedValue,
    onSelect,
    onContinue,
    onSkip,
    onBack,
    continueButtonText,
    skipButtonText,
}) => {
    const { theme } = useTheme();
    const { t } = useTranslation();

    const displayTitle = titleKey ? t(titleKey) : title;
    const displayContinueText = continueButtonText
        ? t(continueButtonText)
        : t('QuestionStep.continue');
    const displaySkipText = skipButtonText ? t(skipButtonText) : t('QuestionStep.skip');

    const showContinue = onContinue && selectedValue;
    // Convert options to bubble items format
    const bubbleItems = options.map((option) => ({
        id: option.id,
        label: option.labelKey ? t(option.labelKey) : option.label,
    }));
    const styles = StyleSheet.create({
        container: {
            width: '100%',
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
        },
        content: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: bubbleItems?.length > 9 ? hp(5) : hp(15),
        },
        title: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(2.2),
            color: theme.white,
            textAlign: 'center',
            marginBottom: hp(4),
            // marginTop: hp(2),
        },
        bubblesContainer: {
            // flex: 1,
            minHeight: "70%",
            height: "auto",
            width: '100%',
            alignSelf: "center",

        },
        buttonsContainer: {
            width: '100%',
            paddingVertical: hp(2),
            paddingBottom: hp(4),
            gap: hp(2),
        },
        headerTitle: {
            fontSize: hp(1.3),
            fontFamily: fontFamilies.medium,
            color: theme.white,
        },
    });

    const handleBubbleSelect = (item: { id: string; label: string }) => {
        onSelect(item.id);

    };



    // Calculate min/max sizes based on primary options
    const hasPrimary = options.some((opt) => opt.isPrimary);
    const minSize = hasPrimary ? hp(9) : hp(8);
    const maxSize = hasPrimary ? hp(14) : hp(12);

    return (
        <View style={styles.container}>
            {/* Header with back button and step badge */}
            <AuthStepsHeader
                handleBack={onBack}
                title={t('QuestionStep.stepOf', { step: step.toString(), total: totalSteps.toString() })}
                titleStyle={styles.headerTitle}
            />

            <View style={styles.content}>
                {/* Title */}
                <Text style={styles.title}>{displayTitle}</Text>

                {/* Bubble Pattern Layout with built-in scroll */}
                <View style={[styles.bubblesContainer, {

                    // minHeight: bubbleItems?.length > 9 ? "70%" : "45%"
                }]}>
                    <AdvancedBubblePatternLayout
                        items={bubbleItems}
                        onSelect={handleBubbleSelect}
                        selectedId={selectedValue}
                        minSize={minSize}
                        maxSize={maxSize}
                        containerPadding={0}
                        containerWidth={SCREEN_WIDTH - wp(5) * 2}
                    />
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>


                <Button
                    borderedGlassButton={showContinue ? true : false}
                    title={showContinue ? displayContinueText : displaySkipText}
                    onPress={showContinue ? onContinue : onSkip}
                    buttonStyle={{
                        width: '100%',
                    }}
                    titleStyle={{
                        fontSize: hp(1.6),
                    }}
                    disabled={false}
                    glassStyles={{
                        width: '100%',
                        backgroundColor: showContinue ? undefined : 'transparent',
                    }}
                />
            </View>
        </View>
    );
};

export default QuestionStep;
