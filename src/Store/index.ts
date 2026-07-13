// src/Store/index.ts atau store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { api } from "@/Services/api";
import AuthSlicer from "@/Store/redux/Auth";
import SidebarSlicer from "@/Store/redux/Sidebar";
import storage from "redux-persist/lib/storage"; // LOCAL STORAGE
import { encryptTransform } from "redux-persist-transform-encrypt";
// import storage from 'redux-persist/lib/storage/session' // SESSION STORAGE

const persistConfig = {
  key: import.meta.env.VITE_LOCAL_STORAGE_KEY,
  transforms: [
    encryptTransform({
      secretKey: import.meta.env.VITE_LOCAL_STORAGE_SECRET_KEY,
      onError: function (error) {
        new Error("CANNOT PERSIST THE STATE");
      },
    }),
  ],
  version: 1,
  storage,
  whitelist: ["AuthSlicer", "RuanganSlicer", "SidebarSlicer"],
  // blacklist: ['api'],
};

const reducers = combineReducers({
  [api.reducerPath]: api.reducer,
  AuthSlicer,
  SidebarSlicer,
});

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware);

    return middlewares;
  },
});

const persistor = persistStore(store);

setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store, persistor };
