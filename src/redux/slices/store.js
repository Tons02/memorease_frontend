import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";
// No need to import 'thunk' if you're not using it explicitly elsewhere

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // serializableCheck: true, // Uncomment if you need to disable this check
    }).concat(apiSlice.middleware), // Remove 'thunk' from here
});
