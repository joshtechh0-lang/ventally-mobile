const fs = require('fs');

const files = [
  'node_modules/expo/android/build.gradle',
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
  // Remove "apply plugin:" style
  content = content.replace(/^apply plugin: 'expo-module-gradle-plugin'\r?\n/m, '');
  // Remove "id 'expo-module-gradle-plugin'" line inside plugins {} block
  content = content.replace(/^[ \t]*id ['"]expo-module-gradle-plugin['"]\r?\n/m, '');
  // Remove empty plugins {} block left behind
  content = content.replace(/^plugins \{\s*\}\r?\n/m, '');
  // Remove expoModule { ... } block
  content = content.replace(/^expoModule \{[^}]*\}\r?\n/ms, '');
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Patched:', file);
  } else {
    console.log('No change:', file);
  }
}

const expoGradle = 'node_modules/expo/android/build.gradle';
if (fs.existsSync(expoGradle)) {
  let content = fs.readFileSync(expoGradle, 'utf8');
  if (!content.includes('compileSdk')) {
    content = content.replace('android {', 'android {\n  compileSdk safeExtGet("compileSdkVersion", 36)');
    fs.writeFileSync(expoGradle, content);
    console.log('Added compileSdk to', expoGradle);
  } else {
    console.log('compileSdk already present');
  }
}
