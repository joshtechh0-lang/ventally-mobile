import { View, FlatList, FlatListProps } from "react-native";
import { hp, wp } from "../utils/size";
import { useTheme } from "../theme";
import TransactionRow from "./shared/TransactionRow";
import { useTranslation } from "react-i18next";
import EmptyState from "./shared/EmptyState";

interface TransactionsTableProps extends Partial<FlatListProps<any>> {
    transactions: any[];
    loading?: boolean;
}

const TransactionsTable = ({
    transactions,
    loading,
    ...props
}: TransactionsTableProps) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    return (

        <View style={{
            borderWidth: hp(0.1),
            borderColor: theme.white + "20",
            borderRadius: hp(2.5),
            // backgroundColor: theme.black + '20',
            marginBottom: hp(3), // Add bottom padding for scrolling
            flex: 1, // Ensure it takes available space if needed in full screen
        }}
        >
            {/* Header */}
            <TransactionRow
                sessionCharges={t('Wallet.sessionCharges')}
                fundAdditions={t('Wallet.fundAdditions')}
                refunds={t('Wallet.refunds')}
                subscriptionCharge={t('Wallet.subscriptionCharge')}
                isHeader
            />

            {/* List */}
            <FlatList
                data={transactions}
                renderItem={({ item }) => (
                    <TransactionRow
                        key={item.id}
                        sessionCharges={item.sessionCharges}
                        fundAdditions={item.fundAdditions}
                        refunds={item.refunds}
                        subscriptionCharge={item.subscriptionCharge}
                        item={item}
                    />
                )}
                ListEmptyComponent={() => loading ? null : <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: hp(2)
                }}>
                    <EmptyState
                        title={t('VenterWallet.noTransactions')}
                        description={t('VenterWallet.noTransactionsDescription')}
                    />
                </View>
                }
                showsVerticalScrollIndicator={false}
                {...props}
            />
        </View>
    );
};
export default TransactionsTable;