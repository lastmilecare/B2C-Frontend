import { configureStore } from "@reduxjs/toolkit";
import { api } from "./apiSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
  },
  middleware: (gDM) => gDM().concat(api.middleware),
});
