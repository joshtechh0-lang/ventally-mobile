import os, sys

patches = {
    'node_modules/expo-modules-core/android/src/main/cpp/JavaScriptModuleObject.h': [
        ('#include <react/jni/ReadableNativeArray.h>\n', ''),
        ('#include <react/jni/ReadableNativeMap.h>\n', ''),
        ('#include <jni/JCallback.h>\n', 'namespace facebook::react { class ReadableNativeArray; class ReadableNativeMap; class NativeMap; }\n'),
    ],
    'node_modules/expo-modules-core/android/src/main/cpp/JNIFunctionBody.h': [
        ('#include <react/jni/ReadableNativeArray.h>\n', 'namespace facebook::react { class ReadableNativeArray; }\n'),
    ],
}

for fpath, replacements in patches.items():
    if not os.path.exists(fpath):
        print('Skipping (not found):', fpath)
        continue
    with open(fpath, 'r') as f:
        c = f.read()
    orig = c
    for old, new in replacements:
        c = c.replace(old, new)
    if c != orig:
        with open(fpath, 'w') as f:
            f.write(c)
        print('Patched:', fpath)
    else:
        print('No change:', fpath)
