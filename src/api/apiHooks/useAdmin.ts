import { useMemo } from 'react';
import apiInstance from '../apiInstance';
import type {
    AdminReportsResponse,
    AdminReportStatsResponse,
    AdminReportDetailsResponse,
    UpdateReportStatusPayload,
    UpdateReportStatusResponse,
    SubmitReportPayload,
    SubmitReportResponse,
    MyReportsResponse,
    AdminListenerVerificationsResponse,
    AdminListenerVerificationDetailResponse,
    ReviewListenerVerificationPayload,
    ReviewListenerVerificationResponse,
    ListSubAdminsResponse,
    CreateSubAdminPayload,
    CreateSubAdminResponse,
    ListPendingSubAdminsResponse,
    GetSubAdminResponse,
    UpdateSubAdminPermissionsPayload,
    UpdateSubAdminPermissionsResponse,
    UpdateSubAdminStatusPayload,
    UpdateSubAdminStatusResponse,
    DeleteSubAdminResponse,
    AdminListUsersResponse,
    AdminUserDetailResponse,
    SuspendUserPayload,
    SuspendUserResponse,
    AdminDeleteUserResponse,
    AdminAISettingsResponse,
    UpdateAdminAISettingsPayload,
    UpdateAdminAISettingsResponse,
    AdminListIntegrationsResponse,
    UpdateExportStatusPayload,
    UpdateExportStatusResponse,
    AdminPaymentHistoryResponse,
    AdminBulkDeleteUsersPayload,
    AdminBulkDeleteUsersResponse,
    AdminBulkUpdateUserRolesPayload,
    AdminBulkUpdateUserRolesResponse,
} from '../../types/apiPayloadsTypes';

/**
 * Custom hook for Administrative and Report API endpoints
 */
