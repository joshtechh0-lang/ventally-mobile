import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View, Text, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BlurView } from '@react-native-community/blur';
import { hp, wp } from '../utils/size';
import { fontFamilies } from '../utils/fontFamilies';
import { useTheme } from '../theme';
import { routes } from './routes';

import AdminHome from '../screens/Admin/AdminHome';
import AdminUsers from '../screens/Admin/AdminUsers';
import AdminSubAdmins from '../screens/Admin/AdminSubAdmins';
import AdminReports from '../screens/Admin/AdminReports';
import AdminSettings from '../screens/Admin/AdminSettings';

import { homeIcon, settingIcon, moreIcon, moduleIcon, userIcon, reportIcon } from '../assets/icons';

const Tab = createBottomTabNavigator();

const TabIcon = ({ focused, icon, label }: { focused: boolean; icon?: any; label: string }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: wp(18),
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
      {icon ? (
        <Image source={icon} style={styles.icon} />
      ) : (
        <View style={[styles.icon, { backgroundColor: focused ? theme.white : theme.white60, borderRadius: hp(0.3) }]} />
      )}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const TabBarBackground = () => {
  if (Platform.OS === 'ios') {
    return (
      <View style={StyleSheet.absoluteFill}>
        <BlurView blurType="dark" blurAmount={25} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
      </View>
    );
  }
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
  );
};

const AdminHomeStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

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
        name={routes.adminHome}
        component={AdminHome}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={homeIcon} label={t('Navigation.tabs.home')} />
          ),
        }}
      />
      <Tab.Screen
        name={routes.adminUsers}
        component={AdminUsers}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={userIcon} label={t('Navigation.tabs.users')} />
          ),
        }}
      />
      <Tab.Screen
        name={routes.adminSubAdmins}
        component={AdminSubAdmins}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={userIcon} label={t('Navigation.tabs.subAdmins')} />
          ),
        }}
      />
      <Tab.Screen
        name={routes.adminReports}
        component={AdminReports}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={reportIcon} label={t('Navigation.tabs.reports')} />
          ),
        }}
      />
      <Tab.Screen
        name={routes.adminSettings}
        component={AdminSettings}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={settingIcon} label={t('Navigation.tabs.settings')} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminHomeStack;
