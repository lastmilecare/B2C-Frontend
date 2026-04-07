// Check if user has a specific permission
export const hasPermission = (permissions = [], permission) => {
  return permissions.includes(permission);
};

// Check if user has ALL of the given permissions
export const hasAllPermissions = (permissions = [], required = []) => {
  return required.every((p) => permissions.includes(p));
};

// Check if user has ANY of the given permissions
export const hasAnyPermission = (permissions = [], required = []) => {
  return required.some((p) => permissions.includes(p));
};

// Check if user is LMC Admin (no tenantId)
export const isLMCAdmin = (tenantId) => !tenantId;

// Check if user is Tenant Admin
export const isTenantAdmin = (tenantId) => !!tenantId;