import React, { useState } from "react";
import CopySidebar from "./CopySidebar";
import CopyHeader from "./CopyHeader";

const CopyLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f3f6fb] overflow-hidden">
      
      <CopySidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
     
        <CopyHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="p-6 overflow-auto flex-1">
          {children}
        </div>
      </div>

 
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default CopyLayout;