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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <PatientRegistration />
            </Layout>
          }
        />
        <Route
          path="/patient-registration"
          element={
            <Layout>
              <PatientRegistration />
            </Layout>
          }
        />
        <Route
          path="/patient-list"
          element={
            <Layout>
              <PatientList />
            </Layout>
          }
        />
        <Route
          path="/opd-form"
          element={
            <Layout>
              <OpdForm />
            </Layout>
          }
        />

        <Route
          path="/prescription-form"
          element={
            <Layout>
              <PrescriptionForm />
            </Layout>
          }
        />
        <Route
          path="/prescription-list"
          element={
            <Layout>
              <PrescriptionList />
            </Layout>
          }
        />
        <Route
          path="/opd-billing"
          element={
            <Layout>
              <OpdBilling />
            </Layout>
          }
        />
        <Route path="/print-opd-form" element={<PrintOpdForm />} />

          {/* <Route path="/signup" element={<Signup />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
