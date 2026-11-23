import { Platform } from "react-native";
import { hp } from "./size";

export const getKeyboardAvoidingViewProps = () => ({
  behavior: Platform.OS === 'ios' ? 'padding' : 'height',
  keyboardVerticalOffset: Platform.OS === 'ios' ? 0 : 20,
});

export const getScrollViewProps = () => ({
  keyboardShouldPersistTaps: 'handled',
  showsVerticalScrollIndicator: false,
  bounces: false,
  keyboardDismissMode: 'on-drag' as const,
});

// KeyboardAwareScrollView props for consistent behavior
export const getKeyboardAwareScrollViewProps = () => ({
  style: { flex: 1 },
  enableOnAndroid: true,
  enableAutomaticScroll: true,
  extraScrollHeight: hp(5),
  keyboardShouldPersistTaps: 'handled' as const,
  showsVerticalScrollIndicator: false,
});

export const getKeyboardAwareContentStyle = () => ({
  flexGrow: 1,
  // paddingVertical: hp(4),
});