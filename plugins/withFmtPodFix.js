const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const RUBY_PATCH_FN = "def patch_expensify_fmt_base_h!(installer)";
const REACT_CODEGEN_PATCH_FN =
  "def patch_react_codegen_generate_specs_phase!(installer)";
const EX_CONSTANTS_SCRIPT_PATCH_FN =
  "def patch_ex_constants_generate_app_config_phase!(installer)";

// fmt 11: -DFMT_USE_CONSTEVAL=0 is ignored because base.h redefines it via __cpp_consteval;
// wrapping the auto-detect in #ifndef keeps the Xcode -D effective.
const rubyMethod = (
  `
def patch_expensify_fmt_base_h!(installer)
  require 'fileutils'
  candidate_paths = [
    File.join(installer.sandbox.root, 'fmt/include/fmt/base.h'),
    File.join(__dir__, 'Pods/fmt/include/fmt/base.h'),
  ].uniq

  path = candidate_paths.find { |p| File.exist?(p) }
  return unless path

  contents = File.read(path)
  return if contents.include?('EXPENSIFY_FMT_CONSTEVAL_GUARD')
  before = <<~'PATCH'
// Detect consteval, C++20 constexpr extensions and std::is_constant_evaluated.
#if !defined(__cpp_lib_is_constant_evaluated)
#  define FMT_USE_CONSTEVAL 0
#elif FMT_CPLUSPLUS < 201709L
#  define FMT_USE_CONSTEVAL 0
#elif FMT_GLIBCXX_RELEASE && FMT_GLIBCXX_RELEASE < 10
#  define FMT_USE_CONSTEVAL 0
#elif FMT_LIBCPP_VERSION && FMT_LIBCPP_VERSION < 10000
#  define FMT_USE_CONSTEVAL 0
#elif defined(__apple_build_version__) && __apple_build_version__ < 14000029L
#  define FMT_USE_CONSTEVAL 0  // consteval is broken in Apple clang < 14.
#elif FMT_MSC_VERSION && FMT_MSC_VERSION < 1929
#  define FMT_USE_CONSTEVAL 0  // consteval is broken in MSVC VS2019 < 16.10.
#elif defined(__cpp_consteval)
#  define FMT_USE_CONSTEVAL 1
#elif FMT_GCC_VERSION >= 1002 || FMT_CLANG_VERSION >= 1101
#  define FMT_USE_CONSTEVAL 1
#else
#  define FMT_USE_CONSTEVAL 0
#endif
#if FMT_USE_CONSTEVAL
PATCH
  after = <<~'PATCH'
// Detect consteval, C++20 constexpr extensions and std::is_constant_evaluated.
// EXPENSIFY_FMT_CONSTEVAL_GUARD: If FMT_USE_CONSTEVAL is set (-D from Xcode), skip this block so
// Apple Clang cannot redefine it to 1 via __cpp_consteval (breaks FMT_STRING in format-inl.h).
#ifndef FMT_USE_CONSTEVAL
#if !defined(__cpp_lib_is_constant_evaluated)
#  define FMT_USE_CONSTEVAL 0
#elif FMT_CPLUSPLUS < 201709L
#  define FMT_USE_CONSTEVAL 0
#elif FMT_GLIBCXX_RELEASE && FMT_GLIBCXX_RELEASE < 10
#  define FMT_USE_CONSTEVAL 0
#elif FMT_LIBCPP_VERSION && FMT_LIBCPP_VERSION < 10000
#  define FMT_USE_CONSTEVAL 0
#elif defined(__apple_build_version__) && __apple_build_version__ < 14000029L
#  define FMT_USE_CONSTEVAL 0  // consteval is broken in Apple clang < 14.
#elif FMT_MSC_VERSION && FMT_MSC_VERSION < 1929
#  define FMT_USE_CONSTEVAL 0  // consteval is broken in MSVC VS2019 < 16.10.
#elif defined(__cpp_consteval)
#  define FMT_USE_CONSTEVAL 1
#elif FMT_GCC_VERSION >= 1002 || FMT_CLANG_VERSION >= 1101
#  define FMT_USE_CONSTEVAL 1
#else
#  define FMT_USE_CONSTEVAL 0
#endif
#endif
#if FMT_USE_CONSTEVAL
PATCH
  unless contents.include?(before.chomp)
    Pod::UI.puts '[!] expensify: fmt base.h layout changed; update plugins/withFmtPodFix.js'
    return
  end
  patched = contents.sub(before.chomp, after.chomp)
  begin
    File.write(path, patched)
  rescue Errno::EACCES
    FileUtils.chmod_R('u+w', File.dirname(path))
    File.write(path, patched)
  end
end

`
).trimStart();

const reactCodegenRubyMethod = `
def patch_react_codegen_generate_specs_phase!(installer)
  installer.pods_project.targets.each do |target|
    next unless target.name == 'ReactCodegen'
    target.build_phases.each do |phase|
      next unless phase.respond_to?(:name) && phase.name == '[CP-User] Generate Specs'
      # xcodeproj validates this as a String (e.g. "1"), not Ruby true
      phase.always_out_of_date = '1' if phase.respond_to?(:always_out_of_date=)
    end
  end
end

`.trimStart();

