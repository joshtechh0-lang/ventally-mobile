// ============================================================================
// WALLET TYPES
// ============================================================================

export interface WalletBalance {
    minutes: number;
    currency: number;
    currencyCode: string;
}

export interface AutoRecharge {
    enabled: boolean;
    threshold: number;
    amount: number;
}

export interface WalletBalanceResponse {
    balance: WalletBalance;
    autoRecharge: AutoRecharge;
}

export interface Transaction {
    id: string;
    type: string;
    amountMinutes: number;
    amountCurrency: number;
    balanceAfterMinutes: number;
    balanceAfterCurrency: number;
    description: string;
    createdAt: string;
}

export interface TransactionsResponse {
    transactions: Transaction[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
    };
}

export interface Subscription {
    id: string;
    planName: string;
    status: string;
    includedMinutes: number;
    usedMinutes: number;
    remainingMinutes: number;
    remainingMessages?: number;
    overageRate: number;
    billingCycleStart: string;
    billingCycleEnd: string;
    monthlyPrice: number;
    features: Record<string, any>;
}

export interface SubscriptionResponse {
    hasSubscription: boolean;
    message: string;
    subscription?: Subscription;
}

export interface UpdateAutoRechargePayload {
    enabled: boolean;
    threshold: number;
    amount: number;
}

export interface UpdateAutoRechargeResponse {
    message: string;
    autoRecharge: AutoRecharge;
}

// ============================================================================
// PAYMENTS TYPES
// ============================================================================

export interface CreditPack {
    id: string;
    name: string;
    minutes: number;
    price: number;
    pricePerMinute: string;
}

export interface CreditPacksResponse {
    packs: CreditPack[];
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    price_monthly: number;
    included_minutes: number;
    overage_rate: number;
    features: Record<string, any>;
    is_active: boolean;
    stripe_price_id: string;
    created_at: string;
    updated_at: string;
}

export interface SubscriptionPlansResponse {
    plans: SubscriptionPlan[];
}

export interface CreateCheckoutSessionPayload {
    packType: string;
    customMinutes?: number;
    customPrice?: number;
    promoCode?: string;
}

export interface CreateCheckoutSessionResponse {
    sessionId: string;
    url: string;
    credits: number;
    amount: number;
}

export interface CreateSubscriptionCheckoutPayload {
    planId: string;
}

export interface CreateSubscriptionCheckoutResponse {
    sessionId: string;
    url: string;
    planName: string;
    monthlyPrice: number;
    includedMinutes: number;
}

export interface VerifyCheckoutResponse {
    success: boolean;
    status: string;
    amountPaid: number;
    credits: number;
}

export interface CancelSubscriptionResponse {
    message: string;
    cancelAt: string;
}

// ============================================================================
// NOTIFICATIONS TYPES
// ============================================================================

export interface FirebaseStatus {
    initialized: boolean;
    credentialsConfigured: boolean;
    status: string;
    message: string;
}

export interface NotificationFeatures {
    pushNotifications: boolean;
    deviceTokenRegistration: boolean;
    notificationHistory: boolean;
}

export interface NotificationStatusResponse {
    success: boolean;
    firebase: FirebaseStatus;
    features: NotificationFeatures;
}

export interface RegisterDevicePayload {
    token: string;
    device_type: string;
    device_info?: {
        model?: string;
        os_version?: string;
        app_version?: string;
    };
}

export interface RegisterDeviceResponse {
    success: boolean;
    message: string;
}

export interface UnregisterDevicePayload {
    token: string;
}

export interface SendNotificationPayload {
    user_id: number;
    title: string;
    body: string;
    data?: Record<string, any>;
    image_url?: string;
}

export interface SendNotificationResponse {
    success: boolean;
    message: string;
    result: {
        successCount: number;
        failureCount: number;
    };
}

export interface SendBulkNotificationPayload {
    user_ids: number[];
    title: string;
    body: string;
    data?: Record<string, any>;
    image_url?: string;
}

export interface SendTopicNotificationPayload {
    topic: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    image_url?: string;
}

export interface SubscribeTopicPayload {
    topic: string;
}

export interface NotificationItem {
    id: number;
    title: string;
    body: string;
    data: Record<string, any>;
    type: string;
    status: string;
    created_at: string;
    read_at: string;
}

export interface NotificationHistoryResponse {
    success: boolean;
    data: NotificationItem[];
    total: number;
    limit: number;
    offset: number;
}

