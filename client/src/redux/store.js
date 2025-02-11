import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import techstackReducer from "./techstackSlice";
import savedstackReducer from "./savedstackSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

const rootReducer = combineReducers({
  user: userReducer,
  stack: techstackReducer,
  savedStack: savedstackReducer
});

const persistConfig = {
  key: "root",
  storage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
