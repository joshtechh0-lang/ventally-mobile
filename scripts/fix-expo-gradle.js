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

// Patch expo-modules-core CMakeLists.txt for RN 0.76 compatibility
const cmakeFile = 'node_modules/expo-modules-core/android/CMakeLists.txt';
if (fs.existsSync(cmakeFile)) {
  let content = fs.readFileSync(cmakeFile, 'utf8');
  const original = content;

  // Remove get_target_property block that uses non-existent ReactAndroid::reactnativejni
  content = content.replace(
    /get_target_property\(INCLUDE_reactnativejni\s*\n\s*ReactAndroid::reactnativejni\s*\n\s*INTERFACE_INCLUDE_DIRECTORIES\)\n/,
    ''
  );

  // Replace the include path using the removed variable with direct path
  content = content.replace(
    /\$\{INCLUDE_reactnativejni\}\/react\s*\n\s*\n\s*# header only imports from turbomodule.*\n/,
    '"${REACT_NATIVE_DIR}/ReactAndroid/src/main/jni/react"\n        '
  );

  // Fix target_include_directories to use SYSTEM PRIVATE
  content = content.replace(
    /target_include_directories\(\s*\n(\s*\$\{PACKAGE_NAME\}\s*\n\s*)PRIVATE/,
    'target_include_directories(\n$1SYSTEM PRIVATE'
  );

  // Replace non-existent link targets with ReactAndroid::reactnative
  content = content.replace(
    /ReactAndroid::jsi\s*\n\s*ReactAndroid::reactnativejni\s*\n\s*ReactAndroid::folly_runtime\s*\n\s*ReactAndroid::react_nativemodule_core/,
    'ReactAndroid::jsi\n        ReactAndroid::reactnative'
  );

  if (content !== original) {
    fs.writeFileSync(cmakeFile, content);
    console.log('Patched:', cmakeFile);
  } else {
    console.log('No change needed:', cmakeFile);
  }
}
