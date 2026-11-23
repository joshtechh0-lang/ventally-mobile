import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';

const NotificationDetail = ({ route }: any) => {
  const navigation = useNavigation();
  const { t } = useTranslationWithUpdate();
  const { theme } = useTheme();
  const { notification } = route.params;
  const styles = StyleSheet.create({
    content: {
      width: '100%',
    },
    scrollContent: {
      paddingHorizontal: wp(5),
      paddingBottom: hp(4),
    },
    bodyText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      lineHeight: hp(2.4),
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <HomeWrapper>
      <ScreenHeader
        title={t('Notifications.title')}
        onBackPress={handleBack}
        showBackButton
      />
      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.bodyText}>
            {notification?.body || ""}
          </Text>
        </ScrollView>
      </View>
    </HomeWrapper>
  );
};

export default NotificationDetail;
