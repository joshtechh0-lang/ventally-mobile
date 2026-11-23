import { DeviceEventEmitter } from 'react-native';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
    message: string;
    type?: ToastType;
    duration?: number;
}

const TOAST_EVENT = 'SHOW_CUSTOM_TOAST';

export const ToastService = {
    show: (options: ToastOptions) => {
        DeviceEventEmitter.emit(TOAST_EVENT, options);
    },
    success: (message: string, duration?: number) => {
        DeviceEventEmitter.emit(TOAST_EVENT, { message, type: 'success', duration });
    },
    error: (message: string, duration?: number) => {
        DeviceEventEmitter.emit(TOAST_EVENT, { message, type: 'error', duration });
    },
    info: (message: string, duration?: number) => {
        DeviceEventEmitter.emit(TOAST_EVENT, { message, type: 'info', duration });
    },
    subscribe: (callback: (options: ToastOptions) => void) => {
        return DeviceEventEmitter.addListener(TOAST_EVENT, callback);
    },
};
