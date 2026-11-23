import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, ActivityIndicator, SafeAreaView } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation, useRoute } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import GlassView from '../../components/GlassWrapper';
import { chevronIcon, backIcon, secureIcon as securityIcon, userInfo, tickIcon } from '../../assets/icons';
import Button from '../../components/Button';
import { GlassModal } from '../../components';
import { useAdmin } from '../../api/apiHooks/useAdmin';
import { AdminUserDetail as AdminUserDetailType } from '../../types/apiPayloadsTypes';
import { Loader } from '../../components/Loader';
import { toastError } from '../../utils/toast';
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





const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const AdminUserDetail = () => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params as { userId: string };
    const { adminGetUserDetail, exportIntegrationsPDF } = useAdmin();

    const [user, setUser] = useState<AdminUserDetailType | null>(null);
    const [loading, setLoading] = useState(false);
    const [isExported, setIsExported] = useState(false);
    const [isListenerInfoExpanded, setIsListenerInfoExpanded] = useState(false);

    // PDF viewer
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfBase64, setPdfBase64] = useState<string | null>(null);
    const [pdfModalVisible, setPdfModalVisible] = useState(false);
    const webViewRef = React.useRef<WebView>(null);

    useEffect(() => {
        const fetchUserDetail = async () => {
            setLoading(true);
            try {
                const response = await adminGetUserDetail(userId);
                if (response?.user) {
                    setUser(response.user);
                    console?.log('----_--___>', response?.user)
                }
            } catch (error: any) {
                console.error('Error fetching user detail:', error);
                toastError({ text: error?.message || t('Common.error') });
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetail();
    }, [userId]);

    const stats = [
        { label: t('Admin.userDetail.stats.totalSessions'), value: formatNumber(user?.stats?.totalSessions) },
        { label: t('Admin.userDetail.stats.totalMinutes'), value: formatNumber(user?.stats?.totalMinutes) },
        { label: t('Admin.userDetail.stats.totalPayout'), value: `${formatNumber(user?.stats?.totalPayout)}` },
    ];

    const listenerInfo = user?.listenerInfo ? [
        { label: t('EditProfile.gender'), value: user.listenerInfo.genderIdentity || 'N/A' },
        { label: t('VenterSettings.options.language.title'), value: user.listenerInfo.language || 'N/A' },
        { label: t('EditProfile.ethnicity'), value: user.listenerInfo.ethnicity || 'N/A' },
        { label: t('EditProfile.ageGroup'), value: user.listenerInfo.ageGroup || 'N/A' },
        { label: t('EditProfile.lgbtq'), value: user.listenerInfo.lgbtqIdentity || 'N/A' },
        { label: t('EditProfile.specialTopics'), value: user.listenerInfo.specialTopics?.join(', ') || 'N/A' },
        { label: t('EditProfile.faith'), value: user.listenerInfo.faithOrBelief || 'N/A' },
    ] : [];

    // ── download PDF → base64 → postMessage into WebView ─────────────────────
    const handleExportPdf = async () => {
        try {
            setPdfLoading(true);
            const token = await getAccessToken();

            let url = `${BASE_URL}admin/integrations/export/pdf?maxRows=250&userId=${userId}`;
            const filePath = `${RNFS.CachesDirectoryPath}/user_export_${userId}_${Date.now()}.pdf`;

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
            // postMessage is sent once WebView fires onLoadEnd
        } catch (err: any) {
            toastError({ text: err?.message || 'Failed to export PDF' });
        } finally {
            setPdfLoading(false);
        }
    };

    const handleWebViewLoaded = () => {
        if (pdfBase64 && webViewRef.current) {
            webViewRef.current.postMessage(pdfBase64);
        }
    };

    const handleCloseModal = () => {
        setPdfModalVisible(false);
        setPdfBase64(null);
    };



    return (
        <HomeWrapper>
            <ScreenHeader
                title={t('Admin.userDetail.title')}
                onBackPress={() => navigation.goBack()}
                rightComponent={
                    <GlassView glassStyles={styles.headerRightIcon}>
                        <Image source={userInfo} style={styles.secureIcon} resizeMode="contain" />
                    </GlassView>
                }
            />
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <GlassView bordered glassStyles={styles.userSummaryCard}>

                    <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.email}>{user?.email || 'N/A'}</Text>
                            <Text style={styles.idText}>ID: {user?.id || 'N/A'}</Text>
                            <Text style={styles.summaryText}>
                                {t('Admin.userDetail.sessions', 'Sessions')}: {formatNumber(user?.stats?.totalSessions)}   {t('Admin.userDetail.minutes', 'Minutes')}: {formatNumber(user?.stats?.totalMinutes)}
                            </Text>
                        </View>
                        <View style={styles.venterBadge}>
                            <Text style={styles.badgeText}>{user?.accountType === 'venter' ? t('Admin.userDetail.venterBadge') : user?.accountType === 'listener' ? t('Admin.userDetail.listenerBadge') : t('Admin.users.card.both')}</Text>
                        </View>
                    </View>

                    {/* <GlassView bordered glassStyles={styles.innerStatsCard}> */}
                    <View style={styles.statsGrid}>
                        {stats.map((stat, index) => (
                            <View key={index} style={styles.statItem}>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                                <Text style={styles.statValue}>{stat.value}</Text>
                            </View>
                        ))}
                    </View>
                    {/* </GlassView> */}

                    <View style={styles.buttonRow}>

                        <Button
                            title={pdfLoading ? '...' : t('Admin.userDetail.exportPdf', { defaultValue: 'Export as PDF' })}
                            onPress={handleExportPdf}
                            disabled={pdfLoading}
                        />
                    </View>
                </GlassView>

                {user?.listenerInfo && (
                    <>
                        <TouchableOpacity
                            style={styles.expandableHeader}
                            onPress={() => setIsListenerInfoExpanded(!isListenerInfoExpanded)}
                        >
                            <Text style={styles.expandableTitle}>{t('Admin.userDetail.listenerInfo')}</Text>
                            <View style={{ transform: [{ rotate: isListenerInfoExpanded ? '180deg' : '0deg' }] }}>
                                <Image source={chevronIcon} style={styles.chevron} resizeMode="contain" />
                            </View>
                        </TouchableOpacity>

                        {isListenerInfoExpanded && (
                            <View style={styles.infoList}>
                                {listenerInfo.map((info, index) => (
                                    <View key={index} style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>{info.label}</Text>
                                        <Text style={styles.infoValue}>{info.value}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                )}

                {user?.verificationDocuments && user.verificationDocuments.length > 0 && (
                    <View style={styles.documentsSection}>
                        <Text style={styles.sectionTitle}>{t('Admin.userDetail.documentsTitle', 'Verification Documents')}</Text>
                        {user.verificationDocuments.map((doc, index) => (
                            <GlassView key={index} bordered glassStyles={styles.docCard}>
                                <View style={styles.docHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.docName} numberOfLines={1}>{doc.original_file_name}</Text>
                                        <Text style={styles.docInfo}>{formatFileSize(doc.file_size_bytes)} • {formatDate(doc.created_at)}</Text>
                                    </View>
                                    <View style={[styles.docStatusBadge, { backgroundColor: doc.status === 'approved' ? theme.primary + '40' : theme.white10 }]}>
                                        <Text style={styles.docStatusText}>{doc.status}</Text>
                                    </View>
                                </View>
                            </GlassView>
                        ))}
                    </View>
                )}
            </ScrollView>
            <GlassModal
                icon={tickIcon}
                iconBorder={false}
                visible={isExported}
                onClose={() => setIsExported(false)}
                title={t('Admin.userDetail.exportSuccess.title')}
                message={t('Admin.userDetail.exportSuccess.subtitle')}
                showButtons={false}
            />

            {/* PDF Modal */}
            <Modal
                visible={pdfModalVisible}
                animationType="slide"
                statusBarTranslucent
                onRequestClose={handleCloseModal}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>📄 User Export</Text>
                        <TouchableOpacity
                            onPress={handleCloseModal}
                            style={styles.closeBtn}
                        >
                            <Text style={styles.closeBtnText}>{t('Common.close', { defaultValue: 'Close' })}</Text>
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

            <Loader isVisible={loading} />
        </HomeWrapper>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        paddingHorizontal: wp(5),
        paddingBottom: hp(10),
    },
    userSummaryCard: {
        paddingVertical: hp(2),
        borderRadius: hp(2.5),
        marginBottom: hp(3),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: hp(2),
        paddingHorizontal: wp(3),
    },
    email: {
        flex: 1,
        fontFamily: fontFamilies.semiBold,
        fontSize: hp(2.2),
        color: theme.white,
    },
    idText: {
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.6),
        color: theme.white,
        marginBottom: hp(0.5),
    },
    summaryText: {
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.4),
        color: theme.white + "90",
        marginBottom: hp(2),
    },
    venterBadge: {
        backgroundColor: theme.white20,
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.5),
        borderRadius: hp(2),
        marginTop: hp(0.5)
    },
    badgeText: {
        fontFamily: fontFamilies.medium,
        fontSize: hp(1.2),
        color: theme.white,
    },
    innerStatsCard: {
        borderRadius: hp(2),
        paddingVertical: hp(2),
        paddingHorizontal: wp(4),
        marginBottom: hp(3),
        backgroundColor: theme.white05,
    },
    statsGrid: {
        flexDirection: 'row', justifyContent: 'space-between',
        marginBottom: hp(3),
        backgroundColor: theme.white + "10",
        borderBottomLeftRadius: hp(1.5),
        borderBottomRightRadius: hp(1.5),
        borderWidth: 1,
        borderColor: theme.white20,
        padding: hp(1.3),
    },
    statItem: {
        flex: 1,
        justifyContent: "space-between"
    },
    statLabel: {
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.6),
        color: theme.white,
        marginBottom: hp(1),
    },
    statValue: {
        fontFamily: fontFamilies.bold,
        fontSize: hp(2.4),
        color: theme.white,
    },
    buttonRow: {
        paddingHorizontal: wp(3),
    },
    exportButton: {
        flex: 1,
        height: hp(5),
        borderRadius: hp(2.5),
        borderWidth: 1,
        borderColor: theme.white20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.white05,
    },
    exportText: {
        fontFamily: fontFamilies.medium,
        fontSize: hp(1.6),
        color: theme.white,
    },
    expandableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: hp(2),
    },
    expandableTitle: {
        fontFamily: fontFamilies.semiBold,
        fontSize: hp(1.8),
        color: theme.white,
    },
    chevron: {
        width: hp(2),
        height: hp(2),
        tintColor: theme.white,
    },
    documentsSection: {
        marginTop: hp(2),
    },
    sectionTitle: {
        fontFamily: fontFamilies.semiBold,
        fontSize: hp(1.8),
        color: theme.white,
        marginBottom: hp(1.5),
    },
    docCard: {
        padding: wp(3),
        borderRadius: hp(1.5),
        marginBottom: hp(1),
        backgroundColor: theme.white05,
    },
    docHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    docName: {
        fontFamily: fontFamilies.medium,
        fontSize: hp(1.6),
        color: theme.white,
    },
    docInfo: {
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.4),
        color: theme.white60,
    },
    docStatusBadge: {
        paddingHorizontal: wp(2.5),
        paddingVertical: hp(0.4),
        borderRadius: hp(1),
        marginLeft: wp(2),
    },
    docStatusText: {
        fontFamily: fontFamilies.medium,
        fontSize: hp(1.2),
        color: theme.white,
        textTransform: 'capitalize',
    },
    infoList: {
        paddingBottom: hp(2),
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: hp(1.2),
    },
    infoLabel: {
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.6),
        color: theme.white,
    },
    infoValue: {
        fontFamily: fontFamilies.medium,
        fontSize: hp(1.6),
        color: theme.white + "cc",
    },
    headerRightIcon: {
        width: hp(4),
        height: hp(4),
        borderRadius: hp(2),
        justifyContent: 'center',
        alignItems: 'center',
    },
    secureIcon: {
        width: hp(2),
        height: hp(2),
        tintColor: theme.white,
        resizeMode: "contain",
        alignSelf: "center"
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(10),
    },
    successCircle: {
        width: hp(12),
        height: hp(12),
        borderRadius: hp(6),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(3),
        borderWidth: 1,
        borderColor: theme.white20,
    },
    checkInner: {
        width: hp(6),
        height: hp(6),
        borderRadius: hp(3),
        backgroundColor: theme.white10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkText: {
        fontSize: hp(3),
        color: theme.white,
    },
    successTitle: {
        fontFamily: fontFamilies.bold,
        fontSize: hp(2.8),
        color: theme.white,
        marginBottom: hp(1),
        textAlign: 'center',
    },
    successSubtitle: {
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.6),
        color: theme.white60,
        textAlign: 'center',
    },
    successFooter: {
        paddingHorizontal: wp(5),
        paddingBottom: hp(5),
    },
    // PDF Modal
    modalContainer: { flex: 1, backgroundColor: '#000' },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: wp(5), paddingVertical: hp(2),
        backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    modalTitle: { fontFamily: fontFamilies.bold, fontSize: hp(2.2), color: theme.white },
    closeBtn: {
        paddingHorizontal: wp(4), paddingVertical: hp(1),
        backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: hp(1.5),
    },
    closeBtnText: { fontFamily: fontFamilies.medium, fontSize: hp(1.6), color: theme.white },
});

export default AdminUserDetail;