const exConstantsRubyMethod = `
def patch_ex_constants_generate_app_config_phase!(installer)
  installer.pods_project.targets.each do |target|
    next unless target.name == 'EXConstants'
    target.build_phases.each do |phase|
      next unless phase.respond_to?(:name) && phase.name&.include?('Generate app.config for prebuilt Constants.manifest')
      next unless phase.respond_to?(:shell_script)
      phase.shell_script = 'bash -l "$PODS_TARGET_SRCROOT/../scripts/get-app-config-ios.sh"'
    end
  end
end

`.trimStart();

const postInstallTail = `
    patch_react_codegen_generate_specs_phase!(installer)
    patch_ex_constants_generate_app_config_phase!(installer)
    patch_expensify_fmt_base_h!(installer)

    # fmt: FMT_USE_CONSTEVAL workaround (must run after base.h patch)
    installer.pods_project.targets.each do |target|
      next unless target.name == 'fmt'
      target.build_configurations.each do |cfg|
        defs = cfg.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] || ['$(inherited)']
        defs = [defs] if defs.is_a?(String)
        defs = defs.reject { |d| d.to_s.start_with?('FMT_USE_CONSTEVAL=') }
        defs << 'FMT_USE_CONSTEVAL=0'
        cfg.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = defs
      end
    end`;

function withFmtPodFix(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let contents = fs.readFileSync(podfilePath, "utf8");

      const anchor = "prepare_react_native_project!\n\n";
      if (!contents.includes(anchor)) {
        throw new Error(
          "withFmtPodFix: expected prepare_react_native_project! block in Podfile"
        );
      }
      let methodsToInsert = "";
      if (!contents.includes(RUBY_PATCH_FN)) {
        methodsToInsert += `${rubyMethod}\n`;
      }
      if (!contents.includes(REACT_CODEGEN_PATCH_FN)) {
        methodsToInsert += `${reactCodegenRubyMethod}\n`;
      }
      if (!contents.includes(EX_CONSTANTS_SCRIPT_PATCH_FN)) {
        methodsToInsert += `${exConstantsRubyMethod}\n`;
      }
      if (methodsToInsert) {
        contents = contents.replace(anchor, `${anchor}${methodsToInsert}`);
      }

      if (
        contents.includes("patch_expensify_fmt_base_h!(installer)") &&
        !contents.includes("patch_react_codegen_generate_specs_phase!(installer)")
      ) {
        contents = contents.replace(
          /(\n    )(patch_expensify_fmt_base_h!\(installer\)\n)/,
          `$1patch_react_codegen_generate_specs_phase!(installer)\n$1patch_ex_constants_generate_app_config_phase!(installer)\n$1$2`
        );
      }
      if (
        contents.includes("patch_react_codegen_generate_specs_phase!(installer)") &&
        !contents.includes(
          "patch_ex_constants_generate_app_config_phase!(installer)"
        )
      ) {
        contents = contents.replace(
          /(\n    )(patch_react_codegen_generate_specs_phase!\(installer\)\n)/,
          `$1$2$1patch_ex_constants_generate_app_config_phase!(installer)\n`
        );
      }

      if (!contents.includes("patch_expensify_fmt_base_h!(installer)")) {
        const match = contents.match(
          /(post_install do \|installer\|\n    react_native_post_install\([\s\S]*?\n    \))\n  end\nend/m
        );
        if (!match) {
          throw new Error(
            "withFmtPodFix: Podfile post_install block not found; update the plugin for your Expo/RN template."
          );
        }
        contents = contents.replace(
          match[0],
          `${match[1]}${postInstallTail}\n  end\nend`
        );
      }

      fs.writeFileSync(podfilePath, contents);

      // Paths with spaces: Expo/RN "Bundle React Native" phase uses backticks around a resolved
      // script path; the shell then splits on spaces. Quote the path and invoke with bash.
      const pbxPath = path.join(
        config.modRequest.platformProjectRoot,
        "Expensify.xcodeproj",
        "project.pbxproj"
      );
      if (fs.existsSync(pbxPath)) {
        let pbx = fs.readFileSync(pbxPath, "utf8");
        const bundleBacktickBug =
          '`\\"$NODE_BINARY\\" --print \\"require(\'path\').dirname(require.resolve(\'react-native/package.json\')) + \'/scripts/react-native-xcode.sh\'\\"`';
        const bundleSpacesFix =
          'RN_XCODE_SH=\\"$(\\"$NODE_BINARY\\" --print \\"require(\'path\').dirname(require.resolve(\'react-native/package.json\')) + \'/scripts/react-native-xcode.sh\'\\")\\"\\n/bin/bash \\"$RN_XCODE_SH\\"';
        if (pbx.includes(bundleBacktickBug)) {
          pbx = pbx.replace(bundleBacktickBug, bundleSpacesFix);
          fs.writeFileSync(pbxPath, pbx);
        }
      }

      return config;
    },
  ]);
}

module.exports = withFmtPodFix;
