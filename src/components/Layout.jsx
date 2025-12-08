import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-sky-50">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="hidden lg:block">
          <Sidebar />
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-grow p-2 overflow-y-auto">{children}</main>
        <Footer />

      </div>
    </div>
  );
};

export default Layout;
