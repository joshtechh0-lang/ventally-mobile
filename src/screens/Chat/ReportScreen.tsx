import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import GlassWrapper from '../../components/GlassWrapper';
import GlassModal from '../../components/shared/GlassModal';
import Button from '../../components/Button';
import { routes } from '../../navigation/routes';
import { useSelector } from 'react-redux';
import { useAdmin } from '../../api/apiHooks/useAdmin';
import { useBlock } from '../../api/apiHooks/useBlock';
import { SubmitReportPayload } from '../../types/apiPayloadsTypes';
import { Loader, Input } from '../../components';
import { toastError } from '../../utils/toast';
import type { RootState } from '../../store/store';

const REPORT_REASONS = [
  'reasonDisruptive',
  'reasonBullying',
  'reasonDanger',
  'reasonInappropriate',
] as const;

const ReportScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const { t } = useTranslationWithUpdate();
  const { theme } = useTheme();
  const { isVenter } = useSelector((state: any) => state.user);
  const { data, type } = route?.params || {};
  const { submitReport } = useAdmin();
  const { blockUser } = useBlock();
  console.log("params route---", route);
  const session = useSelector((state: RootState) => state.session);
  console.log('Session details in report screen:', session);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBlock, setIsLoadingBlock] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('reasonDisruptive');
  const [description, setDescription] = useState('');

  const [blockUserModal, setBlockUserModal] = useState(false);
  const [wasThatUseFulModal, setWasThatUseFulModal] = useState(false);
  const [temporaryRestrictionModal, setTemporaryRestrictionModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sessionEndedModal, setSessionEndedModal] = useState(false);

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: hp(4),
    },
    card: {
      paddingHorizontal: wp(5),
      paddingVertical: hp(2.5),
      borderRadius: hp(2.5),
      borderWidth: 1,
      borderColor: theme.white20,
    },
    cardTitle: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(2),
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: hp(1.2),
    },
    radioOuter: {
      width: hp(2.2),
      height: hp(2.2),
      borderRadius: hp(1.1),
      borderWidth: 1.5,
      borderColor: theme.white + "90",
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(3),
    },
    radioInner: {
      width: hp(1.2),
      height: hp(1.2),
      borderRadius: hp(0.6),
      backgroundColor: theme.white,
    },
    optionLabel: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.7),
      color: theme.white,
      flex: 1,
    },
    submitContainer: {
      paddingTop: hp(3),
      paddingBottom: hp(2),
    },
    inputContainer: {
      marginTop: hp(2),
    },
    descriptionInput: {

      paddingHorizontal: wp(4),

    },
  });

  const handleBack = () => navigation.goBack();

  const handleSubmit = async () => {
    if (!description.trim()) {
      toastError({ text: t('ReportScreen.errorDescriptionRequired', { defaultValue: 'Please provide a description' }) });
      return;
    }

    try {
      setIsLoading(true);

      // Map local enum constants to the explicit API requirement
      const reasonMap: Record<string, string> = {
        'reasonDisruptive': 'disruptive_behavior',
        'reasonBullying': 'bullying_or_harassment',
        'reasonDanger': 'danger_to_self_or_others',
        'reasonInappropriate': 'inappropriate_or_unsafe_response'
      };

      const simplifiedReason = reasonMap[selectedReason] || 'disruptive_behavior';

      // Find the ID of the user being reported based on our perspective
      const reportedUserId = isVenter ? session?.listenerId : session?.venterId;

      const payload: SubmitReportPayload = {
        reportedId: reportedUserId || '',
        sessionType: session?.sessionType || type,
        // @ts-ignore
        sessionId: session?.sessionId,
        reason: simplifiedReason,
        description: description,
      };

      console?.log('--------------------------->> SubmitReport Payload', JSON?.stringify(payload, null, 2));

      // Call the correct API Hook
      const res = await submitReport(payload);

      console?.log('--------------------------->> Res', res);
      if (res?.success) {
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      console?.log('--------------------------->> Err', err);
      toastError({ text: err?.message || t('Common.error', { defaultValue: 'An error occurred' }) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessDone = () => {
    setShowSuccessModal(false);
    setBlockUserModal(true);
  };

  const handleBlockUser = async () => {
    const reportedUserId = isVenter ? session?.listenerId : session?.venterId;
    if (!reportedUserId) {
      toastError({ text: t('Common.error', { defaultValue: 'User ID not found' }) });
      return;
    }

    try {
      setIsLoadingBlock(true);
      const res = await blockUser(reportedUserId);
      console?.log('--------------------------->> Block Res', res);
      if (res?.message) {
        setBlockUserModal(false);
        setWasThatUseFulModal(true);
      }
    } catch (err: any) {
      console?.log('--------------------------->> Block Err', err);
      toastError({ text: err?.message || err?.error || t('Common.error', { defaultValue: 'Failed to block user' }) });
    } finally {
      setIsLoadingBlock(false);
    }
  };

  const handleSessionEndedDone = () => {
    setSessionEndedModal(false);
    if (isVenter) {
      (navigation as any).navigate(routes.venterHomeTab)
    } else {
      (navigation as any).navigate(routes.listenerHomeTab)
    }
  };

  return (
    <HomeWrapper>
      // @ts-ignore
      <ScreenHeader title=""

        onBackPress={handleBack}
        showBackButton
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GlassWrapper bordered style={styles.card} glassStyles={{
          backgroundColor: theme.black + "20",
        }}>
          <Text style={styles.cardTitle}>
            {t('ReportScreen.reportingListener')}
          </Text>
          {REPORT_REASONS.map((key) => (
            <TouchableOpacity
              key={key}
              style={styles.optionRow}
              onPress={() => setSelectedReason(key)}
              activeOpacity={0.7}
            >
              <View style={[styles.radioOuter, {
                borderWidth: selectedReason === key ? hp(.7) : hp(.1)
              }]}>
                {/* {selectedReason === key && (
                  <View style={styles.radioInner} />
                )} */}
              </View>
              <Text style={styles.optionLabel}>
                {t(`ReportScreen.${key}`)}
              </Text>
            </TouchableOpacity>
          ))}

          <GlassWrapper style={styles.inputContainer}>
            <Input
              inputStyle={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder={t('ReportScreen.descriptionPlaceholder', { defaultValue: 'Describe the issue...' })}
              placeholderTextColor={theme.white60}
              multiline
              maxLength={1000}
              textAlignVertical="top"
            />
          </GlassWrapper>
        </GlassWrapper>
        <View style={{ flex: 1 }} />
        <Button
          title={t('ReportScreen.submitButton')}
          onPress={handleSubmit}
          buttonStyle={{}}
          titleStyle={{}}
          disabled={false}
          borderedGlassButton
          glassStyles={{ backgroundColor: theme.black + "20", }}
          leftIcon={undefined}
          iconStyle={{}}
        />
      </ScrollView>

      <GlassModal
        visible={showSuccessModal}
        onClose={handleSuccessDone}
        showIcon={false}
        title={t('ReportScreen.successTitle')}
        message={t('ReportScreen.successMessage')}
        showButtons={true}
        primaryButtonText={t('ReportScreen.doneButton')}
        onPrimaryPress={handleSuccessDone}
        secondaryButtonText=""
        dismissOnOverlayPress={false}
        dismissOnBackPress={true}
        bottomAttachedBtn
      />
      <GlassModal
        visible={blockUserModal}
        onClose={() => setBlockUserModal(false)}
        showIcon={false}
        title={t('ReportScreen.blockUserTitle')}
        message={t('ReportScreen.blockUserMessage')}
        showButtons={true}
        primaryButtonText={t('Common.yes')}
        secondaryButtonText={t('Common.no')}

        onPrimaryPress={handleBlockUser}
        onSecondaryPress={() => {
          setSessionEndedModal(true)
          setBlockUserModal(false)
        }}
        dismissOnOverlayPress={false}
        dismissOnBackPress={true}


      />
      <GlassModal
        visible={wasThatUseFulModal}
        onClose={() => setWasThatUseFulModal(false)}
        showIcon={false}
        titleStyle={{ marginBottom: hp(3) }}
        title={t('ReportScreen.wasThatUseFulTitle')}
        showButtons={true}
        primaryButtonText={t('Common.yes')}
        secondaryButtonText={t('Common.no')}
        onPrimaryPress={() => {
          setTemporaryRestrictionModal(true)
          setWasThatUseFulModal(false)
        }}
        onSecondaryPress={() => {
          setTemporaryRestrictionModal(true)
          setWasThatUseFulModal(false)
        }}
        dismissOnOverlayPress={false}
        dismissOnBackPress={true}
      />
      <GlassModal
        visible={temporaryRestrictionModal}
        onClose={() => setTemporaryRestrictionModal(false)}
        showIcon={false}
        title={t('ReportScreen.temporaryRestrictionTitle')}
        message={t('ReportScreen.temporaryRestrictionMessage')}
        showButtons={true}
        primaryButtonText={t('ReportScreen.contactSupport')}
        secondaryButtonText={t('ReportScreen.exit')}
        onPrimaryPress={() => setTemporaryRestrictionModal(false)}
        onSecondaryPress={() => setTemporaryRestrictionModal(false)}
        dismissOnOverlayPress={false}
        showVerticalButtons
      />
      <GlassModal
        visible={sessionEndedModal}
        onClose={() => setSessionEndedModal(false)}
        showIcon={false}
        title={t('ReportScreen.sessionEndedTitle')}
        message={t('ReportScreen.sessionEndedMessage')}
        showButtons={true}
        primaryButtonText={t('Common.ok')}
        onPrimaryPress={handleSessionEndedDone}
        secondaryButtonText=""
        dismissOnOverlayPress={false}
        dismissOnBackPress={true}
        bottomAttachedBtn
      />
      <Loader isVisible={isLoading || isLoadingBlock} />
    </HomeWrapper >
  );
};

export default ReportScreen;
