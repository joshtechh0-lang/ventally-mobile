

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, TextInput,
    Image, RefreshControl, ActivityIndicator, Modal, SafeAreaView,
} from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { fontFamilies } from '../../utils/fontFamilies';
import GlassView from '../../components/GlassWrapper';
import { searchIcon } from '../../assets/icons';
import { Button } from '../../components';
import { useAdmin } from '../../api/apiHooks/useAdmin';
import { AdminIntegrationItem } from '../../types/apiPayloadsTypes';
import { Loader } from '../../components/Loader';
import { toastError, toastSuccess } from '../../utils/toast';
import WebView from 'react-native-webview';
import RNFS from 'react-native-fs';
import { BASE_URL, getAccessToken } from '../../api/apiInstance';

// ── pdf.js HTML shell ──────────────────────────────────────────────────────────
// Base64 is NOT injected into the template — it's sent via postMessage after load.
// This avoids crashes from special characters in the base64 string breaking the
// template literal, and works identically on both iOS and Android.
const PDF_VIEWER_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #1a1a1a; }
    #scroll {
      width: 100%; height: 100vh; overflow-y: auto; overflow-x: hidden;
      display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
      padding: 30px 15px; background: #1a1a1a;
    }
    canvas {
      display: block; margin-bottom: 20px;
      max-width: 100%; height: auto !important;
      box-shadow: 0 4px 15px rgba(0,0,0,0.8);
    }
    #status {
      color: #aaa; font-family: sans-serif; font-size: 14px;
      padding: 60px 20px; text-align: center; width: 100%;
    }
  </style>
</head>
<body>
  <div id="scroll"><div id="status">Waiting for PDF data…</div></div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    function renderPdf(base64) {
      try {
        const binary = atob(base64);
        const bytes  = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        pdfjsLib.getDocument({ data: bytes }).promise.then(function(pdf) {
          var scroll = document.getElementById('scroll');
          scroll.innerHTML = '';

          var renderPage = function(num) {
            pdf.getPage(num).then(function(page) {
              var naturalViewport = page.getViewport({ scale: 1 });
              var scale    = window.innerWidth / naturalViewport.width;
              var viewport = page.getViewport({ scale: scale });

              var canvas      = document.createElement('canvas');
              var ctx         = canvas.getContext('2d');
              canvas.width    = viewport.width;
              canvas.height   = viewport.height;
              scroll.appendChild(canvas);

              page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function() {
                if (num < pdf.numPages) renderPage(num + 1);
              });
            });
          };

          renderPage(1);
        }).catch(function(err) {
          document.getElementById('scroll').innerHTML =
            '<div id="status">Error loading PDF: ' + err.message + '</div>';
        });
      } catch(e) {
        document.getElementById('scroll').innerHTML =
          '<div id="status">Error decoding PDF: ' + e.message + '</div>';
      }
    }

    // Receive base64 payload from React Native via postMessage / injectedJavaScript
    document.addEventListener('message', function(e) { renderPdf(e.data); });
    window.addEventListener('message',   function(e) { renderPdf(e.data); });
  </script>
