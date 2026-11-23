import apiInstance from '../apiInstance';
import type {
    SubmitVerificationResponse,
    GetSubmissionsResponse,
    GetSubmissionDetailResponse,
    ReviewVerificationPayload,
} from '../../types/apiPayloadsTypes';
import { setUser } from '../../store/slices/appSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';

/**
 * Custom hook for Listener Verification API endpoints
 */
export const useListenerVerification = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.app.user);
    /**
     * Submit verification document (multipart/form-data)
     */
    const submitVerification = async (document: any): Promise<SubmitVerificationResponse> => {
        try {
            const formData = new FormData();
            formData.append('document', document);

            const response = await apiInstance.post<SubmitVerificationResponse>('listener-verifications', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log("response====???", response);

            dispatch(setUser({
                ...user,
                verificationDocumentStatus: (response as any)?.data?.verification?.status || (response as any)?.verification?.status || 'pending'
            } as any));
            return response?.data;
        } catch (error) {

            throw error;
        }
    };

    /**
     * Get my verification submissions
     */
    const getMySubmissions = async (limit: number = 10, offset: number = 0): Promise<GetSubmissionsResponse> => {
        try {
            const response = await apiInstance.get<GetSubmissionsResponse>(`listener-verifications/me?limit=${limit}&offset=${offset}`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Admin: List all listener verification submissions
     */
    const getAllSubmissions = async (status?: string, limit: number = 50, offset: number = 0): Promise<GetSubmissionsResponse> => {
        try {
            let url = `listener-verifications/admin/all?limit=${limit}&offset=${offset}`;
            if (status) {
                url += `&status=${status}`;
            }
            const response = await apiInstance.get<GetSubmissionsResponse>(url);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Admin: Get verification submission detail
     */
    const getSubmissionDetail = async (verificationId: string): Promise<GetSubmissionDetailResponse> => {
        try {
            const response = await apiInstance.get<GetSubmissionDetailResponse>(`listener-verifications/admin/${verificationId}`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Admin: Review verification submission
     */
    const reviewSubmission = async (verificationId: string, payload: ReviewVerificationPayload): Promise<GetSubmissionDetailResponse> => {
        try {
            const response = await apiInstance.put<GetSubmissionDetailResponse>(`listener-verifications/admin/${verificationId}`, payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        submitVerification,
        getMySubmissions,
        getAllSubmissions,
        getSubmissionDetail,
        reviewSubmission,
    };
};
