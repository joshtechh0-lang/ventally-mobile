import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RequestItem {
    id: string;
    type: 'call' | 'message';
    title: string;
    timeAgo?: string;
    roomName?: string;
    /** ID of the requester (venter) */
    venterId: string | null;
    /** ID of the assigned listener */
    listenerId: string | null;
    /** The raw requestId from the server (same as id for now) */
    requestId: string | null;
    /** Session type from the server payload */
    requestType: string | null;
    /** Rate per minute for this session */
    ratePerMinute?: number | null;
}

interface ListenerState {
    requests: RequestItem[];
    /**
     * Last explicit "available" choice on listener home (null = never set; hydrate from API on focus).
     * Used to resync server when returning to this screen.
     */
    listenerAvailabilityPreference: boolean | null;
}

const initialState: ListenerState = {
    requests: [],
    listenerAvailabilityPreference: null,
};

const listenerSlice = createSlice({
    name: 'listener',
    initialState,
    reducers: {
        setRequests: (state, action: PayloadAction<RequestItem[]>) => {
            state.requests = action.payload;
        },
        removeRequest: (state, action: PayloadAction<string>) => {
            state.requests = state.requests.filter(req => req.id !== action.payload);
        },
        clearRequests: (state) => {
            state.requests = [];
        },
        setListenerAvailabilityPreference: (state, action: PayloadAction<boolean | null>) => {
            state.listenerAvailabilityPreference = action.payload;
        },
    },
});

export const { setRequests, removeRequest, clearRequests, setListenerAvailabilityPreference } = listenerSlice.actions;
export default listenerSlice.reducer;
