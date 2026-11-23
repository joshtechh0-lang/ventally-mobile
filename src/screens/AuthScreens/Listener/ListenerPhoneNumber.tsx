import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AuthWrapper from '../../../wrapper/AuthWrapper';
import { hp, wp } from '../../../utils/size';
import { fontFamilies } from '../../../utils/fontFamilies';
import { useTheme } from '../../../theme';
import { routes } from '../../../navigation/routes';

import apiInstance from '../../../api/apiInstance';
import Button from '../../../components/Button';

const ListenerPhoneNumber = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const accountTypeChanging = (route.params as any)?.accountTypeChanging;

  const handleContinue = async () => {
    if (phone.trim()) {
      // Validate phone
      const cleaned = phone.replace(/[\s\-\(\)]/g, '');
      const phoneRegex = /^\+?\d{10,15}$/;
      if (!phoneRegex.test(cleaned)) {
        setError('Please enter a valid phone number');
        return;
      }
      try {
        setLoading(true);
        await apiInstance.put('auth/profile', { phone: phone.trim() });
      } catch (e) {
        // Continue even if save fails
      } finally {
        setLoading(false);
      }
    }
    (navigation as any).navigate(routes.listenerVerification, { accountTypeChanging });
  };

  const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: wp(5), paddingTop: hp(2) },
    iconContainer: {
      width: hp(7), height: hp(7), borderRadius: hp(3.5),
      backgroundColor: theme.primary + '20',
      justifyContent: 'center', alignItems: 'center',
      marginBottom: hp(2),
    },
    title: { fontFamily: fontFamilies.bold, fontSize: hp(2.8), color: theme.white, marginBottom: hp(1) },
    subtitle: { fontFamily: fontFamilies.normal, fontSize: hp(1.7), color: theme.white + '80', marginBottom: hp(1) },
    reasonBox: {
      backgroundColor: theme.white + '10', borderRadius: hp(1.5),
      padding: hp(2), marginBottom: hp(3),
      borderWidth: 1, borderColor: theme.white + '20',
    },
    reasonText: { fontFamily: fontFamilies.normal, fontSize: hp(1.5), color: theme.white + '90', lineHeight: hp(2.2) },
    label: { fontFamily: fontFamilies.semiBold, fontSize: hp(1.7), color: theme.white, marginBottom: hp(1) },
    input: {
      backgroundColor: theme.white + '10', borderRadius: hp(1.5),
      padding: hp(1.8), fontFamily: fontFamilies.normal,
      fontSize: hp(1.8), color: theme.white,
      borderWidth: 1, borderColor: theme.white + '20',
      marginBottom: hp(1),
    },
    error: { fontFamily: fontFamilies.normal, fontSize: hp(1.5), color: '#ff6b6b', marginBottom: hp(1) },
  });

  return (
    <AuthWrapper>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={{fontSize: hp(3)}}>🔔</Text>
        </View>
        <Text style={styles.title}>Add Your Phone Number</Text>
        <Text style={styles.subtitle}>Optional but recommended</Text>

        <View style={styles.reasonBox}>
          <Text style={styles.reasonText}>
            📱 We use your phone number to send you instant SMS alerts when a venter needs support. This helps you respond faster and connect with more people who need help — even when you're not actively checking the app.
          </Text>
        </View>

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="+1 234 567 8900"
          placeholderTextColor={theme.white + '40'}
          value={phone}
          onChangeText={(text) => { setPhone(text); setError(''); }}
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={{ alignItems: 'center' }}>
          <Button
            title={loading ? 'Saving...' : 'Continue'}
            onPress={handleContinue}
            disabled={loading}
          />
        </View>
      </View>
    </AuthWrapper>
  );
};

export default ListenerPhoneNumber;