export interface UnreadCountResponse {
    success: boolean;
    unreadCount: number;
}

export interface NotificationSettings {
    allNotifications: boolean;
    messageNotifications: boolean;
    callNotifications: boolean;
    reminderNotifications: boolean;
    soundVibration: boolean;
    inAppAlerts: boolean;
    remindMeAtUtc: string;
    quietHoursStartUtc: string;
    quietHoursEndUtc: string;
}

export interface NotificationSettingsResponse {
    success: boolean;
    data: NotificationSettings;
}

export interface UpdateNotificationSettingsPayload extends Partial<NotificationSettings> { }

// ============================================================================
// MOOD TYPES
// ============================================================================

export interface MoodEntry {
    id: string;
    user_id: string;
    mood_type: string;
    category: string;
    notes: string;
    logged_date: string;
    created_at: string;
    updated_at: string;
}

export interface LogMoodPayload {
    mood_type: string;
    category: string;
    notes?: string;
}

export interface LogMoodResponse {
    message: string;
    mood: MoodEntry;
}

export interface TodayMoodResponse {
    message: string;
    logged: boolean;
    mood?: MoodEntry;
}

export interface UpdateMoodPayload {
    mood_type?: string;
    category?: string;
    notes?: string;
}

export interface UpdateMoodResponse {
    message: string;
    mood: MoodEntry;
}

export interface MoodHistoryResponse {
    message: string;
    moods: MoodEntry[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        has_more: boolean;
    };
}

export interface MoodDistribution {
    mood_type: string;
    count: string;
}

export interface CategoryDistribution {
    category: string;
    count: string;
}

export interface MoodStatsResponse {
    message: string;
    period_days: number;
    total_entries: number;
    mood_distribution: MoodDistribution[];
    category_distribution: CategoryDistribution[];
    streaks: {
        current: number;
        longest: number;
    };
}

export interface DeleteMoodResponse {
    message: string;
    mood_id: string;
}

// ============================================================================
// REFLECTION TYPES
// ============================================================================

export interface ReflectionEntry {
    id: string;
    user_id: string;
    mood_log_id?: string;
    reflection_text: string;
    reflection_date: string;
    mood_type?: string;
    category?: string;
    created_at: string;
    updated_at: string;
}

export interface SaveReflectionPayload {
    reflection_text: string;
}

export interface SaveReflectionResponse {
    message: string;
    reflection: ReflectionEntry;
}

export interface TodayReflectionResponse {
    message: string;
    saved: boolean;
    reflection?: ReflectionEntry;
}

export interface ReflectionHistoryResponse {
    message: string;
    reflections: ReflectionEntry[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
    };
}

export interface UpdateReflectionPayload {
    reflection_text: string;
}

export interface UpdateReflectionResponse {
    message: string;
    reflection: ReflectionEntry;
}

export interface DeleteReflectionResponse {
    message: string;
    reflection_id: string;
}

// ============================================================================
// AVAILABILITY TYPES
// ============================================================================

export interface ListenerProfile {
    listenerId: string;
    anonymousName?: string;
    ratePerMinute: number;
    totalSessions: number;
    averageRating: number;
    bioAnonymous: string;
    specialties: string[];
    avatarSeed?: string;
}

export interface GoOnlineResponse {
    message: string;
    profile: ListenerProfile;
}

export interface GoOfflineResponse {
    message: string;
}

export interface HeartbeatResponse {
    message: string;
    lastSeen: string;
}

export interface AvailableListenersResponse {
    listeners: ListenerProfile[];
    total: number;
}

export interface UpdateRatePayload {
    ratePerMinute: number;
}

export interface UpdateRateResponse {
    message: string;
    profile: ListenerProfile;
}

export interface AvailabilityStatusResponse {
    status: string;
    isBusy: boolean;
    lastSeen: string;
}

export interface ListenerProfileResponse {
    profile: ListenerProfile;
}

// ============================================================================
// CHAT/CONVERSATIONS TYPES
// ============================================================================

export interface AnonymousParticipant {
    anonymousName: string;
    avatarSeed: string;
}

export interface Conversation {
    id: string;
    status: string;
    otherParticipant: AnonymousParticipant;
    ratePerMinute: number;
    durationMinutes: number;
    totalCost: number;
    createdAt: string;
    startedAt: string;
    endedAt: string;
    updatedAt: string;
    lastMessage?: Message;
}

