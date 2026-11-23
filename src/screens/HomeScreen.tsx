import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, StatusBar, Image } from 'react-native';
import { useTheme } from '../theme';
import { useTranslationWithUpdate } from '../hooks/useTranslationWithUpdate';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setLoading, setUser } from '../store/slices/appSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hp, wp } from '../utils/size';
import { fontFamilies } from '../utils/fontFamilies';
import AuthWrapper from '../wrapper/AuthWrapper';

export const HomeScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslationWithUpdate();
  const dispatch = useDispatch();
  const { isLoading, user } = useSelector((state: RootState) => state.app);

  useEffect(() => {
    // Example: Set user on mount
    dispatch(setUser({ name: 'John Doe', email: 'john@example.com' }));
  }, [dispatch]);


  return (
    <AuthWrapper>
      <View style={{
        padding: hp(1.6), borderRadius: hp(3), overflow: 'hidden', backgroundColor: 'rgba(255,255,255 , 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
      }}>

        <Image
          source={require('../assets/icons/chat.png')}
          style={{ height: hp(13), width: hp(13), borderRadius: 10 }}
        />

      </View>
      <Text style={{ fontFamily: fontFamilies.bold, fontSize: hp(3), color: theme.text }}>{t('Home.title')}</Text>
    </AuthWrapper>

  );
};

