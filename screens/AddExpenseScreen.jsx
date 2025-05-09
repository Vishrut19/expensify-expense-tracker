import React, { useState } from "react";
import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import ScreenWrapper from "../components/screenWrapper";
import { colors } from "../theme";
import BackButton from "../components/backButton";
import { useNavigation } from "@react-navigation/native";
import { categories } from "../constants";
import Snackbar from "react-native-snackbar";
import Loading from "../components/loading";
import { expensesRef } from "../config/firebase";
import { addDoc } from "firebase/firestore";
export default function AddExpenseScreen(props) {
  let { id } = props.route.params;
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const handleAddExpense = async () => {
    if (title && amount && category) {
      // good to go
      // navigation.goBack();
      setLoading(true);
      let doc = await addDoc(expensesRef, {
        title,
        amount,
        category,
        tripId: id,
      });
      setLoading(false);
      if (doc && doc.id) navigation.goBack();
    } else {
      // show error
      Snackbar.show({
        text: "Please fill all the fields!",
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
              Add Expense
            </Text>
          </View>
          {/* Banner Image */}
          <View className="flex-row justify-center my-3 mt-5">
            <Image
              className="h-72 w-72"
              source={require("../assets/images/expenseBanner.png")}
            />
          </View>
          {/* Form */}
          <View className="space-y-3 mx-2">
            <Text className={`${colors.heading} text-lg font-bold`}>
              For Which Item?
            </Text>
            <TextInput
              value={title}
              placeholder="Enter Title"
              onChangeText={(value) => setTitle(value)}
              className="p-4 bg-white rounded-full mb-3"
            />
            <Text className={`${colors.heading} text-lg font-bold`}>
              How Much Money ?
            </Text>
            <TextInput
              value={amount}
              placeholder="Enter Amount"
              onChangeText={(value) => setAmount(value)}
              className="p-4 bg-white rounded-full mb-3"
            />
          </View>
          <View className="mx-2 space-x-2">
            <Text className="font-bold text-lg">Category</Text>
            <View className="flex-row flex-wrap items-center">
              {/* This adds Light Green Bg Color for Selected Category */}
              {categories.map((cat) => {
                const bgColor =
                  cat.value === category ? "bg-green-200" : "bg-white";
                return (
                  <TouchableOpacity
                    key={cat.value}
                    className={`rounded-full ${bgColor} p-3 e px-4 mb-2 mr-2`}
                    onPress={() => setCategory(cat.value)}
                  >
                    <Text>{cat.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
        {/* Footer Button */}
        <View>
          {loading ? (
            <Loading />
          ) : (
            <TouchableOpacity
              onPress={handleAddExpense}
              style={{ backgroundColor: colors.button }}
              className="my-6 rounded-full p-3 shadow-sm mx-2"
            >
              <Text className="text-center text-white text-lg font-bold">
                Add Expense
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
}
