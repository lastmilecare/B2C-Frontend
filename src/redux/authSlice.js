// import { createSlice } from "@reduxjs/toolkit";
// import { cookie } from "../utils/cookie";

// const authSlice = createSlice({
//   name: "auth",
//   initialState: {
//     user:        null,
//     token:       cookie.get("token")       || null,
//     role:        cookie.get("role")        || null,
//     tenantId:    cookie.get("tenantId")    || null,
//     permissions: cookie.get("permissions")
//                    ? JSON.parse(cookie.get("permissions"))
//                    : [],
//   },
//   reducers: {
//     setCredentials: (state, action) => {
//       const { token, email, role, tenantId, permissions,username } = action.payload.data;

//       state.user        = action.payload.data;
//       state.token       = token;
//       state.role        = role;
//       state.tenantId    = tenantId;
//       state.permissions = permissions;

//       // Persist to cookies
//       cookie.set("token",       token);
//       cookie.set("role",        role);
//       cookie.set("email",       email);
//       cookie.set("tenantId",    tenantId ?? "");
//       cookie.set("permissions", JSON.stringify(permissions));
//       cookie.set("username",     username);
//     },

//     logout: (state) => {
//       state.user        = null;
//       state.token       = null;
//       state.role        = null;
//       state.tenantId    = null;
//       state.permissions = [];

//       cookie.remove("token");
//       cookie.remove("role");
//       cookie.remove("email");
//       cookie.remove("tenantId");
//       cookie.remove("permissions");
//       cookie.remove("username");
//     },
//   },
// });

// export const { setCredentials, logout } = authSlice.actions;
// export default authSlice.reducer;

// src/redux/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { cookie } from "../utils/cookie";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:        null,
    token:       cookie.get("token")    || null,
    role:        cookie.get("role")     || null,
    tenantId:    cookie.get("tenantId") || null,
    permissions: cookie.get("permissions")
                   ? JSON.parse(cookie.get("permissions"))
                   : [],
  },
  reducers: {
    setCredentials: (state, action) => {
      // Response: { status, code, data: { token, role, permissions... }, message }
      // action.payload.data = { token, role, permissions, tenantId, ... }
      const data = action.payload.data;

      state.user        = data;
      state.token       = data.token;
      state.role        = data.role;
      state.tenantId    = data.tenantId;
      state.permissions = data.permissions || [];

      cookie.set("token",       data.token);
      cookie.set("role",        data.role        ?? "");
      cookie.set("email",       data.email       ?? "");
      cookie.set("tenantId",    data.tenantId    ?? "");
      cookie.set("username",    data.username    ?? "");
      cookie.set("name",        data.name        ?? "");
      cookie.set("user_id",     data.user_id     ?? "");
      cookie.set("permissions", JSON.stringify(data.permissions || []));
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
      cookie.remove("username");
      cookie.remove("name");
      cookie.remove("user_id");
      cookie.remove("permissions");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;