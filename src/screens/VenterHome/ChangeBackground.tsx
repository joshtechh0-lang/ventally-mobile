import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, ImageBackground, Alert, Pressable } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useDispatch, useSelector } from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { GlassModal, ScreenHeader } from '../../components';
import Button from '../../components/Button';
import GlassView from '../../components/GlassWrapper';
import { addCustomBackground, removeCustomBackground, setSelectedBackgroundId } from '../../store/slices/appSlice';
import type { RootState } from '../../store';
import { defaultBackgrounds } from '../../utils/backgrounds';
import { copyImageToPermanentStorage } from '../../utils/fileStorage';
import { x, trashIcon } from '../../assets/icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2.5;
const SPACING = wp(2);

const ChangeBackground = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const dispatch = useDispatch();
    const customBackgrounds = useSelector((state: RootState) => state?.app?.customBackgrounds);
    const selectedBackgroundId = useSelector((state: RootState) => state?.app?.selectedBackgroundId);
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedBgToDelete, setSelectedBgToDelete] = useState(null)
    // Default to '1' (Cosmic Dreams) if nothing selected in redux yet
    const [selectedId, setSelectedId] = useState(selectedBackgroundId || '1');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [newSelected, setNewSelected] = useState(selectedBackgroundId || '1');
    const flatListRef = useRef<FlatList>(null);

    // Merge custom backgrounds with default ones
    const addedBgs = customBackgrounds && customBackgrounds?.length > 0 ?
        customBackgrounds?.map(bg => {
            console.log('[ChangeBackground] Mapping custom bg:', bg);
            return {
                id: bg.id,
                name: bg.name,
                color: '#000000',
                image: { uri: bg.uri },
                isDefault: false,
            };
        }) : []

    console.log('[ChangeBackground] Total backgrounds:', {
        defaults: defaultBackgrounds.length,
        custom: addedBgs.length,
        total: defaultBackgrounds.length + addedBgs.length
    });

    const backgrounds = [
        ...defaultBackgrounds,
        ...addedBgs
    ];

    const handleSelect = (item: any) => {
        setSelectedId(item.id);
        dispatch(setSelectedBackgroundId(item.id));
    };

    const handleAddBackground = async () => {
        try {
            const image = await ImagePicker.openPicker({
                mediaType: 'photo',
                cropping: true,
                compressImageQuality: 0.9,
                includeBase64: false,
                forceJpg: true,
            });

            if (!image?.path) return;

            console.log('pickResult', image);

            // Copy to permanent storage so it persists after app restart
            console.log('[handleAddBackground] Copying image to permanent storage...');
            const permanentUri = await copyImageToPermanentStorage(
                image.path,
                `bg_${Date.now()}.jpg`
            );
            console.log('[handleAddBackground] Permanent URI:', permanentUri);

            const newBackground = {
                id: `custom-${Date.now()}`,
                uri: permanentUri,
                name: (image as any)?.filename || `Background ${customBackgrounds?.length + 1}`,
            };

            dispatch(addCustomBackground(newBackground));
            handleSelect(newBackground);
        } catch (err: unknown) {
            // react-native-image-crop-picker throws on cancel as well
            if (
                err &&
                typeof err === 'object' &&
                'code' in err &&
                (err as any).code === 'E_PICKER_CANCELLED'
            ) {
                return;
            }

            console.error('Error picking image:', err);
            if (err && typeof err === 'object' && 'message' in err) {
                Alert.alert('Error', `Failed to pick image: ${(err as any).message}`);
            }
        }
    };

    const handleDeleteBackground = (item: any) => {
        setShowDeleteModal(true)
        setSelectedBgToDelete(item)
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        cardContainer: {
            width: CARD_WIDTH,
            height: hp(30),
            marginHorizontal: SPACING,
            borderRadius: hp(2),
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: 'transparent',
            justifyContent: 'flex-end',
        },
        selectedCard: {
            borderColor: theme.white,
        },
        cardInner: {
            flex: 1,
            backgroundColor: theme.black, // Placeholder for image
            borderRadius: hp(1.8),
        },
        statusLabel: {
            // position: 'absolute',
            // top: hp(2),
            alignSelf: 'center',
            paddingHorizontal: wp(3),
            paddingVertical: hp(0.5),
            borderRadius: hp(99),
            overflow: 'hidden',
            marginBottom: hp(2)
        },
        statusText: {
            color: theme.white,
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.6),
        },
        descriptionContainer: {
            padding: wp(5),
            margin: hp(2),
        },
        descriptionTitle: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(2),
            color: theme.white,
            marginBottom: hp(1),
        },
        descriptionText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + 'cc',
            lineHeight: hp(2.4),
        },
        addButton: {
            marginTop: hp(4),
            width: width * 0.6,
        },
        paginationContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: hp(2),
            marginBottom: hp(2),
        },
        dot: {
            width: hp(.5),
            height: hp(.5),
            borderRadius: hp(.5),
            backgroundColor: theme.white + '40',
            marginHorizontal: wp(.8),
        },
        activeDot: {
            backgroundColor: theme.white,
            width: hp(.7),
            height: hp(.7),
            borderRadius: hp(.7),
        },
        glassView: {
            padding: hp(2),
            backgroundColor: theme.black + '30',
            margin: hp(2),
            marginTop: hp(5)
        },
        deleteButton: {
            position: 'absolute',
            top: hp(1),
            right: wp(2),
            zIndex: 10,
            padding: hp(0.5),
            backgroundColor: 'rgba(255, 0, 0, 0.6)',
            borderRadius: hp(1),
        },
        deleteIcon: {
            width: hp(2.5),
            height: hp(2.5),
            tintColor: theme.white,
            resizeMode: 'contain',
        }
    });

    const renderItem = ({ item }: { item: any }) => {
        const isSelected = item.id === newSelected;
        return (
            <ImageBackground
                source={item.image}
                style={[styles.cardContainer, isSelected && styles.selectedCard]}
                imageStyle={{ borderRadius: hp(2) }}
                onError={(error) => {
                    console.log('[ImageBackground] Failed to load:', item.id, item.image);
                }}
            >
                {!item.isDefault && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteBackground(item)}
                    >
                        <Image source={trashIcon} style={styles.deleteIcon} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setNewSelected(item.id)}
                    style={{ width: '100%', height: '100%', justifyContent: 'flex-end' }}
                >
                </TouchableOpacity>
            </ImageBackground>
        );
    };

    const handleScroll = (event: any) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / (CARD_WIDTH + (SPACING * 2)));
        setCurrentIndex(index);
    };

    return (
        <HomeWrapper>
            <ScreenHeader
                onBackPress={handleBack}
                title={t('GeneralSettings.changeBackground') || "Change Background"}
            />

            <GlassView glassStyles={styles.glassView}>
                {newSelected === selectedId && (
                    <View style={styles.statusLabel}>
                        <Text style={[styles.statusText, {
                            fontSize: hp(1.8)
                        }]}>{t('ChangeBackground.current') || "Current"}</Text>
                    </View>
                )}
                {newSelected !== selectedId && (
                    <Pressable onPress={() => {
                        const item = backgrounds.find((item) => item.id === newSelected);
                        handleSelect(item)
                    }} style={[styles.statusLabel, {
                        backgroundColor: theme.white + "20",
                        borderWidth: 1,
                        borderColor: theme.white60
                    }]}>
                        <Text style={styles.statusText}>{t('ChangeBackground.setAsCurrent') || "Set as Current"}</Text>
                    </Pressable>
                )}
                <FlatList
                    ref={flatListRef}
                    data={backgrounds}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: (width - CARD_WIDTH) / 2 - SPACING }}
                    snapToInterval={CARD_WIDTH + (SPACING * 2)} // Approx
                    decelerationRate="fast"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                />

                {/* Pagination Dots */}
                <View style={styles.paginationContainer}>
                    {backgrounds.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                currentIndex === index && styles.activeDot
                            ]}
                        />
                    ))}
                </View>
                <Button
                    leftIcon={x}
                    iconStyle={{
                        height: hp(2),
                        width: hp(2),
                        tintColor: theme.white,
                        resizeMode: 'contain',
                        transform: [{ rotate: '45deg' }]
                    }}
                    title={t('ChangeBackground.addBackground', 'Add Background')}
                    onPress={handleAddBackground}
                    borderedGlassButton
                    glassStyles={{}}
                    buttonStyle={{}}
                    titleStyle={{ color: theme.white }}
                    disabled={false}
                />
            </GlassView>

            <GlassView bordered style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>{t('GeneralSettings.changeBackground') || "Change Background"}</Text>
                <Text style={styles.descriptionText}>
                    {t('ChangeBackground.description')}
                </Text>
            </GlassView>
            <GlassModal

                visible={showDeleteModal}
                showButtons={true}
                title={t('ChangeBackground.deleteAlertTitle') || "Delete Background"}
                message={t('ChangeBackground.deleteAlertMessage') || "Are you sure you want to delete this background?"}
                primaryButtonText={t('ChangeBackground.delete') || "Delete"}
                secondaryButtonText={t('ChangeBackground.cancel') || "Cancel"}
                onSecondaryPress={() => setShowDeleteModal(false)}
                onClose={() => setShowDeleteModal(false)}
                onPrimaryPress={() => {
                    dispatch(removeCustomBackground((selectedBgToDelete as any).id));
                    // If we are deleting the currently selected background, reset to default '1'
                    if (selectedId === (selectedBgToDelete as any).id || newSelected === (selectedBgToDelete as any).id) {
                        const defaultBg = defaultBackgrounds[0];
                        setSelectedId(defaultBg.id);
                        setNewSelected(defaultBg.id);
                        dispatch(setSelectedBackgroundId(defaultBg.id));
                    }
                    setShowDeleteModal(false);
                }} />
        </HomeWrapper>
    );
};

export default ChangeBackground;
