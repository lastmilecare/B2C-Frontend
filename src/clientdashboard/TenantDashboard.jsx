import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardShell, FilterBar, TabNav } from "../utils/client-dashboard";
import { getTabBundle } from "../data/dashboardData";
import { TENANTS } from "./tenants";
import { DashboardPanel } from "./panels";
import { useDashboardView } from "./useDashboardView";
import { mergeCategoryFilterOptions } from "./mergeFilterOptions";

export function TenantDashboard({ tenantId }) {
  const config = TENANTS[tenantId];
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const tabId = config.tabs.some((tab) => tab.id === requested)
    ? requested
    : config.tabs[0].id;
  const bundle = getTabBundle(tenantId, tabId);
  const [filters, setFilters] = useState(() => bundle.initialFilters());
  useEffect(() => {
    setFilters(getTabBundle(tenantId, tabId).initialFilters());
  }, [tenantId, tabId]);
  const { view, isLoading, isError, error, isApiTab } = useDashboardView(
    tenantId,
    tabId,
    filters,
    bundle,
  );
  const filterFields = useMemo(
    () => mergeCategoryFilterOptions(bundle.filters, view),
    [bundle.filters, view?.categoryOptions],
  );
  return (
    <DashboardShell
      title={config.title}
      subtitle={config.subtitle}
      clientBadge={config.badge}
      tabs={
        <TabNav
          tabs={config.tabs}
          active={tabId}
          onChange={(id) => setSearchParams({ tab: id })}
        />
      }
    >
      <div className="mb-6">
        <FilterBar
          filters={filterFields}
          values={filters}
          onChange={(id, value) =>
            setFilters((current) => ({ ...current, [id]: value }))
          }
        />
      </div>
      {isApiTab && isLoading && (
        <p className="mb-4 text-sm text-muted">Loading dashboard data…</p>
      )}
      {isApiTab && isError && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load data{error?.error ? `: ${error.error}` : "."}
        </p>
      )}
      <DashboardPanel view={view} />
    </DashboardShell>
  );
}
