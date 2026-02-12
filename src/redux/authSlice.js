import { createSlice } from "@reduxjs/toolkit";
import { cookie } from "../utils/cookie";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: cookie.get("token") || null },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.data;
      state.token = action.payload.data.token;
      cookie.set("token", action.payload.data.token);
      cookie.set("username", action.payload.data.username);
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
