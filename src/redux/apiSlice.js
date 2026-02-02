import { createApi } from "@reduxjs/toolkit/query/react";
import axiosClient from "../api/axiosClient";
const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: "" }) =>
    async ({ url, method, data, params, responseType }) => {
      try {
        const isAbsoluteUrl = url.startsWith("http");
        const result = await axiosClient({
          url: isAbsoluteUrl ? url : baseUrl + url,
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
  tagTypes: ["Bill", "Inventory"],
  endpoints: (build) => ({
    login: build.mutation({
      query: (body) => ({ url: "/auth/login", method: "post", data: body }),
    }),
      // signup: build.mutation({
      //   query: (body) => ({ url: "/auth/signup", method: "post", data: body }),
      // }),
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
      providesTags: ["Bill"],
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
    getOpdBillById: build.query({
  query: (id) => ({
    url: `/opd-billing/${id}`,
    method: "GET",
  }),
  providesTags: ["Bill"],
}),

    createBill: build.mutation({
      query: (billData) => ({
        url: "/opd-billing",
        method: "POST",
        data: billData,
      }),
      invalidatesTags: ["Bill"],
    }),
    updateBill: build.mutation({
      query: ({ id, data}) => ({
        url: `/opd-billing/${id}`,
        method: "PUT",
        data: data,
      }),
      invalidatesTags: ["Bill"],

    }),
    deleteOpdBill: build.mutation({
  query: (id) => ({
    url: `/opd-billing/${id}`,
    method: "DELETE",
  }),
  invalidatesTags: ["Bill"],
}),


    registerPatients: build.mutation({
      query: (pData) => ({
        url: "/patient/register",
        method: "POST",
        data: pData,
      }),
    }),
    getMedicineSales: build.query({
  query: ({
    patientName,
    medicineName,
    startDate,
    endDate,
    issuedBy
  } = {}) => ({
    url: "/medicine-sales/view", 
    method: "GET",
    params: {
      patientName,
      medicineName,
      startDate,
      endDate,
      issuedBy
    }
  }),
}),

    getInventory: build.query({
      query: (params) => ({
        url: "/inventory/view",
        method: "GET",
        params: params, 
      }),
      providesTags: ["Inventory"],
    }),

    // 2. Add New Inventory Item
    createInventoryItem: build.mutation({
      query: (body) => ({
        url: "/inventory/add",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Inventory"], 
    }),

    // 3. Update Inventory Item
    updateInventoryItem: build.mutation({
      query: ({ id, body }) => ({
        url: `/inventory/update/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: ["Inventory"],
    }),

    // 4. Delete Inventory Item
    deleteInventoryItem: build.mutation({
      query: (id) => ({
        url: `/inventory/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Inventory"],
    }),
    // 🔍 1. Search OPD Bill No (autosuggest)
searchOpdBillNo: build.query({
  query: (bill_no) => ({
    url: "/billing/search-bill-no",
    method: "GET",
    params: { bill_no },
  }),
}),

// 📄 2. Get billing details by bill no
getBillingByBillNo: build.query({
  query: (bill_no) => ({
    url: "/billing/by-bill-no",
    method: "GET",
    params: { bill_no },
  }),
}),

// 💾 3. Create medicine bill
createMedicineBill: build.mutation({
  query: (data) => ({
    url: "/billing",
    method: "POST",
    data,
  }),
  invalidatesTags: ["Bill", "Inventory"],
}),

  }),

});

export const { useLoginMutation, useSignupMutation, useGetPatientsQuery, useSearchDiseasesQuery, useGetCountriesQuery,
  useGetStatesByCountryQuery,
  useGetDistrictsByStateQuery, useGetOpdBillingQuery, useGetComboQuery, useGetPrescriptionsQuery, useLazyExportPrescriptionsExcelQuery,
  useGetPatientsByUhidQuery, useSearchUHIDQuery,
  useGetServiceMastersQuery, useCreateBillMutation, useRegisterPatientsMutation, useGetPatientByIdQuery,
  useUpdatePatientMutation, useUpdateBillMutation, useDeleteOpdBillMutation, useGetOpdBillByIdQuery,
  useGetInventoryQuery, useCreateInventoryItemMutation, useUpdateInventoryItemMutation, useDeleteInventoryItemMutation,
  useLazyGetMedicineSalesQuery, useSearchOpdBillNoQuery, useGetBillingByBillNoQuery, useCreateMedicineBillMutation,
  useLazyGetBillingByBillNoQuery, useGetMedicineSalesQuery, 
} = api;
