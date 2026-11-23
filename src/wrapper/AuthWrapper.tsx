import React from 'react'
import { ImageBackground, StatusBar, View, StyleSheet, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { authBg } from '../assets/images'
import { useTheme } from '../theme'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { getBackgroundImage } from '../utils/backgrounds'

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    imageBackground: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
  const systemColorScheme = useColorScheme();

  const darkTheme = true
  // systemColorScheme === 'dark' ? true : false;
  const selectedBackgroundId = useSelector((state: RootState) => state?.app?.selectedBackgroundId);
  const customBackgrounds = useSelector((state: RootState) => state?.app?.customBackgrounds);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={getBackgroundImage(selectedBackgroundId, customBackgrounds)}
        style={styles.imageBackground}
      >
        {darkTheme && <View style={[styles.overlay, {
          backgroundColor: "rgba(0,0,0,0.6)"
        }]} />}
        <StatusBar translucent backgroundColor="transparent" barStyle={theme.background === '#000000' ? 'light-content' : 'dark-content'} />

        <SafeAreaView style={styles.safeArea}>
          {children}
        </SafeAreaView>
      </ImageBackground>
    </View>
  )
}

export default AuthWrapper