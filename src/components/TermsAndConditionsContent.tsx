import React from 'react';
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useTranslationWithUpdate } from "../hooks/useTranslationWithUpdate";
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from "../theme";
import { hp, wp } from "../utils/size";
import { fontFamilies } from "../utils/fontFamilies";

const TermsAndConditionsContent = ({ title }: { title?: string }) => {
    const { theme, isDark } = useTheme();
    const { t, i18n } = useTranslationWithUpdate();
    const [langKey, setLangKey] = React.useState(i18n.language);
    useFocusEffect(React.useCallback(() => { setLangKey(i18n.language); }, [i18n.language]));
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
        mainHeading: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(2.2),
            color: theme.white,
            marginBottom: hp(1),
            alignSelf: "center"

        }
    });
    return (
        <ScrollView
            key={langKey}
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Terms and Conditions Section */}
            {!title && <Text style={styles.mainHeading}>
                {t('TermsAndConditions.title')}
            </Text>}
            <View style={styles.section}>
                {/* <Text style={styles.mainTitle}>{t('TermsAndConditions.title')}</Text> */}

                <Text style={styles.subheading}>{t('TermsAndConditions.purpose')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.purposeText')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.enforcementSteps')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.firstOffense')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.secondOffense')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.thirdOffense')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.severeViolations')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.severeViolationsText1')}
                </Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.severeViolationsText2')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.transparency')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.transparencyText')}
                </Text>
            </View>

            {/* Ventally Safety & Crisis Policy Section */}
            <View style={styles.section}>
                <Text style={[styles.mainTitle, { alignSelf: 'flex-start' }]}>
                    {t('TermsAndConditions.safetyPolicyTitle')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.safetyPurpose')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.safetyPurposeText')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.crisisProtocol')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.crisisProtocol1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.crisisProtocol2')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.crisisProtocol3')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.limitations')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.limitationsText')}
                </Text>

                <Text style={[styles.mainTitle, { alignSelf: 'flex-start', marginTop: hp(3) }]}>
                    {t('TermsAndConditions.confidentialityPolicyTitle')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.confidentialityPurpose')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.confidentialityPurposeText')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.prohibitedConduct')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.prohibitedConduct1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.prohibitedConduct2')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.prohibitedConduct3')}
                </Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.prohibitedConduct4')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.repercussions')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.repercussionsText')}
                </Text>

                <Text style={[styles.mainTitle, { alignSelf: 'flex-start', marginTop: hp(3) }]}>
                    {t('TermsAndConditions.bullyingPolicyTitle')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.bullyingPurpose')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.bullyingPurposeText')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.bullyingProhibitedConduct')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.bullyingProhibitedConduct1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.bullyingProhibitedConduct2')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.bullyingProhibitedConduct3')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.bullyingReporting')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.bullyingReporting1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.bullyingReporting2')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.bullyingRepercussions')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.bullyingRepercussions1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.bullyingRepercussions2')}
                </Text>

                <Text style={[styles.mainTitle, { alignSelf: 'flex-start', marginTop: hp(3) }]}>
                    {t('TermsAndConditions.antiDiscriminationPolicyTitle')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.antiDiscriminationPurpose')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.antiDiscriminationPurpose1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.antiDiscriminationPurpose2')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.antiDiscriminationProhibitedConduct')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.antiDiscriminationProhibitedConduct1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.antiDiscriminationProhibitedConduct2')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.antiDiscriminationProhibitedConduct3')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.antiDiscriminationRepercussions')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.antiDiscriminationRepercussionsText')}
                </Text>

                <Text style={[styles.mainTitle, { alignSelf: 'flex-start', marginTop: hp(3) }]}>
                    {t('TermsAndConditions.codeOfConductTitle')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.codeOfConductPurpose')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.codeOfConductPurpose1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.codeOfConductPurpose2')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.standardsOfBehavior')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.standardRespect')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.standardNoHarassment')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.standardNoHateSpeech')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.standardNoExploitation')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.standardNoThreats')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.standardConfidentiality')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.reportingMisconduct')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.reportingMisconduct1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.reportingMisconduct2')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.reportingMisconduct3')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.repercussionsForViolations')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.repercussionsZeroTolerance')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.repercussionsFirstOffense')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.repercussionsSecondOffense')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.repercussionsThirdOffense')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.repercussionsSevereViolations')}
                </Text>

                <Text style={[styles.mainTitle, { alignSelf: 'flex-start', marginTop: hp(3) }]}>
                    {t('TermsAndConditions.communityCommitmentTitle')}
                </Text>

                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.communityCommitmentIntro')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.communityCommitment1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.communityCommitment2')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.communityCommitment3')}
                </Text>

                <Text style={[styles.mainTitle, { alignSelf: 'flex-start', marginTop: hp(3) }]}>
                    {t('TermsAndConditions.sexualHarassmentPolicyTitle')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.sexualHarassmentPurpose')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.sexualHarassmentPurpose1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.sexualHarassmentPurpose2')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.definitionOfSexualHarassment')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.sexualHarassmentDefinition')}
                </Text>
                <Text style={[styles.text, { marginLeft: wp(4), marginTop: hp(1) }]}>
                    {t('TermsAndConditions.examplesProhibitedConduct')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.sexualHarassmentExample1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.sexualHarassmentExample2')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.sexualHarassmentExample3')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.sexualHarassmentExample4')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.sexualHarassmentExample5')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.scopeTitle')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.scopeText')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.scopeVoice')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.scopeTextSessions')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.scopeInApp')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.reportingHarassment')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.reportingHarassment1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.reportingHarassment2')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.reportingHarassment3')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.sexualHarassmentRepercussions')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.sexualHarassmentZeroTolerance')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.sexualHarassmentFirstOffense')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.sexualHarassmentSecondOffense')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.sexualHarassmentThirdOffense')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.sexualHarassmentSevereViolations')}
                </Text>

                <Text style={[styles.mainTitle, { alignSelf: 'flex-start', marginTop: hp(3) }]}>
                    {t('TermsAndConditions.privacyTitle')}
                </Text>

                <Text style={styles.text}>
                    {t('TermsAndConditions.privacyEffectiveDate')}
                </Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.privacyContact')}
                </Text>

                <Text style={styles.text}>
                    {t('TermsAndConditions.privacyIntro')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.informationWeCollect')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.informationWeCollectIntro')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.informationYouProvide')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.informationYouProvide1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.informationYouProvide2')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.informationYouProvide3')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.informationYouProvide4')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.informationCollectedAutomatically')}</Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.informationCollectedAutomatically1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.informationCollectedAutomatically2')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.informationCollectedAutomatically3')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.specialCategories')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.specialCategoriesText')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.howWeUseYourInformation')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.howWeUseYourInformationIntro')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.howWeUse1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.howWeUse2')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.howWeUse3')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.howWeUse4')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.howWeUse5')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.howWeUse6')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.howWeUse7')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.legalBasesForProcessing')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.legalBasesIntro')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.legalBases1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.legalBases2')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.legalBases3')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.legalBases4')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.howWeShareYourInformation')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.howWeShareIntro')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.howWeShare1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.howWeShare2')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.howWeShare3')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.internationalDataTransfers')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.internationalDataTransfers1')}
                </Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.internationalDataTransfers2')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.dataRetention')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.dataRetention1')}
                </Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.dataRetention2')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.yourRights')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.yourRightsIntro')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.yourRights1')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.yourRights2')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.yourRights3')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.yourRights4')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.yourRights5')}
                </Text>
                <Text style={styles.bulletPoint}>
                    {t('TermsAndConditions.yourRights6')}
                </Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.yourRightsContact')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.cookiesAndTracking')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.cookiesAndTrackingText')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.securityMeasures')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.securityMeasuresText')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.childrensPrivacy')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.childrensPrivacyText')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.thirdPartyLinks')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.thirdPartyLinksText')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.changesToThisPolicy')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.changesToThisPolicyText')}
                </Text>

                <Text style={styles.subheading}>{t('TermsAndConditions.contactUs')}</Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.contactUsIntro')}
                </Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.contactUsTeam')}
                </Text>
                <Text style={styles.text}>
                    {t('TermsAndConditions.contactUsEmail')}
                </Text>
            </View>
        </ScrollView>
    );
};
export default TermsAndConditionsContent;