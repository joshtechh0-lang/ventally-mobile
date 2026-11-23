import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View, Text, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BlurView } from '@react-native-community/blur';
import { useDispatch } from 'react-redux';
import { setRequests } from '../../store/slices/listenerSlice';
import socketService from '../../sockets';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { routes } from '../routes';

// Listener tab screens
import ListenerHome from '../../screens/ListenerHome/ListenerHome';
import ListenerRequests from '../../screens/ListenerHome/ListenerRequests';
import ListenerWallet from '../../screens/ListenerHome/ListenerWallet';
import ListenerProfile from '../../screens/ListenerHome/ListenerProfile';
import ListenerSettings from '../../screens/ListenerHome/ListenerSettings';

// Re‑use existing icons for now
import { homeIcon, messagesIcon, walletIcon, settingIcon, requestIcon, userIcon } from '../../assets/icons';
import ProfileScreen from '../../screens/Common/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ focused, icon, label }: { focused: boolean; icon?: any; label: string }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: wp(15.5),
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: hp(0.5),
    },
    icon: {
      width: hp(2.5),
      height: hp(2.5),
      tintColor: focused ? theme.white : theme.white60,
      marginBottom: hp(0.3),
    },
    label: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.2),
      color: focused ? theme.white : theme.white60,
    },
  });

  return (
    <View style={styles.container}>
      {icon && <Image source={icon} style={styles.icon} />}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

// Custom tab bar background with glass effect
const TabBarBackground = () => {
  if (Platform.OS === 'ios') {
    return (
      <View style={StyleSheet.absoluteFill}>
        <BlurView
          blurType="dark"
          blurAmount={25}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(0,0,0,0.4)',
            },
          ]}
        />
      </View>
    );
  }
  // For Android, use darker semi-transparent background
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: 'rgba(0,0,0,0.5)',
        },
      ]}
    />
  );
};

const ListenerHomeStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  React.useEffect(() => {
    // Sync the full requests list when the server sends a snapshot
    // (call:request / chat:request are handled globally in MainNavigator so the
    //  overlay works regardless of which screen the listener is on)
    const handleRequestsLatest = (data: any) => {
      // Only update Redux if the snapshot contains at least one request.
      // An empty snapshot (request expired on backend) must NOT clear the overlay —
      // the listener may still be looking at an IncomingCallOverlay that came in
      // via FCM notification, and wiping it would make the request unreachable.
      const rawRequests = data?.requests;
      if (!Array.isArray(rawRequests) || rawRequests.length === 0) return;

      const requests = rawRequests.map((item: any) => ({
        id: item.requestId ?? item.id,
        type: item.requestType === 'call' ? 'call' : 'message',
        title: item.requester?.anonymousName ?? 'Anonymous',
        requestType: item.requestType ?? null,
        requestId: item.requestId ?? item.id ?? null,
        venterId: item.requester?.id ?? null,
        listenerId: item.listenerId ?? null,
        ratePerMinute: item.ratePerMinute ?? null,
      }));
      dispatch(setRequests(requests));
    };

    socketService.on('requests:latest', handleRequestsLatest);

    return () => {
      socketService.off('requests:latest', handleRequestsLatest);
      // NOTE: do NOT call clearRequests() here — the global socket listener in
      // MainNavigator keeps dispatching new requests; clearing on unmount would
      // dismiss the IncomingCallOverlay whenever the listener navigates away.
    };
  }, [dispatch]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.3)',
          paddingBottom: hp(0),
          paddingTop: hp(2),
          borderRadius: hp(3),
          height: hp(8),
          marginHorizontal: wp(2),
          position: 'absolute',
          bottom: hp(2.5),
          overflow: 'hidden',
          elevation: 0,
          shadowColor: 'transparent',
        },
        tabBarBackground: () => <TabBarBackground />,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.white,
        tabBarInactiveTintColor: theme.white60,
      }}
    >
      <Tab.Screen
        name={routes.listenerHome}
        component={ListenerHome}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={homeIcon} label={t('Navigation.tabs.home')} />
          ),
        }}
      />
      <Tab.Screen
        name={routes.listenerRequests}
        component={ListenerRequests}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={requestIcon} label={t('Navigation.tabs.requests')} />
          ),
        }}
      />
      <Tab.Screen
        name={routes.listenerWalletTab}
        component={ListenerWallet}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={walletIcon} label={t('Navigation.tabs.wallet')} />
          ),
        }}
      />
      <Tab.Screen
        name={routes.listenerProfile}
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={userIcon} label={t('Navigation.tabs.profile')} />
          ),
        }}
      />
      <Tab.Screen
        name={routes.listenerSettingsTab}
        component={ListenerSettings}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={settingIcon} label={t('Navigation.tabs.settings')} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ListenerHomeStack;

