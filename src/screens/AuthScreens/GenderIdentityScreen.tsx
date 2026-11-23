import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { routes } from '../../navigation/routes';
import QuestionStep, { QuestionOption } from '../../components/QuestionStep';
import apiInstance, { ApiResponse } from '../../api/apiInstance';
import { updateUser } from '../../store/slices/userSlice';
import { RootState } from '../../store/store';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { hp, WINDOW_HEIGHT, WINDOW_WIDTH, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import { getGlassColors } from '../../utils/glassColors';
import { fontFamilies } from '../../utils/fontFamilies';
import GlassView from '../../components/GlassWrapper';
import { toastError, toastSuccess } from '../../utils/toast';

interface GenderOption {
  id: string;
  label: string;
  label_key?: string;
  is_primary?: boolean;
}

const GenderIdentityScreen = ({ route }: any) => {
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
  const [selectedGender, setSelectedGender] = useState<string | undefined>(user?.gender);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(false);
    }, [])
  );

  useEffect(() => {
    // fetchGenderOptions();
    setOptions(getDefaultOptions());
  }, []);

  const fetchGenderOptions = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<GenderOption[]> = await apiInstance.get(
        'questions/gender-identity/options'
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
      console.error('Error fetching gender options:', error);
      // Fallback to default options
      setOptions(getDefaultOptions());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultOptions = (): any[] => [
    {
      id: 'Man',
      labelKey: 'GenderIdentity.man',
      isPrimary: true,
    },
    {
      id: 'Woman',
      labelKey: 'GenderIdentity.woman',
      isPrimary: true,
    },
    {
      id: 'Non-binary',
      labelKey: 'GenderIdentity.nonBinary',
    },
    {
      id: 'Gender non-conforming',
      labelKey: 'GenderIdentity.genderNonConforming',
    },
    {
      id: 'Questioning',
      labelKey: 'GenderIdentity.questioning',
    },
    {
      id: 'Prefer not to say',
      labelKey: 'GenderIdentity.preferNotToSay',
    },
  ];
  //  Man, Woman, Non-binary, Gender non-conforming, Questioning, Prefer not to say
  const handleSelect = async (value: string) => {
    try {
      setSelectedGender(value);
      if (!edit) {
        setTimeout(async () => {
          setLoading(true);
          dispatch(updateUser({ gender: value }));
          const response = (await apiInstance.put('auth/profile', {
            genderIdentity: value,
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
      console.error('Error saving gender identity:', error);
      toastError({ text: t('Common.error'), theme });
    } finally {
      if (!edit) setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedGender) return;
    try {
      setLoading(true);
      dispatch(updateUser({ gender: selectedGender }));
      const response: ApiResponse = await apiInstance.put('auth/profile', {
        genderIdentity: selectedGender,
      });

      if (response.success) {
        toastSuccess({ text: t('Common.success'), theme });
        navigation.goBack();

      } else {
        toastError({ text: response.error || t('Common.error'), theme });
      }
    } catch (error) {
      console.error('Error updating gender identity:', error);
      toastError({ text: t('Common.error'), theme });
    } finally {
      setLoading(false);
    }
  };



  const handleSkip = () => {
    // Navigate to next question (Racial Identity)
    navigation.navigate(routes.ageGroup as never);
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
      <QuestionStep
        step={1}
        totalSteps={7}
        title=""
        titleKey="GenderIdentity.title"
        options={options}
        selectedValue={selectedGender}
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

export default GenderIdentityScreen;

