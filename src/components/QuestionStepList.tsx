import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { hp, wp } from '../utils/size';
import { fontFamilies } from '../utils/fontFamilies';
import { useTheme } from '../theme';
import GlassView from './GlassWrapper';
import Button from './Button';
import { backIcon } from '../assets/icons';
import AuthStepsHeader from './AuthStepsHeader';

export interface QuestionOption {
  id: string;
  label: string;
  labelKey?: string; // Translation key for label
}

interface QuestionStepListProps {
  step: number;
  totalSteps: number;
  title: string;
  titleKey?: string; // Translation key for title
  options: any[];
  selectedValue?: string | string[];
  onSelect: (value: string) => void;
  onContinue?: () => void;
  onSkip: () => void;
  onBack: () => void;
  skipButtonText?: string;
  continueButtonText?: string;
}

const QuestionStepList: React.FC<QuestionStepListProps> = ({
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
  skipButtonText,
  continueButtonText,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const displayTitle = titleKey ? t(titleKey) : title;

  const displaySkipText = skipButtonText ? t(skipButtonText) : t('QuestionStep.skip');
  const displayContinueText = continueButtonText ? t(continueButtonText) : t('QuestionStep.continue');

  const hasSelection = Array.isArray(selectedValue)
    ? selectedValue.length > 0
    : !!selectedValue;

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: hp(3),
      width: '100%',
    },
    backButton: {
      width: hp(6),
      height: hp(6),
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepBadge: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(0.8),
      borderRadius: hp(2),
      backgroundColor: theme.white + '20',
    },
    stepBadgeText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.3),
      color: theme.white,
    },
    title: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(2),
    },
    scrollContent: {
      paddingBottom: hp(2),
    },
    optionContainer: {
      marginBottom: hp(1.5),
      borderRadius: 999
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: hp(2),
      paddingHorizontal: wp(4),

    },
    selectedOptionButton: {
      borderColor: theme.white + '50',
      backgroundColor: theme.white + '20',
    },
    optionText: {
      flex: 1,
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
    },
    selectedOptionText: {
      fontFamily: fontFamilies.semiBold,
    },
    radioButton: {
      width: hp(2.5),
      height: hp(2.5),
      borderRadius: hp(1.25),
      borderWidth: 2,
      borderColor: theme.white + '50',
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioButtonSelected: {
      borderColor: theme.magenda,
      backgroundColor: theme.magenda,
    },
    radioButtonInner: {
      width: hp(1.2),
      height: hp(1.2),
      borderRadius: hp(0.6),
      backgroundColor: theme.white,
    },
    buttonsContainer: {
      width: '100%',
      paddingVertical: hp(2),
      paddingBottom: hp(4),
    },
    headerTitle: {
      fontSize: hp(1.3),
      fontFamily: fontFamilies.medium,
      color: theme.white,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header with back button and step badge */}
      <AuthStepsHeader handleBack={onBack}
        title={t('QuestionStep.stepOf', { step: step.toString(), total: totalSteps.toString() })}
        titleStyle={
          styles.headerTitle
        } />

      {/* Title */}
      <Text style={styles.title}>{displayTitle}</Text>

      {/* Options List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {options.map((option) => {
          const isSelected = Array.isArray(selectedValue)
            ? selectedValue.includes(option.id)
            : selectedValue === option.id;
          const displayLabel = option.labelKey ? t(option.labelKey) : option.label;

          return (
            <TouchableOpacity
              key={option.id}
              style={styles.optionContainer}
              onPress={() => onSelect(option.id)}
              activeOpacity={0.7}
            >
              <GlassView

                radius={999}
              >
                <View style={StyleSheet.flatten([
                  styles.optionButton,

                ])}>

                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.selectedOptionText,
                    ]}
                  >
                    {displayLabel}
                  </Text>
                  <View
                    style={StyleSheet.flatten([
                      styles.radioButton,
                      isSelected && styles.radioButtonSelected,
                    ])}
                  >
                    {isSelected && <View style={styles.radioButtonInner} />}
                  </View>
                </View>

              </GlassView>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Action Button (Continue or Skip) */}
      <View style={styles.buttonsContainer}>
        <Button
          borderedGlassButton={hasSelection && onContinue ? true : false}
          title={hasSelection && onContinue ? displayContinueText : displaySkipText}
          onPress={hasSelection && onContinue ? onContinue : onSkip}
          buttonStyle={{
            width: '100%',
          }}
          titleStyle={{
            fontSize: hp(1.6),
          }}
          disabled={false}
          glassStyles={{
            width: '100%',
            backgroundColor: hasSelection && onContinue ? undefined : 'transparent',
          }}
        />
      </View>
    </View>
  );
};

export default QuestionStepList;
