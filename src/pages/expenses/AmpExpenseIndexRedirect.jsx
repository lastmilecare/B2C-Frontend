import { Navigate } from 'react-router-dom';

/** Register at path `/expense-transactions` (exact) for AMP users. */
const AmpExpenseIndexRedirect = () => (
  <Navigate to="/expense-transactions/operating" replace />
);

export default AmpExpenseIndexRedirect;
