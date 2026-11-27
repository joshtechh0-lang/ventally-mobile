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
