import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import userReducer from './slices/userSlice';
import callReducer from './slices/callSlice';
import listenerReducer from './slices/listenerSlice';
import sessionReducer from './slices/sessionSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['app', 'user', 'call', 'listener', 'session'],
  version: 1,
  migrate: (state: any) => {
    // Handle migration from old state structure
    if (state && state.app) {
      // If old state had selectedBackground object, convert to selectedBackgroundId
      if (state.app.selectedBackground && typeof state.app.selectedBackground === 'object') {
        state.app.selectedBackgroundId = state.app.selectedBackground.id || null;
        delete state.app.selectedBackground;
      }
      // Ensure customBackgrounds is initialized
      if (!state.app.customBackgrounds) {
        state.app.customBackgrounds = [];
      }
      // Ensure selectedBackgroundId exists
      if (state.app.selectedBackgroundId === undefined) {
        state.app.selectedBackgroundId = null;
      }
    }
    return Promise.resolve(state);
  },
};

const rootReducer = combineReducers({
  app: appReducer,
  user: userReducer,
  call: callReducer,
  listener: listenerReducer,
  session: sessionReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
        ignoredPaths: ['app.customBackgrounds'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