</body>
</html>`;

// ── component ──────────────────────────────────────────────────────────────────
const AdminExports = () => {
    const { theme } = useTheme();
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const { getIntegrations, updateExportStatus, exportIntegrationsPDF } = useAdmin();

    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<AdminIntegrationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [exportingId, setExportingId] = useState<string | null>(null);

    // PDF viewer
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfBase64, setPdfBase64] = useState<string | null>(null);
    const [pdfModalVisible, setPdfModalVisible] = useState(false);
    const webViewRef = useRef<WebView>(null);

    const LIMIT = 20;
    const offsetRef = useRef(0);
    const isFetchingRef = useRef(false);

    // ── list fetching ──────────────────────────────────────────────────────────
    const fetchIntegrations = useCallback(async (
        isRefresh = false,
        isLoadMore = false,
        query = searchQuery,
    ) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        if (isRefresh) setRefreshing(true);
        else if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const currentOffset = isRefresh ? 0 : offsetRef.current;
            const res = await getIntegrations(query || undefined, undefined, undefined, LIMIT, currentOffset);
            const data = res?.items ?? [];
            if (isRefresh) {
                setItems(data);
                offsetRef.current = LIMIT;
            } else {
                setItems(prev => [...prev, ...data]);
                offsetRef.current = currentOffset + LIMIT;
            }
            setTotal(res?.pagination?.total ?? 0);
        } catch (err) {
            console.warn('Failed to load integrations:', err);
        } finally {
            isFetchingRef.current = false;
            setLoading(false); setRefreshing(false); setLoadingMore(false);
        }
    }, [getIntegrations, searchQuery]);

    useEffect(() => { fetchIntegrations(true); }, []);

    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isFirstSearch = useRef(true);
    useEffect(() => {
        if (isFirstSearch.current) { isFirstSearch.current = false; return; }
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => fetchIntegrations(true, false, searchQuery), 500);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchQuery]);

    const onRefresh = () => fetchIntegrations(true, false, searchQuery);
    const handleLoadMore = () => {
        if (items.length < total && !isFetchingRef.current)
            fetchIntegrations(false, true, searchQuery);
    };

    // ── export toggle ──────────────────────────────────────────────────────────
    const handleToggleExport = async (userId: string, alreadyExported: boolean) => {
        try {
            setExportingId(userId);
            if (!alreadyExported) {
                await updateExportStatus(userId, { exported: true });
                setItems(prev => prev.map(item =>
                    item.id === userId ? { ...item, exportStatus: 'exported' as any } : item
                ));
                toastSuccess({
                    text: t('Admin.exportsIntegrations.exportSuccess', { defaultValue: 'Marked as exported' }),
                });
            } else {
                await downloadAndShowPdf(userId);
            }
        } catch (err: any) {
            toastError({ text: err?.message || t('Common.error') });
        } finally {
            setExportingId(null);
        }
    };

    // ── download PDF → base64 → postMessage into WebView ─────────────────────
    const downloadAndShowPdf = async (queryUser?: string) => {
        try {
            setPdfLoading(true);
            const token = await getAccessToken();

            let url = `${BASE_URL}admin/integrations/export/pdf?maxRows=250`;
            if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
            if (queryUser) url += `&userId=${queryUser}`;

            const filePath = `${RNFS.CachesDirectoryPath}/export_${Date.now()}.pdf`;

            const result = await RNFS.downloadFile({
                fromUrl: url,
                toFile: filePath,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/pdf',
                },
            }).promise;

            if (result.statusCode !== 200) {
                throw new Error(`Server returned ${result.statusCode}`);
            }

            const base64 = await RNFS.readFile(filePath, 'base64');

            // Clean up temp file (fire-and-forget)
            RNFS.unlink(filePath).catch(() => { });

            setPdfBase64(base64);
            setPdfModalVisible(true);
            // postMessage is sent once WebView fires onLoadEnd (see below)
        } catch (err: any) {
            toastError({ text: err?.message || 'Failed to export PDF' });
        } finally {
            setPdfLoading(false);
        }
    };

    // Called once the pdf.js HTML shell has fully loaded — then we send the data
    const handleWebViewLoaded = () => {
        if (pdfBase64 && webViewRef.current) {
            // postMessage sends the raw base64 string safely — no template injection
            webViewRef.current.postMessage(pdfBase64);
        }
    };

    const handleCloseModal = () => {
        setPdfModalVisible(false);
        setPdfBase64(null);
    };

    // ── render item ────────────────────────────────────────────────────────────
    const renderItem = ({ item }: { item: AdminIntegrationItem }) => {
        const isExported = item.exportStatus === 'exported';
        const isExportingThis = exportingId === item.id;

        return (
            <GlassView bordered glassStyles={{
                paddingVertical: hp(2), borderRadius: hp(3),
                marginBottom: hp(2), backgroundColor: theme.black + '15',
            }}>
                <View style={{ paddingHorizontal: wp(3) }}>
                    {/* Header row */}
                    <View style={{
                        flex: 1, flexDirection: 'row', justifyContent: 'space-between',
                        alignItems: 'center', gap: wp(2), marginBottom: hp(0.5),
                    }}>
                        <Text style={{ fontFamily: fontFamilies.bold, fontSize: hp(2.2), color: theme.white, flex: 1 }}>
                            {item.email}
                        </Text>
                        <View style={{
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            paddingHorizontal: wp(4), paddingVertical: hp(0.5), borderRadius: hp(3),
                        }}>
                            <Text style={{ fontFamily: fontFamilies.medium, fontSize: hp(1.4), color: theme.white + 'cc' }}>
                                {item.accountType}
                            </Text>
                        </View>
                    </View>

                    <Text style={{ fontFamily: fontFamilies.medium, fontSize: hp(1.6), color: theme.white + 'b3', marginBottom: hp(1) }}>
                        ID: {item.id}
                    </Text>

                    <View style={{ flexDirection: 'row', marginBottom: hp(2) }}>
                        <Text style={{ fontFamily: fontFamilies.medium, fontSize: hp(1.6), color: theme.white + 'cc', marginRight: wp(4) }}>
                            {t('Admin.exportsIntegrations.sessions', { count: (item.stats?.totalSessions ?? 0).toLocaleString() })}
                        </Text>
                        <Text style={{ fontFamily: fontFamilies.medium, fontSize: hp(1.6), color: theme.white + 'cc' }}>
                            {t('Admin.exportsIntegrations.minutes', { count: (item.stats?.totalMinutes ?? 0).toLocaleString() })}
                        </Text>
                    </View>
                </View>

                {/* Stats grid */}
                <View style={{
                    flexDirection: 'row', justifyContent: 'space-between',
                    marginBottom: hp(3), backgroundColor: theme.white + '10',
                    borderBottomLeftRadius: hp(1.5), borderBottomRightRadius: hp(1.5),
                    borderWidth: 1, borderColor: theme.white20, padding: hp(1),
                }}>
                    {[
                        { label: t('Admin.exportsIntegrations.totalSessions'), value: (item.stats?.totalSessions ?? 0).toLocaleString() },
                        { label: t('Admin.exportsIntegrations.totalMinutes'), value: (item.stats?.totalMinutes ?? 0).toLocaleString() },
                        { label: t('Admin.exportsIntegrations.totalPayout'), value: `${(item.stats?.totalPayout ?? 0).toLocaleString()}` },
                    ].map(({ label, value }) => (
                        <View key={label} style={{ alignItems: 'flex-start' }}>
                            <Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.4), color: theme.white + 'cc', marginBottom: hp(1) }}>
                                {label}
                            </Text>
                            <Text style={{ fontFamily: fontFamilies.bold, fontSize: hp(2.2), color: theme.white }}>
                                {value}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={{ paddingHorizontal: wp(3) }}>
                    <Button
                        title={
                            isExportingThis ? '…'
                                : isExported
                                    ? t('Admin.exportsIntegrations.exported', { defaultValue: 'Exported' })
                                    : t('Admin.exportsIntegrations.export', { defaultValue: 'Export' })
                        }
                        onPress={() => handleToggleExport(item.id, isExported)}
                        glassStyles={{ width: '100%' }}
                        // buttonStyle={isExported ? { backgroundColor: theme.magenda + '33' } : {}}
                        disabled={isExportingThis}
                    />
                </View>
            </GlassView>
        );
    };

    // ── render ─────────────────────────────────────────────────────────────────
    return (
        <HomeWrapper>
            <ScreenHeader
                title={t('Admin.exportsIntegrations.title')}
                showBackButton
                onBackPress={() => navigation.goBack()}
            />

            <View style={{ flex: 1, paddingHorizontal: wp(5), paddingTop: hp(2) }}>
                {/* Search bar */}
                <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: hp(4),
                    paddingHorizontal: wp(5), height: hp(6), marginBottom: hp(1.5),
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
                }}>
                    <Image
                        source={searchIcon}
                        style={{ width: hp(2.5), height: hp(2.5), tintColor: theme.white60 }}
                        resizeMode="contain"
                    />
                    <TextInput
                        style={{ flex: 1, fontFamily: fontFamilies.normal, fontSize: hp(1.8), color: theme.white, marginLeft: wp(3) }}
                        placeholder={t('Admin.exportsIntegrations.searchPlaceholder')}
                        placeholderTextColor={theme.white + '66'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* List */}
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: hp(5) }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.white} />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore
                            ? <ActivityIndicator size="small" color={theme.white} style={{ marginVertical: hp(2) }} />
                            : null
                    }
                    ListEmptyComponent={
                        !loading ? (
                            <View style={{ alignItems: 'center', paddingTop: hp(10) }}>
                                <Text style={{ fontFamily: fontFamilies.medium, fontSize: hp(1.6), color: theme.white + 'cc' }}>
                                    No data found.
                                </Text>
                            </View>
                        ) : null
                    }
                />
            </View>

            <Loader isVisible={loading || pdfLoading} />

            {/* ── PDF Modal ──────────────────────────────────────────────────── */}
            <Modal
                visible={pdfModalVisible}
                animationType="slide"
                statusBarTranslucent
                onRequestClose={handleCloseModal}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
                    {/* Header */}
                    <View style={{
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                        paddingHorizontal: wp(5), paddingVertical: hp(2),
                        backgroundColor: '#111',
                        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
                    }}>
                        <Text style={{ fontFamily: fontFamilies.bold, fontSize: hp(2.2), color: theme.white }}>
                            Exported PDF
                        </Text>
                        <TouchableOpacity
                            onPress={handleCloseModal}
                            style={{
                                paddingHorizontal: wp(4), paddingVertical: hp(1),
                                backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: hp(1.5),
                            }}
                        >
                            <Text style={{ fontFamily: fontFamilies.medium, fontSize: hp(1.6), color: theme.white }}>
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/*
                      ✅ WebView loads the static pdf.js HTML shell.
                         Once loaded, onLoadEnd fires → we postMessage the base64 data.
                         pdf.js decodes it entirely in JS — no file:// URIs, no data: URIs,
                         works identically on iOS and Android.
                    */}
            {/* @ts-ignore */}
                    <WebView
                        ref={webViewRef}
                        source={{ html: PDF_VIEWER_HTML }}
                        originWhitelist={['*']}
                        javaScriptEnabled
                        style={{ flex: 1, backgroundColor: '#1a1a1a' }}
                        onLoadEnd={handleWebViewLoaded}
                        startInLoadingState
                        renderLoading={() => (
                            <View style={{
                                flex: 1, justifyContent: 'center', alignItems: 'center',
                                backgroundColor: '#1a1a1a',
                            }}>
                                <ActivityIndicator size="large" color="#fff" />
                            </View>
                        )}
                        // @ts-ignore
                        onError={(e) =>
                            toastError({ text: `WebView error: ${e.nativeEvent.description}` })
                        }
                    />
                </SafeAreaView>
            </Modal>
        </HomeWrapper>
    );
};

export default AdminExports;