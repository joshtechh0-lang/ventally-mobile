import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { getGlassColors } from '../../utils/glassColors';
import Button from '../../components/Button';
import { routes } from '../../navigation/routes';
import GlassView from '../../components/GlassWrapper';
import AuthStepsHeader from '../../components/AuthStepsHeader';
import TermsAndConditionsContent from '../../components/TermsAndConditionsContent';
import { ScreenHeader } from '../../components';

const TermsAndConditionsScreen = ({ route }: any) => {
  const readOnly = route?.params?.readOnly;
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const glassColors = getGlassColors(theme, isDark);
  const user = useSelector((state: RootState) => state.user.user);
  const role = user?.role || (user as any)?.userType;

  const handleAccept = () => {
    // Skip optional questions — go straight to the destination
    if (role === 'listener') {
      (navigation as any).navigate(routes.listenerTermsAndConditions);
    } else {
      (navigation as any).navigate(routes.venterHomeTab);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Placeholder for back arrow - using chevron rotated or text for now

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },

    scrollContent: {
      paddingBottom: hp(6),
    },
    section: {
      marginBottom: hp(4),
    },
    mainTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2.2),
      color: theme.white,
      marginBottom: hp(1),
      alignSelf: "center"

    },
    subheading: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
      marginTop: hp(2.5),
      marginBottom: hp(1.5),
    },
    text: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      lineHeight: hp(2.4),
      marginBottom: hp(1.5),
      opacity: 0.9,
    },
    bulletPoint: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      lineHeight: hp(2.4),
      marginBottom: hp(1.2),
      marginLeft: wp(4),
      opacity: 0.9,
    },
    acceptButtonContainer: {
      paddingVertical: hp(2),
      paddingBottom: hp(4),
    },
  });

  return (
    <AuthWrapper key={langKey}>
      <View style={{ width: '100%' }}>
        <ScreenHeader title={route?.params?.title || ""} onBackPress={handleBack} />
      </View>

      <View style={styles.container}>
        {/* Header with back button */}
        <TermsAndConditionsContent title={route?.params?.title || ""} />

        {/* Accept Button */}
        {
          !readOnly &&
          <View style={styles.acceptButtonContainer}>
            <Button
              title={t('Common.accept')}
              onPress={handleAccept}

            />
          </View>}
      </View>
    </AuthWrapper>
  );
};

export default TermsAndConditionsScreen;