export const useAdmin = () => {
    // -------------------------------------------------------------------------
    // Report endpoints (user-facing)
    // -------------------------------------------------------------------------

    /**
     * Submit a report against another user
     */
    const submitReport = async (payload: SubmitReportPayload): Promise<SubmitReportResponse> => {
        try {
            const response = await apiInstance.post<SubmitReportResponse>('reports', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get reports submitted by the authenticated user
     */
    const getMyReports = async (
        limit: number = 20,
        offset: number = 0,
        status?: string
    ): Promise<MyReportsResponse> => {
        try {
            const response = await apiInstance.get<MyReportsResponse>('reports/my-reports', {
                params: { limit, offset, status },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    // -------------------------------------------------------------------------
    // Report endpoints (admin-only)
    // -------------------------------------------------------------------------

    /**
     * Get all reports with filtering (Admin)
     */
    const getReports = async (
        status?: string,
        limit: number = 50,
        offset: number = 0,
        reason?: string
    ): Promise<AdminReportsResponse> => {
        try {
            const response = await apiInstance.get<AdminReportsResponse>('reports/admin/all', {
                params: { limit, offset, status, reason },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get comprehensive report statistics (Admin)
     */
    const getReportStats = async (): Promise<AdminReportStatsResponse> => {
        try {
            const response = await apiInstance.get<AdminReportStatsResponse>('reports/admin/stats');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get detailed information about a specific report (Admin)
     */
    const getReportDetails = async (reportId: string): Promise<AdminReportDetailsResponse> => {
        try {
            const response = await apiInstance.get<AdminReportDetailsResponse>(`reports/admin/${reportId}`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Update report status and add admin notes (Admin)
     */
    const updateReportStatus = async (
        reportId: string,
        payload: UpdateReportStatusPayload
    ): Promise<UpdateReportStatusResponse> => {
        try {
            const response = await apiInstance.put<UpdateReportStatusResponse>(
                `reports/admin/${reportId}`,
                payload
            );
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    // -------------------------------------------------------------------------
    // Listener Verification endpoints (admin-only)
    // -------------------------------------------------------------------------

    /**
     * List all listener verification submissions (Admin)
     */
    const getListenerVerifications = async (
        limit: number = 50,
        offset: number = 0,
        status?: 'pending' | 'approved' | 'rejected'
    ): Promise<AdminListenerVerificationsResponse> => {
        try {
            const response = await apiInstance.get<AdminListenerVerificationsResponse>(
                'listener-verifications/admin/all',
                { params: { limit, offset, status } }
            );
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get a single listener verification submission detail (Admin)
     */
    const getListenerVerificationDetail = async (
        verificationId: string
    ): Promise<AdminListenerVerificationDetailResponse> => {
        try {
            const response = await apiInstance.get<AdminListenerVerificationDetailResponse>(
                `listener-verifications/admin/${verificationId}`
            );
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Approve or reject a pending listener verification submission (Admin)
     */
    const reviewListenerVerification = async (
        verificationId: string,
        payload: ReviewListenerVerificationPayload
    ): Promise<ReviewListenerVerificationResponse> => {
        try {
            const response = await apiInstance.put<ReviewListenerVerificationResponse>(
                `listener-verifications/admin/${verificationId}`,
                payload
            );
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    // -------------------------------------------------------------------------
    // Sub-Admin Management endpoints (admin-only)
    // -------------------------------------------------------------------------

    /**
     * List all sub-admin accounts
     */
    const getSubAdmins = async (): Promise<ListSubAdminsResponse> => {
        try {
            const response = await apiInstance.get<ListSubAdminsResponse>('sub-admins');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Create a new sub-admin account
     */
    const createSubAdmin = async (payload: CreateSubAdminPayload): Promise<CreateSubAdminResponse> => {
        try {
            const response = await apiInstance.post<CreateSubAdminResponse>('sub-admins', payload);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * List pending sub-admin requests
     */
    const getPendingSubAdmins = async (): Promise<ListPendingSubAdminsResponse> => {
        try {
            const response = await apiInstance.get<ListPendingSubAdminsResponse>('sub-admins/pending');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get sub-admin profile detail
     */
    const getSubAdminDetail = async (subAdminId: string): Promise<GetSubAdminResponse> => {
        try {
            const response = await apiInstance.get<GetSubAdminResponse>(`sub-admins/${subAdminId}`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Update sub-admin feature-level permissions
     */
    const updateSubAdminPermissions = async (
        subAdminId: string,
        payload: UpdateSubAdminPermissionsPayload
    ): Promise<UpdateSubAdminPermissionsResponse> => {
        try {
            const response = await apiInstance.put<UpdateSubAdminPermissionsResponse>(
                `sub-admins/${subAdminId}`,
                payload
            );
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Delete a sub-admin account
     */
    const deleteSubAdmin = async (subAdminId: string): Promise<DeleteSubAdminResponse> => {
        try {
            const response = await apiInstance.delete<DeleteSubAdminResponse>(`sub-admins/${subAdminId}`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Update sub-admin lifecycle status
     */
    const updateSubAdminStatus = async (
        subAdminId: string,
        payload: UpdateSubAdminStatusPayload
    ): Promise<UpdateSubAdminStatusResponse> => {
        try {
            const response = await apiInstance.put<UpdateSubAdminStatusResponse>(
                `sub-admins/${subAdminId}/status`,
                payload
            );
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    // -------------------------------------------------------------------------
    // Admin User Moderation endpoints (admin-only)
    // -------------------------------------------------------------------------

    /**
     * List users for admin moderation
     */
    const adminListUsers = async (
        search?: string,
        role?: 'venter' | 'listener' | 'both',
        limit: number = 20,
        offset: number = 0
    ): Promise<AdminListUsersResponse> => {
        try {
            const response = await apiInstance.get<AdminListUsersResponse>('admin/users', {
                params: { search, role, limit, offset },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get user detail for moderation
     */
    const adminGetUserDetail = async (userId: string): Promise<AdminUserDetailResponse> => {
        try {
            const response = await apiInstance.get<AdminUserDetailResponse>(`admin/users/${userId}`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Delete user account (Admin moderation)
     */
    const adminDeleteUser = async (userId: string): Promise<AdminDeleteUserResponse> => {
        try {
            const response = await apiInstance.delete<AdminDeleteUserResponse>(`admin/users/${userId}`);
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Suspend or reactivate user account (Admin moderation)
     */
    const adminSuspendUser = async (
        userId: string,
        payload: SuspendUserPayload
    ): Promise<SuspendUserResponse> => {
        try {
            const response = await apiInstance.put<SuspendUserResponse>(
                `admin/users/${userId}/suspend`,
                payload
            );
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Bulk delete user accounts (Admin moderation)
     */
    const adminBulkDeleteUsers = async (
        payload: AdminBulkDeleteUsersPayload
    ): Promise<AdminBulkDeleteUsersResponse> => {
        try {
            const response = await apiInstance.delete<AdminBulkDeleteUsersResponse>('admin/users', {
                data: payload,
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Bulk change user roles (Admin moderation)
     */
    const adminBulkUpdateUserRoles = async (
        payload: AdminBulkUpdateUserRolesPayload
    ): Promise<AdminBulkUpdateUserRolesResponse> => {
        try {
            const response = await apiInstance.put<AdminBulkUpdateUserRolesResponse>(
                'admin/users/roles',
                payload
            );
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    // -------------------------------------------------------------------------
    // Admin Integrations (admin-only)
    // -------------------------------------------------------------------------

    /**
     * List integrations/exports users
     */
    const getIntegrations = async (
        search?: string,
        role?: 'venter' | 'listener' | 'both',
        status?: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<AdminListIntegrationsResponse> => {
        try {
            const response = await apiInstance.get<AdminListIntegrationsResponse>('admin/integrations', {
                params: { search, role, status, limit, offset },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Update user export status
     */
    const updateExportStatus = async (
        userId: string,
        payload: UpdateExportStatusPayload
    ): Promise<UpdateExportStatusResponse> => {
        try {
            const response = await apiInstance.put<UpdateExportStatusResponse>(
                `admin/integrations/${userId}/export-status`,
                payload
            );
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Export integrations as PDF
     */
    const exportIntegrationsPDF = async (
        search?: string,
        role?: string,
        status?: string,
        maxRows: number = 250,
        userId?: string
    ): Promise<any> => {
        try {
            const response = await apiInstance.get('admin/integrations/export/pdf', {
                params: { search, role, status, maxRows, userId },
                responseType: 'blob',
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    // -------------------------------------------------------------------------
    // Admin Payment History (admin-only)
    // -------------------------------------------------------------------------

    /**
     * List payment history
     */
    const getPaymentHistory = async (
        search?: string,
        userId?: string,
        status?: string,
        from?: string,
        to?: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<AdminPaymentHistoryResponse> => {
        try {
            const response = await apiInstance.get<AdminPaymentHistoryResponse>('admin/payments/history', {
                params: { search, userId, status, from, to, limit, offset },
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Get admin financial payment stats
     */
    const getAdminPaymentStats = async (): Promise<any> => {
        try {
            const response = await apiInstance.get<any>('admin/payments/stats');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Export payment history as PDF
     */
    const exportPaymentHistoryPDF = async (
        search?: string,
        userId?: string,
        status?: string,
        from?: string,
        to?: string,
        maxRows: number = 250
    ): Promise<any> => {
        try {
            const response = await apiInstance.get('admin/payments/history/export/pdf', {
                params: { search, userId, status, from, to, maxRows },
                responseType: 'blob',
            });
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    // -------------------------------------------------------------------------
    // Admin AI Settings (admin-only)
    // -------------------------------------------------------------------------

    /**
     * Get current AI admin settings
     */
    const getAdminAISettings = async (): Promise<AdminAISettingsResponse> => {
        try {
            const response = await apiInstance.get<AdminAISettingsResponse>('admin-settings/ai');
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Update AI admin settings
     */
    const updateAdminAISettings = async (
        payload: UpdateAdminAISettingsPayload
    ): Promise<UpdateAdminAISettingsResponse> => {
        try {
            const response = await apiInstance.put<UpdateAdminAISettingsResponse>(
                'admin-settings/ai',
                payload
            );
            return response?.data;
        } catch (error) {
            throw error;
        }
    };

    return useMemo(() => ({
        // User-facing
        submitReport,
        getMyReports,
        // Admin: reports
        getReports,
        getReportStats,
        getReportDetails,
        updateReportStatus,
        // Admin: listener verifications
        getListenerVerifications,
        getListenerVerificationDetail,
        reviewListenerVerification,
        // Admin: sub-admins
        getSubAdmins,
        createSubAdmin,
        getPendingSubAdmins,
        getSubAdminDetail,
        updateSubAdminPermissions,
        deleteSubAdmin,
        updateSubAdminStatus,
        // Admin: user moderation
        adminListUsers,
        adminGetUserDetail,
        adminDeleteUser,
        adminSuspendUser,
        adminBulkDeleteUsers,
        adminBulkUpdateUserRoles,
        // Admin: AI settings
        getAdminAISettings,
        updateAdminAISettings,
        // Admin: Integrations
        getIntegrations,
        updateExportStatus,
        exportIntegrationsPDF,
        // Admin: Payments
        getPaymentHistory,
        getAdminPaymentStats,
        exportPaymentHistoryPDF,
        // Admin: listener request aliases
        getAdminListenerRequests: getListenerVerifications,
        getAdminListenerRequestDetail: getListenerVerificationDetail,
        reviewAdminListenerRequest: reviewListenerVerification,
    }), []);
};
