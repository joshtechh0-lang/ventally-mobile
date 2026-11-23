import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { routes } from '../../navigation/routes';
import QuestionStepList from '../../components/QuestionStepList';
import apiInstance, { ApiResponse } from '../../api/apiInstance';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../../theme';
import { updateUser } from '../../store/slices/userSlice';
import { toastError, toastSuccess } from '../../utils/toast';
import { RootState } from '../../store/store';

interface AgeGroupOption {
  id: string;
  label: string;
  label_key?: string;
}

const AgeGroupScreen = ({ route }: any) => {
  const edit = route?.params?.edit;
  // const edit = true;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | undefined>(user?.ageGroup);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const shouldSkipLGBTQ = user?.gender === 'Man' || user?.gender === 'Woman';

  useFocusEffect(
    useCallback(() => {
      setLoading(false);
    }, [])
  );

  useEffect(() => {
    // fetchAgeGroupOptions();
    setOptions(getDefaultOptions());
  }, []);

  const fetchAgeGroupOptions = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<AgeGroupOption[]> = await apiInstance.get(
        'questions/age-group/options'
      );

      if (response.success && response.data) {
        const formattedOptions = response.data.map((option) => ({
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
      console.error('Error fetching age group options:', error);
      // Fallback to default options
      setOptions(getDefaultOptions());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultOptions = (): any[] => [
    {
      id: '18-24',
      labelKey: 'AgeGroup.age18to24',
    },
    {
      id: '25-34',
      labelKey: 'AgeGroup.age25to34',
    },
    {
      id: '35-44',
      labelKey: 'AgeGroup.age35to44',
    },
    {
      id: '45-54',
      labelKey: 'AgeGroup.age45to54',
    },
    {
      id: '55-64',
      labelKey: 'AgeGroup.age55to64',
    },
    {
      id: '65+',
      labelKey: 'AgeGroup.age65Plus',
    },
    {
      id: 'Prefer not to say',
      labelKey: 'AgeGroup.preferNotToSay',
    },
  ];

  const handleSelect = async (value: string) => {
    try {
      setSelectedAgeGroup(value);
      if (!edit) {
        setTimeout(async () => {
          setLoading(true);
          dispatch(updateUser({ ageGroup: value }));
          const response = (await apiInstance.put('auth/profile', {
            ageGroup: value,
          })) as unknown as ApiResponse;

          if (response.success) {
            setLoading(false);
            if (shouldSkipLGBTQ) {
              navigation.navigate(routes.specialTopics as never);
            } else {
              navigation.navigate(routes.lgbtqIdentity as never);
            }
          } else {
            toastError({ text: response.error || t('Common.error'), theme });
            setLoading(false);
          }
        }, 800);
      }
    } catch (error) {
      console.error('Error saving age group:', error);
      toastError({ text: t('Common.error'), theme });
    } finally {
      if (!edit) setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAgeGroup) return;
    try {
      setLoading(true);
      dispatch(updateUser({ ageGroup: selectedAgeGroup }));
      const response: ApiResponse = await apiInstance.put('auth/profile', {
        ageGroup: selectedAgeGroup,
      });

      if (response.success) {
        toastSuccess({ text: t('Common.success'), theme });
        navigation.goBack();

      } else {
        toastError({ text: response.error || t('Common.error'), theme });
      }
    } catch (error) {
      console.error('Error updating age group:', error);
      toastError({ text: t('Common.error'), theme });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Navigate based on gender selection
    if (shouldSkipLGBTQ) {
      navigation.navigate(routes.specialTopics as never);
    } else {
      navigation.navigate(routes.lgbtqIdentity as never);
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
      <QuestionStepList
        step={4}
        totalSteps={7}
        title=""
        titleKey="AgeGroup.title"
        options={options}
        selectedValue={selectedAgeGroup}
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

export default AgeGroupScreen;
