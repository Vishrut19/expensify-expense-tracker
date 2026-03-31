module.exports = {
  expo: {
    name: "Expensify",
    slug: "expensify",
    version: "0.0.1",
    orientation: "portrait",
    icon: "./assets/images/login.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/banner.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "org.reactjs.native.example.expensify",
      googleServicesFile: "./GoogleService-Info.plist",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/login.png",
        backgroundColor: "#ffffff",
      },
      package: "com.expensify",
    },
    plugins: [
      "./plugins/withFmtPodFix.js",
      [
        "expo-build-properties",
        {
          ios: {
            // Prebuilt RN tarballs fail when the project path contains spaces (e.g. "Mobile Apps").
            buildReactNativeFromSource: true,
          },
        },
      ],
      "expo-dev-client",
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme:
            "com.googleusercontent.apps.928603206713-6n9268sus6177r2ka30r1q4lrpvfq859",
        },
      ],
    ],
  },
};
