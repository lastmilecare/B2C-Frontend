// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/Updates/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import { ROUTES } from "./config/routes.config";

// ── Public pages ─────────────────────────────────────────────────────────────
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PrintOpdForm from "./pages/PrintOpdForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/print-opd-form" element={<PrintOpdForm />} />
       {ROUTES.map(({ path, component: Component, permission }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute permission={permission}>
                <AppLayout>
                  <Component />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
