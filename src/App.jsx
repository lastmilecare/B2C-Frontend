import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import PatientRegistration from "./pages/PatientForm_old";
import PatientList from "./pages/PatientList_old";
import OpdForm from "./pages/OpdBillingForm_old";
import OpdBilling from "./pages/OpdBillingList_old";
// import Signup from "./pages/Signup";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PrescriptionForm from "./pages/PrescriptionForm_old";
import PrescriptionList from "./pages/PrescriptionList_old";
import PrintOpdForm from "./pages/PrintOpdForm";
import ProtectedRoute from "./routes/ProtectedRoute";
import PurchsedEntry from "./pages/PurchasedEntry_old";
import MedicineSalesRecord from "./pages/MedicineSalesRecord_old";
import ExpiryItems from "./pages/ExpiryItems_old";
import Billing from "./pages/Billing_old";
import ItemMaster from "./pages/ItemMaster";
import CampBilling from "./pages/CampBilling_old";

import PatientListCopy from "./pages/PatientList";
import AppLayout from "./components/Updates/AppLayout";
import AppDashboard from "./pages/Dashboard";
import OpdFormCopy from "./pages/OpdForm";
import PrescriptionFormCopy from "./pages/PrescriptionForm";

import PurchasedEntryCopy from "./pages/PurchasedEntry";
import BillingCopy from "./pages/Billing";
import CampBillingCopy from "./pages/CampBilling";
import OpdBillingListCopy from "./pages/OpdBillingList";
import PrescriptionListCopy from "./pages/PrescriptionList";
import ExpiryItemsCopy from "./pages/ExpiryItems";
import PatientRegistrationCopy from "./pages/PatientForm";
import SalesRecordCopy from "./pages/salesrecord";
import AttendancePage from "./pages/AttendancePage";
import StaffForm from "./pages/StaffForm";
import StaffList from "./pages/StaffList";
import Permission from "./pages/Permission";
import Roles from "./pages/Roles";
import TenantForm from "./pages/TenantForm";
import TenantList from "./pages/TenantList";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AppDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient-registration-old"
          element={
            <ProtectedRoute>
              <Layout>
                <PatientRegistration />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient-registration-old/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <PatientRegistration />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient-list-old"
          element={
            <ProtectedRoute>
              <Layout>
                <PatientList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/opd-form-old"
          element={
            <ProtectedRoute>
              <Layout>
                <OpdForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/opd-form-old/:ID"
          element={
            <ProtectedRoute>
              <Layout>
                <OpdForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescription-form-old"
          element={
            <ProtectedRoute>
              <Layout>
                <PrescriptionForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescription-list-old"
          element={
            <ProtectedRoute>
              <Layout>
                <PrescriptionList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescription-old/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <PrescriptionForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/opd-billing-old"
          element={
            <ProtectedRoute>
              <Layout>
                <OpdBilling />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchased-entry-old"
          element={
            <ProtectedRoute>
              <Layout>
                <PurchsedEntry />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchased-entry-old/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <PurchsedEntry />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales-record-old"
          element={
            <ProtectedRoute>
              <Layout>
                <MedicineSalesRecord />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expiry-items-old"
          element={
            <ProtectedRoute>
              <Layout>
                <ExpiryItems />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicines-billing-old"
          element={
            <ProtectedRoute>
              <Layout>
                <Billing />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicine-billing-old/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <Billing />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/items-master-old"
          element={
            <ProtectedRoute>
              <Layout>
                <ItemMaster />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/camp-billing-old"
          element={
            <ProtectedRoute>
              <Layout>
                <CampBilling />
              </Layout>
            </ProtectedRoute>
          }
        />
        // App.jsx (Add this inside your Routes)
        <Route
          path="/patient-list"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PatientListCopy />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient-registration"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PatientRegistrationCopy />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AppDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/opd-form"
          element={
            <ProtectedRoute>
              <AppLayout>
                <OpdFormCopy />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/opd-form/:ID"
          element={
            <ProtectedRoute>
              <AppLayout>
                <OpdFormCopy />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescription-form"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PrescriptionFormCopy />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchased-entry"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PurchasedEntryCopy />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <AppLayout>
                <BillingCopy />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/camp-billing"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CampBillingCopy />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient-registration/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PatientRegistrationCopy />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/opd-list"
          element={
            <ProtectedRoute>
              <AppLayout>
                <OpdBillingListCopy />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescription-list"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PrescriptionListCopy />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expiry-items"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ExpiryItemsCopy />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescription-form/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PrescriptionFormCopy />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchased-entry/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PurchasedEntryCopy />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <BillingCopy />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales-record"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SalesRecordCopy />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AttendancePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-form"
          element={
            <ProtectedRoute>
              <AppLayout>
                <StaffForm />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-list"
          element={
            <ProtectedRoute>
              <AppLayout>
                <StaffList />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Roles />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/permissions"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Permission />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenant-list"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TenantList />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenants"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TenantForm />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/print-opd-form" element={<PrintOpdForm />} />
        {/* <Route path="/staff-form" element={<StaffForm />} /> */}
        {/* <Route path="/staff-list" element={<StaffList />} /> */}
        {/* <Route path="/signup" element={<Signup />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
