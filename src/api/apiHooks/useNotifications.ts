import apiInstance from '../apiInstance';
import type {
    NotificationStatusResponse,
    RegisterDevicePayload,
    RegisterDeviceResponse,
    UnregisterDevicePayload,
    SendNotificationPayload,
    SendNotificationResponse,
    SendBulkNotificationPayload,
    SendTopicNotificationPayload,
    SubscribeTopicPayload,
    NotificationHistoryResponse,
    UnreadCountResponse,
    NotificationSettingsResponse,
    UpdateNotificationSettingsPayload,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for Notifications API endpoints
 */
export const useNotifications = () => {
    /**
     * Get Firebase Cloud Messaging status
     */
    const getStatus = async (): Promise<NotificationStatusResponse> => {
        try {
            const response = await apiInstance.get<NotificationStatusResponse>('notifications/status');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Register a device token for push notifications
     */
    const registerDevice = async (payload: RegisterDevicePayload): Promise<RegisterDeviceResponse> => {
        try {
            const response = await apiInstance.post<RegisterDeviceResponse>('notifications/register', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Unregister a device token
     */
    const unregisterDevice = async (payload: UnregisterDevicePayload): Promise<RegisterDeviceResponse> => {
        try {
            const response = await apiInstance.delete<RegisterDeviceResponse>('notifications/register', { data: payload });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Send a push notification to a specific user
     */
    const sendNotification = async (payload: SendNotificationPayload): Promise<SendNotificationResponse> => {
        try {
            const response = await apiInstance.post<SendNotificationResponse>('notifications/send', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Send a push notification to multiple users
     */
    const sendBulkNotification = async (payload: SendBulkNotificationPayload): Promise<SendNotificationResponse> => {
        try {
            const response = await apiInstance.post<SendNotificationResponse>('notifications/send-bulk', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Send a push notification to a topic
     */
    const sendTopicNotification = async (payload: SendTopicNotificationPayload): Promise<SendNotificationResponse> => {
        try {
            const response = await apiInstance.post<SendNotificationResponse>('notifications/send-topic', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Subscribe user's devices to a topic
     */
    const subscribeTopic = async (payload: SubscribeTopicPayload): Promise<RegisterDeviceResponse> => {
        try {
            const response = await apiInstance.post<RegisterDeviceResponse>('notifications/subscribe', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Unsubscribe user's devices from a topic
     */
    const unsubscribeTopic = async (payload: SubscribeTopicPayload): Promise<RegisterDeviceResponse> => {
        try {
            const response = await apiInstance.post<RegisterDeviceResponse>('notifications/unsubscribe', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get notification history for the authenticated user
     */
    const getHistory = async (limit: number = 50, offset: number = 0): Promise<NotificationHistoryResponse> => {
        try {
            const response = await apiInstance.get<NotificationHistoryResponse>('notifications/history', {
                params: { limit, offset },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Mark a notification as read
     */
    const markAsRead = async (id: number): Promise<void> => {
        try {
            await apiInstance.put(`notifications/${id}/read`);
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get unread notification count
     */
    const getUnreadCount = async (): Promise<UnreadCountResponse> => {
        try {
            const response = await apiInstance.get<UnreadCountResponse>('notifications/unread-count');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get notification settings
     */
    const getSettings = async (): Promise<NotificationSettingsResponse> => {
        try {
            const response = await apiInstance.get<NotificationSettingsResponse>('notifications/settings');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Update notification settings
     */
    const updateSettings = async (payload: UpdateNotificationSettingsPayload): Promise<NotificationSettingsResponse> => {
        try {
            const response = await apiInstance.put<NotificationSettingsResponse>('notifications/settings', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        getStatus,
        registerDevice,
        unregisterDevice,
        sendNotification,
        sendBulkNotification,
        sendTopicNotification,
        subscribeTopic,
        unsubscribeTopic,
        getHistory,
        markAsRead,
        getUnreadCount,
        getSettings,
        updateSettings,
    };
};
