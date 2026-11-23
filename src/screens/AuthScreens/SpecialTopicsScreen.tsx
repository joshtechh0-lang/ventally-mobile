import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { RootState } from '../../store/store';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { routes } from '../../navigation/routes';
import QuestionStepList from '../../components/QuestionStepList';
import apiInstance, { ApiResponse } from '../../api/apiInstance';
import { useTheme } from '../../theme';
import { updateUser } from '../../store/slices/userSlice';
import { ActivityIndicator, View } from 'react-native';
import { toastError, toastSuccess } from '../../utils/toast';

interface SpecialTopicOption {
  id: string;
  label: string;
  label_key?: string;
}

const SpecialTopicsScreen = ({ route }: any) => {
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
  const currentTopics = useSelector((state: RootState) => state.user.user.specialTopics);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(currentTopics || []);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(false);
    }, [])
  );

  useEffect(() => {
    // fetchSpecialTopicsOptions();
    setOptions(getDefaultOptions());
  }, []);

  const fetchSpecialTopicsOptions = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<SpecialTopicOption[]> = await apiInstance.get(
        'questions/special-topics/options'
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
      console.error('Error fetching special topics options:', error);
      // Fallback to default options
      setOptions(getDefaultOptions());
    } finally {
      setLoading(false);
    }
  };
  // Mental Health, Life & Identity, Relationships, Work & Money, Health & Medical, Work & Finances
  const getDefaultOptions = (): any[] => [
    {
      id: 'Mental Health',
      labelKey: 'SpecialTopics.mentalHealth',
    },
    {
      id: 'Life & Identity',
      labelKey: 'SpecialTopics.lifeIdentity',
    },
    {
      id: 'Relationships',
      labelKey: 'SpecialTopics.relationships',
    },
    {
      id: 'Health & Medical',
      labelKey: 'SpecialTopics.healthMedical',
    },
    {
      id: 'Work & Finances',
      labelKey: 'SpecialTopics.workFinances',
    },
  ];

  const handleSelect = (value: string) => {
    setSelectedTopics(prev =>
      prev.includes(value)
        ? prev.filter(id => id !== value)
        : [...prev, value]
    );
  };

  const handleContinue = async () => {
    if (selectedTopics.length === 0) return;

    try {
      dispatch(updateUser({ specialTopics: selectedTopics }));
      setLoading(true);
      const response = (await apiInstance.put('auth/profile', {
        specialTopics: selectedTopics,
      })) as unknown as ApiResponse;

      if (response.success) {
        if (edit) {
          toastSuccess({ text: t('Common.success'), theme });
          navigation.goBack();
        } else {
          navigation.navigate(routes.faithOrBelief as never);
        }
      } else {
        toastError({ text: response.error || t('Common.error'), theme });
      }
    } catch (error) {
      console.error('Error saving special topics:', error);
      toastError({ text: t('Common.error'), theme });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Navigate to next question (Faith or Belief)
    navigation.navigate(routes.faithOrBelief as never);
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
        step={6}
        totalSteps={7}
        title=""
        titleKey="SpecialTopics.title"
        options={options}
        selectedValue={selectedTopics}
        onSelect={handleSelect}
        onContinue={handleContinue}
        continueButtonText={edit ? 'Common.update' : undefined}
        skipButtonText={edit ? 'Common.cancel' : undefined}
        onSkip={edit ? handleBack : handleSkip}
        onBack={handleBack}
      />
    </AuthWrapper>
  );
};

export default SpecialTopicsScreen;
