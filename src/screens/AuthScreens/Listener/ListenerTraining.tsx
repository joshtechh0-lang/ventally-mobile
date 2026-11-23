import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ImageBackground, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../../utils/size';
import { fontFamilies } from '../../../utils/fontFamilies';
import { useTheme } from '../../../theme';
import GlassView from '../../../components/GlassWrapper';
import Button from '../../../components/Button';
import AccordionItem from '../../../components/AccordionItem';
import { listenerTopImage } from '../../../assets/images';
import { moduleIcon, timeIcon } from '../../../assets/icons';
import { routes } from '../../../navigation/routes';
import AuthStepsHeader from '../../../components/AuthStepsHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBackgroundImage } from '../../../utils/backgrounds';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import Checkbox from '../../../components/Checkbox';
import { toastError } from '../../../utils/toast';

const ListenerTraining = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accountTypeChanging } = (route.params as any) || {};
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const insets = useSafeAreaInsets()
  const [expandedSection, setExpandedSection] = useState<string>('mission'); // Only one section can be expanded
  const [showError, setShowError] = useState(false);

  // Compliance checkboxes state - 9 in modules + 1 for general agreement = 10 total
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    general: true,
    module1: false,
    module2: false,
    module3: false,
    module4: false,
    module5: false,
    module6: false,
    module7: false,
    module8: false,
    final: false,
  });

  const toggleSection = (sectionId: string) => {
    // If clicking the same section, close it. Otherwise, open the new section
    setExpandedSection(prev => prev === sectionId ? '' : sectionId);
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    const newItems = { ...checkedItems, [id]: checked };
    setCheckedItems(newItems);
    if (checked && showError) {
      // Check if all are now checked to hide error
      const allChecked = Object.keys(checkedItems).every(key =>
        key === id ? checked : checkedItems[key]
      );
      if (allChecked) setShowError(false);
    }
  };

  const isAllChecked = Object.values(checkedItems).every(val => val === true);

  const trainingModules = [
    {
      id: 'mission',
      title: t('ListenerTraining.missionTitle'),
      description: t('ListenerTraining.missionDescription'),
    },
    {
      id: 'legal',
      title: t('ListenerTraining.legalTitle'),
      description: 'Legal and ethical boundaries content will be displayed here.',
    },
    {
      id: 'confidentiality',
      title: t('ListenerTraining.confidentialityTitle'),
      description: 'Confidentiality and data protection guidelines will be shown here.',
    },
    {
      id: 'communication',
      title: t('ListenerTraining.communicationTitle'),
      description: 'Communication skills and staying present techniques will be covered here.',
    },
    {
      id: 'distressed',
      title: t('ListenerTraining.distressedTitle'),
      description: 'Guidelines for supporting distressed venters will be provided here.',
    },
    {
      id: 'redflags',
      title: t('ListenerTraining.redFlagsTitle'),
      description: 'Red flags identification and escalation protocols will be explained here.',
    },
    {
      id: 'selfcare',
      title: t('ListenerTraining.selfCareTitle'),
      description: 'Self-care practices for listeners will be discussed here.',
    }
  ];

  const complianceModules = t('ListenerTraining.complianceModules', { returnObjects: true }) as any[];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      // paddingHorizontal: wp(5),
    },
    scrollContent: {
      paddingBottom: hp(4),
    },
    topImageContainer: {
      width: '100%',
      height: hp(40),
      borderRadius: hp(2),
      overflow: 'hidden',
    },
    topImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    titleContainer: {
      marginBottom: hp(2),
    },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.2),
      color: theme.white,
      marginBottom: hp(0.5),
    },
    subtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + '80',
      lineHeight: hp(2),
    },
    expertiseContainer: {
      marginBottom: hp(3),
    },
    expertiseTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(1.5),
    },
    expertiseTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: wp(2),
    },
    expertiseTag: {
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.8),
      borderRadius: hp(999),
    },
    overviewBox: {
      backgroundColor: "transparent",
      borderRadius: hp(1.6),
      marginBottom: hp(3),
      padding: hp(1.6)
    },
    expertiseTagText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
    },
    statsIconCon: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between"
    },
    statsIcon: {
      width: hp(3),
      height: hp(3),
      resizeMode: "contain",
      tintColor: theme.white
    },
    overviewContainer: {
      marginBottom: hp(2),
    },
    overviewTitle: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(1.5),
    },
    overviewText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + '90',
      lineHeight: hp(2),
    },
    statsContainer: {
      flexDirection: 'row',
      gap: wp(4),
    },
    statItem: {
      flex: 1,
      padding: wp(3.5),
      borderRadius: hp(1.5),
    },
    statNumber: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.2),
      color: theme.white,
    },
    statLabel: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
    },
    modulesContainer: {
      marginBottom: hp(4),
    },
    complianceSection: {
      marginTop: hp(4),
      paddingTop: hp(2),
      // borderTopWidth: 1,
      // borderTopColor: theme.white + '20',
    },
    complianceTitle: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(2),
    },
    complianceIntro: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.5),
      color: theme.white + 'cc',
      lineHeight: hp(2.6),
      marginBottom: hp(2),
    },
    moduleContent: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + 'cc',
      lineHeight: hp(2.6),
      marginBottom: hp(1.5),
    },
    errorText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.4),
      color: '#FF5252',
      textAlign: 'center',
      marginBottom: hp(1),
    },
    continueButtonContainer: {
      paddingHorizontal: wp(5),
      paddingBottom: hp(4),
    },
    imageBackground: {
      flex: 1,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.overlay
    },
  });

  const selectedBackgroundId = useSelector((state: RootState) => state?.app?.selectedBackgroundId);
  const customBackgrounds = useSelector((state: RootState) => state?.app?.customBackgrounds);

  const handleContinue = () => {
    if (isAllChecked || __DEV__) {
      (navigation as any).navigate(routes.listenerPhoneNumber, { accountTypeChanging });

    } else {
      setShowError(true);
      toastError({
        text: t('ListenerTraining.agreeAllTerms'),
        theme
      });
    }
  };

  return (
    <View key={langKey} style={styles.container}>
      <ImageBackground
        source={getBackgroundImage(selectedBackgroundId, customBackgrounds)}
        style={styles.imageBackground}
      >
        <View style={[styles.overlay, {
          backgroundColor: "rgba(0,0,0,0.6)"
        }]} />
        <View style={{
          zIndex: 999,
          width: "100%",
          paddingHorizontal: wp(5),
          position: "absolute",
          top: insets.top + hp(.5)
        }}>
          <AuthStepsHeader handleBack={() => navigation.goBack()} btnOpacity={0.2} />
          {/* Training progress bar */}
          <View style={{ paddingHorizontal: hp(2), paddingBottom: hp(1) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: hp(0.5) }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: hp(1.4), fontFamily: fontFamilies.normal }}>
                {Object.values(checkedItems).filter(Boolean).length} of {Object.keys(checkedItems).length} modules completed
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: hp(1.4), fontFamily: fontFamilies.normal }}>
                {Math.round((Object.values(checkedItems).filter(Boolean).length / Object.keys(checkedItems).length) * 100)}%
              </Text>
            </View>
            <View style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: hp(1), height: hp(0.6) }}>
              <View style={{ width: `${Math.round((Object.values(checkedItems).filter(Boolean).length / Object.keys(checkedItems).length) * 100)}%`, backgroundColor: '#a78bfa', borderRadius: hp(1), height: hp(0.6) }} />
            </View>
          </View>
        </View>
        <StatusBar translucent backgroundColor="transparent" barStyle={'light-content'} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Image */}
          <View style={styles.topImageContainer}>
            <Image source={listenerTopImage} style={styles.topImage} />
          </View>
          <View style={{ flex: 1, padding: wp(5) }}>

            {/* Title Section */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{t('ListenerTraining.title')}</Text>
              <Text style={styles.subtitle}>
                {t('ListenerTraining.subtitle')}
              </Text>
            </View>

            {/* Expertise Tags */}
            <View style={styles.expertiseContainer}>
              <Text style={styles.expertiseTitle}>{t('ListenerTraining.expertise')}</Text>
              <View style={styles.expertiseTags}>
                <GlassView style={styles.expertiseTag}>
                  <Text style={styles.expertiseTagText}>{t('ListenerTraining.emotionalIntelligence')}</Text>
                </GlassView>
                <GlassView style={styles.expertiseTag}>
                  <Text style={styles.expertiseTagText}>{t('ListenerTraining.activeListening')}</Text>
                </GlassView>
              </View>
            </View>

            {/* Course Overview */}
            <View style={styles.overviewContainer}>
              <Text style={styles.overviewTitle}>{t('ListenerTraining.courseOverview')}</Text>
              <GlassView bordered style={styles.overviewBox}>
                <Text style={styles.overviewText}>
                  {t('ListenerTraining.courseDescription')}
                </Text>
              </GlassView>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <GlassView style={styles.statItem}>
                  <View style={styles.statsIconCon}>
                    <Text style={styles.statLabel}>{t('ListenerTraining.hours')}</Text>
                    <Image source={timeIcon} style={styles.statsIcon} />
                  </View>
                  <Text style={styles.statNumber}>2</Text>
                </GlassView>
                <GlassView style={styles.statItem}>
                  <View style={styles.statsIconCon}>
                    <Text style={styles.statLabel}>{t('ListenerTraining.modules')}</Text>
                    <Image source={moduleIcon} style={styles.statsIcon} />
                  </View>
                  <Text style={styles.statNumber}>7</Text>
                </GlassView>
              </View>
            </View>




            {/* Compliance Section */}
            <View style={styles.complianceSection}>


              {complianceModules.map((module) => (
                <AccordionItem
                  key={module.id}
                  title={module.title}
                  isExpanded={expandedSection === module.id}
                  onToggle={() => toggleSection(module.id)}
                  showChevron={true}
                  containerStyle={{ marginBottom: hp(2) }}
                >
                  <View>
                    <Text style={styles.moduleContent}>{module.content}</Text>
                    <Checkbox
                      label={module.checkboxLabel}
                      checked={checkedItems[module.id]}
                      onChange={(val) => handleCheckboxChange(module.id, val)}
                      error={showError && !checkedItems[module.id]}
                    />
                  </View>
                </AccordionItem>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.continueButtonContainer}>
          {showError && !isAllChecked && (
            <Text style={styles.errorText}>
              {t('ListenerTraining.agreeAllTerms')}
            </Text>
          )}
          <Button
            title={isAllChecked ? 'Training Complete 🎉 — Next Step' : t('ListenerTraining.continue')}
            onPress={handleContinue}
            disabled={false}
          />
        {!isAllChecked && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ alignItems: 'center', paddingVertical: hp(1.5), marginTop: hp(1) }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: hp(1.5) }}>
              Resume Later — progress is saved
            </Text>
          </TouchableOpacity>
        )}
        </View>
      </ImageBackground>
    </View>
  );
};

export default ListenerTraining;