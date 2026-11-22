/**
 * Centralized tenant feature flags.
 * Target tenant comes from VITE_TENANT_ID (.env) — do not hardcode IDs in components.
 */
export const getConfiguredTenantId = () =>
  Number(import.meta.env.VITE_TENANT_ID);

export const isConfiguredTenant = (tenantId) =>
  Number(tenantId) === getConfiguredTenantId();

const DEFAULT_FEATURES = {
  enableHemoglobin: false,
  enableBMI: false,
  enableHealthFlags: false,
  enablePreviousVisitSummary: false,
  enableEscalationProtocol: false,
  enableOpdCostFreeBilling: false,
  enablePatientFormCustomization: false,
  enableStructuredReferral: false,
  enableTeleConsultation: false,
  enableFitnessStatus: false,
  enableAdminAnalysis: false,
  enableMhcuRegistrationAutos: false,
};

const CONFIGURED_TENANT_FEATURES = {
  enableHemoglobin: true,
  enableBMI: true,
  enableHealthFlags: true,
  enablePreviousVisitSummary: true,
  enableEscalationProtocol: true,
  enableOpdCostFreeBilling: true,
  enablePatientFormCustomization: true,
  enableStructuredReferral: true,
  enableTeleConsultation: true,
  enableFitnessStatus: true,
  enableAdminAnalysis: true,
  enableMhcuRegistrationAutos: true,
};

export const getTenantFeatures = (tenantId) => {
  if (isConfiguredTenant(tenantId)) {
    return { ...DEFAULT_FEATURES, ...CONFIGURED_TENANT_FEATURES };
  }
  return { ...DEFAULT_FEATURES };
};
