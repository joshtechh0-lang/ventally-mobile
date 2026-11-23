import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { routes } from '../../navigation/routes';
import QuestionStepList, { QuestionOption } from '../../components/QuestionStepList';
import apiInstance, { ApiResponse } from '../../api/apiInstance';
import { useTheme } from '../../theme';
import { updateUser } from '../../store/slices/userSlice';
import { ActivityIndicator, View } from 'react-native';
import { toastError, toastSuccess } from '../../utils/toast';
import { RootState } from '../../store/store';

interface RacialOption {
  id: string;
  label: string;
  label_key?: string;
}

const RacialIdentityScreen = ({ route }: any) => {
  const edit = route?.params?.edit;
  // const edit = true;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const user = useSelector((state: RootState) => state.user.user);
  const [selectedRacial, setSelectedRacial] = useState<string | undefined>(user?.culturalBackground);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(false);
    }, [])
  );

  useEffect(() => {
    // fetchRacialOptions();
    setOptions(getDefaultOptions());
  }, []);

  const fetchRacialOptions = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<RacialOption[]> = await apiInstance.get(
        'questions/racial-identity/options'
      );

      if (response.success && response.data) {
        const formattedOptions: QuestionOption[] = response.data.map((option) => ({
          id: option.id,
          label: option.label,
          labelKey: option.label_key,
        }));
        setOptions(formattedOptions);
      } else {
        // Fallback to default options if API fails
        setOptions(getDefaultOptions());
      }
    } catch (error) {
      console.error('Error fetching racial options:', error);
      // Fallback to default options
      setOptions(getDefaultOptions());
    } finally {
      setLoading(false);
    }
  };
  //  Black, White, Asian, Native Indian, Pacific Islander, Middle Eastern, North African, Multiracial, Other
  const getDefaultOptions = (): any[] => [
    {
      id: 'Black',
      labelKey: 'RacialIdentity.black',
    },
    {
      id: 'White',
      labelKey: 'RacialIdentity.white',
    },
    {
      id: 'Asian',
      labelKey: 'RacialIdentity.asian',
    },
    {
      id: 'Native Indian',
      labelKey: 'RacialIdentity.nativeIndian',
    },
    {
      id: 'Pacific Islander',
      labelKey: 'RacialIdentity.pacificIslander',
    },
    {
      id: 'Middle Eastern',
      labelKey: 'RacialIdentity.middleEastern',
    },
    {
      id: 'North African',
      labelKey: 'RacialIdentity.northAfrican',
    },
    {
      id: 'Multiracial',
      labelKey: 'RacialIdentity.multiracial',
    },
    {
      id: 'Other',
      labelKey: 'RacialIdentity.other',
    },
  ];

  const handleSelect = async (value: string) => {
    try {
      setSelectedRacial(value);
      if (!edit) {
        setTimeout(async () => {
          setLoading(true);
          dispatch(updateUser({ culturalBackground: value }));
          const response = (await apiInstance.put('auth/profile', {
            culturalBackground: value,
          })) as unknown as ApiResponse;

          if (response.success) {
            setLoading(false);
            navigation.navigate(routes.ethnicity as never);
          } else {
            toastError({ text: response.error || t('Common.error'), theme });
            setLoading(false);
          }
        }, 800);
      }
    } catch (error) {
      console.error('Error saving racial identity:', error);
      toastError({ text: t('Common.error'), theme });
    } finally {
      if (!edit) setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedRacial) return;
    try {
      setLoading(true);
      dispatch(updateUser({ culturalBackground: selectedRacial }));
      const response: ApiResponse = await apiInstance.put('auth/profile', {
        culturalBackground: selectedRacial,
      });

      if (response.success) {
        toastSuccess({ text: t('Common.success'), theme });
        navigation.goBack();

      } else {
        toastError({ text: response.error || t('Common.error'), theme });
      }
    } catch (error) {
      console.error('Error updating racial identity:', error);
      toastError({ text: t('Common.error'), theme });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Navigate to next question (Ethnicity)
    navigation.navigate(routes.ethnicity as never);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const { theme } = useTheme();

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
      <QuestionStepList
        step={2}
        totalSteps={7}
        title=""
        titleKey="RacialIdentity.title"
        options={options}
        selectedValue={selectedRacial}
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

export default RacialIdentityScreen;
