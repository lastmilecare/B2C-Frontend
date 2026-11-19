import { ampTabs } from "./dummy/tenants/amp";
import { hondaTabs } from "./dummy/tenants/honda";
import { mhcuAdaniTabs } from "./dummy/tenants/mhcu-adani";

/**
 * Dummy dashboard source. Replace `sources` with RTK Query results later;
 * tab components only read the view model returned by `select`.
 */
const sources = {
  amp: ampTabs,
  honda: hondaTabs,
  "mhcu-adani": mhcuAdaniTabs,
};

export function getTabBundle(tenantId, tabId) {
  const tenant = sources[tenantId];
  if (!tenant?.[tabId]) {
    throw new Error(`Unknown dashboard tab: ${tenantId}/${tabId}`);
  }
  return tenant[tabId];
}
