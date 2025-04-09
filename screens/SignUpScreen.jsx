import React, { useState } from "react";
import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import ScreenWrapper from "../components/screenWrapper";
import { colors } from "../theme";
import BackButton from "../components/backButton";
import { useNavigation } from "@react-navigation/native";
export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleAddTrip = () => {
    if (email && password) {
      // Good to Gos
      navigation.goBack(); //This is used to Dismiss the Modal or popup and then we are navigated to Home Screen
      navigation.navigate("Home");
    } else {
      // Show Error
    }
  };

  console.log(email, password);

  return (
    <ScreenWrapper>
      <View className="flex justify-between h-full mx-4">
        {/* View for Header/Top Bar */}
        <View>
          <View className="relative">
            <View className="absolute top-0 left-0">
              <BackButton />
            </View>
            <Text className={`${colors.heading} font-bold text-xl text-center`}>
              Sign Up
            </Text>
          </View>
          {/* Banner Image */}
          <View className="flex-row justify-center my-3 mt-5">
            <Image
              className="h-80 w-80"
              source={require("../assets/images/signup.png")}
            />
          </View>
          {/* Form */}
          <View className="space-y-3 mx-2">
            <Text className={`${colors.heading} text-lg font-bold`}>Email</Text>
            <TextInput
              value={email}
              placeholder="Enter Email"
              onChangeText={(value) => setEmail(value)}
              className="p-4 bg-white rounded-full mb-3"
            />
            <Text className={`${colors.heading} text-lg font-bold`}>
              Password
            </Text>
            <TextInput
              placeholder="Enter Password"
              value={password}
              secureTextEntry
              onChangeText={(value) => setPassword(value)}
              className="p-4 bg-white rounded-full mb-3"
            />
          </View>
        </View>
        <View>
          <TouchableOpacity
            onPress={handleAddTrip}
            style={{ backgroundColor: colors.button }}
            className="my-6 rounded-full p-3 shadow-sm mx-2"
          >
            <Text className="text-center text-white font-bold text-lg">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
