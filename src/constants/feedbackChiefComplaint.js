/** Keep in sync with mobile_backend .../chief-complaint-tenant.ts */
export const PRESCRIPTION_CHIEF_COMPLAINT_TENANT_ID = 2;
export const OPD_CHIEF_COMPLAINT_TENANT_ID = 6;

export function getFeedbackChiefComplaintColumnLabel(tenantId) {
  const id = Number(tenantId);
  if (id === PRESCRIPTION_CHIEF_COMPLAINT_TENANT_ID) {
    return "Prescription Chief Complaint";
  }
  if (id === OPD_CHIEF_COMPLAINT_TENANT_ID) {
    return "OPD Chief Complaint";
  }
  return "Chief Complaint";
}
