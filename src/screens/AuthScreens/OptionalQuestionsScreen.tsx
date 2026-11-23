import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { RootState } from '../../store/store';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import { routes } from '../../navigation/routes';
import AuthStepsHeader from '../../components/AuthStepsHeader';
import { tickIcon } from '../../assets/icons';

const OptionalQuestionsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const user = useSelector((state: RootState) => state.user.user);
  const role = user?.role || user?.userType;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = () => {
    // Navigate to first question (Gender Identity)
    navigation.navigate(routes.genderIdentity as never);
  };

  const handleSkipAll = () => {
    if (role === 'listener') {
      (navigation as any).navigate(routes.listenerTermsAndConditions);
    } else {
      (navigation as any).navigate(routes.venterHomeTab);
    }
  };

  const styles = globalStyles(theme)

  return (
    <AuthWrapper key={langKey}>
      <View style={styles.container}>
        {/* Header with back button */}
        <AuthStepsHeader handleBack={handleBack} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>
            {t('OptionalQuestions.title')}
          </Text>

          {/* Introductory Text */}
          <Text style={styles.introText}>
            {t('OptionalQuestions.introText')}
          </Text>

          {/* Time estimate */}
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: hp(1.4), fontFamily: fontFamilies.normal, textAlign: 'center', marginBottom: hp(2) }}>
            A few quick questions — about 60 seconds
          </Text>

          {/* Section Header */}
          <Text style={styles.sectionHeader}>
            Help us match you with a Support Guide who gets it
          </Text>

          {/* Bullet Points with Checkmarks */}
          <View style={styles.bulletPointContainer}>
            <View style={styles.checkmarkCircle}>
              <Image source={tickIcon} style={styles.tickIconImage} />
            </View>
            <Text style={styles.bulletText}>
              {t('OptionalQuestions.bullet1')}
            </Text>
          </View>

          <View style={styles.bulletPointContainer}>
            <View style={styles.checkmarkCircle}>
              <Image source={tickIcon} style={styles.tickIconImage} />
            </View>
            <Text style={styles.bulletText}>
              {t('OptionalQuestions.bullet2')}
            </Text>
          </View>

          <View style={styles.bulletPointContainer}>
            <View style={styles.checkmarkCircle}>
              <Image source={tickIcon} style={styles.tickIconImage} />
            </View>
            <Text style={styles.bulletText}>
              {t('OptionalQuestions.bullet3')}
            </Text>
          </View>

          {/* Why we ask */}
          <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: hp(1.5), padding: hp(1.5), marginTop: hp(2), marginBottom: hp(1) }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: hp(1.4), fontFamily: fontFamilies.normal, lineHeight: hp(2) }}>
              🎯 Why we ask: Ventally matches you with Support Guides who understand your background and lived experience. Nothing is shared with other users.
            </Text>
          </View>

          {/* Informational Text */}
          <Text style={styles.infoText}>
            {t('OptionalQuestions.infoText1')}
          </Text>

          <Text style={styles.infoText}>
            {t('OptionalQuestions.infoText2')}
          </Text>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <Button
            borderedGlassButton
            title={t('OptionalQuestions.continue')}
            onPress={handleContinue}
            buttonStyle={{}}
            titleStyle={{ fontSize: hp(1.6) }}
            disabled={false}
            glassStyles={{ width: '100%' }}
            leftIcon={undefined}
            iconStyle={{}}
          />

          <Button
            borderedGlassButton
            title={t('OptionalQuestions.skipAll')}
            onPress={handleSkipAll}
            buttonStyle={{}}
            titleStyle={{ fontSize: hp(1.6) }}
            disabled={false}
            glassStyles={{
              width: '100%',
              backgroundColor: 'transparent',
            }}
            leftIcon={undefined}
            iconStyle={{}}
          />
        </View>
      </View>
    </AuthWrapper>
  );
};

export default OptionalQuestionsScreen;
const globalStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  scrollContent: {
    paddingBottom: hp(6),
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: hp(2.2),
    color: theme.white,
    textAlign: 'center',
    marginBottom: hp(2),
  },
  introText: {
    fontFamily: fontFamilies.normal,
    fontSize: hp(1.8),
    color: theme.white,
    marginBottom: hp(4),
    textAlign: 'center',
    opacity: 0.9,
  },
  sectionHeader: {
    fontFamily: fontFamilies.normal,
    fontSize: hp(1.6),
    color: theme.white,
    marginBottom: hp(2),
  },
  bulletPointContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  checkmarkCircle: {
    width: hp(1.8),
    height: hp(1.8),
    borderRadius: hp(1.25),
    backgroundColor: theme.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
    marginTop: hp(0.2),
  },
  checkmark: {
    color: theme.white,
    fontSize: hp(1.5),
    fontWeight: 'bold',
  },
  bulletText: {
    flex: 1,
    fontFamily: fontFamilies.normal,
    fontSize: hp(1.6),
    color: theme.white,
    opacity: 0.9,
  },
  infoText: {
    fontFamily: fontFamilies.normal,
    fontSize: hp(1.6),
    color: theme.white,
    marginTop: hp(3),
    marginBottom: hp(2),
    opacity: 0.85,
  },
  buttonsContainer: {
    paddingVertical: hp(2),
    paddingBottom: hp(4),
    gap: hp(2),
  },
  tickIconImage: {
    width: hp(1.2),
    height: hp(1.2),
    tintColor: theme.green,
    resizeMode: 'contain',
  },
});