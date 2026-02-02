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
              <Layout>
                <PatientRegistration />
              </Layout>
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
