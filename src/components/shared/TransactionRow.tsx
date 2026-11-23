import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { useTranslation } from 'react-i18next';

interface TransactionRowProps {
    sessionCharges: string;
    fundAdditions: string;
    refunds: string;
    subscriptionCharge: string;
    isHeader?: boolean;

    item?: any;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
    sessionCharges,
    fundAdditions,
    refunds,
    subscriptionCharge,
    isHeader = false,
    item
}) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = StyleSheet.create({
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: hp(1.5),
            paddingHorizontal: wp(3),
            borderBottomWidth: isHeader ? 0 : 1,
            borderBottomColor: theme.white + '10',
            backgroundColor: isHeader ? theme.white + '12' : 'transparent',
            borderRadius: isHeader ? hp(1.5) : 0,
            marginBottom: isHeader ? hp(1) : 0,
        },
        column: {
            justifyContent: 'center',
        },
        descColumn: {
            flex: 1.8,
        },
        dataColumn: {
            flex: 1,
            alignItems: 'center',
        },
        amountColumn: {
            flex: 1.5,
            alignItems: 'flex-end',
        },
        text: {
            fontFamily: isHeader ? fontFamilies.semiBold : fontFamilies.normal,
            fontSize: hp(1.4),
            color: isHeader ? theme.white : theme.white + "cc",
        },
        amountText: {
            fontFamily: fontFamilies.medium,
            textAlign: 'center',
            fontSize: hp(1.4),
        }
    });

    const getTransactionType = () => {
        if (isHeader) return sessionCharges;
        return t("Wallet.usage")
        switch (item?.type) {
            case 'chat_deduction': return "Chat Deduction";
            case 'tip_sent': return "Tip Sent";
            case 'credit_purchase': return "Credit Purchase";
            case 'subscription_payment': return "Subscription Payment";
            case 'session_payment':
            case 'SESSION': return "Session Charge";
            case 'deposit':
            case 'DEPOSIT': return "Deposit";
            case 'refund':
            case 'REFUND': return "Refund";
            default: return sessionCharges || "Transaction";
        }
    };

    const formatAmount = (raw: string | undefined): string => {
        if (!raw) return subscriptionCharge;
        const stripped = raw.replace(/[^0-9.\-]/g, '');
        const num = parseFloat(stripped);
        if (isNaN(num)) return raw;
        const abs = Math.abs(num).toFixed(2);
        return num < 0 ? `- ${abs}` : `${abs}`;
    };

    const isPositive = !item?.amount?.includes('-') && item?.amount !== undefined;

    return (
        <View style={styles.row}>
            <View style={[styles.column, styles.descColumn]}>
                <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
                    {getTransactionType()}
                </Text>
            </View>
            <View style={[styles.column, styles.dataColumn]}>
                <Text style={styles.text}>{fundAdditions}</Text>
            </View>
            <View style={[styles.column, styles.dataColumn]}>
                <Text style={styles.text}>{refunds}</Text>
            </View>
            <View style={[styles.column, styles.amountColumn]}>
                <Text style={[
                    styles.text,
                    styles.amountText,
                    !isHeader && { color: isPositive ? '#4ADE80' : theme.white }
                ]}>
                    {formatAmount(item?.amount)}
                </Text>
            </View>
        </View>
    );
};

export default TransactionRow;
