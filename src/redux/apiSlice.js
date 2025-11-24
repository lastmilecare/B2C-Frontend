import { createApi } from "@reduxjs/toolkit/query/react";
import axiosClient from "../api/axiosClient";

// axiosBaseQuery wrapper for RTK Query
// const axiosBaseQuery =
//   ({ baseUrl } = { baseUrl: "" }) =>
//     async ({ url, method, data, params, responseType }) => {
//       try {
//         const result = await axiosClient({ url: baseUrl + url, method, data, params, responseType: responseType || "json", });
//         return { data: result.data };
//       } catch (error) {
//         return {
//           error: {
//             status: error.response?.status,
//             data: error.response?.data || error.message,
//           },
//         };
//       }
//     };
const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: "" }) =>
    async ({ url, method, data, params, responseType }) => {
      try {
        const result = await axiosClient({
          url: baseUrl + url,
          method,
          data,
          params,
          responseType: responseType || "json",
        });

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
      query: ({
        page = 1,
        limit = 10,
        name,
        contactNumber,
        gender,
        category,
        startDate,
        endDate,
        external_id,
        idProof_number
      } = {}) => ({
        url: "/patient",
        method: "get",
        params: {
          page,
          limit,
          name,
          contactNumber,
          gender,
          category,
          startDate,
          endDate,
          external_id,
          idProof_number
        },
      }),
    }),


    searchDiseases: build.query({
      query: ({ q, page = 1, limit = 20 }) => ({
        url: "/diseases/search",
        method: "get",
        params: { q, page, limit },
      }),
    }),
    getCountries: build.query({
      query: () => ({ url: "/location/countries", method: "get" }),
    }),

    getStatesByCountry: build.query({
      query: (countryId) => ({
        url: `/location/states/${countryId}`,
        method: "get",
      }),
    }),

    getDistrictsByState: build.query({
      query: (stateId) => ({
        url: `/location/districts/${stateId}`,
        method: "get",
      }),
    }),

    getOpdBilling: build.query({
      query: ({
        page = 1,
        limit = 10,
        name,
        contactNumber,
        gender,
        category,
        startDate,
        endDate,
        external_id,
        idProof_number,
        bill_no,
        department,
        doctor_id,
        pay_mode
      } = {}) => ({
        url: "/opd-billing/view",
        method: "get",
        params: {
          page,
          limit,
          name,
          contactNumber,
          gender,
          category,
          startDate,
          endDate,
          external_id,
          idProof_number,
          bill_no,
          department,
          doctor_id,
          pay_mode
        },
      }),
    }),
    getCombo: build.query({
      query: (type) => ({
        url: `/combo/${type}`,
        method: "get",
      }),
    }),
    getPrescriptions: build.query({
      query: ({
        page = 1,
        limit = 10,
        name,
        contactNumber,
        billNumber,
        category,
        startDate,
        endDate,
      } = {}) => ({
        url: "/prescriptions/view",
        method: "get",
        params: {
          page,
          limit,
          name,
          contactNumber,
          billNumber,
          category,
          startDate,
          endDate,
        },
      }),
      transformResponse: (response) => ({
        data: response.data || [],
        pagination: response.pagination || {},
      }),
    }),
    exportPrescriptionsExcel: build.query({
      query: (filters = {}) => ({
        url: "/prescriptions/export/excel",
        method: "GET",
        params: filters,
        responseType: "blob",
      }),
      transformResponse: (response) => response,
    }),
    getPatientsByUhid: build.query({
      query: ({
        uhid
      } = {}) => ({
        url: "/patient/by-uhid",
        method: "GET",
        params: {
          uhid
        },
      }),
    }),
    searchUHID: build.query({
      query: (query) => ({
        url: `/patient/search-uhid`,
        params: { query },
      }),
    }),
    getServiceMasters: build.query({
      query: (serviceName) => ({
        url: "/opd-service/service-master",
        method: "GET",
        params: {
          ServiceName: serviceName || "",
        },
      }),
    }),

  }),

});

export const { useLoginMutation, useSignupMutation, useGetPatientsQuery, useSearchDiseasesQuery, useGetCountriesQuery,
  useGetStatesByCountryQuery,
  useGetDistrictsByStateQuery, useGetOpdBillingQuery, useGetComboQuery, useGetPrescriptionsQuery, useLazyExportPrescriptionsExcelQuery,
  useGetPatientsByUhidQuery, useSearchUHIDQuery,useGetServiceMastersQuery 
} = api;