export interface CreateConversationPayload {
    listenerId: string;
}

export interface CreateConversationResponse {
    message: string;
    conversation: Conversation;
}

export interface ConversationsResponse {
    conversations: Conversation[];
    total: number;
    pagination: {
        total: number;
        limit: number;
        offset: number;
        has_more: boolean;
    };
}

export interface ConversationDetailsResponse {
    conversation: Conversation;
}

export interface AcceptConversationResponse {
    message: string;
    conversation: Conversation;
}

export interface DeclineConversationResponse {
    message: string;
}

export interface EndConversationResponse {
    message: string;
    durationMinutes: number;
    totalCost: number;
    earnings: number;
}

export interface MessageSender {
    anonymousName: string;
    avatarSeed: string;
    isMe: boolean;
}

export interface Message {
    id: string;
    content: string;
    sender: MessageSender;
    deliveredAt: string;
    readAt: string;
    createdAt: string;
}

export interface ConversationMessagesResponse {
    messages: Message[];
    total: number;
    hasMore: boolean;
}

// ============================================================================
// CALLS TYPES
// ============================================================================

export interface Call {
    id: string;
    status: string;
    // otherParticipant: AnonymousParticipant; // Use this or specific types below
    roomName?: string;
    ratePerMinute?: number;
    durationSeconds?: number;
    totalCost?: number;
    createdAt?: string;
    startedAt?: string;
    endedAt?: string;

    // For handling different response structures where participant is named differently
    listener?: AnonymousParticipant;
    venter?: AnonymousParticipant;
    otherParticipant?: AnonymousParticipant;
}

export interface CreateCallPayload {
    listenerId: string;
    paymentMode?: 'payg' | 'prepaid';
}

export interface CreateCallResponse {
    success: boolean;
    call: Call;
}

export interface CallsResponse {
    success: boolean;
    count: number;
    calls: Call[];
}

export interface CallDetailsResponse {
    success: boolean;
    call: Call;
}

export interface AcceptCallResponse {
    success: boolean;
    call: Call & { token?: string }; // token might be returned
}

export interface DeclineCallResponse {
    success: boolean;
    message: string;
}

export interface CancelCallResponse {
    success: boolean;
    message: string;
}

export interface EndCallResponse {
    success: boolean;
    call: Call;
}

export interface CallTokenResponse {
    success: boolean;
    token: string;
    roomName: string;
}

export interface ActiveCallResponse {
    success: boolean;
    activeCall: Call | null;
}

// ============================================================================
// BIOMETRIC TYPES
// ============================================================================

export interface BiometricInfo {
    enabled: boolean;
    deviceName?: string;
    registeredAt?: string;
}

export interface RegisterBiometricPayload {
    publicKey: string;
    deviceId: string;
    deviceName: string;
}

export interface RegisterBiometricResponse {
    message: string;
    biometric: BiometricInfo;
}

export interface BiometricLoginPayload {
    email: string;
    deviceId: string;
    challenge: string;
    signature: string;
}

export interface UserInfo {
    id: string;
    email: string;
    userType: string;
    phone: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
}

export interface UserRoleConfigResponse {
    availableRoles: string[];
    activeRole: string;
    userType: string;
}

export interface UpdateAvailableRolesPayload {
    rolesToAdd: string[];
    rolesToRemove: string[];
}

export interface UpdateAvailableRolesResponse {
    message: string;
    tokens: AuthTokens;
    user: {
        availableRoles: string[];
        activeRole: string;
    }
}

export interface SwitchRolePayload {
    targetRole: string;
}

