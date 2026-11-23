import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View, Text, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BlurView } from '@react-native-community/blur';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { routes } from '../routes';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

// Import screens
import VenterHome from '../../screens/VenterHome/VenterHome';
import VenterMessages from '../../screens/VenterHome/VenterMessages';
import VenterCall from '../../screens/VenterHome/VenterCall';
import VenterWallet from '../../screens/VenterHome/VenterWallet';
import VenterSettings from '../../screens/VenterHome/VenterSettings';
import VenterOthers from '../../screens/VenterHome/VenterOthers';
import PulsingDot from '../../components/shared/PulsingDot';

// Import icons
import { homeIcon, messagesIcon, callIcon, walletIcon, settingIcon, moreIcon } from '../../assets/icons';

const Tab = createBottomTabNavigator();

// Custom tab bar icon component
const TabIcon = ({ focused, icon, label, showDot }: { focused: boolean; icon?: any; label: string; showDot?: boolean }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

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
    placeholder: {
      width: hp(2.5),
      height: hp(2.5),
      backgroundColor: focused ? theme.white : theme.white60,
      borderRadius: hp(0.3),
      marginBottom: hp(0.3),
    },
    activeDot: {
      position: 'absolute',
      right: wp(1.5),
      top: hp(-0.5),
      zIndex: 1,
    }
  });

  return (
    <View style={styles.container}>
      {icon ? (
        <View>
          {showDot && (
            <PulsingDot
              size={hp(0.8)}
              color={theme.success}
              containerStyle={styles.activeDot}
            />
          )}
          <Image source={icon} style={styles.icon} />
        </View>
      ) : (
        <View style={styles.placeholder} />
      )}
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

const VenterHomeStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { isChatActive } = useSelector((state: RootState) => state.call);

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
          marginHorizontal: wp(2),
          position: 'absolute',
          bottom: hp(2.5),
          height: hp(8),
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
        name={routes.venterHome}
        component={VenterHome}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={homeIcon} label={t('Navigation.tabs.home')} />
          ),
        }}
      />
      <Tab.Screen
        name={routes.venterMessages}
        component={VenterMessages}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={messagesIcon} label={t('Navigation.tabs.messages')} showDot={isChatActive} />
          ),
        }}
      />
      <Tab.Screen
        name={routes.venterCall}
        component={VenterCall}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={callIcon} label={t('Navigation.tabs.call')} />
          ),
        }}
      />
      <Tab.Screen
        name={routes.venterWallet}
        component={VenterWallet}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={walletIcon} label={t('Navigation.tabs.wallet')} />
          ),
        }}
      />
      <Tab.Screen
        name={routes.venterSettings}
        component={VenterSettings}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={settingIcon} label={t('Navigation.tabs.settings')} />
          ),
        }}
      />
      <Tab.Screen
        name={routes.venterOthers}
        component={VenterOthers}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} icon={moreIcon} label={t('Navigation.tabs.others')} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default VenterHomeStack;
