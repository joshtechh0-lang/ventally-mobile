import React, { useState, useEffect } from 'react';
import { View, Text, AppState } from 'react-native';
import { hp } from '../utils/size';
import { fontFamilies } from '../utils/fontFamilies';

export const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkConnection = async () => {
      try {
        const response = await fetch('https://api.ventally.co/api/v1/', { method: 'HEAD' });
        if (mounted) setIsOffline(!response.ok && response.status !== 401);
      } catch {
        if (mounted) setIsOffline(true);
      }
    };

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') checkConnection();
    });

    checkConnection();
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  if (!isOffline) return null;

  return (
    <View style={{
      backgroundColor: '#ef4444',
      paddingVertical: hp(1),
      paddingHorizontal: hp(2),
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text style={{ color: '#fff', fontSize: hp(1.5), fontFamily: fontFamilies.medium }}>
        No internet connection — please check your network
      </Text>
    </View>
  );
};
