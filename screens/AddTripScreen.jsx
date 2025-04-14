import React, { useState } from "react";
import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import ScreenWrapper from "../components/screenWrapper";
import { colors } from "../theme";
import BackButton from "../components/backButton";
import { useNavigation } from "@react-navigation/native";
import Loading from "../components/loading";
import Snackbar from "react-native-snackbar";
import { addDoc } from "firebase/firestore";
import { tripsRef } from "../config/firebase";
import { useSelector } from "react-redux";
export default function AddTripScreen() {
  const [place, setPlace] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.user);

  const handleAddTrip = async () => {
    if (place && country) {
      // Good to Gos
      // navigation.navigate("Home");
      setLoading(true);
      /* Here we are passing a document reference to firestore i.e. if the user enters a data
       * then we will pass that data to the Firestore.
       */
      let doc = await addDoc(tripsRef, {
        place,
        country,
        userId: user.uid,
      });
      setLoading(false);
      // If the document has a id then we will goBack to Home Screen.
      if (doc && doc.id) {
        navigation.goBack();
      }
    } else {
      // Show Error
      setLoading(false);
      Snackbar.show({
        text: "Place and Country are required",
        backgroundColor: "red",
      });
    }
  };

  return (
    <ScreenWrapper>
      <View className="flex justify-between h-full mx-4">
        {/* View for Header/Top Bar */}
        <View>
          <View className="relative mt-5">
            <View className="absolute top-0 left-0">
              <BackButton />
            </View>
            <Text className={`${colors.heading} font-bold text-xl text-center`}>
              Add Trip
            </Text>
          </View>
          {/* Banner Image */}
          <View className="flex-row justify-center my-3 mt-5">
            <Image
              className="h-72 w-72"
              source={require("../assets/images/4.png")}
            />
          </View>
          {/* Form */}
          <View className="space-y-3 mx-2">
            <Text className={`${colors.heading} text-lg font-bold`}>
              Where Do You Want To Go?
            </Text>
            <TextInput
              value={place}
              placeholder="Enter Place"
              onChangeText={(value) => setPlace(value)}
              className="p-4 bg-white rounded-full mb-3"
            />
            <Text className={`${colors.heading} text-lg font-bold`}>
              Which Country ?
            </Text>
            <TextInput
              placeholder="Enter Country"
              value={country}
              onChangeText={(value) => setCountry(value)}
              className="p-4 bg-white rounded-full mb-3"
            />
          </View>
        </View>
        <View>
          {loading ? (
            <Loading />
          ) : (
            <TouchableOpacity
              onPress={handleAddTrip}
              style={{ backgroundColor: colors.button }}
              className="my-6 rounded-full p-3 shadow-sm mx-2"
            >
              <Text className="text-center text-white font-bold text-lg">
                Add Trip
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
}
