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
const VITE_AUTH_URL = import.meta.env.VITE_AUTH_URL;
export const api = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Bill", "Inventory"],
  endpoints: (build) => ({
    login: build.mutation({
      query: (body) => ({ url: VITE_AUTH_URL, method: "post", data: body }),
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
        idProof_number,
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
          idProof_number,
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
        doctor,
        payment_mode,
        added_by,
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
          doctor,
          payment_mode,
          added_by,
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
        url: "/picasoid-prescription/export/excel",
        method: "GET",
        params: filters,
        responseType: "blob",
      }),
      // transformResponse: (response) => response,
      keepUnusedDataFor: 0,
    }),
    getPatientsByUhid: build.query({
      query: ({ uhid } = {}) => ({
        url: "/patient/by-uhid",
        method: "GET",
        params: {
          uhid,
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
      query: ({ id, data }) => ({
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
        issuedBy,
      } = {}) => ({
        url: "/medicine-sales/view",
        method: "GET",
        params: {
          patientName,
          medicineName,
          startDate,
          endDate,
          issuedBy,
        },
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
        url: "/opd-billing",
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

    getPatientById: build.query({
      query: (id) => ({
        url: "/patient/by-id",
        method: "GET",
        params: {
          patientId: id,
        },
      }),
    }),

    updatePatient: build.mutation({
      query: ({ id, body }) => ({
        url: `/patient/update-patient/${id}`,
        method: "PUT",
        data: body,
      }),
    }),
    // getMediceneList: build.query({
    //   query: (id) => ({
    //     url: "/medicine-inventory",
    //     method: "GET",
    //     params: {
    //       medicineId: id,
    //     },
    //   }),
    // }),

    getMediceneList: build.query({
      query: ({ searchTerm, code, itemtypeid } = {}) => ({
        url: "/medicine-inventory",
        method: "GET",
        params: {
          search: searchTerm,
          code,
          itemTypeId: itemtypeid,
          isActive: true,
          sortBy: "descriptions",
          sortOrder: "ASC",
        },
      }),
    }),

    getPrescriptionsList: build.query({
      query: ({
        page = 1,
        limit = 10,
        Name_,
        mobileno,
        date_from,
        date_to,
        bill_no,
        status,
        ID,
      } = {}) => ({
        url: "/picasoid-prescription",
        method: "GET",
        params: {
          page,
          limit,
          Name_,
          mobileno,
          date_from,
          date_to,
          bill_no,
          status,
          ID,
        },
      }),
      transformResponse: (response) => ({
        data: response.data || [],
        pagination: response.pagination || {},
      }),
    }),
    createPrescription: build.mutation({
      query: (PrescriptionData) => ({
        url: "/picasoid-prescription/create",
        method: "POST",
        data: PrescriptionData,
      }),
    }),
    updatePrescription: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/picasoid-prescription/${id}`,
        method: "PUT",
        data: body,
      }),
    }),
    togglePrescriptionStatus: build.mutation({
      query: (id) => ({
        url: `/picasoid-prescription/${id}/toggle-status`,
        method: "PATCH",
        data: {}, // 👈 add empty body for axios safety
      }),
      invalidatesTags: ["PrescriptionDetail"],
    }),
    exportOpdExcel: build.query({
      query: (filters = {}) => ({
        url: "/opd-billing/opd-billing-export",
        method: "GET",
        params: filters,
        responseType: "blob",
      }),
      // transformResponse: (response) => response,
      keepUnusedDataFor: 0,
    }),
    createMedicineStock: build.mutation({
      query: (body = {}) => ({
        url: "/medicine-inventory/stock",
        method: "POST",
        data: body,
      }),
    }),
    getStockDetails: build.query({
      query: ({
        page = 1,
        limit = 10,
        RecieptNo,
        ItemTypeID,
        descriptions,
        startDate,
        endDate,
        SupplierID,
        StockID,
        ItemID,
      } = {}) => ({
        url: "/medicine-inventory/stock/view",
        method: "get",
        params: {
          page,
          limit,
          RecieptNo,
          ItemTypeID,
          descriptions,
          startDate,
          endDate,
          SupplierID,
          StockID,
          ItemID,
        },
      }),
      providesTags: ["Inventory"],
    }),
    getExpireStockDetails: build.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/medicine-inventory/stock/view/expiry",
        method: "get",
        params: {
          page,
          limit,
        },
      }),
    }),
    getSalesStockDetails: build.query({
      query: ({
        page = 1,
        limit = 10,
        descriptions,
        startDate,
        endDate,
        AddedBy,
        CustommerName,
        BillNo,
      } = {}) => ({
        url: "/medicine-inventory/stock/view/sales",
        method: "get",
        params: {
          page,
          limit,
          descriptions,
          startDate,
          endDate,
          AddedBy,
          CustommerName,
          BillNo,
        },
      }),
    }),
    getPatientNameFromSales: build.query({
      query: (searchTerm) => ({
        url: "/medicine-inventory/stock/view/sales/patient-name",
        method: "GET",
        params: {
          search: searchTerm,
        },
      }),
    }),
    updateStockDetails: build.mutation({
      query: ({ id, body }) => ({
        url: `/medicine-inventory/stock/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: ["Inventory"],
    }),

    createItem: build.mutation({
      query: (body) => ({
        url: "/medicine-inventory/items",
        method: "POST",
        data: body,
      }),
    }),

    updateItem: build.mutation({
      query: ({ id, body }) => ({
        url: `/medicine-inventory/items/${id}`,
        method: "PUT",
        data: body,
      }),
    }),
    activateItem: build.mutation({
      query: (id) => ({
        url: `/medicine-inventory/items/${id}/active`,
        method: "PATCH",
      }),
    }),

    inactivateItem: build.mutation({
      query: (id) => ({
        url: `/medicine-inventory/items/${id}/inactive`,
        method: "PATCH",
      }),
    }),
    deleteitem: build.mutation({
      query: (id) => ({
        url: `/medicine-inventory/stock/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Inventory"],
    }),
    createMedicineBill: build.mutation({
      query: (data) => ({
        url: "/medicine-inventory/lastbill",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Bill", "Inventory"],
    }),
    getMedicineBillById: build.query({
      query: (id) => ({
        url: `/medicine-inventory/lastbill/${id}`,
        method: "GET",
      }),
    }),
    updateMedicineBill: build.mutation({
      query: ({ id, data }) => ({
        url: `/medicine-inventory/lastbill/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Bill", "Inventory"],
    }),
    checkIn: build.mutation({
      query: () => ({
        url: `/attendance/check-in`,
        method: "POST",
      }),
      invalidatesTags: ["Attendance", "Dashboard"],
    }),
    checkOut: build.mutation({
      query: () => ({
        url: `/attendance/check-out`,
        method: "POST",
      }),
      invalidatesTags: ["Attendance", "Dashboard"],
    }),
    getAttendance: build.query({
      query: (params) => ({
        url: `/attendance`,
        method: "GET",
        params,
      }),
      providesTags: ["Attendance"],
    }),
    getMonthlyStats: build.query({
      query: ({ month, year }) => ({
        url: `/attendance/stats`,
        method: "GET",
        params: { month, year },
      }),
      providesTags: ["Attendance"],
    }),
    getAdminDashboard: build.query({
      query: () => ({
        url: `/attendance/admin/dashboard`,
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),
    getCalendarData: build.query({
      query: ({ month, year }) => ({
        url: `/attendance/calendar`,
        method: "GET",
        params: { month, year },
      }),
    }),
    getAttendanceExport: build.query({
      query: (params) => ({
        url: `/attendance/export`,
        method: "GET",
        params,
        responseType: "blob",
      }),
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useGetPatientsQuery,
  useSearchDiseasesQuery,
  useGetCountriesQuery,
  useGetStatesByCountryQuery,
  useGetDistrictsByStateQuery,
  useGetOpdBillingQuery,
  useGetComboQuery,
  useGetPrescriptionsQuery,
  useLazyExportPrescriptionsExcelQuery,
  useGetPatientsByUhidQuery,
  useSearchUHIDQuery,
  useGetServiceMastersQuery,
  useCreateBillMutation,
  useRegisterPatientsMutation,
  useGetPatientByIdQuery,
  useUpdatePatientMutation,
  useUpdateBillMutation,
  useDeleteOpdBillMutation,
  useGetOpdBillByIdQuery,
  useGetInventoryQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
  useLazyGetMedicineSalesQuery,
  useSearchOpdBillNoQuery,
  useGetBillingByBillNoQuery,
  useCreateMedicineBillMutation,
  useLazyGetBillingByBillNoQuery,
  useGetMedicineSalesQuery,
  useGetMediceneListQuery,
  useGetPrescriptionsListQuery,
  useCreatePrescriptionMutation,
  useUpdatePrescriptionMutation,
  useTogglePrescriptionStatusMutation,
  useLazyExportOpdExcelQuery,
  useCreateMedicineStockMutation,
  useGetStockDetailsQuery,
  useGetExpireStockDetailsQuery,
  useGetSalesStockDetailsQuery,
  useGetPatientNameFromSalesQuery,
  useLazySearchDiseasesQuery,
  useUpdateStockDetailsMutation,
  useCreateItemMutation,
  useUpdateItemMutation,
  useLazyGetMediceneListQuery,
  useActivateItemMutation,
  useInactivateItemMutation,
  useDeleteitemMutation,
  useGetMedicineBillByIdQuery,
  useUpdateMedicineBillMutation,
  useCheckInMutation,
  useCheckOutMutation,
  useGetAttendanceQuery,
  useGetMonthlyStatsQuery,
  useGetAdminDashboardQuery,
  useGetCalendarDataQuery,
  useLazyGetAttendanceExportQuery
} = api;
