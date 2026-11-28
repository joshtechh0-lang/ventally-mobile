const fs = require('fs');

const files = [
  'node_modules/expo/node_modules/expo-modules-core/android/build.gradle',
  'node_modules/@expo/log-box/android/build.gradle',
  'node_modules/@expo/dom-webview/android/build.gradle',
  'node_modules/expo-asset/android/build.gradle',
  'node_modules/expo-constants/android/build.gradle',
  'node_modules/expo-file-system/android/build.gradle',
  'node_modules/expo-font/android/build.gradle',
  'node_modules/expo-keep-awake/android/build.gradle',
];

for (const file of files) {
  if (!fs.existsSync(file)) { console.log('SKIP:', file); continue; }
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  content = content.replace(/^apply plugin: 'expo-module-gradle-plugin'\r?\n/m, '');
  content = content.replace(/^[ \t]*id ['"]expo-module-gradle-plugin['"]\r?\n/m, '');
  content = content.replace(/^plugins \{\s*\}\r?\n/m, '');
  content = content.replace(/^expoModule \{[^}]*\}\r?\n/ms, '');
  // Replace safeExtGet compileSdk with hardcoded 36
  content = content.replace(/compileSdk safeExtGet\("compileSdkVersion", \d+\)/g, 'compileSdk 36');
  // Add compileSdk if missing entirely
  if (!content.includes('compileSdk')) {
    content = content.replace(/^android \{/m, 'android {\n  compileSdk 36');
  }
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Patched:', file);
  } else {
    console.log('No change:', file);
  }
}

// expo/android/build.gradle uses safeExtGet - keep it but ensure compileSdk exists
const expoGradle = 'node_modules/expo/android/build.gradle';
if (fs.existsSync(expoGradle)) {
  let content = fs.readFileSync(expoGradle, 'utf8');
  const original = content;
  content = content.replace(/^apply plugin: 'expo-module-gradle-plugin'\r?\n/m, '');
  content = content.replace(/^[ \t]*id ['"]expo-module-gradle-plugin['"]\r?\n/m, '');
  content = content.replace(/^expoModule \{[^}]*\}\r?\n/ms, '');
  if (!content.includes('compileSdk')) {
    content = content.replace(/^android \{/m, 'android {\n  compileSdk safeExtGet("compileSdkVersion", 36)');
  }
  if (content !== original) {
    fs.writeFileSync(expoGradle, content);
    console.log('Patched:', expoGradle);
  } else {
    console.log('No change:', expoGradle);
  }
}

// === Patch expo-modules-core for RN 0.76 compat ===

// 1. Patch JavaScriptModuleObject.h — fix include path to use prefab-compatible path
const jniFiles = [
  'node_modules/expo-modules-core/android/src/main/cpp/JavaScriptModuleObject.h',
  'node_modules/expo-modules-core/android/src/main/cpp/JavaScriptModuleObject.cpp',
];
for (const jniFile of jniFiles) {
  if (fs.existsSync(jniFile)) {
    let content = fs.readFileSync(jniFile, 'utf8');
    const original = content;
    content = content.replace(
      /#include <jni\/JCallback\.h>/g,
      '#include <react/jni/JCallback.h>'
    );
    if (content !== original) {
      fs.writeFileSync(jniFile, content);
      console.log('Patched:', jniFile);
    } else {
      console.log('No change needed:', jniFile);
    }
  }
}

// 2. Patch CMakeLists.txt — fix non-existent RN 0.76 targets
// 2. Patch expo-modules-core CMakeLists.txt for RN 0.76 compat
const cmakeFile = 'node_modules/expo-modules-core/android/CMakeLists.txt';
if (fs.existsSync(cmakeFile)) {
  let content = fs.readFileSync(cmakeFile, 'utf8');
  const original = content;
  content = content.replace(
    'get_target_property(INCLUDE_reactnativejni\n        ReactAndroid::reactnativejni\n        INTERFACE_INCLUDE_DIRECTORIES)\n',
    ''
  );
  content = content.replace('        ${INCLUDE_reactnativejni}/react\n', '');
  content = content.replace(/\s*ReactAndroid::reactnativejni\s*\n/g, '');
  content = content.replace(/\s*ReactAndroid::folly_runtime\s*\n/g, '');
  content = content.replace(/\s*ReactAndroid::react_nativemodule_core\s*\n/g, '');

  // Add include paths that were provided by the removed link targets
  const includeBlock = [
    '        "${REACT_NATIVE_DIR}/ReactAndroid/src/main/jni"',
    '        "${REACT_NATIVE_DIR}/ReactCommon"',
    '        "${REACT_NATIVE_DIR}/ReactCommon/callinvoker"',
  ].join('\n');
  content = content.replace(
    /target_include_directories\(\n        \$\{PACKAGE_NAME\}\n        PRIVATE/,
    'target_include_directories(\n        ${PACKAGE_NAME}\n        PRIVATE\n' + includeBlock
  );

  if (content !== original) {
    fs.writeFileSync(cmakeFile, content);
    console.log('Patched:', cmakeFile);
  } else {
    console.log('No change needed (CMakeLists):', cmakeFile);
  }
}

// === Patch react-native-reanimated CMakeLists.txt for RN 0.76 compat ===
const reanimatedCmake = 'node_modules/react-native-reanimated/android/CMakeLists.txt';
if (fs.existsSync(reanimatedCmake)) {
  let content = fs.readFileSync(reanimatedCmake, 'utf8');
  const original = content;

  // Replace non-existent RN 0.76 targets
  content = content.replace(/\s*ReactAndroid::folly_runtime/g, '');
  content = content.replace(/\s*ReactAndroid::glog/g, '');
  content = content.replace(/\s*ReactAndroid::reactnativejni/g, '');

  // Suppress C++20 deprecation warnings that reanimated triggers as errors
  if (!content.includes('Wno-deprecated-this-capture')) {
    content += '\ntarget_compile_options(reanimated PRIVATE -Wno-deprecated-this-capture -Wno-vla-cxx-extension)\n';
  }

  if (content !== original) {
    fs.writeFileSync(reanimatedCmake, content);
    console.log('Patched:', reanimatedCmake);
  } else {
    console.log('No change needed:', reanimatedCmake);
  }
}
