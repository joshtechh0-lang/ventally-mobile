import {
  initConnection,
  endConnection,
  getSubscriptions,
  getProducts,
  requestSubscription,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  getAvailablePurchases,
  ProductPurchase,
  SubscriptionPurchase,
  PurchaseError,
  Subscription,
  Product,
} from 'react-native-iap';
import { Platform } from 'react-native';
import apiInstance from '../api/apiInstance';

// Product IDs
export const SUBSCRIPTION_SKUS = {
  light_support_monthly: 'LS1',
  light_support_annual: 'LSANNUAL1',
  balanced_support_monthly: 'BS1',
};

export const CONSUMABLE_SKUS = {
  voice_top_up: 'VTUP1',
  text_top_up: 'TextTopUp1',
  support_boost: 'SupportB1',
};

export const ALL_SUBSCRIPTION_SKUS = Object.values(SUBSCRIPTION_SKUS);
export const ALL_CONSUMABLE_SKUS = Object.values(CONSUMABLE_SKUS);

class IAPService {
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;

  async initialize() {
    try {
      await initConnection();
      console.log('[IAP] Connection initialized');
    } catch (err) {
      console.error('[IAP] Failed to initialize:', err);
    }
  }

  async destroy() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
    }
    await endConnection();
  }

  setupListeners(
    onPurchaseSuccess: (purchase: ProductPurchase | SubscriptionPurchase) => void,
    onPurchaseError: (error: PurchaseError) => void,
  ) {
    this.purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
      console.log('[IAP] Purchase updated:', purchase);
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        try {
          await this.validateReceipt(purchase);
          await finishTransaction({ purchase, isConsumable: true });
          onPurchaseSuccess(purchase);
        } catch (err) {
          console.error('[IAP] Receipt validation failed:', err);
        }
      }
    });

    this.purchaseErrorSubscription = purchaseErrorListener((error) => {
      console.error('[IAP] Purchase error:', error);
      onPurchaseError(error);
    });
  }

  async getSubscriptionProducts(): Promise<Subscription[]> {
    try {
      const products = await getSubscriptions({ skus: ALL_SUBSCRIPTION_SKUS });
      return products;
    } catch (err) {
      console.error('[IAP] Failed to get subscriptions:', err);
      return [];
    }
  }

  async getConsumableProducts(): Promise<Product[]> {
    try {
      const products = await getProducts({ skus: ALL_CONSUMABLE_SKUS });
      return products;
    } catch (err) {
      console.error('[IAP] Failed to get consumables:', err);
      return [];
    }
  }

  async purchaseSubscription(sku: string): Promise<void> {
    try {
      await requestSubscription({ sku });
    } catch (err) {
      console.error('[IAP] Subscription purchase failed:', err);
      throw err;
    }
  }

  async purchaseConsumable(sku: string): Promise<void> {
    try {
      await requestPurchase({ sku });
    } catch (err) {
      console.error('[IAP] Consumable purchase failed:', err);
      throw err;
    }
  }

  async restorePurchases(): Promise<void> {
    try {
      const purchases = await getAvailablePurchases();
      for (const purchase of purchases) {
        if (purchase.transactionReceipt) {
          try {
            await this.validateReceipt(purchase);
            await finishTransaction({ purchase, isConsumable: false });
          } catch (err) {
            console.error('[IAP] Restore failed for:', purchase.productId, err);
          }
        }
      }
      console.log('[IAP] Restore purchases completed', purchases.length, 'purchases');
    } catch (err) {
      console.error('[IAP] Restore purchases error:', err);
      throw err;
    }
  }

  async validateReceipt(purchase: ProductPurchase | SubscriptionPurchase): Promise<any> {
    try {
      const res = await apiInstance.post('payments/apple-iap/validate', {
        receipt: purchase.transactionReceipt,
        productId: purchase.productId,
        transactionId: purchase.transactionId,
      });
      return res.data;
    } catch (err) {
      console.error('[IAP] Receipt validation error:', err);
      throw err;
    }
  }
}

export default new IAPService();
