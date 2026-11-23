import { Platform } from "react-native";


export const fontFamilies = {

    normal: Platform.OS !== 'ios' ? 'PlusJakartaSans-Regular' : 'PlusJakartaSansRegular',
    medium: Platform.OS !== 'ios' ? 'PlusJakartaSans-Medium' : 'PlusJakartaSansMedium',
    semiBold: Platform.OS !== 'ios' ? 'PlusJakartaSans-SemiBold' : 'PlusJakartaSansSemiBold',
    bold: Platform.OS !== 'ios' ? 'PlusJakartaSans-Bold' : 'PlusJakartaSansBold',

  // Adjust the above code to fit your chosen fonts' names
};