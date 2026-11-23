import { authBg } from '../assets/images';

export const defaultBackgrounds = [
    { id: '1', name: 'Cosmic Dreams', color: '#1a1a2e', image: authBg, isDefault: true },
    { id: '2', name: 'Aurora Borealis', color: '#0f3460', image: require('../assets/images/bg2.png'), isDefault: true },
    { id: '3', name: 'Forest Mist', color: '#16213e', image: require('../assets/images/bg3.png'), isDefault: true },
    { id: '4', name: 'Ocean Breeze', color: '#16213e', image: require('../assets/images/bg4.jpeg'), isDefault: true },
    { id: '5', name: 'Ocean Breeze', color: '#16213e', image: require('../assets/images/bg5.jpeg'), isDefault: true },
    { id: '6', name: 'Ocean Breeze', color: '#16213e', image: require('../assets/images/bg6.jpeg'), isDefault: true },
    { id: '7', name: 'Ocean Breeze', color: '#16213e', image: require('../assets/images/bg7.jpeg'), isDefault: true },
    { id: '8', name: 'Ocean Breeze', color: '#16213e', image: require('../assets/images/bg8.jpeg'), isDefault: true },
];

export const getBackgroundImage = (id: string | null | undefined, customBackgrounds: any[] = []) => {

    if (!id) {
        return authBg;
    }

    // Check custom backgrounds first
    const custom = (customBackgrounds || []).find(bg => bg.id === id);
    if (custom) {
        return { uri: custom.uri };
    }

    // Check default backgrounds
    const defaultBg = defaultBackgrounds.find(bg => bg.id === id);
    if (defaultBg) {
        return defaultBg.image;
    }

    return authBg;
};
