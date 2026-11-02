import React from "react";
import { cookie } from "../../utils/cookie";
import {
  AmpOperatingExpensePage,
  HondaComplianceExpensePage,
} from "./expenseRouteComponents";

const ExpenseLandingPage = () => {
  const tenantId = cookie.get("tenantId") || "N/A";

  if (Number(tenantId) == 2) {
    return <AmpOperatingExpensePage />;
  }

  if (Number(tenantId) == 1) {
    return <HondaComplianceExpensePage />;
  }

  return null;
};

export default ExpenseLandingPage;
