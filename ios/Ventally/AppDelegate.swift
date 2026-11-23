import UIKit
internal import Expo
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import FirebaseCore

@main
class AppDelegate: ExpoAppDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    // ✅ Firebase Configuration — must happen before any Firebase usage
    FirebaseApp.configure()

    // ✅ Set notification center delegate for foreground notifications
    UNUserNotificationCenter.current().delegate = self

    // ✅ Register for remote notifications unconditionally on every launch.
    // This must NOT be gated on requestAuthorization's callback — that callback
    // fires with granted=false on devices where permission was already granted
    // in a previous install, which would prevent APNs from issuing a device token.
    // RNFirebase swizzling (messaging_ios_auto_register_for_remote_messages=true
    // in firebase.json) then forwards the APNs token to Firebase automatically.
    DispatchQueue.main.async {
      UIApplication.shared.registerForRemoteNotifications()
    }

    // Request permission (shows dialog on first launch only; silent no-op if already granted)
    UNUserNotificationCenter.current().requestAuthorization(
      options: [.alert, .badge, .sound]
    ) { granted, error in
      print("[APNs] Authorization granted: \(granted), error: \(String(describing: error))")
    }

    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "Ventally",
      in: window,
      launchOptions: launchOptions
    )

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
