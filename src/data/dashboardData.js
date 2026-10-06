import { ampTabs } from "./dummy/tenants/amp";
import { hondaTabs } from "./dummy/tenants/honda";

/**
 * Dummy dashboard source. Replace `sources` with RTK Query results later;
 * tab components only read the view model returned by `select`.
 */
const sources = {
  amp: ampTabs,
  honda: hondaTabs,
};

export function getTabBundle(tenantId, tabId) {
  const tenant = sources[tenantId];
  if (!tenant?.[tabId]) {
    throw new Error(`Unknown dashboard tab: ${tenantId}/${tabId}`);
  }
  return tenant[tabId];
}
