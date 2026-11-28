import os, sys

FOLLY_STUB = """#pragma once
// Stub folly/dynamic.h for RN 0.76 + expo-modules-core 1.12 compat
#include <string>
#include <vector>
#include <map>
#include <unordered_map>
namespace folly {
struct dynamic {
  enum Type { NULLT, ARRAY, BOOL, DOUBLE, INT64, OBJECT, STRING };
  dynamic() : type_(NULLT) {}
  dynamic(std::nullptr_t) : type_(NULLT) {}
  dynamic(bool b) : type_(BOOL), boolean_(b) {}
  dynamic(int i) : type_(INT64), integer_(i) {}
  dynamic(long i) : type_(INT64), integer_(i) {}
  dynamic(long long i) : type_(INT64), integer_(i) {}
  dynamic(double d) : type_(DOUBLE), dbl_(d) {}
  dynamic(const char* s) : type_(STRING), string_(s) {}
  dynamic(const std::string& s) : type_(STRING), string_(s) {}
  dynamic(std::string&& s) : type_(STRING), string_(std::move(s)) {}
  static dynamic object() { dynamic d; d.type_ = OBJECT; return d; }
  static dynamic array() { dynamic d; d.type_ = ARRAY; return d; }
  Type type() const { return type_; }
  bool isNull() const { return type_ == NULLT; }
  bool isBool() const { return type_ == BOOL; }
  bool isDouble() const { return type_ == DOUBLE; }
  bool isInt() const { return type_ == INT64; }
  bool isString() const { return type_ == STRING; }
  bool isArray() const { return type_ == ARRAY; }
  bool isObject() const { return type_ == OBJECT; }
  bool asBool() const { return boolean_; }
  double asDouble() const { return dbl_; }
  long long asInt() const { return integer_; }
  const std::string& asString() const { return string_; }
  std::string& getString() { return string_; }
  void push_back(dynamic val) {}
  dynamic& operator[](const std::string&) { static dynamic d; return d; }
  const dynamic& operator[](const std::string&) const { static dynamic d; return d; }
  dynamic& operator[](size_t) { static dynamic d; return d; }
  size_t size() const { return 0; }
  bool empty() const { return true; }
private:
  Type type_;
  union { bool boolean_; double dbl_; long long integer_; };
  std::string string_;
};
} // namespace folly
"""

# Create stub folly/dynamic.h in all relevant include dirs
folly_dirs = [
    "node_modules/react-native/ReactAndroid/src/main/jni/third-party/folly",
    "node_modules/expo-modules-core/android/src/main/cpp/folly",
]
for folly_dir in folly_dirs:
    os.makedirs(folly_dir, exist_ok=True)
    stub_path = folly_dir + "/dynamic.h"
    with open(stub_path, "w") as f:
        f.write(FOLLY_STUB)
    print("Written stub:", stub_path)

patches = {
    "node_modules/expo-modules-core/android/src/main/cpp/JavaScriptModuleObject.h": [
        ("namespace facebook::react { class ReadableNativeArray; class ReadableNativeMap; class NativeMap; }\n",
         "#include <react/jni/ReadableNativeMap.h>\n#include <react/jni/ReadableNativeArray.h>\n"),
    ],
    "node_modules/expo-modules-core/android/src/main/cpp/JNIFunctionBody.h": [
        ("#include <react/jni/ReadableNativeArray.h>\n", "namespace facebook::react { class ReadableNativeArray; }\n"),
    ],
    "node_modules/expo-modules-core/android/src/main/cpp/MethodMetadata.h": [
        ("#include <react/jni/ReadableNativeArray.h>\n", "namespace facebook::react { class ReadableNativeArray; }\n"),
        ("#include <folly/dynamic.h>\n", ""),
        ("#include <jsi/JSIDynamic.h>\n", ""),
    ],
}

for fpath, replacements in patches.items():
    if not os.path.exists(fpath):
        print("Skipping (not found):", fpath)
        continue
    with open(fpath, "r") as f:
        c = f.read()
    orig = c
    for old, new in replacements:
        c = c.replace(old, new)
    if c != orig:
        with open(fpath, "w") as f:
            f.write(c)
        print("Patched:", fpath)
    else:
        print("No change:", fpath)
