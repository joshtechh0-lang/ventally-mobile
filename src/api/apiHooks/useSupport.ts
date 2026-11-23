import apiInstance from '../apiInstance';
import type {
    SubmitAppealPayload,
    SubmitFeedbackPayload,
    GenericMessageResponse,
    SubmitListenerAppealPayload,
    SubmitListenerAppealResponse,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for Support API endpoints (Appeals and Feedback)
 */
export const useSupport = () => {
    /**
     * Submit an appeal
     */
    const submitAppeal = async (payload: SubmitAppealPayload): Promise<GenericMessageResponse> => {
        try {
            const response = await apiInstance.post<GenericMessageResponse>('support/appeals', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Submit platform feedback
     */
    const submitFeedback = async (payload: SubmitFeedbackPayload): Promise<GenericMessageResponse> => {
        try {
            const response = await apiInstance.post<GenericMessageResponse>('support/feedback', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Submit listener appeal with document (multipart/form-data)
     */
    const submitListenerAppeal = async (payload: SubmitListenerAppealPayload): Promise<SubmitListenerAppealResponse> => {
        try {
            const formData = new FormData();
            formData.append('contact', payload.contact);
            formData.append('reportId', payload.reportId);
            formData.append('summary', payload.summary);
            formData.append('document', {
                uri: payload.document.uri,
                name: payload.document.name,
                type: payload.document.type,
            } as any);

            const response = await apiInstance.post<SubmitListenerAppealResponse>(
                'support/listener-appeals',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        submitAppeal,
        submitFeedback,
        submitListenerAppeal,
    };
};
