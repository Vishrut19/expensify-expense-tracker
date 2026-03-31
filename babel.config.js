module.exports = function (api) {
  const isTest = api.env("test");
  api.cache(!isTest);
  return {
    presets: isTest
      ? ["babel-preset-expo"]
      : [
          // Required for NativeWind v4: sets JSX importSource to NativeWind.
          ["babel-preset-expo", {jsxImportSource: "nativewind"}],
          // NativeWind v4 preset (wraps native components so `className` works).
          "nativewind/babel",
        ],
  };
};
