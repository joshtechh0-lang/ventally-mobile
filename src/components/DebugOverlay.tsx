/**
 * DebugOverlay — temporary cold-start diagnostic screen.
 * Shows the csLog buffer from AsyncStorage so you can see what's happening
 * during a cold start without needing a computer connected.
 *
 * Mount it in MainNavigator temporarily, then remove after diagnosis.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CS_DEBUG_KEY } from '../hooks/UseNotifications';

const DebugOverlay: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [log, setLog] = useState('(no log yet)');
  const scrollRef = useRef<ScrollView>(null);

  const refresh = useCallback(async () => {
    try {
      const val = await AsyncStorage.getItem(CS_DEBUG_KEY);
      setLog(val && val.trim() ? val : '(no log yet)');
      // Scroll to bottom after update
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (e) {
      setLog('(error reading log)');
    }
  }, []);

  const clearLog = useCallback(async () => {
    await AsyncStorage.removeItem(CS_DEBUG_KEY);
    setLog('(cleared)');
  }, []);

  // Auto-refresh when the overlay is visible
  useEffect(() => {
    if (!visible) return;
    refresh();
    const interval = setInterval(refresh, 1500);
    return () => clearInterval(interval);
  }, [visible, refresh]);

  // Also refresh when app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return (
    <>
      {/* Floating trigger button — bottom-right corner */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setVisible(true);
          refresh();
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>🔍</Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.backdrop}>
          <View style={styles.panel}>
            <View style={styles.header}>
              <Text style={styles.title}>Cold-Start Debug Log</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={clearLog} style={styles.btn}>
                  <Text style={styles.btnText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={refresh} style={styles.btn}>
                  <Text style={styles.btnText}>↻</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setVisible(false)} style={[styles.btn, styles.btnClose]}>
                  <Text style={styles.btnText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView
              ref={scrollRef}
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
            >
              <Text style={styles.logText}>{log}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  fabText: {
    fontSize: 20,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: '#0e0e0e',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#eee',
    fontSize: 14,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  btnClose: {
    backgroundColor: '#551111',
  },
  btnText: {
    color: '#eee',
    fontSize: 13,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
  },
  logText: {
    color: '#00ff88',
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 18,
  },
});

export default DebugOverlay;
