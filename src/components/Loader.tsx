import React from "react";
import { StyleSheet, ActivityIndicator, View, Modal } from "react-native";
import { useTheme } from "../theme";
import GlassView from "./GlassWrapper";
import { hp } from "../utils/size";


interface LoaderProps {
  isVisible?: boolean;
  fullBlank?: boolean;
}

export function Loader(props: LoaderProps) {
  const { isVisible, fullBlank } = props;
  const { theme } = useTheme();
  // return isVisible ? (
  //   <View
  //     style={{
  //       position: "absolute",
  //       top: 0,
  //       left: 0,
  //       right: 0,
  //       bottom: 0,
  //       justifyContent: "center",
  //       alignItems: "center",
  //       // backgroundColor: "rgba(255,255,255,0.1)",
  //       zIndex: 9999,
  //     }}
  //   >
  //     <ActivityIndicator size={"large"} color={theme.primary} />
  //   </View>
  // ) : null;
  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <GlassView radius={hp(2)} bordered glassStyles={{ padding: hp(3) }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </GlassView>
      </View>
    </Modal>
  )
}
const styles = StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "red",
  },
});
