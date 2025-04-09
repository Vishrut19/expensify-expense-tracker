import { TouchableOpacity } from "react-native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { colors } from "../theme";
import { useNavigation } from "@react-navigation/native";

export default function BackButton() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      className="bg-white rounded-full h-10 w-10 items-center justify-center"
    >
      <ChevronLeftIcon size={25} color={colors.button} />
    </TouchableOpacity>
  );
}
