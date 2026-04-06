import { useSelector } from "react-redux";
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  isLMCAdmin,
  isTenantAdmin,
} from "../utils/permissions";

const usePermissions = () => {
  const { permissions, role, tenantId } = useSelector((state) => state.auth);

  return {
    can:        (permission)  => hasPermission(permissions, permission),
    canAll:     (required)    => hasAllPermissions(permissions, required),
    canAny:     (required)    => hasAnyPermission(permissions, required),
    isLMCAdmin: ()            => isLMCAdmin(tenantId),
    isTenantAdmin: ()         => isTenantAdmin(tenantId),
    role,
    tenantId,
    permissions,
  };
};

export default usePermissions;