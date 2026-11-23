import apiInstance from '../apiInstance';
import type {
    CreateConversationPayload,
    CreateConversationResponse,
    ConversationsResponse,
    ConversationDetailsResponse,
    AcceptConversationResponse,
    DeclineConversationResponse,
    EndConversationResponse,
    ConversationMessagesResponse,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for Chat/Conversations API endpoints
 */
export const useChat = () => {
    /**
     * Create chat conversation
     */
    const createConversation = async (payload: CreateConversationPayload): Promise<CreateConversationResponse> => {
        try {
            const response = await apiInstance.post<CreateConversationResponse>('conversations', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get conversation history
     */
    const getConversations = async (status?: string, limit: number = 20, offset: number = 0): Promise<ConversationsResponse> => {
        try {
            const response = await apiInstance.get<ConversationsResponse>('conversations', {
                params: {
                    // ...(status && { status }),
                    limit,
                    offset
                },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get conversation details
     */
    const getConversationDetails = async (conversationId: string): Promise<ConversationDetailsResponse> => {
        try {
            const response = await apiInstance.get<ConversationDetailsResponse>(`conversations/${conversationId}`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Accept chat request (listener)
     */
    const acceptConversation = async (conversationId: string): Promise<AcceptConversationResponse> => {
        try {
            const response = await apiInstance.post<AcceptConversationResponse>(`conversations/${conversationId}/accept`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Decline chat request (listener)
     */
    const declineConversation = async (conversationId: string): Promise<DeclineConversationResponse> => {
        try {
            const response = await apiInstance.post<DeclineConversationResponse>(`conversations/${conversationId}/decline`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * End conversation
     */
    const endConversation = async (conversationId: string): Promise<EndConversationResponse> => {
        try {
            const response = await apiInstance.post<EndConversationResponse>(`conversations/${conversationId}/end`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get conversation messages
     */
    const getMessages = async (conversationId: string, limit: number = 50, before?: string): Promise<ConversationMessagesResponse> => {
        try {
            const response = await apiInstance.get<ConversationMessagesResponse>(`conversations/${conversationId}/messages`, {
                params: { limit, before },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        createConversation,
        getConversations,
        getConversationDetails,
        acceptConversation,
        declineConversation,
        endConversation,
        getMessages,
    };
};
