import dayjs from "dayjs";
import { useMemo } from "react";
import {
  useGetCampPatientProfileQuery,
  useGetPatientProfileQuery,
} from "../redux/apiSlice";
import {API_TENANT_ID} from "../utils/constants";
const API_TABS = {
  "unique-patients": "patientProfile",
  "camp-profile": "campPatientProfile",
};

function campDateQuery(filters) {
  const range = filters.dateRange;
  if (!range?.[0] || !range?.[1]) return {};
  return {
    from: dayjs(range[0]).format("YYYY-MM-DD"),
    to: dayjs(range[1]).format("YYYY-MM-DD"),
  };
}

function buildQueryArg(tenantSlug, filters) {
  return {
    tenantSlug,
    tenantApiId: API_TENANT_ID[tenantSlug],
    gender: filters.gender ?? "all",
    patientType: filters.patientType ?? "all",
    ...campDateQuery(filters),
  };
}

/**
 * API-backed tabs use RTK Query; other tabs still use dummy `bundle.select`.
 */
export function useDashboardView(tenantSlug, tabId, filters, bundle) {
  const mode = API_TABS[tabId];
  const queryArg = useMemo(
    () => buildQueryArg(tenantSlug, filters),
    [tenantSlug, filters],
  );

  const patientProfile = useGetPatientProfileQuery(queryArg, {
    skip: mode !== "patientProfile",
  });
  const campProfile = useGetCampPatientProfileQuery(queryArg, {
    skip: mode !== "campPatientProfile",
  });

  const active = mode === "patientProfile" ? patientProfile : mode === "campPatientProfile" ? campProfile : null;

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
