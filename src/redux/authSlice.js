// import { createSlice } from "@reduxjs/toolkit";
// import { cookie } from "../utils/cookie";

// const authSlice = createSlice({
//   name: "auth",
//   initialState: { user: null, token: cookie.get("token") || null },
//   reducers: {
//     setCredentials: (state, action) => {
//       state.user = action.payload.data;
//       state.token = action.payload.data.token;
//       cookie.set("token", action.payload.data.token);
//       cookie.set("username", action.payload.data.username);
//       cookie.set("user_id", action.payload.data.user_id);
//       cookie.set("role", action.payload.data.role);
//     },
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       cookie.remove("token");
//       cookie.remove("username");
//       cookie.remove("user_id");
//       cookie.remove("role");
//     },
//   },
// });

// export const { setCredentials, logout } = authSlice.actions;
// export default authSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import { cookie } from "../utils/cookie";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:        null,
    token:       cookie.get("token")       || null,
    role:        cookie.get("role")        || null,
    tenantId:    cookie.get("tenantId")    || null,
    permissions: cookie.get("permissions")
                   ? JSON.parse(cookie.get("permissions"))
                   : [],
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, email, role, tenantId, permissions } = action.payload.data;

      state.user        = action.payload.data;
      state.token       = token;
      state.role        = role;
      state.tenantId    = tenantId;
      state.permissions = permissions;

      // Persist to cookies
      cookie.set("token",       token);
      cookie.set("role",        role);
      cookie.set("email",       email);
      cookie.set("tenantId",    tenantId ?? "");
      cookie.set("permissions", JSON.stringify(permissions));
    },

    logout: (state) => {
      state.user        = null;
      state.token       = null;
      state.role        = null;
      state.tenantId    = null;
      state.permissions = [];

      cookie.remove("token");
      cookie.remove("role");
      cookie.remove("email");
      cookie.remove("tenantId");
      cookie.remove("permissions");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;