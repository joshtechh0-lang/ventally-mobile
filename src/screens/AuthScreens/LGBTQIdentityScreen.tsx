import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { routes } from '../../navigation/routes';
import QuestionStep, { QuestionOption } from '../../components/QuestionStep';
import apiInstance, { ApiResponse } from '../../api/apiInstance';
import { useTheme } from '../../theme';
import { updateUser } from '../../store/slices/userSlice';
import { ActivityIndicator, View } from 'react-native';
import { toastError, toastSuccess } from '../../utils/toast';
import { RootState } from '../../store/store';

interface LGBTQOption {
  id: string;
  label: string;
  label_key?: string;
  is_primary?: boolean;
}

const LGBTQIdentityScreen = ({ route }: any) => {
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
  const [selectedLGBTQ, setSelectedLGBTQ] = useState<string | undefined>(user?.lgbtqIdentity);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(false);
    }, [])
  );

  useEffect(() => {
    // fetchLGBTQOptions();
    setOptions(getDefaultOptions());
  }, []);

  const fetchLGBTQOptions = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<LGBTQOption[]> = await apiInstance.get(
        'questions/lgbtq-identity/options'
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
      console.error('Error fetching LGBTQ+ identity options:', error);
      // Fallback to default options
      setOptions(getDefaultOptions());
    } finally {
      setLoading(false);
    }
  };
  // Gay, Lesbian, Bisexual, Pansexual, Asexual, Queer, Questioning, Straight/Heterosexual, Prefer not to say
  const getDefaultOptions = (): any[] => [
    {
      id: 'Gay',
      labelKey: 'LGBTQIdentity.gay',
    },
    {
      id: 'Lesbian',
      labelKey: 'LGBTQIdentity.lesbian',
    },
    {
      id: 'Bisexual',
      labelKey: 'LGBTQIdentity.bisexual',
    },
    {
      id: 'Pansexual',
      labelKey: 'LGBTQIdentity.pansexual',
    },
    {
      id: 'Asexual',
      labelKey: 'LGBTQIdentity.asexual',
    },
    {
      id: 'Queer',
      labelKey: 'LGBTQIdentity.queer',
    },
    {
      id: 'Questioning',
      labelKey: 'LGBTQIdentity.questioning',
    },
    {
      id: 'Straight/Heterosexual',
      labelKey: 'LGBTQIdentity.straightHeterosexual',
    },
    {
      id: 'Prefer not to say',
      labelKey: 'LGBTQIdentity.preferNotToSay',
    },
  ];

  const handleSelect = async (value: string) => {
    try {
      setSelectedLGBTQ(value);
      if (!edit) {
        setTimeout(async () => {
          setLoading(true);
          dispatch(updateUser({ lgbtqIdentity: value }));
          const response = (await apiInstance.put('auth/profile', {
            lgbtqIdentity: value,
          })) as unknown as ApiResponse;

          if (response.success) {
            setLoading(false);
            navigation.navigate(routes.specialTopics as never);
          } else {
            toastError({ text: response.error || t('Common.error'), theme });
            setLoading(false);
          }
        }, 800);
      }
    } catch (error) {
      console.error('Error saving LGBTQ+ identity:', error);
      toastError({ text: t('Common.error'), theme });
    } finally {
      if (!edit) setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedLGBTQ) return;
    try {
      setLoading(true);
      dispatch(updateUser({ lgbtqIdentity: selectedLGBTQ }));
      const response: ApiResponse = await apiInstance.put('auth/profile', {
        lgbtqIdentity: selectedLGBTQ,
      });

      if (response.success) {
        toastSuccess({ text: t('Common.success'), theme });
        navigation.goBack();

      } else {
        toastError({ text: response.error || t('Common.error'), theme });
      }
    } catch (error) {
      console.error('Error updating LGBTQ+ identity:', error);
      toastError({ text: t('Common.error'), theme });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Navigate to next question (Special Topics)
    navigation.navigate(routes.specialTopics as never);
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
        step={5}
        totalSteps={7}
        title=""
        titleKey="LGBTQIdentity.title"
        options={options}
        selectedValue={selectedLGBTQ}
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

export default LGBTQIdentityScreen;
