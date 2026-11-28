import os, sys

DYNAMIC_H = """\
#pragma once
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

JSON_H = """\
#pragma once
// Stub folly/json.h for RN 0.76 compat
#include "dynamic.h"
#include <string>
namespace folly {
inline std::string toJson(const dynamic&) { return "{}"; }
inline dynamic parseJson(const std::string&) { return dynamic(); }
inline dynamic parseJson(const char*) { return dynamic(); }
struct json_opts {};
inline std::string toJson(const dynamic&, const json_opts&) { return "{}"; }
} // namespace folly
"""

CONV_H = """\
#pragma once
// Stub folly/Conv.h for RN 0.76 compat
#include <string>
#include <sstream>
namespace folly {
template<typename T> std::string to(const T& v) { std::ostringstream s; s << v; return s.str(); }
template<> inline std::string to<std::string>(const std::string& v) { return v; }
} // namespace folly
"""

RANGE_H = """\
#pragma once
// Stub folly/Range.h for RN 0.76 compat
#include <string>
namespace folly {
using StringPiece = std::string;
} // namespace folly
"""

OPTIONAL_H = """\
#pragma once
// Stub folly/Optional.h for RN 0.76 compat
#include <optional>
namespace folly {
template<typename T> using Optional = std::optional<T>;
} // namespace folly
"""

MEMORY_H = """\
#pragma once
// Stub folly/Memory.h for RN 0.76 compat
#include <memory>
"""

SYNCHRONIZED_H = """\
#pragma once
// Stub folly/Synchronized.h for RN 0.76 compat
#include <mutex>
namespace folly {
template<typename T>
struct Synchronized {
    T& operator*() { return val_; }
    const T& operator*() const { return val_; }
    struct LockedPtr {
        T& operator*() { return *ptr_; }
        T* operator->() { return ptr_; }
        T* ptr_;
        std::unique_lock<std::mutex> lock_;
    };
    LockedPtr lock() { return LockedPtr{&val_, std::unique_lock<std::mutex>(mu_)}; }
private:
    T val_;
    mutable std::mutex mu_;
};
} // namespace folly
"""

FOLLY_HEADERS = {
    "dynamic.h": DYNAMIC_H,
    "json.h": JSON_H,
    "Conv.h": CONV_H,
    "Range.h": RANGE_H,
    "Optional.h": OPTIONAL_H,
    "Memory.h": MEMORY_H,
    "Synchronized.h": SYNCHRONIZED_H,
}

folly_dirs = [
    "node_modules/react-native/ReactAndroid/src/main/jni/third-party/folly",
    "node_modules/react-native/ReactAndroid/src/main/jni/third-party/folly/folly",
    "node_modules/react-native/ReactAndroid/src/main/jni/react/jni/folly",
    "node_modules/expo-modules-core/android/src/main/cpp/folly",
]

for folly_dir in folly_dirs:
    os.makedirs(folly_dir, exist_ok=True)
    for hname, hcontent in FOLLY_HEADERS.items():
        stub_path = folly_dir + "/" + hname
        with open(stub_path, "w") as f:
            f.write(hcontent)
        print("Written stub:", stub_path)

patches = {
    "node_modules/expo-modules-core/android/src/main/cpp/JavaScriptModuleObject.h": [
        ("#include <react/jni/ReadableNativeMap.h>\n#include <react/jni/ReadableNativeArray.h>\n",
         "// Stubbed for RN 0.76 compat\n#include <fbjni/fbjni.h>\n#include <jsi/jsi.h>\nnamespace facebook::react {\n  struct NativeMap : jni::JavaClass<NativeMap> {\n    static constexpr auto kJavaDescriptor = \"Lcom/facebook/react/bridge/NativeMap;\";\n  };\n  struct ReadableNativeMap : jni::JavaClass<ReadableNativeMap, NativeMap> {\n    static constexpr auto kJavaDescriptor = \"Lcom/facebook/react/bridge/ReadableNativeMap;\";\n  };\n  struct ReadableNativeArray : jni::JavaClass<ReadableNativeArray> {\n    static constexpr auto kJavaDescriptor = \"Lcom/facebook/react/bridge/ReadableNativeArray;\";\n  };\n}\n"),
        ("namespace facebook::react { class ReadableNativeArray; class ReadableNativeMap; class NativeMap; }\n",
         "// Stubbed for RN 0.76 compat\n#include <fbjni/fbjni.h>\n#include <jsi/jsi.h>\nnamespace facebook::react {\n  struct NativeMap : jni::JavaClass<NativeMap> {\n    static constexpr auto kJavaDescriptor = \"Lcom/facebook/react/bridge/NativeMap;\";\n  };\n  struct ReadableNativeMap : jni::JavaClass<ReadableNativeMap, NativeMap> {\n    static constexpr auto kJavaDescriptor = \"Lcom/facebook/react/bridge/ReadableNativeMap;\";\n  };\n  struct ReadableNativeArray : jni::JavaClass<ReadableNativeArray> {\n    static constexpr auto kJavaDescriptor = \"Lcom/facebook/react/bridge/ReadableNativeArray;\";\n  };\n}\n"),
        ("std::unordered_map<std::string, folly::dynamic> constan",
         "std::unordered_map<std::string, std::string> constan"),
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
