import React, { useEffect } from 'react'
import { ImageBackground, StatusBar, View, StyleSheet, useColorScheme } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { authBg } from '../assets/images'
import { useTheme } from '../theme'
import { hp, wp } from '../utils/size'
import { getBackgroundImage } from '../utils/backgrounds'
import { RootState } from '../store/store'
import { useSelector } from 'react-redux'
import AsyncStorage from '@react-native-async-storage/async-storage'

const HomeWrapper = ({ children, hideStatusBarPadding = false }: { children: React.ReactNode, hideStatusBarPadding?: boolean }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const { isConnecting, isActive, isChatActive } = useSelector((state: RootState) => state.call);
  const isVenter = useSelector((state: RootState) => state.user.isVenter);
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    imageBackground: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      paddingTop: !hideStatusBarPadding && (
        (isConnecting || isActive) ||                        // call: both roles
        (!isVenter && isChatActive)                          // chat: listener only
      ) ? insets.top + hp(4.5) : 0,
      paddingBottom: insets.bottom + hp(1),
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.overlay

    },
  });

  // const darkTheme = systemColorScheme === 'dark' ? true : false;

  const selectedBackgroundId = useSelector((state: RootState) => state?.app?.selectedBackgroundId);
  const customBackgrounds = useSelector((state: RootState) => state?.app?.customBackgrounds);



  return (
    <View style={styles.container}>
      <ImageBackground
        source={getBackgroundImage(selectedBackgroundId, customBackgrounds)}
        style={styles.imageBackground}
      >
        {<View style={[styles.overlay]} />}
        <StatusBar translucent backgroundColor="transparent" barStyle={theme.background === '#000000' ? 'light-content' : 'dark-content'} />

        <SafeAreaView style={styles.safeArea}>
          {children}
        </SafeAreaView>
      </ImageBackground>
    </View>
  )
}

export default HomeWrapper