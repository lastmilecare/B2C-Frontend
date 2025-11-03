import { createSlice } from "@reduxjs/toolkit";
import { cookie } from "../utils/cookie";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: cookie.get("token") || null },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      cookie.set("token", action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      cookie.remove("token");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
