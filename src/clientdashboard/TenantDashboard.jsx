import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardShell, FilterBar, TabNav } from "../utils/client-dashboard";
import { getTabBundle } from "../data/dashboardData";
import { TENANTS } from "./tenants";
import { DashboardPanel } from "./panels";

export function TenantDashboard({ tenantId }) {
  const config = TENANTS[tenantId];
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const tabId = config.tabs.some((tab) => tab.id === requested) ? requested : config.tabs[0].id;
  const bundle = getTabBundle(tenantId, tabId);
  const [filters, setFilters] = useState(() => bundle.initialFilters());

  useEffect(() => {
    setFilters(getTabBundle(tenantId, tabId).initialFilters());
  }, [tenantId, tabId]);

  const view = useMemo(() => bundle.select(filters), [bundle, filters]);

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
          filters={bundle.filters}
          values={filters}
          onChange={(id, value) => setFilters((current) => ({ ...current, [id]: value }))}
        />
      </div>
      <DashboardPanel view={view} />
    </DashboardShell>
  );
}
