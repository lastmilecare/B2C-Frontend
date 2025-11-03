import { createApi } from "@reduxjs/toolkit/query/react";
import axiosClient from "../api/axiosClient";

// axiosBaseQuery wrapper for RTK Query
const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: "" }) =>
  async ({ url, method, data, params }) => {
    try {
      const result = await axiosClient({ url: baseUrl + url, method, data, params });
      return { data: result.data };
    } catch (error) {
      return {
        error: {
          status: error.response?.status,
          data: error.response?.data || error.message,
        },
      };
    }
  };

export const api = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({ baseUrl: "/api" }),
  endpoints: (build) => ({
    login: build.mutation({
      query: (body) => ({ url: "/auth/login", method: "post", data: body }),
    }),
    signup: build.mutation({
      query: (body) => ({ url: "/auth/signup", method: "post", data: body }),
    }),
    getPatients: build.query({
      query: () => ({ url: "/patients", method: "get" }),
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useGetPatientsQuery } = api;
