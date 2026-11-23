import React, { useEffect } from 'react'
import AuthWrapper from '../../wrapper/AuthWrapper'
import { Image, Text, View } from 'react-native'
import { fontFamilies } from '../../utils/fontFamilies'
import { hp } from '../../utils/size'
import { useTheme } from '../../theme';
import { useNavigation } from '@react-navigation/native'
import { routes } from '../../navigation/routes'
import { chatIcon } from '../../assets/icons'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '../../store/store'
import { getAccessToken } from '../../api/apiInstance'
import { useListenerNavigation } from '../../hooks/useListenerNavigation'
import { useVenterNavigation } from '../../hooks/useVenterNavigation'
import { apiInstance } from '../../api'
import { logout, setUser } from '../../store/slices/userSlice'
import { ENABLE_ADMIN_FLOW } from '../../config/featureFlags'


const Splash = () => {
  const { t } = useTranslation()
  const navigation = useNavigation();
  const { isVenter, user, pref } = useSelector((state: any) => state.user);
  const { theme } = useTheme();
  const { navigateListener } = useListenerNavigation();
  const { navigateVenter } = useVenterNavigation();

  const dispatch = useDispatch<AppDispatch>()
  const hasNavigated = React.useRef(false);


  const getUser = async () => {
    try {
      const res = await apiInstance.get('auth/profile')
      console?.log('---___--_-___>USER', res?.data?.user)
      return res.data.user
    } catch (err) {
      console.log('Error getting user:', err)
      return null
    }
  }
  // const getActiveCall = async () => {
  //   try {
  //     const res = await apiInstance.get('calls/active')
  //     console.log('Active call:', res.data.activeCall.id)
  //     endCall({id: res.data.activeCall.id})
  //     return res.data
  //   } catch (err) {
  //     console.log('Error getting active call:', err)
  //     return null
  //   }
  // }
  // const endCall = async ({id }: {id: string}) => {
  //   try {
  //     const res = await apiInstance.post(`calls/${id}/end`)
  //     console.log('End call:', res.data)
  //     return res.data
  //   } catch (err) {
  //     console.log('Error ending call:', err)
  //     return null
  //   }
  // }
  // useEffect(() => {
  //   if (user) {
  //     getActiveCall();
  //   }
  // }, [user])
  useEffect(() => {

    if (hasNavigated.current) return;

    const navigateToRole = async (role: string, user: any) => {
      const normalizedRole = role.toLowerCase();
      if (normalizedRole === "admin" && !ENABLE_ADMIN_FLOW) {
        await dispatch(logout());
        navigation.navigate(routes.logIn as never);
        hasNavigated.current = true;
        return;
      }

      dispatch(setUser(user));
      if (normalizedRole === "venter") {
        navigateVenter(user);
      } else if (normalizedRole === "listener") {
        console?.log('----_-_--_--__-_______>', user)
        navigateListener(user);
      } else if (normalizedRole === "admin") {
        navigation.navigate(routes.adminHomeTab as never);
      } else {
        navigation.navigate(routes.onBoarding as never);
      }
      hasNavigated.current = true;
    };

    const checkNavigation = async () => {
      const token = await getAccessToken();
 
      console.log('Splash Check:', { token: !!token, user, activeRole: user?.activeRole, role: user?.role });

      if (token) {
        // console?.log('----_-_--_--__-_______>', user)
        // If we have any role info, we can navigate
        try {
          const user = await getUser()
          console?.log('----_-_--_--__-_______>', user)
          const role = user?.activeRole || user?.userType || user?.role;
          if (role) {
            navigateToRole(role, user);
          } else {



            navigation.navigate(routes.onBoarding as never);
            hasNavigated.current = true;

          }
        } catch (err) {
          console.log('Error getting user:', err)
          navigation.navigate(routes.onBoarding as never);
          hasNavigated.current = true;
        }
      } else {
        // No token, wait a brief moment for splash feel then go to onboarding
        setTimeout(() => {
          if (!hasNavigated.current) {
            navigation.navigate(routes.onBoarding as never);
            hasNavigated.current = true;
          }
        }, 1500);
      }
    };

    checkNavigation();
  }, [user, navigation]);

  return (
    <AuthWrapper>
      <View style={{
        padding: hp(1.6), borderRadius: hp(3), overflow: 'hidden', backgroundColor: 'rgba(255,255,255 , 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
      }}>
        <Image
          source={chatIcon}
          style={{ height: hp(13), width: hp(13), borderRadius: 10 }}
        />
      </View>
      <Text style={{ fontFamily: fontFamilies.bold, fontSize: hp(3), color: theme.white }}>{t('OnBoarding.appName')}</Text>
    </AuthWrapper>
  )
}

export default Splash