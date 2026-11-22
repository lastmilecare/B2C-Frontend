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
  useGetPatientFeedbackQuery,
  useGetMhcuProgramOverviewQuery,
  useGetMhcuPatientsScreeningQuery,
  useGetMhcuRiskZonesQuery,
  useGetMhcuDiseaseChronicQuery,
  useGetMhcuHomeCareQuery,
  useGetMhcuVillageScorecardQuery,
  useGetMhcuPatientFeedbackQuery,
  useGetMhcuConcernCasesQuery,
} from "../redux/apiSlice";
import { mhcuApiFiltersReady, mhcuStandardQueryParams } from "./mhcu-filters";
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
  if (tabId === "revenue") {
    return {
      gender: filters.gender ?? "all",
      patientType: filters.patientType ?? "all",
      service: filters.service ?? "all",
      ...dateRangeQuery(filters),
    };
  }
  if (tabId === "cost") {
    return {
      gender: filters.gender ?? "all",
      category: filters.category ?? "all",
      ...dateRangeQuery(filters),
    };
  }
  if (tabId === "third-party") {
    return {
      gender: filters.gender ?? "all",
      category: filters.category ?? "all",
      ...dateRangeQuery(filters),
    };
  }
  if (tabId === "third-party-category") {
    return {
      gender: filters.gender ?? "all",
      category: filters.category ?? "all",
      ...dateRangeQuery(filters),
    };
  }

  // if (tabId === "footfall") {
  //   return {
  //     gender: filters.gender ?? "all",
  //     patientType: (filters.patientType ?? "all").toUpperCase(),
  //     ...dateRangeQuery(filters),
  //   };
  // }

  if (
    (tenantSlug === "mhcu-adani" &&
      (tabId === "overview" ||
        tabId === "patients" ||
        tabId === "risk-zones" ||
        tabId === "disease")) ||
    tabId === "home-care" ||
    tabId === "village-scorecard" ||
    tabId === "feedback" ||
    tabId === "concern"
  ) {
    return mhcuStandardQueryParams(filters, tabId);
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
  // const mode = API_ENABLED ? resolveApiTabMode(tenantSlug, tabId) : null;
  const mode = resolveApiTabMode(tenantSlug, tabId);
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

  const patientFeedback = useGetPatientFeedbackQuery(queryArg, {
    skip: mode !== "patientFeedback",
  });
  const mhcuApiReady =
    (mode === "mhcuProgramOverview" ||
      mode === "mhcuPatientsScreening" ||
      mode === "mhcuRiskZones" ||
      mode === "mhcuDiseaseChronic" ||
      mode === "mhcuHomeCare" ||
      mode === "mhcuVillageScorecard" ||
      mode === "mhcuPatientFeedback" ||
      mode === "mhcuConcernCases") &&
    mhcuApiFiltersReady(filters);

  const mhcuProgramOverview = useGetMhcuProgramOverviewQuery(queryArg, {
    skip: mode !== "mhcuProgramOverview" || !mhcuApiReady,
  });

  const mhcuPatientsScreening = useGetMhcuPatientsScreeningQuery(queryArg, {
    skip: mode !== "mhcuPatientsScreening" || !mhcuApiReady,
  });
  const mhcuRiskZones = useGetMhcuRiskZonesQuery(queryArg, {
    skip: mode !== "mhcuRiskZones" || !mhcuApiReady,
  });
  const mhcuDiseaseChronic = useGetMhcuDiseaseChronicQuery(queryArg, {
    skip: mode !== "mhcuDiseaseChronic" || !mhcuApiReady,
  });
  const mhcuHomeCare = useGetMhcuHomeCareQuery(queryArg, {
    skip: mode !== "mhcuHomeCare" || !mhcuApiReady,
  });
  const mhcuVillageScorecard = useGetMhcuVillageScorecardQuery(queryArg, {
    skip: mode !== "mhcuVillageScorecard" || !mhcuApiReady,
  });
  const mhcuPatientFeedback = useGetMhcuPatientFeedbackQuery(queryArg, {
    skip: mode !== "mhcuPatientFeedback" || !mhcuApiReady,
  });
  const mhcuConcernCases = useGetMhcuConcernCasesQuery(queryArg, {
    skip: mode !== "mhcuConcernCases" || !mhcuApiReady,
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
                    : mode === "patientFeedback"
                      ? patientFeedback
                      : mode === "mhcuProgramOverview"
                        ? mhcuProgramOverview
                        : mode === "mhcuPatientsScreening"
                          ? mhcuPatientsScreening
                          : mode === "mhcuRiskZones"
                            ? mhcuRiskZones
                            : mode === "mhcuDiseaseChronic"
                              ? mhcuDiseaseChronic
                              : mode === "mhcuHomeCare"
                                ? mhcuHomeCare
                                : mode === "mhcuVillageScorecard"
                                  ? mhcuVillageScorecard
                                  : mode === "mhcuPatientFeedback"
                                    ? mhcuPatientFeedback
                                    : mode === "mhcuConcernCases"
                                      ? mhcuConcernCases
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