export interface SwitchRoleResponse {
    message: string;
    tokens: AuthTokens;
    user: {
        id: string;
        email: string;
        activeRole: string;
        availableRoles: string[];
        userType: string;
    }
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface BiometricLoginResponse {
    message: string;
    user: UserInfo;
    tokens: AuthTokens;
}

export interface DisableBiometricResponse {
    message: string;
    biometric: BiometricInfo;
}

export interface BiometricStatusResponse {
    biometric: BiometricInfo;
}

// ============================================================================
// SESSIONS TYPES
// ============================================================================

export interface Session {
    id: string;
    venterId: string;
    listenerId: string;
    status: string;
    ratePerMinute: number;
    estimatedCost?: number;
    finalCost?: number;
    twilioCallSid?: string;
    durationSeconds?: number;
    createdAt: string;
    acceptedAt?: string;
    startedAt?: string;
    endedAt?: string;
}

export interface CreateSessionPayload {
    listenerId: string;
}

export interface CreateSessionResponse {
    message: string;
    session: Session;
}

export interface ActiveSession {
    id: string;
    venterId: string;
    venterEmail: string;
    listenerId: string;
    listenerEmail: string;
    status: string;
    ratePerMinute: number;
    createdAt: string;
    acceptedAt: string;
    startedAt: string;
}

export interface ActiveSessionsResponse {
    sessions: ActiveSession[];
    count: number;
}

export interface SessionDetailsResponse {
    session: Session;
}

export interface AcceptSessionResponse {
    message: string;
    session: {
        id: string;
        status: string;
        twilioCallSid: string;
        startedAt: string;
    };
}

export interface EndSessionResponse {
    message: string;
    session: {
        id: string;
        status: string;
        durationSeconds: number;
        finalCost: number;
        endedAt: string;
    };
}

// ============================================================================
// ADMIN TYPES
// ============================================================================

export interface AdminReport {
    id: string;
    reporterId: string;
    reportedId: string;
    sessionType: string;
    sessionId: string;
    reason: string;
    description: string;
    status: string;
    adminNotes: string;
    reviewedBy?: string;
    reviewedAt?: string;
    created_at: string;
    reporter_email?: string;
    reported_email?: string;
    reporter_type?: string;
    reported_type?: string;
    reviewer_email?: string;
}

export interface AdminReportsResponse {
    success: boolean;
    reports: AdminReport[];
    stats: {
        pending: number;
        reviewing: number;
        resolved: number;
        dismissed: number;
    };
    pagination: {
        limit: number;
        offset: number;
        total: number;
    };
}

export interface AdminReportStatsResponse {
    success: boolean;
    stats: {
        byStatus: Record<string, number>;
        byReason: Record<string, number>;
        last30Days: Array<{ date: string; count: number }>;
        topReportedUsers: Array<{
            reported_id: string;
            email: string;
            user_type: string;
            report_count: number;
        }>;
        applicationStatus24h: {
            window: string;
            generatedAt: string;
            cards: {
                activeUsers: { value: number; changePercent: number };
                monthlySessions: { value: number; changePercent: number };
                newSignups: { value: number; changePercent: number };
                listenerOnlineMinutes: { value: number; changePercent: number };
            };
            userProgressEngagementRatio: Array<{
                hour: string;
                activeUsers: number;
                sessions: number;
            }>;
        };
    };
}

export interface AdminReportDetailsResponse {
    success: boolean;
    report: AdminReport;
}

export interface UpdateReportStatusPayload {
    status: string;
    adminNotes?: string;
}

export interface UpdateReportStatusResponse {
    success: boolean;
    report: AdminReport;
}

export interface SubmitReportPayload {
    reportedId: string;
    sessionType?: string;
    sessionId?: string;
    reason: string;
    description: string;
}

export interface SubmitReportResponse {
    success: boolean;
    report: AdminReport;
}

export interface MyReportsResponse {
    success: boolean;
    reports: AdminReport[];
    pagination: {
        limit: number;
        offset: number;
        total: number;
    };
}

export interface ListenerVerificationSubmission {
    id: string;
    listener_id: string;
    listener_email?: string;
    status: string;
    s3_key?: string;
    file_url?: string;
    mime_type?: string;
    original_file_name?: string;
    file_size_bytes?: number;
    admin_notes?: string;
    reviewed_by?: string;
    reviewed_at?: string;
    s3_deleted_at?: string;
    created_at: string;
    updated_at?: string;
    document_url?: string;
    gender_identity?: string;
    lgbtq_identity?: string;
    age_group?: string | number;
}

export interface AdminListenerVerificationsResponse {
    success: boolean;
    submissions: ListenerVerificationSubmission[];
}

// -------------------------------------------------------------------------
// Sub-Admin Management Types
// -------------------------------------------------------------------------

export interface AdminPermissions {
    view: boolean;
    edit: boolean;
    delete: boolean;
    suspend: boolean;
    accessAdminPanel: boolean;
}

export interface SubAdmin {
    id: string;
    email: string;
    phone?: string;
    userType: string;
    activeRole: string;
    availableRoles: string[];
    isVerified: boolean;
    isActive: boolean;
    status: string;
    permissions: AdminPermissions;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ListSubAdminsResponse {
    subAdmins: SubAdmin[];
}

export interface CreateSubAdminPayload {
    email: string;
    password?: string;
    phone?: string;
    permissions: AdminPermissions;
}

export interface CreateSubAdminResponse {
    message: string;
    subAdmin: {
        id: string;
        email: string;
        status: string;
        permissions: AdminPermissions;
    };
}

export interface ListPendingSubAdminsResponse {
    pendingRequests: Array<{
        id: string;
        email: string;
        status: string;
        permissions: AdminPermissions;
    }>;
}

export interface GetSubAdminResponse {
    subAdmin: {
        id: string;
        email: string;
        status: string;
        permissions: AdminPermissions;
    };
}

export interface UpdateSubAdminPermissionsPayload {
    permissions: AdminPermissions;
}

export interface UpdateSubAdminPermissionsResponse {
    message: string;
    subAdmin: {
        id: string;
        permissions: AdminPermissions;
    };
}

export interface UpdateSubAdminStatusPayload {
    status: 'pending' | 'active' | 'suspended';
}

export interface UpdateSubAdminStatusResponse {
    message: string;
    subAdmin: {
        id: string;
        status: string;
        isActive: boolean;
    };
}

export interface DeleteSubAdminResponse {
    message: string;
}

// -------------------------------------------------------------------------
// Admin User Moderation Types
// -------------------------------------------------------------------------

export interface AdminUserListItem {
    id: string;
    email: string;
    activeRole: string;
    availableRoles: string[];
    accountType: 'venter' | 'listener' | 'both';
    isActive: boolean;
    stats?: {
        totalSessions: number;
        totalMinutes: number;
        totalPayout: number;
    };
    createdAt: string;
}

export interface AdminListUsersResponse {
    users: AdminUserListItem[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
    };
}

export interface AdminUserDetail {
    id: string;
    email: string;
    phone?: string;
    userType: string;
    activeRole: string;
    availableRoles: string[];
    accountType: string;
    isVerified: boolean;
    isActive: boolean;
    stats: {
        totalSessions: number;
        totalMinutes: number;
        totalPayout: number;
    };
    listenerInfo?: {
        genderIdentity: string;
        language: string;
        ethnicity: string;
        ageGroup: string;
        lgbtqIdentity: string;
        specialTopics: string[];
        faithOrBelief: string;
        verificationStatus: string;
    };
    verificationDocuments?: Array<{
        id: string;
        status: string;
        original_file_name: string;
        mime_type: string;
        file_size_bytes: number;
        created_at: string;
        reviewed_at: string;
        admin_notes: string;
    }>;
    createdAt: string;
}

export interface AdminUserDetailResponse {
    user: AdminUserDetail;
}

export interface SuspendUserPayload {
    suspended: boolean;
}

export interface SuspendUserResponse {
    message: string;
    user: {
        id: string;
        email: string;
        isActive: boolean;
    };
}

export interface AdminDeleteUserResponse {
    message: string;
    user: {
        id: string;
        email: string;
    };
}

export interface AdminListenerVerificationDetailResponse {
    success: boolean;
    submission: ListenerVerificationSubmission;
}

export interface ReviewListenerVerificationPayload {
    status: 'verified' | 'rejected';
    adminNotes?: string;
}

export interface ReviewListenerVerificationResponse {
    success: boolean;
    submission: {
        id: string;
        listener_id: string;
        status: string;
        reviewed_at: string;
        s3_deleted_at?: string;
    };
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface LogoutResponse {
    message: string;
}

export interface DeleteAccountPayload {
    password?: string;
}

export interface DeleteAccountResponse {
    message: string;
}

export interface ChangePasswordPayload {
    currentPassword?: string;
    newPassword?: string;
}

export interface ChangePasswordResponse {
    message: string;
}

export interface ChangeEmailRequestPayload {
    newEmail: string;
}

export interface ChangeEmailVerifyPayload {
    newEmail: string;
    otp: string;
}

export interface ChangePhoneRequestPayload {
    newPhone: string;
}

export interface ChangePhoneVerifyPayload {
    newPhone: string;
    otp: string;
}

export interface GenericMessageResponse {
    message: string;
}

export interface TwoFactorAuthenticationSettings {
    enabled: boolean;
    method: 'sms' | 'email' | 'authenticator_app';
}

export interface TwoFactorSettingsResponse {
    success: boolean;
    twoFactorAuthentication: TwoFactorAuthenticationSettings;
}

export interface UpdateTwoFactorSettingsPayload {
    enabled: boolean;
    method?: 'sms' | 'email' | 'authenticator_app';
}

// ============================================================================
// EARNINGS TYPES
// ============================================================================

export interface EarningsSummaryResponse {
    pendingBalance: number;
    availableBalance: number;
    totalPaid: number;
    lifetimeEarnings: number;
    pendingSessions: number;
    totalSessions: number;
}

export interface EarningTransaction {
    id: string;
    sessionType: 'call' | 'chat';
    sessionId: string;
    grossAmount: number;
    platformFee: number;
    netAmount: number;
    platformFeePercentage: number;
    status: 'pending' | 'available' | 'paid' | 'cancelled';
    payoutId: string | null;
    createdAt: string;
}

export interface EarningsTransactionsResponse {
    earnings: EarningTransaction[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

export interface Payout {
    id: string;
    amount: number;
    stripeTransferId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    failureReason: string | null;
    processedAt: string;
    createdAt: string;
}

export interface PayoutsResponse {
    payouts: Payout[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

// ============================================================================
// SOBRIETY / RECOVERY TYPES
// ============================================================================

export interface SobrietyAchievement {
    code: string;
    label: string;
    days_required: number;
    achieved: boolean;
}

export interface SobrietyStatus {
    id: string;
    user_id: string;
    sober_start_date: string;
    last_relapse_date: string;
    notes: string;
    days_sober: number;
    achievements: SobrietyAchievement[];
    created_at: string;
    updated_at: string;
}

export interface SobrietyStatusResponse {
    message: string;
    tracking_enabled: boolean;
    status?: SobrietyStatus;
}

export interface StartSobrietyPayload {
    restart_date: string;
    notes?: string;
}

export interface LogRelapsePayload {
    relapse_date: string;
    restart_date?: string;
    notes?: string;
}

export interface SobrietyEvent {
    id: string;
    user_id: string;
    event_type: string;
    event_date: string;
    restart_date?: string;
    notes?: string;
    created_at: string;
}

export interface SobrietyHistoryResponse {
    message: string;
    events: SobrietyEvent[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        has_more: boolean;
    };
}

export interface VenterHomeProgress {
    tracking_enabled: boolean;
    days_sober: number;
    sober_start_date: string;
    last_relapse_date: string;
}

export interface VenterHomeHighlights {
    feeling: string;
    latest_mood_date: string;
    achievements_count: number;
}

export interface RecentEntry {
    id: string;
    entry_type: 'mood' | 'reflection';
    entry_date: string;
    created_at: string;
    title: string;
    content: string;
    category: string;
    mood_type?: string;
    mood_log_id?: string;
}

export interface VenterHomeSummaryResponse {
    message: string;
    progress: VenterHomeProgress;
    highlights: VenterHomeHighlights;
    achievements: SobrietyAchievement[];
    recent_entries: RecentEntry[];
}

// ============================================================================
// LISTENER VERIFICATION TYPES
// ============================================================================

export interface ListenerVerification {
    id: string;
    listener_id?: string;
    listener_email?: string;
    status: 'pending' | 'approved' | 'verified' | 'rejected';
    admin_notes?: string;
    reviewed_at?: string;
    created_at: string;
    updated_at?: string;
    mime_type?: string;
    original_file_name?: string;
    file_url?: string;
    document_url?: string;
}

export interface SubmitVerificationResponse {
    success: boolean;
    verification: {
        id: string;
        status: string;
        createdAt: string;
    };
}

export interface GetSubmissionsResponse {
    success: boolean;
    submissions: ListenerVerification[];
}

export interface GetSubmissionDetailResponse {
    success: boolean;
    submission: ListenerVerification;
}

export interface ReviewVerificationPayload {
    status: 'verified' | 'rejected';
    adminNotes: string;
}

// ============================================================================
// SUPPORT TYPES
// ============================================================================

export interface SubmitAppealPayload {
    reason: string;
    description: string;
    attachments?: string[];
}

export interface SubmitFeedbackPayload {
    rating: number;
    comment?: string;
}

export interface SubmitListenerAppealPayload {
    contact: string;
    reportId: string;
    summary: string;
    document: {
        uri: string;
        name: string;
        type: string;
    };
}

export interface SubmitListenerAppealResponse {
    success: boolean;
    appeal: {
        id: string;
        status: string;
        contact: string;
        reportId: string;
        summary: string;
        documentUrl: string;
        createdAt: string;
    };
}
// ============================================================================
// BLOCKING TYPES
// ============================================================================

export interface BlockUserResponse {
    success: boolean;
    message: string;
    block: {
        id: string;
        blockedAt: string;
    };
}

export interface UnblockUserResponse {
    message: string;
}

export interface CheckBlockStatusResponse {
    isBlocked: boolean;
    blockType: 'you_blocked' | 'they_blocked' | 'none';
    blockedAt?: string;
}

export interface BlockedUser {
    id: string;
    blocked_id: string;
    username: string;
    role: string;
    blocked_at: string;
}

export interface GetBlockedUsersResponse {
    blockedUsers: BlockedUser[];
    pagination: {
        limit: number;
        offset: number;
        total: number;
    };
}

// ============================================================================
// ADMIN SETTINGS TYPES
// ============================================================================

export interface AdminAISettings {
    ai_enabled: boolean;
    ai_crisis_detection_enabled: boolean;
    ai_crisis_sensitivity: number;
    ai_auto_escalation_enabled: boolean;
}

export interface AdminAISettingsResponse {
    success: boolean;
    settings: AdminAISettings;
}

export interface UpdateAdminAISettingsPayload extends Partial<AdminAISettings> { }

export interface UpdateAdminAISettingsResponse {
    success: boolean;
    message: string;
    settings: AdminAISettings;
}
// -------------------------------------------------------------------------
// Admin Integrations Types
// -------------------------------------------------------------------------

export interface AdminIntegrationItem {
    id: string;
    email: string;
    accountType: string;
    stats: {
        totalSessions: number;
        totalMinutes: number;
        totalPayout: number;
    };
    exportStatus: 'exported' | 'pending' | 'not_exported';
    exportedAt: string | null;
}

export interface AdminListIntegrationsResponse {
    items: AdminIntegrationItem[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
    };
}

export interface UpdateExportStatusPayload {
    exported: boolean;
}

export interface UpdateExportStatusResponse {
    message: string;
    integration: {
        userId: string;
        email: string;
        exportStatus: string;
    };
}

// -------------------------------------------------------------------------
// Admin Payment History Types
// -------------------------------------------------------------------------

export interface AdminPaymentHistoryItem {
    id: string;
    amount: number;
    currency: string;
    status: string;
    mode: string;
    createdAt: string;
    completedAt: string | null;
    user: {
        id: string;
        email: string;
    };
}

export interface AdminPaymentHistoryResponse {
    payments: AdminPaymentHistoryItem[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
    };
}

// -------------------------------------------------------------------------
// Admin Bulk User Moderation Types
// -------------------------------------------------------------------------

export interface AdminBulkDeleteUsersPayload {
    userIds: string[];
}

export interface AdminBulkDeleteUsersResponse {
    message: string;
    deletedCount: number;
}

export interface AdminBulkUpdateUserRolesPayload {
    userIds: string[];
    targetRole: 'venter' | 'listener' | 'both';
}

export interface AdminBulkUpdateUserRolesResponse {
    message: string;
    updatedCount: number;
}

// -------------------------------------------------------------------------
// Reviews Types
// -------------------------------------------------------------------------

export interface Review {
    id: string;
    sessionType: 'call' | 'chat';
    sessionId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment?: string;
    createdAt: string;
    is_my_review?: boolean;
}

export interface SubmitReviewPayload {
    sessionType: 'call' | 'chat';
    sessionId: string;
    revieweeId: string;
    rating: number;
    comment?: string;
}

export interface SubmitReviewResponse {
    success: boolean;
    review: Review;
}

export interface GetUserReviewsResponse {
    success: boolean;
    reviews: Review[];
    stats: {
        averageRating: number;
        totalReviews: number;
        distribution: {
            '1': number;
            '2': number;
            '3': number;
            '4': number;
            '5': number;
        };
    };
    pagination: {
        limit: number;
        offset: number;
        total: number;
    };
}

export interface GetSessionReviewsResponse {
    success: boolean;
    reviews: Review[];
}

export interface CanReviewResponse {
    canReview: boolean;
    reason?: string;
    otherUserId?: string;
}

