import dayjs from "dayjs";
import { useMemo } from "react";
import {
  useGetCampPatientProfileQuery,
  useGetPatientProfileQuery,
  useGetPatientComplaintsQuery,
  useGetPatientFootfallQuery,
  useGetRevenueQuery,
  useGetCostQuery,
  useGetThirdPartyQuery,
  useGetThirdPartyCategoryQuery,
} from "../redux/apiSlice";

import { resolveApiTabMode, usesPatientComplaintsApi } from "./apiTabRouting";
const API_ENABLED = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());
function campDateQuery(filters) {
  const range = filters.dateRange;
  if (!range?.[0] || !range?.[1]) return {};
  return {
    from: dayjs(range[0]).format("YYYY-MM-DD"),
    to: dayjs(range[1]).format("YYYY-MM-DD"),
  };
}
function dateRangeQuery(filters) {
  const range = filters.dateRange;
  if (!range?.[0] || !range?.[1]) return {};
  return {
    from: dayjs(range[0]).format("YYYY-MM-DD"),
    to: dayjs(range[1]).format("YYYY-MM-DD"),
  };
}
function buildQueryArg(tenantSlug, tabId, filters) {
  if (usesPatientComplaintsApi(tenantSlug, tabId)) {
    return {
      complaint: filters.complaint ?? "all",
      area: filters.area ?? "all",
      gender: filters.gender ?? "all",
      ...dateRangeQuery(filters),
    };
  }
  if (tabId === "unique-patients") {
    return {
      gender: filters.gender ?? "all",
      patientType: filters.patientType ?? "all",
      ...dateRangeQuery(filters),
    };
  }
  return {
    gender: filters.gender ?? "all",
    patientType: filters.patientType ?? "all",
    ...campDateQuery(filters),
  };
}
/**
 * API-backed tabs use RTK Query; other tabs still use dummy `bundle.select`.
 */
export function useDashboardView(tenantSlug, tabId, filters, bundle) {
  const mode = API_ENABLED ? resolveApiTabMode(tenantSlug, tabId) : null;
  // const mode = resolveApiTabMode(tenantSlug, tabId);
  const queryArg = useMemo(
    () => buildQueryArg(tenantSlug, tabId, filters),
    [tenantSlug, tabId, filters],
  );
  const patientProfile = useGetPatientProfileQuery(queryArg, {
    skip: mode !== "patientProfile",
  });
  const campProfile = useGetCampPatientProfileQuery(queryArg, {
    skip: mode !== "campPatientProfile",
  });
  const patientComplaints = useGetPatientComplaintsQuery(queryArg, {
    skip: mode !== "patientComplaints",
  });
  const patientFootfall = useGetPatientFootfallQuery(queryArg, {
    skip: mode !== "patientFootfall",
  });
  const revenue = useGetRevenueQuery(queryArg, {
    skip: mode !== "revenue",
  });
  const cost = useGetCostQuery(queryArg, {
    skip: mode !== "cost",
  });
  const thirdParty = useGetThirdPartyQuery(queryArg, {
    skip: mode !== "thirdParty",
  });
  const thirdPartyCategory = useGetThirdPartyCategoryQuery(queryArg, {
    skip: mode !== "thirdPartyCategory",
  });

  const active =
    mode === "patientProfile"
      ? patientProfile
      : mode === "campPatientProfile"
        ? campProfile
        : mode === "patientComplaints"
          ? patientComplaints
          : mode === "patientFootfall"
            ? patientFootfall
            : mode === "revenue"
              ? revenue
              : mode === "cost"
                ? cost
                : mode === "thirdParty"
                  ? thirdParty
                  : mode === "thirdPartyCategory"
                    ? thirdPartyCategory
                    : null;

  const dummyView = useMemo(() => {
    if (mode) return null;
    return bundle.select(filters);
  }, [mode, bundle, filters]);
  return {
    view: active?.data ?? dummyView,
    isLoading: Boolean(active?.isLoading),
    isFetching: Boolean(active?.isFetching),
    isError: Boolean(active?.isError),
    error: active?.error,
    isApiTab: Boolean(mode),
  };
}
