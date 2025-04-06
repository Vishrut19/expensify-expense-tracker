import { View, StatusBar, Platform } from "react-native";
import React from "react";

export default function ScreenWrapper({ children }) {
  // This property is used to provide height of the notch area (If platform is iOS then it will give a padding of 30px)
  let statusBarHeight = StatusBar.currentHeight
    ? StatusBar.currentHeight
    : Platform.OS == "ios"
    ? 50
    : 0;
  return <View style={{ paddingTop: statusBarHeight }}>{children}</View>;
}
