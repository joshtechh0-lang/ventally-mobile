import React from 'react';
import { View, StyleSheet } from 'react-native';

// The actual call WebView now lives in PersistentCallWebView, mounted at the
// app root so it survives navigation and never drops audio. This screen is
// just a transparent placeholder that occupies the routes.activeCall slot —
// the persistent overlay renders itself full-screen on top when this route
// is active.
const WebViewCallScreen = () => {
  return <View style={styles.container} />;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
});

export default WebViewCallScreen;
