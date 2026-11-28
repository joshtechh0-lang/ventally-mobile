const fs = require('fs');
const path = require('path');

const files = [
  'node_modules/expo-modules-core/android/build.gradle',
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
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Patched:', file);
  } else {
    console.log('No change:', file);
  }
}

try {
  const { execSync } = require('child_process');
  const scriptPath = path.join(__dirname, 'patch-expo-headers.py');
  if (fs.existsSync(scriptPath)) {
    const out = execSync('python3 ' + scriptPath, { encoding: 'utf8' });
    console.log(out.trim());
  }
} catch (e) {
  console.error('Python header patch failed:', e.message);
}
