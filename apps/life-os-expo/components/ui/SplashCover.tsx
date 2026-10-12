import { Image, View } from "react-native";

const splashIcon = require("../../assets/images/splash-icon.png");

export default function SplashCover() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={splashIcon}
        style={{ width: 200, height: 200 }}
        resizeMode="contain"
      />
    </View>
  );
}
