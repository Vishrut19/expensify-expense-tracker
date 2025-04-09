import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import React from "react";
import ScreenWrapper from "../components/screenWrapper";
import { colors } from "../theme";
import randomImage from "../assets/images/randomImage";
import EmptyList from "../components/emptyList";
import { useNavigation } from "@react-navigation/native";

const trips = [
  {
    id: 1,
    place: "Gujarat",
    country: "India",
  },
  {
    id: 2,
    place: "New York",
    country: "United States of America",
  },
  {
    id: 3,
    place: "London",
    country: "United Kingdom",
  },
  {
    id: 4,
    place: "Paris",
    country: "France",
  },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  return (
    <ScreenWrapper className="flex-1">
      {/* View For Top Bar */}
      <View className="flex-row justify-between items-center p-4">
        <Text className={`${colors.heading} font-bold text-3xl shadow-sm`}>
          Expensify
        </Text>
        <TouchableOpacity className="p-2 px-3 bg-white border border-gray-200 rounded-full">
          <Text className={colors.heading}>Logout</Text>
        </TouchableOpacity>
      </View>
      {/* View for Banner Image */}
      <View className="flex-row justify-center items-center bg-blue-200 rounded-xl mx-4 mb-4">
        <Image
          source={require("../assets/images/banner.png")}
          className="w-60 h-60"
        />
      </View>
      {/* View for Recent Trips */}
      <View className="px-4 space-y-4">
        <View className="flex-row justify-between items-center p-4">
          <Text className={`${colors.heading} font-bold text-xl`}>
            Recent Trips
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddTrip")}
            className="p-2 px-3 bg-white border border-gray-200 rounded-full"
          >
            <Text className={colors.heading}>Add Trips</Text>
          </TouchableOpacity>
        </View>
        <View className={{ height: 430 }}>
          <FlatList
            data={trips}
            numColumns={2}
            ListEmptyComponent={
              <EmptyList message={"No Trips Recorded Till Now"} />
            }
            keyExtractor={(trip) => trip.id}
            showsVerticalScrollIndicator={true}
            columnWrapperStyle={{
              justifyContent: "space-between",
            }}
            className="mx-1"
            renderItem={({ item: trip }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate("TripExpenses", { ...trip })}
                className="bg-white p-3 rounded-2xl mb-3 shadow-sm"
              >
                <View>
                  <Image source={randomImage()} className="w-36 h-36 mb-2" />
                  <Text className={`${colors.heading} font-bold`}>
                    {trip.place}
                  </Text>
                  <Text className={`${colors.heading} text-xs`}>
                    {trip.country}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}
