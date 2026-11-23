import { Dimensions } from "react-native";


export const WINDOW_WIDTH = Dimensions.get("window").width;
export const WINDOW_HEIGHT = Dimensions.get("window").height;
export const wp = (p: any) => WINDOW_WIDTH * (p / 100);
export const hp = (p: any) => WINDOW_HEIGHT * (p / 100);
export const alpha = (percentage: number) => Math.round((percentage / 100) * 255)
