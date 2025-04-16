import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import ScreenWrapper from "../components/screenWrapper";
import { colors } from "../theme";
import { useNavigation } from "@react-navigation/native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../config/firebase";

GoogleSignin.configure({
  webClientId:
    "928603206713-71lfoc822n5m2g8so6ppucf5t41fo57v.apps.googleusercontent.com", // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
});

export default function WelcomeScreen() {
  const navigation = useNavigation();

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      // Get both idToken and accessToken
      const { idToken, accessToken } = await GoogleSignin.getTokens();
      // Create the credential with both tokens
      const googleCredential = GoogleAuthProvider.credential(
        idToken,
        accessToken
      );
      // Sign in to Firebase with the credential
      await signInWithCredential(auth, googleCredential);
    } catch (error) {
      console.log("Error Message:", error.message);
      if (error.code) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            break;
          default:
          // some other error happened
        }
      } else {
        // an error that's not related to google sign in occurred
      }
    }
  };

  return (
    <ScreenWrapper>
      <View className="h-full flex justify-around">
        <View className="flex-row justify-center mt-10">
          <Image
            source={require("../assets/images/welcome.gif")}
            className="h-96 w-96 shadow"
          />
        </View>
        <View className="mx-5 mb-20">
          <Text
            className={`text-center font-bold text-4xl ${colors.heading} mb-10`}
          >
            Expensify
          </Text>
          <TouchableOpacity
            className="shadow p-3 rounded-full mb-5"
            style={{ backgroundColor: colors.button }}
            onPress={() => navigation.navigate("SignIn")}
          >
            <Text className="text-center text-white text-lg font-bold">
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="shadow p-3 rounded-full mb-5"
            style={{ backgroundColor: colors.button }}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text className="text-center text-white text-lg font-bold">
              Sign Up
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="shadow p-3 rounded-full bg-white"
            onPress={() => signIn()}
          >
            <View className="flex-row justify-center items-center space-x-3">
              <Image
                source={require("../assets/images/googleIcon.png")}
                className="h-8 w-8"
              />
              <Text className="text-center text-gray-600 text-lg font-bold">
                Sign In with Google
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
