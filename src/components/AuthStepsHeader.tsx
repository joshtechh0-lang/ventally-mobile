import { Image, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View } from "react-native";
import GlassView from "./GlassWrapper";
import { alpha, hp, WINDOW_WIDTH, wp } from "../utils/size";
import { backIcon } from "../assets/icons";
import { fontFamilies } from "../utils/fontFamilies";
import { useTheme } from "../theme";

const AuthStepsHeader = ({handleBack,title,titleStyle,glassyTitle = true,btnOpacity = 0.03}: {handleBack: () => void,title?: string,titleStyle?: StyleProp<TextStyle>,glassyTitle?: boolean,btnOpacity?: number}) => {
    const { theme } = useTheme();
    const styles = StyleSheet.create({
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            // marginBottom: hp(3),
            gap:wp(5),
          },
          backButtonContainer: {
            // width: hp(6),
            height: hp(6),
            justifyContent: 'center',
            alignItems: 'center',
          },
          backIcon: {
            width: hp(2),
            height: hp(2),
            resizeMode:"contain",
            tintColor: theme.white,
            alignSelf:"center",
          },
          
          stepBadge: {
            backgroundColor:`${theme.black}${alpha(6)}`,
            paddingHorizontal: wp(4),
            paddingVertical: hp(0.5),
            borderWidth: 1,
            borderColor: theme.white+"40",
            borderRadius: hp(2),
          },
          title: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.4),
            color: theme.white,
          },
          emptySpace: {
            width: hp(2),
            
          },
          noGlassTitle: {
            width:WINDOW_WIDTH-wp(30),
            fontFamily: fontFamilies.medium,
            fontSize: hp(2.2),
            color: theme.white,
            textAlign:"center"
          }
    })
    return (
        <View style={styles.header}>
          <View style={styles.backButtonContainer}>
          <TouchableOpacity style={{
              height:hp(3.5),
              width:hp(3.5),
              justifyContent:"center",
              alignItems:"center",
            }}  onPress={handleBack}>

            <GlassView
              
              style={{
                height: hp(3.5),
                width: hp(3.5),
                justifyContent: 'center',
                alignItems: 'center',
              }}
              opacity={btnOpacity}
              radius={999}
            >
                <Image
                  source={backIcon}
                  style={styles.backIcon}
                />
            </GlassView>
            </TouchableOpacity>

          </View>
          
          {title && glassyTitle && (
            // <View style={styles.titleContainer}>
              <View
                style={styles.stepBadge}
              
              >
                <Text style={[styles.title,  ]}>{title}</Text>
              </View>
            // </View>
          )}
          {title && !glassyTitle && (
              <Text numberOfLines={2} style={[styles.noGlassTitle, titleStyle]}>{title}</Text>
          )}
          
          <View style={styles.emptySpace} />
    </View>
    )
}

export default AuthStepsHeader;