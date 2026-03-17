import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import PatientRegistration from "./pages/PatientForm";
import PatientList from "./pages/PatientList";
import OpdForm from "./pages/OpdBillingForm";
import OpdBilling from "./pages/OpdBillingList";
// import Signup from "./pages/Signup";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PrescriptionForm from "./pages/PrescriptionForm";
import PrescriptionList from "./pages/PrescriptionList";
import PrintOpdForm from "./pages/PrintOpdForm";
import ProtectedRoute from "./routes/ProtectedRoute";
import PurchsedEntry from "./pages/PurchasedEntry";
import MedicineSalesRecord from "./pages/MedicineSalesRecord";
import ExpiryItems from "./pages/ExpiryItems";
import Billing from "./pages/Billing";
import ItemMaster from "./pages/ItemMaster";
import CampBilling from "./pages/CampBilling";

import PatientListCopy from "./pages/PatientListCopy";
import CopyLayout from "./components/copy/CopyLayout";
import DashboardCopy from "./pages/DashboardCopy";
import OpdFormCopy from "./pages/OpdFormCopy";
import PrescriptionFormCopy from "./pages/PrescriptionFormCopy";

import PurchasedEntryCopy from "./pages/PurchasedEntryCopy";
import BillingCopy from "./pages/BillingCopy";
import CampBillingCopy from "./pages/CampBillingCopy";
import OpdBillingListCopy from "./pages/OpdBillingListCopy";
import PrescriptionListCopy from "./pages/PrescriptionListCopy";
import ExpiryItemsCopy from "./pages/ExpiryItemsCopy";
import PatientRegistrationCopy from "./pages/PatientFormCopy";
import SalesRecordCopy from "./pages/salesrecordcopy";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
  path="/"
  element={
    <ProtectedRoute>
      <CopyLayout>
        <DashboardCopy />
      </CopyLayout>
    </ProtectedRoute>
  }
/>
        <Route
          path="/patient-registration"
          element={
            <ProtectedRoute>
              <Layout>
                <PatientRegistration />
              </Layout>
            </ProtectedRoute>

          }
        />
        <Route path="/patient-registration/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <PatientRegistration />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient-list"
          element={
            <ProtectedRoute>
              <Layout>
                <PatientList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/opd-form"
          element={
            <ProtectedRoute>
              <Layout>
                <OpdForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/opd-form/:ID"
          element={
            <ProtectedRoute>
              <Layout>
                <OpdForm />
              </Layout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/prescription-form"
          element={
            <ProtectedRoute>
              <Layout>
                <PrescriptionForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/prescription-list"
          element={
            <ProtectedRoute>
              <Layout>
                <PrescriptionList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescription/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <PrescriptionForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/opd-billing"
          element={
            <ProtectedRoute>
              <Layout>
                <OpdBilling />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchased-entry"
          element={
            <ProtectedRoute>
              <Layout>
                <PurchsedEntry />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchased-entry/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <PurchsedEntry />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales-record"
          element={
            <ProtectedRoute>
              <Layout>
                <MedicineSalesRecord />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expiry-items"
          element={
            <ProtectedRoute>
              <Layout>
                <ExpiryItems />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicines-billing"
          element={
            <ProtectedRoute>
              <Layout>
                <Billing />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicine-billing/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <Billing />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/items-master"
          element={
            <ProtectedRoute>
              <Layout>
                <ItemMaster />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/camp-billing"
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
          path="/patient-list-copy"
          element={
            <ProtectedRoute>
              <CopyLayout>
                <PatientListCopy />
              </CopyLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient-registration-copy"
          element={
            <ProtectedRoute>
              <CopyLayout>
                <PatientRegistrationCopy />
              </CopyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-copy"
          element={
            <ProtectedRoute>
              <CopyLayout>
                <DashboardCopy />
              </CopyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/opd-form-copy"
          element={
            <ProtectedRoute>
              <CopyLayout>
                <OpdFormCopy />
              </CopyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescription-form-copy"
          element={
            <ProtectedRoute>
              <CopyLayout>
                <PrescriptionFormCopy />
              </CopyLayout>
            </ProtectedRoute>
          }
        />
       <Route
  path="/purchased-entry-copy"
  element={
    <ProtectedRoute>
      <CopyLayout>
        <PurchasedEntryCopy />
      </CopyLayout>
    </ProtectedRoute>
  }
/> 
        <Route
          path="/billing-copy"
          element={
            <ProtectedRoute>
              <CopyLayout>
                <BillingCopy />
              </CopyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/camp-billing-copy"
          element={
            <ProtectedRoute>
              <CopyLayout>
                <CampBillingCopy />
              </CopyLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/patient-registration-copy/:id"
          element={
            <ProtectedRoute>
              <CopyLayout>
                <PatientRegistrationCopy />
              </CopyLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/opd-list-copy"
          element={
            <ProtectedRoute>
              <CopyLayout>
                <OpdBillingListCopy />
              </CopyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescription-list-copy"
          element={
            <ProtectedRoute>
              <CopyLayout>
                <PrescriptionListCopy />
              </CopyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expiry-items-copy"
          element={
            <ProtectedRoute>
              <CopyLayout>
                <ExpiryItemsCopy />
              </CopyLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/prescription-form-copy/:id"
          element={
            <ProtectedRoute>
              <CopyLayout>
                <PrescriptionFormCopy />
              </CopyLayout>
            </ProtectedRoute>
          }
        />
        <Route
  path="/purchased-entry-copy/:id"
  element={
    <ProtectedRoute>
      <CopyLayout>
        <PurchasedEntryCopy />
      </CopyLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/billing-copy/:id"
  element={
    <ProtectedRoute>
      <CopyLayout>
        <BillingCopy />
      </CopyLayout>
    </ProtectedRoute>
  }
/>
<Route
          path="/sales-record-copy"
          element={
            <ProtectedRoute>
              <CopyLayout>
                <SalesRecordCopy />
              </CopyLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/print-opd-form"
          element={<PrintOpdForm />} />

        {/* <Route path="/signup" element={<Signup />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
