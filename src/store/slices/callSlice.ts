import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SessionType = 'call' | 'chat';

export interface CallState {
  isConnecting: boolean;
  isActive: boolean;
  startTime: number | null;
  isMuted: boolean;
  sessionId: string | null;
  /** Type of session when navigating to finding listener: call or chat */
  sessionType: SessionType | null;
  /** When true, user came from low credit and should return to finding listener after payment */
  returnToSession: boolean;
  /** Messaging session state — independent from the call state */
  isChatActive: boolean;
  chatStartTime: number | null;
  chatData: any | null;
  activeConversationId: string | null;
  /** Set to true when the user initiates a report, preventing chat:ended from navigating to ratings */
  isReporting: boolean;
  /** Set to true when a listener triggers a crisis — prevents call:ended/chat:ended from navigating to feedback */
  crisisEnded: boolean;
  agoraCallData: { token: string; channelName: string; uid: number; agoraAppId: string | null } | null;
  /** True right after listener accepts a call, until navigation to the active call screen is confirmed — hides CallStatusBar during the gap */
  justAccepted: boolean;
}

const initialState: CallState = {
  isConnecting: false,
  isActive: false,
  startTime: null,
  isMuted: false,
  sessionId: null,
  sessionType: null,
  returnToSession: false,
  isChatActive: false,
  chatStartTime: null,
  chatData: null,
  activeConversationId: null,
  isReporting: false,
  crisisEnded: false,
  agoraCallData: null,
  justAccepted: false,
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    setSessionType: (state, action: PayloadAction<SessionType | null>) => {
      state.sessionType = action.payload;
    },
    setReturnToSession: (state, action: PayloadAction<boolean>) => {
      state.returnToSession = action.payload;
    },
    setAgoraCallData: (state, action: PayloadAction<any>) => {
      state.agoraCallData = action.payload;
    },
    setJustAccepted: (state, action: PayloadAction<boolean>) => {
      state.justAccepted = action.payload;
    },
    setIsReporting: (state, action: PayloadAction<boolean>) => {
      state.isReporting = action.payload;
    },
    setCrisisEnded: (state, action: PayloadAction<boolean>) => {
      state.crisisEnded = action.payload;
    },
    startCall: (state) => {
      state.isConnecting = true;
      state.isActive = false;
      state.startTime = null;
      state.isMuted = false;
      state.sessionId = null;
      state.crisisEnded = false;
    },
    sessionStarted: (state, action: PayloadAction<{ sessionId?: string } | undefined>) => {
      state.isConnecting = false;
      state.isActive = true;
      state.startTime = Date.now();
      state.sessionId = action.payload?.sessionId ?? null;
      state.crisisEnded = false;
    },
    endCall: (state) => {
      state.isConnecting = false;
      state.isActive = false;
      state.startTime = null;
      state.isMuted = false;
      state.sessionId = null;
      state.sessionType = null;
      state.returnToSession = false;
      state.isReporting = false;
      // crisisEnded intentionally NOT reset here — must survive endCall() so overlay stays visible.
      // Reset happens in startCall / chatSessionStarted.
    },
    setMuted: (state, action: PayloadAction<boolean>) => {
      state.isMuted = action.payload;
    },
    setCallSession: (state, action: PayloadAction<Partial<CallState>>) => {
      Object.assign(state, action.payload);
    },
    /** Start a messaging (chat) session */
    chatSessionStarted: (state, action: PayloadAction<{ chatData: any; chatStartTime: number; conversationId?: string }>) => {
      state.isChatActive = true;
      state.chatData = action.payload.chatData;
      state.chatStartTime = action.payload.chatStartTime;
      state.activeConversationId = action.payload.conversationId
        ?? action.payload.chatData?.conversation?.id
        ?? action.payload.chatData?.id
        ?? null;
      state.crisisEnded = false;
    },
    /** End the active messaging session */
    endChatSession: (state) => {
      state.isChatActive = false;
      state.chatData = null;
      state.chatStartTime = null;
      state.activeConversationId = null;
      state.isReporting = false;
      // crisisEnded intentionally NOT reset here — reset happens in chatSessionStarted.
    },
  },
});

export const { setAgoraCallData,
  setJustAccepted,
  setSessionType,
  setReturnToSession,
  setIsReporting,
  setCrisisEnded,
  startCall,
  sessionStarted,
  endCall,
  setMuted,
  setCallSession,
  chatSessionStarted,
  endChatSession,
} = callSlice.actions;
export default callSlice.reducer;
