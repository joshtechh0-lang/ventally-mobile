import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Image } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { fontFamilies } from '../../utils/fontFamilies';
import { routes } from '../../navigation/routes';
import GlassView from '../../components/GlassWrapper';
import { searchIcon } from '../../assets/icons';

const CRISIS_DATA = [
    { id: '1234567', email: 'abc@gmail.com', type: 'call', date: '12 Nov 2025' },
    { id: '1234567', email: 'abc@gmail.com', type: 'chat', date: '12 Nov 2025' },
    { id: '1234567', email: 'abc@gmail.com', type: 'chat', date: '12 Nov 2025' },
    { id: '1234567', email: 'abc@gmail.com', type: 'chat', date: '12 Nov 2025' },
];

const AdminCrisisConf = () => {
    const { theme } = useTheme();
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: hp(4),
            paddingHorizontal: wp(5),
            height: hp(6),
            marginBottom: hp(3),
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.15)',
        },
        searchInput: {
            flex: 1,
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.8),
            color: theme.white,
            marginLeft: wp(3),
        },
        searchIcon: {
            width: hp(2.5),
            height: hp(2.5),
            tintColor: theme.white60,
        },
        listContent: {
            paddingBottom: hp(5),
        },
        card: {
            padding: wp(5),
            borderRadius: hp(3),
            marginBottom: hp(2),
            backgroundColor: theme.black + '30',
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: hp(1),
        },
        idText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(2.2),
            color: theme.white,
        },
        badge: {
            backgroundColor: 'rgba(255,255,255,0.15)',
            paddingHorizontal: wp(4),
            paddingVertical: hp(0.5),
            borderRadius: hp(3),
        },
        badgeText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.4),
            color: theme.white + 'cc', // white80
        },
        cardFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        emailText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.8),
            color: theme.white + 'b3', // white70
        },
        dateText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.6),
            color: theme.white60,
        },
    });

    const renderItem = ({ item }: { item: typeof CRISIS_DATA[0] }) => (
        <TouchableOpacity
            onPress={() => {
                if (item.type === 'chat') {
                    (navigation as any).navigate(routes.adminInternal, { screen: routes.adminViewChat, params: { sessionId: item.id, headerRight: false, chatType: item.type } });
                }
            }}
        >
            <GlassView bordered glassStyles={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.idText}>Id: {item.id}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {item.type === 'call' ? t('Admin.crisisManagement.crisisCall') : t('Admin.crisisManagement.crisisChat')}
                        </Text>
                    </View>
                </View>
                <View style={styles.cardFooter}>
                    <Text style={styles.emailText}>Call by: {item.email}</Text>
                    <Text style={styles.dateText}>{item.date}</Text>
                </View>
            </GlassView>
        </TouchableOpacity>
    );

    return (
        <HomeWrapper>
            <ScreenHeader
                title={t('Admin.crisisManagement.title')}
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />
            <View style={styles.container}>
                <View style={styles.searchContainer}>
                    <Image source={searchIcon} style={styles.searchIcon} resizeMode="contain" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('Admin.crisisManagement.searchPlaceholder')}
                        placeholderTextColor={theme.white + '66'} // white40
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <FlatList
                    data={CRISIS_DATA.filter(item =>
                        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.id.includes(searchQuery)
                    )}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </HomeWrapper>
    );
};

export default AdminCrisisConf;
