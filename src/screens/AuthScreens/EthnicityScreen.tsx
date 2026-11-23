import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { routes } from '../../navigation/routes';
import QuestionStep, { QuestionOption } from '../../components/QuestionStep';
import apiInstance, { ApiResponse } from '../../api/apiInstance';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../../theme';
import { updateUser } from '../../store/slices/userSlice';
import { toastError, toastSuccess } from '../../utils/toast';
import { RootState } from '../../store/store';

interface EthnicityOption {
  id: string;
  label: string;
  label_key?: string;
  is_primary?: boolean;
}

const EthnicityScreen = ({ route }: any) => {
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
  const [selectedEthnicity, setSelectedEthnicity] = useState<string | undefined>(user?.ethnicity);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(false);
    }, [])
  );

  useEffect(() => {
    // fetchEthnicityOptions();
    setOptions(getDefaultOptions());
  }, []);

  const fetchEthnicityOptions = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<EthnicityOption[]> = await apiInstance.get(
        'questions/ethnicity/options'
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
      console.error('Error fetching ethnicity options:', error);
      // Fallback to default options
      setOptions(getDefaultOptions());
    } finally {
      setLoading(false);
    }
  };
  // African Diaspora, Caribbean, North African, Hispanic, Pacific Islander, Middle Eastern, Asian, Indigenous, European, Multiple, Other, Prefer not to say
  const getDefaultOptions = (): QuestionOption[] => [
    {
      id: 'African Diaspora',
      label: '',
      labelKey: 'Ethnicity.africanDiaspora',
    },
    {
      id: 'Caribbean',
      label: '',
      labelKey: 'Ethnicity.caribbean',
    },
    {
      id: 'North African',
      label: '',
      labelKey: 'Ethnicity.northAfrican',
    },
    {
      id: 'Hispanic',
      label: '',
      labelKey: 'Ethnicity.hispanic',
    },
    {
      id: 'Pacific Islander',
      label: '',
      labelKey: 'Ethnicity.pacificIslander',
    },
    {
      id: 'Middle Eastern',
      label: '',
      labelKey: 'Ethnicity.middleEastern',
    },
    {
      id: 'Asian',
      label: '',
      labelKey: 'Ethnicity.asian',
    },
    {
      id: 'Indigenous',
      label: '',
      labelKey: 'Ethnicity.indigenous',
    },
    {
      id: 'European',
      label: '',
      labelKey: 'Ethnicity.european',
    },
    {
      id: 'Other',
      label: '',
      labelKey: 'Ethnicity.other',
    },
    {
      id: 'Prefer not to say',
      label: '',
      labelKey: 'Ethnicity.preferNotToSay',
    },
    {
      id: 'Multiple',
      label: '',
      labelKey: 'Ethnicity.multiple',
    },
  ];

  const handleSelect = async (value: string) => {
    try {
      setSelectedEthnicity(value);
      if (!edit) {
        setTimeout(async () => {
          setLoading(true);
          dispatch(updateUser({ ethnicity: value }));
          const response = (await apiInstance.put('auth/profile', {
            ethnicity: value,
          })) as unknown as ApiResponse;

          if (response.success) {
            setLoading(false);
            navigation.navigate(routes.ageGroup as never);
          } else {
            toastError({ text: response.error || t('Common.error'), theme });
            setLoading(false);
          }
        }, 800);
      }
    } catch (error) {
      console.error('Error saving ethnicity:', error);
      toastError({ text: t('Common.error'), theme });
    } finally {
      if (!edit) setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedEthnicity) return;
    try {
      setLoading(true);
      dispatch(updateUser({ ethnicity: selectedEthnicity }));
      const response: ApiResponse = await apiInstance.put('auth/profile', {
        ethnicity: selectedEthnicity,
      });

      if (response.success) {
        toastSuccess({ text: t('Common.success'), theme });
        navigation.goBack();

      } else {
        toastError({ text: response.error || t('Common.error'), theme });
      }
    } catch (error) {
      console.error('Error updating ethnicity:', error);
      toastError({ text: t('Common.error'), theme });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Navigate to next question (Age Group)
    navigation.navigate(routes.ageGroup as never);
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
        step={3}
        totalSteps={7}
        title=""
        titleKey="Ethnicity.title"
        options={options}
        selectedValue={selectedEthnicity}
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

export default EthnicityScreen;
