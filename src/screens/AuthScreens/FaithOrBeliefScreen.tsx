import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { updateUser } from '../../store/slices/userSlice';
import { routes } from '../../navigation/routes';
import QuestionStep, { QuestionOption } from '../../components/QuestionStep';
import apiInstance, { ApiResponse } from '../../api/apiInstance';
import { useTheme } from '../../theme';
import { ActivityIndicator, View } from 'react-native';
import { toastError, toastSuccess } from '../../utils/toast';

interface FaithOrBeliefOption {
  id: string;
  label: string;
  label_key?: string;
  is_primary?: boolean;
}

const FaithOrBeliefScreen = ({ route }: any) => {
  const edit = route?.params?.edit;
  // const edit = true;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const user = useSelector((state: RootState) => state.user.user);
  console.log("user", user);

  const [selectedFaith, setSelectedFaith] = useState<string | undefined>(user?.faithOrBelief);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(false);
    }, [])
  );

  useEffect(() => {
    // fetchFaithOrBeliefOptions();
    setOptions(getDefaultOptions());
  }, []);

  const fetchFaithOrBeliefOptions = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<FaithOrBeliefOption[]> = await apiInstance.get(
        '/questions/faith-or-belief/options'
      );

      if (response.success && response.data) {
        const formattedOptions: QuestionOption[] = response.data.map((option) => ({
          id: option.id,
          label: option.label,
          labelKey: option.label_key,
          isPrimary: option.is_primary,
        }));
        setOptions(formattedOptions);
      } else {
        // Fallback to default options if API fails
        setOptions(getDefaultOptions());
      }
    } catch (error) {
      console.error('Error fetching faith or belief options:', error);
      // Fallback to default options
      setOptions(getDefaultOptions());
    } finally {
      setLoading(false);
    }
  };
  // Christian, Muslim, Sikh, Hindu, Buddhist, Jewish, No religion, Spiritual (not religious), Other
  const getDefaultOptions = (): any[] => [
    {
      id: 'Christian',
      labelKey: 'FaithOrBelief.christian',
      isPrimary: true,
    },
    {
      id: 'Muslim',
      labelKey: 'FaithOrBelief.muslim',
      isPrimary: true,
    },
    {
      id: 'Sikh',
      labelKey: 'FaithOrBelief.sikh',
    },
    {
      id: 'Hindu',
      labelKey: 'FaithOrBelief.hindu',
      isPrimary: true,
    },
    {
      id: 'Buddhist',
      labelKey: 'FaithOrBelief.buddhist',
      isPrimary: true,
    },
    {
      id: 'Jewish',
      labelKey: 'FaithOrBelief.jewish',
    },
    {
      id: 'No religion',
      labelKey: 'FaithOrBelief.noReligion',
    },
    {
      id: 'Spiritual (not religious)',
      labelKey: 'FaithOrBelief.spiritualNotReligious',
      isPrimary: true,
    },
    {
      id: 'Other',
      labelKey: 'FaithOrBelief.other',
    },

  ];

  const handleSelect = async (value: string) => {
    try {
      setSelectedFaith(value);
      if (!edit) {
        setTimeout(async () => {
          setLoading(true);
          dispatch(updateUser({ faithOrBelief: value }));
          const response = (await apiInstance.put('auth/profile', {
            faithOrBelief: value,
          })) as unknown as ApiResponse;

          if (response.success) {
            setLoading(false);
            if (user?.role === 'listener' || user?.userType === 'listener') {
              navigation.navigate(routes.listenerTermsAndConditions as never);
            } else {
              navigation.navigate(routes.venterHomeTab as never);
            }
          } else {
            toastError({ text: response.error || t('Common.error'), theme });
            setLoading(false);
          }
        }, 800);
      }
    } catch (error) {
      console.error('Error saving faith or belief:', error);
      toastError({ text: t('Common.error'), theme });
    } finally {
      if (!edit) setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedFaith) return;
    try {
      setLoading(true);
      dispatch(updateUser({ faithOrBelief: selectedFaith }));
      const response: ApiResponse = await apiInstance.put('auth/profile', {
        faithOrBelief: selectedFaith,
      });

      if (response.success) {
        toastSuccess({ text: t('Common.success'), theme });
        navigation.goBack();

      } else {
        toastError({ text: response.error || t('Common.error'), theme });
      }
    } catch (error) {
      console.error('Error updating faith or belief:', error);
      toastError({ text: t('Common.error'), theme });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Navigate based on user role
    if (user?.role === 'listener' || user?.userType === 'listener') {
      navigation.navigate(routes.listenerTermsAndConditions as never);
    } else {
      navigation.navigate(routes.venterHomeTab as never);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (loading) {
    // You can add a loading indicator here
    return (
      <AuthWrapper key={langKey}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme?.primary} />
        </View>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <QuestionStep
        step={7}
        totalSteps={7}
        title=""
        titleKey="FaithOrBelief.title"
        options={options}
        selectedValue={selectedFaith}
        onSelect={handleSelect}
        onContinue={edit ? handleUpdate : undefined}
        continueButtonText={edit ? 'Common.update' : undefined}
        skipButtonText={edit ? 'Common.cancel' : undefined}
        onSkip={edit ? handleBack : handleSkip}
        onBack={handleBack}
      />
    </AuthWrapper>
  );
};

export default FaithOrBeliefScreen;
